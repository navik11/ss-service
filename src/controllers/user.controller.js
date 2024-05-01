import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError, ApiResponse } from "../utils/ApiErrorRes.js";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { conversionRates, records, users } from "../db/index.js";
import { Password } from "../services/password.service.js";
import dotenv from "dotenv";

dotenv.config({ path: "././.env" });

const login = asyncHandler(async (req, res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ApiError(400, errors.array()[0].msg, errors.array());
    }

    const { name, password } = req.body
    
    if(!users[name]) {
        throw new ApiError(400, "User not found");
    }

    const isPasswordCorrect = await Password.compare(password, users[name].password);
    if(!isPasswordCorrect) {
        throw new ApiError(400, "Invalid credentials");
    }

    const accessToken = jwt.sign({ name }, process.env.JWT_SECRET, { expiresIn: process.env.SESSION_EXPIRY });

    const httpOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
    };

    return res.status(200)
    .cookie("accessToken", accessToken, httpOptions)
    .send(new ApiResponse(200, {name, accessToken}, "User logged in successfully"));

});

const logout = asyncHandler(async (req, res) => {

    const httpOptions = {
        httpOnly: true,
        secure: true,
        sameSite: "None",
    };

    return res.status(200)
    .clearCookie("accessToken", httpOptions)
    .clearCookie("refreshToken", httpOptions)
    .send(new ApiResponse(200, {}, "User logged out successfully"));

});


const createRecord = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ApiError(400, errors.array()[0].msg, errors.array());
    }

    const { name, salary, currency, department, sub_department } = req.body;
    const newRecord = { name, salary, currency, department, sub_department, record_id: records["maxRecordId"] + 1};
    records.data[records["maxRecordId"] + 1] = newRecord;
    records["maxRecordId"] += 1;

    console.log(records);

    return res.status(201).send(new ApiResponse(201, newRecord, "Record created successfully"));
});

const updateRecord = asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        throw new ApiError(400, errors.array()[0].msg, errors.array());
    }

    const { record_id, name, salary, currency, department, sub_department } = req.body;
    
    const record = records.data[record_id];
    if(!record) {
        throw new ApiError(400, "Record not found");
    }
    
    const newRecord = { name, salary, currency, department, sub_department, record_id};
    records.data[record_id] = newRecord;

    console.log(records);

    return res.status(201).send(new ApiResponse(201, newRecord, "Record updated successfully"));
});

const deleteRecord = asyncHandler(async (req, res) => {

    const { record_id, name } = req.body;

    if(!record_id && !name) {
        return res.status(400).send(new ApiResponse(400, {}, "Please provide record_id or name to delete record"));
    }

    if(record_id) {
        const record = records.data[record_id];
        if(!record) {
            throw new ApiError(400, "Record not found");
        }
        delete records.data[record_id];
        console.log(records);
        return res.status(200).send(new ApiResponse(200, {record_id}, "Record deleted successfully"));
    }

    if(name) {
        let record_array = Object.values(records.data);
        let matched_records = record_array.filter(record => record.name === name);
        if(matched_records.length === 0) {
            throw new ApiError(400, "Record not found");
        }
        if(matched_records.length > 1) {
            throw new ApiError(400, "Multiple records found with same name, please provide record_id", [matched_records]);
        }
        const rid = matched_records[0].record_id
        delete records.data[rid];

        console.log(records);

        return res.status(200).send(new ApiResponse(200, {name}, "Record deleted successfully"));
    }

});

const getSS = asyncHandler(async (req, res) => {

    const records_array = Object.values(records.data);

    let min = Number.MAX_VALUE;
    let max = Number.MIN_VALUE;
    let total = 0;
    let length = 0;

    const on_contract = req.query.on_contract;

    for(let record of records_array) {
        if(on_contract=="true" && !record.on_contract) {
            continue;
        }
        const record_salary = record.salary / conversionRates[record.currency];
        if(record_salary < min) {
            min = record.salary;
        }
        if(record_salary > max) {
            max = record.salary;
        }records
        total += record_salary;
        length += 1;
    }

    let mean = total / length;

    let currency = req.query.currency;

    if(currency) {
        currency = currency.toUpperCase();
        if(currency != "USD" && currency != "EUR" && currency != "INR") {
            throw new ApiError(400, "Invalid currency provided, supported currencies are USD, EUR and INR");
        }
        min = min * conversionRates[currency];
        max = max * conversionRates[currency];
        mean = mean * conversionRates[currency];
    } else {
        currency = "USD";
    }

    const stats = {
        currency,
        min,
        max,
        mean
    }

    return res.status(200).send(new ApiResponse(200, stats, "Summary Statistics fetched successfully"));
});

const getDepartmentalSS = asyncHandler(async (req, res) => {

    let records_array = JSON.parse(JSON.stringify(Object.values(records.data)));

    let currency = req.query.currency;

    if(currency) {
        currency = currency.toUpperCase();
        if(currency != "USD" && currency != "EUR" && currency != "INR") {
            throw new ApiError(400, "Invalid currency provided, supported currencies are USD, EUR and INR");
        }
    } else {
        currency = "USD";
    }

    let stats = {};

    for(let record of records_array) {
        record.salary = record.salary * conversionRates[currency] / conversionRates[record.currency];
        if(!stats[record.department]) {
            stats[record.department] = {
                min: Number.MAX_VALUE,
                max: Number.MIN_VALUE,
                total: 0,
                mean: 0,
                noOfRecords: 0
            }
        }
    }

    const departments = Object.keys(stats);

    const on_contract = req.query.on_contract;

    for(let department of departments) {
        for(let record of records_array) {
            if(on_contract=="true" && !record.on_contract) {
                continue;
            }
            if(record.department == department) {
                if(record.salary < stats[department].min) {
                    stats[department].min = record.salary;
                }
                if(record.salary > stats[department].max) {
                    stats[department].max = record.salary;
                }
                stats[department].total += record.salary;
                stats[department].noOfRecords += 1;
            }
        }
        stats[department].mean = stats[department].total / stats[department].noOfRecords;
        delete stats[department].total;
        if(stats[department].noOfRecords == 0) {
            delete stats[department];
        }
    }

    console.log(records)

    return res.status(200).send(new ApiResponse(200, {currency, stats}, "Departmental Summary Statistics fetched successfully"));
});

const getSubDepartmentalSS = asyncHandler(async (req, res) => {

    let records_array = JSON.parse(JSON.stringify(Object.values(records.data)));

    let currency = req.query.currency;

    if(currency) {
        currency = currency.toUpperCase();
        if(currency != "USD" && currency != "EUR" && currency != "INR") {
            throw new ApiError(400, "Invalid currency provided, supported currencies are USD, EUR and INR");
        }
    } else {
        currency = "USD";
    }

    let stats = {};

    const on_contract = req.query.on_contract;

    for(let record of records_array) {
        record.salary = record.salary * conversionRates[currency] / conversionRates[record.currency];
        if(on_contract=="true" && !record.on_contract) {
            continue;
        }
        if(!stats[record.department] || !stats[record.department][record.sub_department]) {
            stats[record.department] = {[record.sub_department]: {
                min: Number.MAX_VALUE,
                max: Number.MIN_VALUE,
                total: 0,
                mean: 0,
                noOfRecords: 0
            }}
        } 
    }

    for(let record of records_array) {
        if(on_contract=="true" && !record.on_contract) {
            continue;
        }
        stats[record.department][record.sub_department].total += record.salary;
        stats[record.department][record.sub_department].min = record.salary<stats[record.department][record.sub_department].min?record.salary:stats[record.department][record.sub_department].min;
        stats[record.department][record.sub_department].max = record.salary>stats[record.department][record.sub_department].max?record.salary:stats[record.department][record.sub_department].max;
        stats[record.department][record.sub_department].noOfRecords += 1;
        stats[record.department][record.sub_department].mean = stats[record.department][record.sub_department].total / stats[record.department][record.sub_department].noOfRecords;
    }

    return res.status(200).send(new ApiResponse(200, {currency, stats}, "Sub-Departmental Summary Statistics fetched successfully"));
});

export { login, logout, createRecord, updateRecord, deleteRecord, getSS, getDepartmentalSS, getSubDepartmentalSS };
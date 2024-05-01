import { Router } from "express";
import { login, createRecord, updateRecord, deleteRecord, getSS, getDepartmentalSS, getSubDepartmentalSS, logout } from "../controllers/user.controller.js";
import { body } from 'express-validator';
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/login").post(
    body("name")
        .notEmpty()
        .withMessage("User name cannot be empty"),
    body("password")
        .trim()
        .notEmpty()
        .withMessage("Password cannot be empty"),
    login
);

router.route("/logout").post(verifyJWT, logout);

router.route("/create-record").post(
    verifyJWT, 
    body("name")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please provide a name of record"),
    body("salary")
        .isInt()
        .withMessage("Please provide a valid salary of record")
        .isInt({ gt: 0 })
        .withMessage("Salary must be greater than 0"),
    body("currency")
        .trim()
        .isIn(['USD', 'EUR', 'INR'])
        .withMessage("Currency must be either USD, EUR, or INR"),
    body("department")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please provide a valid department"),
    body("sub_department")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please provide a valid sub_department"),
    createRecord
);

router.route("/update-record").post(
    verifyJWT, 
    body("record_id")
        .isInt({gt: 0})
        .withMessage("Please provide a valid record_id"),
    body("name")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please provide a name of record"),
    body("salary")
        .isInt()
        .withMessage("Please provide a valid salary of record")
        .isInt({ gt: 0 })
        .withMessage("Salary must be greater than 0"),
    body("currency")
        .trim()
        .isIn(['USD', 'EUR', 'INR'])
        .withMessage("Currency must be either USD, EUR, or INR"),
    body("department")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please provide a valid department"),
    body("sub_department")
        .trim()
        .isLength({ min: 1 })
        .withMessage("Please provide a valid sub_department"),
    updateRecord
);

router.route("/delete-record").post(verifyJWT, deleteRecord);

router.route("/get-ss").get(verifyJWT, getSS);
router.route("/get-departmental-ss").get(verifyJWT, getDepartmentalSS);
router.route("/get-subdepartmental-ss").get(verifyJWT, getSubDepartmentalSS);

export default router;
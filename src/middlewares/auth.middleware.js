import jwt, { decode } from "jsonwebtoken";
import { asyncHandler } from "../utils/asyncHandler.js";
import dotenv from "dotenv";
import { users } from "../db/index.js";
import { ApiError } from "../utils/ApiErrorRes.js";

dotenv.config({ path: "././.env" });

export const verifyJWT = asyncHandler(async (req, _, next) => {
    const token = req.cookies?.accessToken;

    console.log(token)

    if (!token) throw new ApiError(401, "Unauthorised request");

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    const user = users[decodedToken?.name];

    if (!user) {
        throw new ApiError(401, "Invalid access token");
    }

    console.log(user)

    req.user = user;
    next();
});
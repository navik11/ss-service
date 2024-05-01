import express from "express";
import cors from "cors";
import 'express-async-errors';
import bodyParser from "body-parser"
import { errorHandler } from "./middlewares/errorhandler.middleware.js";
import cookieParser from "cookie-parser";

const app = express()

app.use(
    cors({
        origin: "*",
        credentials: true,
    })
);

app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true, limit: "16kb" }))
app.use(express.static("public"))
app.use(cookieParser())

import userRoute from "./routes/user.route.js";

app.use("/api/v1/users", userRoute);

app.use(errorHandler)

export { app }

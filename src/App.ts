import bodyParser from "body-parser";
import compression from "compression";
import cors from "cors";
import dotenv from "dotenv";
import errorHandler from "errorhandler";
import express from "express";
import logger from "morgan";
import path from "path";
const fileUpload = require("express-fileupload");

export const app = express();

app.use(compression());
app.use(logger("dev"));
app.use(bodyParser.json());
app.use(fileUpload());
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");  // TODO: Set up domain name for production
    res.setHeader("Access-Control-Allow-Headers", "*");
    next();
});
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"), { maxAge: 31557600000 }));
app.use(errorHandler());

dotenv.config({ path: "./.env.dev.local" });

export const PORT = process.env.PORT;
export const BASE_URL = "/api/project";
export const HEALTHCHECK_URL = "/api/ping";

app.get(BASE_URL + "/ping", function (req, res) {
    res.statusCode = 200;
    let response = { status: "Success", error: "" };
    res.send(response);
});
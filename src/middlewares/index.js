import express from "express";
const appMiddlewares = express();

import bodyParser from "body-parser";
import multer from "multer";
const upload = multer();
import cookieParser from "cookie-parser";
import session from "express-session";
import expressEjsLayouts from "express-ejs-layouts";
import flash from "express-flash";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import "../logs/logs.js";

appMiddlewares.use(expressEjsLayouts);
appMiddlewares.use(express.static(path.join(__dirname, "../../public")));
appMiddlewares.use(bodyParser.json());
appMiddlewares.use(bodyParser.urlencoded({ extended: true }));
appMiddlewares.use(upload.array());
appMiddlewares.use(cookieParser());
appMiddlewares.use(
  session({
    secret: "secret key",
    resave: false,
    saveUninitialized: false,
  }),
);
appMiddlewares.use(flash());

export default appMiddlewares;

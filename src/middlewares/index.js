import express from "express";
const appMiddlewares = express();

import bodyParser from "body-parser";
import multer from "multer";
const upload = multer();
import expressEjsLayouts from "express-ejs-layouts";

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

export default appMiddlewares;

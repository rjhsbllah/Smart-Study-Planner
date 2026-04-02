import express from "express";
import {
  getAllHasilSpk,
  postHitung,
} from "../controllers/landingpage.controller.js";

const landingpageRouter = express.Router();

landingpageRouter.get("/", getAllHasilSpk);
landingpageRouter.post("/hitung", postHitung);

export default landingpageRouter;

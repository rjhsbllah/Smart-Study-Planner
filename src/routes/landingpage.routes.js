import express from "express";
import {
  getAllHasilSpk,
  postHitung,
  getRiwayat,
} from "../controllers/landingpage.controller.js";

const landingpageRouter = express.Router();

landingpageRouter.get("/", getAllHasilSpk);
landingpageRouter.post("/hitung", postHitung);
landingpageRouter.get("/", getRiwayat);

export default landingpageRouter;

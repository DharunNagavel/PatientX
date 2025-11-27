import express from "express";
import { addResearch,getResearch } from "../controller/profile.controller.js";

const router = express.Router();

// POST → Add new study
router.post("/add-research", addResearch);
router.get("/get-research/:user_id", getResearch);

export default router;

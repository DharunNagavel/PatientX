import { Router } from "express";
import { getResearchers } from "../controller/researcher.controller.js";

const researcherRouter = Router();

researcherRouter.get('/researchersdata', getResearchers);

export default researcherRouter;
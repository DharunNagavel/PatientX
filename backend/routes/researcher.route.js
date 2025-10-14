import { Router } from "express";
import { getResearchers,getrecords } from "../controller/researcher.controller.js";

const researcherRouter = Router();

researcherRouter.get('/researchersdata', getResearchers);

researcherRouter.get('/records', getrecords);



export default researcherRouter;
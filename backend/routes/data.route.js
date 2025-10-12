import { Router } from "express";
import {storeData,getData,grantConsent} from "../controller/data.controller.js"

const dataRouter = Router();

dataRouter.post('/storedata',storeData);
dataRouter.get('/getdata/:id',getData);
dataRouter.post("/grantConsent/:id", grantConsent);


export default dataRouter;
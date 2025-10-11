import { Router } from "express";
import { signin,signup,signout } from "../controller/auth.controller.js";

const authRouter = Router();

authRouter.post('/signup',signup);
authRouter.post('/signin',signin);
authRouter.post('/signout',signout);

export default authRouter;
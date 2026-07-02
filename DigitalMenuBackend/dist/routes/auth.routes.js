import { Router } from "express";
import { login, logout, refresh, register } from "../controllers/auth.controller.js";
import { CornerLock } from '../utils/CornerLock.js';
const authRouter = Router();
authRouter.route("/register").post(CornerLock, register);
authRouter.route("/login").post(login);
authRouter.route("/refresh").post(refresh);
authRouter.route("/logout").delete(logout);
export default authRouter;

import { Router } from "express";
import { login, logout, refresh, register } from "../controllers/auth.controller";
import { CornerLock } from '../utils/CornerLock';

const authRouter = Router();

authRouter.route("/register").post(CornerLock,register);

authRouter.route("/login").post(login);

authRouter.route("/refresh").post(refresh);

authRouter.route("/logout").delete(logout);

export default authRouter;
import { Router } from "express";
import { addItem, deleteItem, getItemsByCategory, updateItem } from "../controllers/items.controller.js";
import { authenticate, verifyCategoryOwnership, verifyItemOwnership } from '../middleware/auth.middleware.js';

const itemRouter = Router();

itemRouter.route("/add").post(authenticate,verifyCategoryOwnership,addItem);

itemRouter.route("/get").get(getItemsByCategory);

itemRouter.route("/update").patch(authenticate,verifyItemOwnership,updateItem);

itemRouter.route("/delete").delete(authenticate,verifyItemOwnership,deleteItem);

export default itemRouter
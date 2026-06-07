import { Router } from "express";
import { addItem, deleteItem, getItemsByCategory, updateItem } from "../controllers/items.controller.js";
import { authenticate, verifyItemOwnership } from '../middleware/auth.middleware';

const itemRouter = Router();

itemRouter.route("/add").post(authenticate,verifyItemOwnership,addItem);

itemRouter.route("/get").get(getItemsByCategory);

itemRouter.route("/update").patch(authenticate,verifyItemOwnership,updateItem);

itemRouter.route("/delete").delete(authenticate,verifyItemOwnership,deleteItem);

export default itemRouter
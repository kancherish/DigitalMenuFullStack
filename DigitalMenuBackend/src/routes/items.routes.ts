import { Router } from "express";
import { addItem, deleteItem, getItemsByCategory, updateItem } from "../controllers/items.controller.js";

const itemRouter = Router();

itemRouter.route("/add").post(addItem);

itemRouter.route("/get").get(getItemsByCategory);

itemRouter.route("/update").patch(updateItem);

itemRouter.route("/delete").delete(deleteItem);

export default itemRouter
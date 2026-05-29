import { Router } from "express";
import { addItem, deleteItem, getItemsByCategory, updateItem } from "../controllers/items.controller";

const itemRouter = Router();

itemRouter.route("/add").put(addItem);

itemRouter.route("/get").get(getItemsByCategory);

itemRouter.route("/updateItem").patch(updateItem);

itemRouter.route("/delete").delete(deleteItem);

export default itemRouter
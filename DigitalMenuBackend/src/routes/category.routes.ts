import { Router } from "express";
import { addCategory, deleteCategory, getCategoriesByRestaurant, updateCategory } from "../controllers/category.controller.js";

const categoryRouter = Router();

categoryRouter.route("/add").post(addCategory);

categoryRouter.route("/get").get(getCategoriesByRestaurant)

categoryRouter.route("/update").patch(updateCategory);

categoryRouter.route("/delete").delete(deleteCategory);

export default categoryRouter
import { Router } from "express";
import { addCategory, deleteCategory, getCategoriesByRestaurant, updateCategory } from "../controllers/category.controller";

const categoryRouter = Router();

categoryRouter.route("/add").put(addCategory);

categoryRouter.route("/getCategories").get(getCategoriesByRestaurant)

categoryRouter.route("/update").patch(updateCategory);

categoryRouter.route("delete").delete(deleteCategory);

export default categoryRouter
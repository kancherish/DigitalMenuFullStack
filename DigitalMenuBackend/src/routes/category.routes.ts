import { Router } from "express";
import { addCategory, deleteCategory, getCategoriesByRestaurant, updateCategory } from "../controllers/category.controller.js";
import { authenticate, verifyRestaurantOwnership } from '../middleware/auth.middleware';

const categoryRouter = Router();

categoryRouter.route("/add").post(authenticate,verifyRestaurantOwnership,addCategory);

categoryRouter.route("/get").get(getCategoriesByRestaurant);

categoryRouter.route("/update").patch(authenticate,verifyRestaurantOwnership,updateCategory);

categoryRouter.route("/delete").delete(authenticate,verifyRestaurantOwnership,deleteCategory);

export default categoryRouter
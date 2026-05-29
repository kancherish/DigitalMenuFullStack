import { Router } from "express";
import { addResturant,getRestaurantInfo,updateRestaurantInfo } from "../controllers/restaurant.controller.js";

const restaurantRouter = Router();

restaurantRouter.route("/add").post(addResturant)

restaurantRouter.route("/get").get(getRestaurantInfo)

restaurantRouter.route("/update").patch(updateRestaurantInfo)


export default restaurantRouter
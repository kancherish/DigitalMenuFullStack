import { Router } from "express";
import { addResturant,getRestaurantInfo,updateRestaurantInfo } from "../controllers/restaurant.controller.js";
import { authenticate, verifyRestaurantOwnership } from '../middleware/auth.middleware.js';

const restaurantRouter = Router();

// restaurantRouter.route("/add").post(addResturant) NO NEED AS RESTURANT WILL BE CREATED WITH ADMIN ONLY

restaurantRouter.route("/get/:rid").get(getRestaurantInfo)

restaurantRouter.route("/update").patch(authenticate,verifyRestaurantOwnership,updateRestaurantInfo)


export default restaurantRouter
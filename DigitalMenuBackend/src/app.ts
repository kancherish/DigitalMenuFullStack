import express from "express"
import cors from "cors"
import errorMiddleware from "./middleware/error.middleware.js";
import HealthRouter from "./routes/health.routes.js";
import { ErrorResponse } from "./utils/Error-Response.js";
import restaurantRouter from "./routes/restaurant.routes.js";
import categoryRouter from "./routes/category.routes.js";
import itemRouter from "./routes/items.routes.js";

const app = express()

//basic Config
app.use(express.json({limit:"16KB"}));
app.use(express.urlencoded({extended:true,limit:"16KB"}));

//cors
app.use(cors({
    origin:["*"],
    credentials:true,
    methods:["GET","POST","PUT","DELETE","PATCH"],
    allowedHeaders:["Content-Type","Authorization"]
}))

//import routera
app.use("/api/v1/health",HealthRouter)
app.use("/api/v1/restaurant",restaurantRouter)
app.use("/api/v1/category",categoryRouter)
app.use("/api/v1/item",itemRouter)


//fallback for invalid api url
app.use((req,res)=>{
    res.json(new ErrorResponse(
        404,
        "INVALID API",
    ))
})

app.use(errorMiddleware);

export default app
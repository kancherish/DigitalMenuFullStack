import express from "express"
import cors from "cors"
import errorMiddleware from "./middleware/error.middleware.js";
import HealthRouter from "./routes/health.routes.js";
import { ErrorResponse } from "./utils/Error-Response.js";
import restaurantRouter from "./routes/restaurant.routes.js";
import categoryRouter from "./routes/category.routes.js";
import itemRouter from "./routes/items.routes.js";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

const app = express()

//protection
app.use(helmet());

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // Time window (e.g., 15 minutes)
  max: 100, // Limit each IP to 100 requests per `window`
  message: "Too many requests, please try again later.",
  standardHeaders: 'draft-8', // Returns standard RateLimit headers
  legacyHeaders: false, // Disables old `X-RateLimit-*` headers
});

// Apply to all requests
app.use(limiter);

//cookie parsing for jwt auth
app.use(cookieParser());

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

//import routers
app.use("/api/v1/health",HealthRouter)
app.use("/api/v1/auth",authRouter)
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
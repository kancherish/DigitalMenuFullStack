import express from "express"
import cors from "cors"
import errorMiddleware from "./middleware/error.middleware.js";
import HealthRouter from "./routes/health.routes.js";
import { ErrorResponse } from "./utils/Error-Response.js";
import restaurantRouter from "./routes/restaurant.routes.js";
import categoryRouter from "./routes/category.routes.js";
import itemRouter from "./routes/items.routes.js";
// import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
// import { prisma } from "./lib/prisma.js";

const app = express()

const STATIC_ORIGINS = new Set([
  "http://localhost:3000",
  "http://192.168.1.12:3000",
  "http://localhost:5173",
])

app.set("trust proxy", 1);

// let allowedOrigins: Set<string|null> = new Set([""]);

// export async function refreshOrigins() {
//   const restaurants = await prisma.restaurant.findMany({
//     select: { domain: true },
//     where: { domain: { not: "" } },
//   });

//   allowedOrigins = new Set((restaurants ?? []).map(r => r.domain));
// }

const corsError = (message: string) => {
  const error = new ErrorResponse(403, message);
  (error as any).stack = undefined;
  return error;
}

app.use(cors({
  origin(origin, callback) {
    if (!origin) {
      return callback(null, true);
    }

    if (!STATIC_ORIGINS.has(origin)) {
      return callback(corsError("Origin not allowed"));
    }

    callback(null, true);
  },
  credentials: true,
}));

//protection
app.use(helmet({
  crossOriginResourcePolicy: false
}));

app.set("trust proxy", 1);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 1000,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: "Too many requests, please try again later.",
});

// Apply to all requests
app.use(limiter);

// //cookie parsing for jwt auth
// app.use(cookieParser());

//basic Config
app.use(express.json({ limit: "16KB" }));
app.use(express.urlencoded({ extended: true, limit: "16KB" }));

//import routers
app.use("/api/v1/health", HealthRouter)
app.use("/api/v1/auth", authRouter)
app.use("/api/v1/restaurant", restaurantRouter)
app.use("/api/v1/category", categoryRouter)
app.use("/api/v1/item", itemRouter)


//fallback for invalid api url
app.use((req, res) => {
  res.status(404).json(new ErrorResponse(
    404,
    "INVALID API",
  ))
})

app.use(errorMiddleware);

export default app
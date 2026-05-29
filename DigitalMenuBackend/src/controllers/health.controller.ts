import type { Request,Response } from "express";
import ApiResponse from "../utils/API-Response.js";

export const healthcheck = (req:Request,res:Response)=>{
    res.json(new ApiResponse(
        200,
        null,
        true,
        "Health is OK!"
    ))
}
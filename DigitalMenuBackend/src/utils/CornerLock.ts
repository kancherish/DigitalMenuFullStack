import { Request,Response,NextFunction } from "express"
import { asyncHandler } from "./asyncHandeler.js"
import bcrypt from "bcryptjs";
import { CORNERAUTHSECRET } from "../env.js";

export const CornerLock = asyncHandler(async (req: Request, res:Response , next:NextFunction)=>{
    const secret_key = req.cookies.tempdata
 
    const valid = await bcrypt.compare(secret_key || "",CORNERAUTHSECRET || "");
    if (valid) {
        next()
    } else {
       return res.status(400).json({msg:"FUCK YOU A PEICE OF SHIT!"})
    }


});
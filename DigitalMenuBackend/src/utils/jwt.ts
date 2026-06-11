import jwt, { Algorithm, SignOptions } from "jsonwebtoken"; // 1. Import Algorithm type
import { JWT_ACCESS_EXPIRES_IN, JWT_ACCESS_SECRET, JWT_ALGO, JWT_REFRESH_EXPIRES_IN, JWT_REFRESH_SECRET } from "../env.js";
import { Response , Request , NextFunction } from "express";

export interface TokenPayload {
  publicId: string;
  username: string;
  restaurantId?: string | null;
}

export const generateAccessToken = (payload: TokenPayload): string => {
  return jwt.sign(
    payload, 
    JWT_ACCESS_SECRET!, 
    { 
      expiresIn: String(JWT_ACCESS_EXPIRES_IN), 
      algorithm: JWT_ALGO as Algorithm 
    } as SignOptions
  );
};


export const generateRefreshToken = (payload: TokenPayload): string => {
  return jwt.sign(
    payload, 
    JWT_REFRESH_SECRET!, 
    { 
      expiresIn: String(JWT_REFRESH_EXPIRES_IN), 
      algorithm: JWT_ALGO as Algorithm 
    } as SignOptions
  );
};

export const verifyAccessToken = (token: string): TokenPayload | null => {
  try { 
    const decoded = jwt.verify(token, JWT_ACCESS_SECRET as string) as TokenPayload;
    return decoded
   }
  catch { return null; }
};

export const verifyRefreshToken = (token: string): TokenPayload | null => {
  try { 
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET as string) as TokenPayload;
    return decoded 
 }
  catch { return null; }
};

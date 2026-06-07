// src/middleware/auth.ts
import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt.js';
import { ErrorResponse } from '../utils/Error-Response.js';
import { prisma } from '../lib/prisma.js';

declare global {
  namespace Express {
    interface Request {
      admin?: TokenPayload;
    }
  }
}

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  const accessToken = req.cookies.accessToken;
  if (!accessToken) {
    res.status(401).json(new ErrorResponse(401, 'No access token provided'));
    return;
  }
  const decoded = verifyAccessToken(accessToken);
  if (!decoded) {
    res.status(401).json(new ErrorResponse(401, 'Invalid or expired access token'));
    return;
  }
  req.admin = decoded;
  next();
};

export const verifyRestaurantOwnership = async (req: Request, res: Response, next: NextFunction) => {
  const restaurantId = req.body?.para?.restaurant_id;
  if (!restaurantId) {
    res.status(400).json(new ErrorResponse(400, 'restaurant_id missing in request body'));
    return;
  }
  const restaurant = await prisma.restaurant.findUnique({
    where: { publicId: restaurantId },
    include: { admin: true }
  });
  if (!restaurant || restaurant.admin.publicId !== req.admin?.publicId) {
    res.status(403).json(new ErrorResponse(403, 'You do not own this restaurant'));
    return;
  }
  next();
};

export const verifyItemOwnership = async (req: Request, res: Response, next: NextFunction) => {
  const categoryId = req.body?.para?.category_id;
  if (!categoryId) {
    res.status(400).json(new ErrorResponse(400, 'category_id missing in request body'));
    return;
  }
  const category = await prisma.category.findUnique({
    where: { publicId: categoryId },
    include: { restaurant: { include: { admin: true } } }
  });
  if (!category || category.restaurant.admin.publicId !== req.admin?.publicId) {
    res.status(403).json(new ErrorResponse(403, 'You do not own the restaurant that owns this category'));
    return;
  }
  next();
};
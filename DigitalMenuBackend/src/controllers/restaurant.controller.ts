import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandeler.js";
import { ErrorResponse } from "../utils/Error-Response.js";
import ApiResponse from "../utils/API-Response.js";

export const addResturant = asyncHandler(async (req: Request, res: Response) => {
       //NO NEED AS OF NOW RESTAURANT WILL BE CREATED WITH ADMIN
});

export const getRestaurantInfo = asyncHandler(async (req: Request, res: Response) => {
  const restaurant_id = String(req.query.r_id) || undefined;

  if (!restaurant_id) {
    res.status(400).json(
      new ErrorResponse(400, "Missing 'restaurant_id' in request query r_id")
    );
    return;
  }

  const restaurant = await prisma.restaurant.findUnique({
    where: { publicId: restaurant_id },
  });

  if (!restaurant) {
    res.status(404).json(
      new ErrorResponse(404, `Restaurant with id ${restaurant_id} not found`)
    );
    return;
  }

  res.status(200).json(new ApiResponse(200, restaurant, true, "Restaurant fetched successfully"));
});

export const updateRestaurantInfo = asyncHandler(async (req: Request, res: Response) => {
  const { restaurant_id, name, tagline, primaryColor, accentColor } = req.body?.para || {};

  if (!restaurant_id) {
    res.status(400).json(
      new ErrorResponse(400, "Missing 'restaurant_id' in request body.para")
    );
    return;
  }

  const existing = await prisma.restaurant.findUnique({
    where: { publicId: restaurant_id },
  });

  if (!existing) {
    res.status(404).json(
      new ErrorResponse(404, `Restaurant with id ${restaurant_id} not found`)
    );
    return;
  }

  const updateData: { name?: string; tagline?: string; primaryColor?: string; accentColor?: string } = {};
  if (name !== undefined) updateData.name = name;
  if (tagline !== undefined) updateData.tagline = tagline;
  if (primaryColor !== undefined) updateData.primaryColor = primaryColor;
  if (accentColor !== undefined) updateData.accentColor = accentColor;

  if (Object.keys(updateData).length === 0) {
    res.status(400).json(
      new ErrorResponse(400, "No update fields provided (name, tagline, primaryColor, accentColor)")
    );
    return;
  }

  const updatedRestaurant = await prisma.restaurant.update({
    where: { publicId: restaurant_id },
    data: updateData,
  });

  res.status(200).json(new ApiResponse(200, updatedRestaurant, true, "Restaurant updated successfully"));
});
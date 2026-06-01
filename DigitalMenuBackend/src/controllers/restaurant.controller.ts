import type { Request, Response } from "express"; // Import both
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandeler.js" // assuming you have your asyncHandler
import { ErrorResponse } from "../utils/Error-Response.js";


// Proper route handler with asyncHandler
export const addResturant = asyncHandler(async (req: Request, res: Response) => {
  // Safely extract with default empty object
  const { name, tagline, primaryColor, accentColor } = req.body?.para || {};

  // Validate required fields
  if (!name || !tagline || !primaryColor || !accentColor) {
    res.json(new ErrorResponse(
        400,
        "Failed to add as request missing one of the paramter in the Body (name,tagline,primaryColor,accentColor)"
    ));
    return;
  }

  const config = await prisma.restaurant.create({
    data: {
      name,
      tagline,
      primaryColor,
      accentColor,
    },
  });

  res.status(201).json({
    success: true,
    data: config,
  });
});

// Also fix getRestaurantInfo to send response
export const getRestaurantInfo = asyncHandler(async (req: Request, res: Response) => {

  const restaurant_id  = String(req.query.r_id) || undefined;

  // Validate presence of id
  if (!restaurant_id) {
    res.status(400).json(
      new ErrorResponse(400, "Missing 'restaurant_id' in request body.para")
    );
    return;
  }

  // Fetch restaurant from database
  const restaurant = await prisma.restaurant.findUnique({
    where: { publicId: restaurant_id }
  });

  // Handle case where id doesn't exist
  if (!restaurant) {
    res.status(404).json(
      new ErrorResponse(404, `Restaurant with id ${restaurant_id} not found`)
    );
    return;
  }

  // Success response
  res.status(200).json({
    success: true,
    data: restaurant,
  });
});

export const updateRestaurantInfo = asyncHandler(async (req: Request, res: Response) => {
  // Extract from body.para (same pattern as addResturant)
  const { restaurant_id, name, tagline, primaryColor, accentColor } = req.body?.para || {};

  // Validate restaurant ID
  if (!restaurant_id) {
    res.status(400).json(
      new ErrorResponse(400, "Missing 'restaurant_id' in request body.para")
    );
    return;
  }

  // Check if restaurant exists first (optional but good practice)
  const existing = await prisma.restaurant.findUnique({
    where: { publicId: restaurant_id }
  });

  if (!existing) {
    res.status(404).json(
      new ErrorResponse(404, `Restaurant with id ${restaurant_id} not found`)
    );
    return;
  }

  // Build update data object – only include fields that were provided
  const updateData: { name?: string; tagline?: string; primaryColor?: string; accentColor?: string } = {};
  if (name !== undefined) updateData.name = name;
  if (tagline !== undefined) updateData.tagline = tagline;
  if (primaryColor !== undefined) updateData.primaryColor = primaryColor;
  if (accentColor !== undefined) updateData.accentColor = accentColor;

  // If no fields to update, return early (optional, could also just return existing)
  if (Object.keys(updateData).length === 0) {
    res.status(400).json(
      new ErrorResponse(400, "No update fields provided (name, tagline, primaryColor, accentColor)")
    );
    return;
  }

  // Perform update
  const updatedRestaurant = await prisma.restaurant.update({
    where: { publicId: restaurant_id },
    data: updateData,
  });

  res.status(200).json({
    success: true,
    data: updatedRestaurant,
  });
});

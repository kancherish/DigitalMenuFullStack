import type { Request, Response } from "express"; // Import both
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandeler.js" // assuming you have your asyncHandler
import { ErrorResponse } from "../utils/Error-Response.js";

export const addCategory = asyncHandler(async (req: Request, res: Response) => {
  // Extract from body.para (same pattern as addResturant)
  const { name, restaurant_id } = req.body?.para || {};

  // Validate required fields
  if (!name || !restaurant_id) {
    res.status(400).json(
      new ErrorResponse(
        400,
        "Missing required parameter(s): name, restaurant_id"
      )
    );
    return;
  }

  // Optional: verify that the restaurant exists before creating category
  const restaurantExists = await prisma.restaurant.findUnique({
    where: { publicId: restaurant_id }
  });

  if (!restaurantExists) {
    res.status(404).json(
      new ErrorResponse(404, `Restaurant with id ${restaurant_id} not found`)
    );
    return;
  }

  // Create category
  const category = await prisma.category.create({
    data: {
      name,
      restaurant_id,
    },
  });

  res.status(201).json({
    success: true,
    data: category,
  });
});
export const getCategoriesByRestaurant = asyncHandler(async (req: Request, res: Response) => {

  const restaurant_id = String(req.query.r_id);
  // Query param ?incItem=true – default false if not provided or not "true"
  const includeItems = req.query.incItem === "true";

  if (!restaurant_id) {
    res.status(400).json(new ErrorResponse(400, "Valid restaurant_id is required in URL param :r_id"));
    return;
  }

  const restaurantExists = await prisma.restaurant.findUnique({
    where: { publicId: restaurant_id }
  });
  if (!restaurantExists) {
    res.status(404).json(new ErrorResponse(404, `Restaurant ${restaurant_id} not found`));
    return;
  }

  // If we include items, always include variants (no separate flag needed)
  const include = includeItems ? { items: { include: { variants: true } } } : {};

  const categories = await prisma.category.findMany({
    where: { restaurant_id },
    orderBy: { id: 'asc' },
    include,
  });

  res.status(200).json({ success: true, data: categories });
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  // Extract from body.para
  const { category_id, name, restaurant_id } = req.body?.para || {};

  // Validate category ID is provided
  if (!category_id) {
    res.status(400).json(
      new ErrorResponse(400, "Missing 'category_id' in request body.para")
    );
    return;
  }

  // Check if category exists
  const existingCategory = await prisma.category.findUnique({
    where: {publicId: category_id }
  });

  if (!existingCategory) {
    res.status(404).json(
      new ErrorResponse(404, `Category with id ${category_id} not found`)
    );
    return;
  }

  // Build update data – only include fields that were provided
  const updateData: { name?: string; restaurant_id?: string } = {};
  if (name !== undefined) updateData.name = name;
  if (restaurant_id !== undefined) updateData.restaurant_id = restaurant_id;

  // If no fields to update, return early
  if (Object.keys(updateData).length === 0) {
    res.status(400).json(
      new ErrorResponse(400, "No update fields provided (name or restaurant_id)")
    );
    return;
  }

  // If changing restaurant_id, verify the new restaurant exists
  if (restaurant_id !== undefined) {
    const newRestaurant = await prisma.restaurant.findUnique({
      where: { id: restaurant_id }
    });
    if (!newRestaurant) {
      res.status(404).json(
        new ErrorResponse(404, `Restaurant with id ${restaurant_id} not found`)
      );
      return;
    }
  }

  // Perform update
  const updatedCategory = await prisma.category.update({
    where: { publicId: category_id },
    data: updateData,
  });

  res.status(200).json({
    success: true,
    data: updatedCategory,
  });
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  // Extract category_id from body.para
  const { category_id } = req.body?.para || {};

  // Validate category ID
  if (!category_id) {
    res.status(400).json(
      new ErrorResponse(400, "Missing 'category_id' in request body.para")
    );
    return;
  }

  // Check if category exists
  const existingCategory = await prisma.category.findUnique({
    where: { publicId: category_id }
  });

  if (!existingCategory) {
    res.status(404).json(
      new ErrorResponse(404, `Category with id ${category_id} not found`)
    );
    return;
  }

  // Delete category (items and variants will be cascade deleted automatically)
  await prisma.category.delete({
    where: { publicId: category_id },
  });

  res.status(200).json({
    success: true,
    message: `Category with id ${category_id} deleted successfully`,
    data: null,
  });
});
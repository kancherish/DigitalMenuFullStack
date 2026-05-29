import type { Request, Response } from "express";
import { prisma } from "../lib/prisma.js";
import { asyncHandler } from "../utils/asyncHandeler.js";
import { ErrorResponse } from "../utils/Error-Response.js";

type VariantInput = { name: string; price: number };
type AddItemBody = { name?: string; description?: string; price?: unknown; category_id?: unknown; variants?: unknown[] };
type GetItemsBody = { category_id?: unknown; includeVariants?: unknown };
type DeleteItemBody = { item_id?: unknown };

const toNumber = (val: unknown): number | null => {
  if (typeof val === "number") return val;
  if (typeof val === "string") {
    const num = parseFloat(val);
    return isNaN(num) ? null : num;
  }
  return null;
};

const toBoolean = (val: unknown): boolean => {
  if (typeof val === "boolean") return val;
  if (typeof val === "string") return val === "true";
  return !!val;
};

export const addItem = asyncHandler(async (req: Request, res: Response) => {
  const { name, description, price, category_id, variants } = (req.body?.para || {}) as AddItemBody;

  if (!name || !category_id) {
    res.status(400).json(new ErrorResponse(400, "Missing required fields: name, category_id"));
    return;
  }

  const categoryIdNum = toNumber(category_id);
  if (categoryIdNum === null) {
    res.status(400).json(new ErrorResponse(400, "category_id must be a valid number"));
    return;
  }

  const category = await prisma.category.findUnique({ where: { id: categoryIdNum } });
  if (!category) {
    res.status(404).json(new ErrorResponse(404, `Category with id ${categoryIdNum} not found`));
    return;
  }

  const priceNum = toNumber(price);
  const hasPrice = priceNum !== null;
  const hasVariants = Array.isArray(variants) && variants.length > 0;

  if (hasPrice && hasVariants) {
    res.status(400).json(new ErrorResponse(400, "Cannot have both price and variants"));
    return;
  }
  if (!hasPrice && !hasVariants) {
    res.status(400).json(new ErrorResponse(400, "Must have either price or variants"));
    return;
  }

  let validatedVariants: VariantInput[] = [];
  if (hasVariants) {
    for (const v of variants) {
      const variant = v as { name?: unknown; price?: unknown };
      const variantName = variant?.name;
      const variantPrice = toNumber(variant?.price);
      if (typeof variantName !== "string" || variantPrice === null) {
        res.status(400).json(new ErrorResponse(400, "Each variant must have a name string and numeric price"));
        return;
      }
      validatedVariants.push({ name: variantName, price: variantPrice });
    }
  }

  // Build data object without undefined optional fields
  const data: any = { name, description: description || null, category_id: categoryIdNum };
  if (hasPrice) data.price = priceNum;
  if (hasVariants) data.variants = { create: validatedVariants };

  const item = await prisma.item.create({ data, include: { variants: true } });
  res.status(201).json({ success: true, data: item });
});

export const updateItem = asyncHandler(async (req: Request, res: Response) => {
  const { item_id, name, description, price, category_id, variants } = req.body?.para || {};

  if (!item_id) {
    res.status(400).json(
      new ErrorResponse(400, "Missing 'item_id' in request body.para")
    );
    return;
  }

  // Check item exists and get current data
  const existingItem = await prisma.item.findUnique({
    where: { id: item_id },
    include: { variants: true }
  });
  if (!existingItem) {
    res.status(404).json(
      new ErrorResponse(404, `Item with id ${item_id} not found`)
    );
    return;
  }

  // Determine what's being updated
  const hasPrice = price !== undefined;
  const hasVariants = variants !== undefined; // even empty array means clear variants
  const willHaveVariants = hasVariants ? (Array.isArray(variants) && variants.length > 0) : undefined;

  // Enforce mutual exclusivity in update
  if (hasPrice && hasVariants) {
    res.status(400).json(
      new ErrorResponse(400, "Cannot update both price and variants at the same time. Choose one mode.")
    );
    return;
  }

  // If switching to price mode (and price provided)
  if (hasPrice && price !== null) {
    // Will delete all existing variants
    // No need to check further
  }
  // If switching to variant mode (variants array provided)
  else if (hasVariants) {
    if (willHaveVariants) {
      // Validate variants
      for (const v of variants) {
        if (!v.name || v.price === undefined) {
          res.status(400).json(
            new ErrorResponse(400, "Each variant must have a name and price.")
          );
          return;
        }
      }
    }
    // If variants is empty array, that means clear all variants and also set price? No – you cannot have empty variants.
    if (variants.length === 0) {
      res.status(400).json(
        new ErrorResponse(400, "If providing variants, at least one variant is required. To remove variants, switch to price mode by providing a price.")
      );
      return;
    }
  }

  // Build update data
  const updateData: any = {};
  if (name !== undefined) updateData.name = name;
  if (description !== undefined) updateData.description = description;
  if (category_id !== undefined) {
    const newCategory = await prisma.category.findUnique({
      where: { id: category_id }
    });
    if (!newCategory) {
      res.status(404).json(new ErrorResponse(404, `Category with id ${category_id} not found`));
      return;
    }
    updateData.category_id = category_id;
  }

  // Handle price/variant switch
  if (hasPrice) {
    // Set price, and delete all variants
    updateData.price = price;
    // We'll delete variants after or use transaction
  }
  if (hasVariants) {
    // Set price to null, and replace variants
    updateData.price = null;
    // We'll handle variant replacement
  }

  // Use transaction to ensure consistency
  const updatedItem = await prisma.$transaction(async (tx) => {
    // Apply basic updates
    const item = await tx.item.update({
      where: { id: item_id },
      data: updateData,
    });

    // Handle variant changes
    if (hasPrice) {
      // Delete all variants
      await tx.variant.deleteMany({
        where: { item_id },
      });
    } else if (hasVariants) {
      // Replace all variants: delete existing, create new
      await tx.variant.deleteMany({
        where: { item_id },
      });
      if (willHaveVariants) {
        await tx.variant.createMany({
          data: variants.map((v: { name: string; price: number }) => ({
            name: v.name,
            price: v.price,
            item_id,
          })),
        });
      }
    }

    // Return item with variants
    return tx.item.findUnique({
      where: { id: item_id },
      include: { variants: true },
    });
  });

  res.status(200).json({
    success: true,
    data: updatedItem,
  });
});

export const getItemsByCategory = asyncHandler(async (req: Request, res: Response) => {
  const { category_id, includeVariants } = (req.body?.para || {}) as GetItemsBody;

  if (!category_id) {
    res.status(400).json(new ErrorResponse(400, "Missing 'category_id'"));
    return;
  }

  const categoryIdNum = toNumber(category_id);
  if (categoryIdNum === null) {
    res.status(400).json(new ErrorResponse(400, "category_id must be a valid number"));
    return;
  }

  const includeVariantsBool = toBoolean(includeVariants ?? true);

  // Build args object without undefined include
  const findManyArgs: any = {
    where: { category_id: categoryIdNum },
    orderBy: { id: "asc" },
  };
  if (includeVariantsBool) {
    findManyArgs.include = { variants: true };
  }

  const items = await prisma.item.findMany(findManyArgs);
  res.status(200).json({ success: true, data: items });
});

export const deleteItem = asyncHandler(async (req: Request, res: Response) => {
  const { item_id } = (req.body?.para || {}) as DeleteItemBody;

  if (!item_id) {
    res.status(400).json(new ErrorResponse(400, "Missing 'item_id'"));
    return;
  }

  const itemIdNum = toNumber(item_id);
  if (itemIdNum === null) {
    res.status(400).json(new ErrorResponse(400, "item_id must be a valid number"));
    return;
  }

  const existingItem = await prisma.item.findUnique({ where: { id: itemIdNum } });
  if (!existingItem) {
    res.status(404).json(new ErrorResponse(404, `Item with id ${itemIdNum} not found`));
    return;
  }

  await prisma.item.delete({ where: { id: itemIdNum } });
  res.status(200).json({ success: true, message: `Item ${itemIdNum} deleted` });
});
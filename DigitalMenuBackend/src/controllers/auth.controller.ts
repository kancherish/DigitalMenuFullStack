// src/controllers/auth.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../utils/asyncHandeler.js';
import ApiResponse from '../utils/API-Response.js';
import { ErrorResponse } from '../utils/Error-Response.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { NavStyle } from '../generated/prisma/enums.js';
import { refreshOrigins } from '../app.js';


export const register = asyncHandler(async (req: Request, res: Response) => {
  const { username, password, restaurantName, tagline, primaryColor, accentColor, tabStyle, roundness,
     showSearch ,showItemCount,stickyNav,domain} = req.body?.para || {};

  if (!username || !password) {
    res.status(400).json(new ErrorResponse(400, 'Username and password required'));
    return;
  }

  if (!restaurantName) {
    res.status(400).json(new ErrorResponse(400, 'Restaurant name is required'));
    return;
  }

  const existing = await prisma.restaurantAdmin.findUnique({ where: { username } });
  if (existing) {
    res.status(409).json(new ErrorResponse(409, 'Username already taken'));
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const adminPublicId = crypto.randomUUID();
  const restaurantPublicId = crypto.randomUUID();

  // Use transaction to create both admin and restaurant
  const result = await prisma.$transaction(async (tx) => {
    // 1. Create admin
    const admin = await tx.restaurantAdmin.create({
      data: {
        publicId: adminPublicId,
        username,
        password: hashedPassword,
      },
    });

    // 2. Create restaurant linked to the admin
    const restaurant = await tx.restaurant.create({
      data: {
        publicId: restaurantPublicId,
        name: restaurantName,
        tagline: tagline || null,
        primaryColor: primaryColor || '#000000',
        accentColor: accentColor || '#ffffff',
        tabStyle: tabStyle || NavStyle.tabs,
        roundness: roundness || "1rem",
        adminId: admin.publicId,
        showSearch,
        showItemCount,
        stickyNav,
        domain
      },
    });

    
    return { admin, restaurant };
  });
  
  const { admin, restaurant } = result;
  
  // Prepare JWT payload
  const payload = {
    publicId: admin.publicId,
    username: admin.username,
    restaurantId: restaurant.publicId,
  };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);
  
  // Store hashed refresh token
  const hashedRefresh = await bcrypt.hash(refreshToken, 10);
  await prisma.restaurantAdmin.update({
    where: { publicId: admin.publicId },
    data: { refreshToken: hashedRefresh },
  });
  
  await refreshOrigins();

  // Return tokens in response body
  res.status(201).json(new ApiResponse(201, {
    accessToken,
    refreshToken,
    admin: { publicId: admin.publicId, username: admin.username },
    restaurant,
  }, true, 'Registration successful'));
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const { username, password } = req.body?.para || {};
  if (!username || !password) {
    res.status(400).json(new ErrorResponse(400, 'Username and password required'));
    return;
  }

  const admin = await prisma.restaurantAdmin.findUnique({
    where: { username },
    include: { restaurant: true },
  });

  if (!admin) {
    res.status(401).json(new ErrorResponse(401, 'Invalid credentials'));
    return;
  }

  const isPasswordValid = await bcrypt.compare(password, admin.password);
  if (!isPasswordValid) {
    res.status(401).json(new ErrorResponse(401, 'Invalid credentials'));
    return;
  }

  if (!admin.publicId || !admin.username || !admin.restaurant?.publicId) {
    res.status(400).json(new ErrorResponse(400, 'Failed to create user'));
    return;
  }

  const payload = { publicId: admin.publicId, username: admin.username, restaurantId: admin.restaurant.publicId };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const hashedRefresh = await bcrypt.hash(refreshToken, 10);
  await prisma.restaurantAdmin.update({
    where: { publicId: admin.publicId },
    data: { refreshToken: hashedRefresh },
  });

  // Return tokens in response body
  res.status(200).json(new ApiResponse(200, {
    accessToken,
    refreshToken,
    admin: { publicId: admin.publicId, username: admin.username, restaurant: admin.restaurant }
  }, true, 'Login successful'));
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  // Extract refresh token from Authorization header (Bearer <token>)
  const authHeader = req.headers.authorization;
  const refreshToken = authHeader?.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;
  if (!refreshToken) {
    res.status(401).json(new ErrorResponse(401, 'No refresh token provided'));
    return;
  }

  const decoded = verifyRefreshToken(refreshToken);
  if (!decoded) {
    res.status(401).json(new ErrorResponse(401, 'Invalid refresh token'));
    return;
  }

  const admin = await prisma.restaurantAdmin.findUnique({
    where: { publicId: decoded.publicId },
  });
  if (!admin || !admin.refreshToken) {
    res.status(401).json(new ErrorResponse(401, 'Invalid refresh token'));
    return;
  }

  const isValid = await bcrypt.compare(refreshToken, admin.refreshToken);
  if (!isValid) {
    res.status(401).json(new ErrorResponse(401, 'Invalid refresh token'));
    return;
  }

  if (!admin.publicId || !admin.username || !decoded.restaurantId) {
    res.status(400).json(new ErrorResponse(400, 'Failed to refresh token'));
    return;
  }

  const payload = {
    publicId: admin.publicId,
    username: admin.username,
    restaurantId: decoded.restaurantId,
  };

  const newAccessToken = generateAccessToken(payload);
  const newRefreshToken = generateRefreshToken(payload);
  const hashedRefresh = await bcrypt.hash(newRefreshToken, 10);

  await prisma.restaurantAdmin.update({
    where: { publicId: admin.publicId },
    data: { refreshToken: hashedRefresh },
  });

  res.status(200).json(new ApiResponse(200, { accessToken: newAccessToken, refreshToken: newRefreshToken }, true, 'Access token refreshed'));
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const { refreshToken } = req.body?.para || {};
  if (refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);
    if (decoded) {
      await prisma.restaurantAdmin.update({
        where: { publicId: decoded.publicId },
        data: { refreshToken: null },
      });
    }
  }
  res.status(200).json(new ApiResponse(200, null, true, 'Logged out successfully'));
});


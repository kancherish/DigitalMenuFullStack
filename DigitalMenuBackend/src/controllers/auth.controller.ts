// src/controllers/auth.ts
import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import { asyncHandler } from '../utils/asyncHandeler.js';
import ApiResponse from '../utils/API-Response.js';
import { ErrorResponse } from '../utils/Error-Response.js';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt.js';
import { setTokenCookies } from '../utils/jwt.js';

export const register = asyncHandler(async (req: Request, res: Response) => {

  const { username, password, restaurantName, tagline, primaryColor, accentColor } = req.body?.para || {};

  console.log(req.body)

  if (!username || !password) {
    res.status(400).json(new ErrorResponse(400, 'Username and password required'));
    return;
  }

  const existing = await prisma.restaurantAdmin.findUnique({ where: { username } });
  if (existing) {
    res.status(409).json(new ErrorResponse(409, 'Username already taken'));
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const adminPublicId = crypto.randomUUID();

  const admin = await prisma.restaurantAdmin.create({
    data: { publicId: adminPublicId, username, password: hashedPassword },
  });

  let restaurant = null;
  if (restaurantName) {
    restaurant = await prisma.restaurant.create({
      data: {
        publicId: crypto.randomUUID(),
        name: restaurantName,
        tagline: tagline || null,
        primaryColor: primaryColor || '#000000',
        accentColor: accentColor || '#ffffff',
        adminId: admin.publicId,
      },
    });
  }

  if (!admin.publicId || !admin.username || !restaurant?.publicId) {
    return res.status(400).json(new ErrorResponse(400,"Failed To create User"));
  }

  const payload = { publicId: admin.publicId, username: admin.username, restaurantId: restaurant?.publicId };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const hashedRefresh = await bcrypt.hash(refreshToken, 10);
  await prisma.restaurantAdmin.update({
    where: { publicId: admin.publicId },
    data: { refreshToken: hashedRefresh },
  });

  setTokenCookies(res, accessToken, refreshToken);

  res.status(201).json(new ApiResponse(201, { admin: { publicId: admin.publicId, username: admin.username }, restaurant }, true, 'Registration successful'));
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
    return res.status(400).json(new ErrorResponse(400,"Failed To create User"));
  }

  const payload = { publicId: admin.publicId, username: admin.username, restaurantId: admin.restaurant?.publicId };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  const hashedRefresh = await bcrypt.hash(refreshToken, 10);
  await prisma.restaurantAdmin.update({
    where: { publicId: admin.publicId },
    data: { refreshToken: hashedRefresh },
  });

  setTokenCookies(res, accessToken, refreshToken);

  res.status(200).json(new ApiResponse(200, { admin: { publicId: admin.publicId, username: admin.username, restaurant: admin.restaurant } }, true, 'Login successful'));
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    res.status(401).json(new ErrorResponse(401, 'No refresh token'));
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
    return res.status(400).json(new ErrorResponse(400,"Failed To create User"));
  }

  const newAccessToken = generateAccessToken({
    publicId: admin.publicId,
    username: admin.username,
    restaurantId: decoded.restaurantId,
  });

  const isProduction = process.env.NODE_ENV === 'production';
  res.cookie('accessToken', newAccessToken, {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000,
  });

  res.status(200).json(new ApiResponse(200, null, true, 'Access token refreshed'));
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;
  if (refreshToken) {
    const decoded = verifyRefreshToken(refreshToken);
    if (decoded) {
      await prisma.restaurantAdmin.update({
        where: { publicId: decoded.publicId },
        data: { refreshToken: null },
      });
    }
  }
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.status(200).json(new ApiResponse(200, null, true, 'Logged out successfully'));
});
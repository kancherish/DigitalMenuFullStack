// src/types/express.d.ts

import { JwtPayload } from 'jsonwebtoken'; // Or import your specific Admin type if you have one

declare global {
  namespace Express {
    interface Request {
      // Use your specific type here instead of 'any' if possible
      admin?: JwtPayload | any; 
    }
  }
}
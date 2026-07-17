// AuthContext.tsx

import type { AdminInfo } from '../types';
import { createContext, useContext } from 'react';

interface AuthContextType {
  admin: AdminInfo | null;
  isAuthenticated: boolean;
  isCheckingSession: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateCachedRestaurant: (restaurant: AdminInfo['restaurant']) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);


export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
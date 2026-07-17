import { useState, useCallback, useEffect } from 'react';
import type { ReactNode } from 'react';
import { authService } from '../api/authService';
import { setAccessToken, onForceLogout } from '../api/tokenstore';
import type { AdminInfo } from '../types';
import { AuthContext } from './AuthContext';

const API_URL = import.meta.env.VITE_SERVER_ADDRESS;



export function AuthProvider({ children }: { children: ReactNode }) {
  const [admin, setAdmin] = useState<AdminInfo | null>(null);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const updateCachedRestaurant = useCallback((restaurant: AdminInfo['restaurant']) => {
  setAdmin((prev) => {
    if (!prev) return prev;
    const updated = { ...prev, restaurant };
    localStorage.setItem('adminInfo', JSON.stringify(updated));
    return updated;
  });
}, []);

  const login = useCallback(async (username: string, password: string) => {
    const adminInfo = await authService.login(username, password);
    setAdmin(adminInfo as unknown as AdminInfo);
    localStorage.setItem('adminInfo', JSON.stringify(adminInfo)); // see note below
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    localStorage.removeItem('adminInfo');
    setAdmin(null);
  }, []);

  // Bootstrap: on mount, try to restore session from refreshToken
  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        setIsCheckingSession(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/refresh`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${refreshToken}` },
        });
        const data = await res.json();

        if (res.ok && data.success) {
          setAccessToken(data.data.accessToken);
          localStorage.setItem('refreshToken', data.data.refreshToken);

          const cachedAdmin = localStorage.getItem('adminInfo');
          if (cachedAdmin) setAdmin(JSON.parse(cachedAdmin));
        } else {
          localStorage.removeItem('refreshToken');
          localStorage.removeItem('adminInfo');
        }
      } catch {
        // network failure — leave tokens as-is, don't wipe on transient error
      } finally {
        if (!cancelled) setIsCheckingSession(false);
      }
    }

    bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return onForceLogout(() => {
      setAdmin(null);
      localStorage.removeItem('adminInfo');
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{ admin, isAuthenticated: !!admin, isCheckingSession, login, logout ,updateCachedRestaurant}}
    >
      {children}
    </AuthContext.Provider>
  );
}
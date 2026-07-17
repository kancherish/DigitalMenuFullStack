import { setAccessToken } from './tokenstore';
import { apiFetch } from './apiFetch';
import { VITE_SERVER_ADDRESS } from '../../env';

interface LoginResponseData {
  accessToken: string;
  refreshToken: string;
  admin: {
    publicId: string;
    username: string;
    restaurant: { publicId: string; name: string; [key: string]: unknown };
  };
}

export const authService = {
  login: async (username: string, password: string) => {
    const res = await fetch(`${VITE_SERVER_ADDRESS}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ para: { username, password } }),
    });

    const data = await res.json();

    console.log(data)

    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Login failed');
    }

    const { accessToken, refreshToken, admin }: LoginResponseData = data.data;

    setAccessToken(accessToken);
    localStorage.setItem('refreshToken', refreshToken);

    return admin;
  },

  logout: async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    setAccessToken(null);
    localStorage.removeItem('refreshToken');

    if (refreshToken) {
      try {
        await apiFetch('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ para: { refreshToken } }),
        });
      } catch {
        // best-effort — client state already cleared
      }
    }
  },
};
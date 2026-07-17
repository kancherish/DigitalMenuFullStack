// api/tokenStore.ts
type LogoutListener = () => void;

let accessToken: string | null = null;
const logoutListeners: LogoutListener[] = [];

export const getAccessToken = () => accessToken;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
};

export const onForceLogout = (fn: LogoutListener) => {
  logoutListeners.push(fn);
  return () => {
    const i = logoutListeners.indexOf(fn);
    if (i !== -1) logoutListeners.splice(i, 1);
  };
};

export const triggerForceLogout = () => {
  accessToken = null;
  logoutListeners.forEach((fn) => fn());
};
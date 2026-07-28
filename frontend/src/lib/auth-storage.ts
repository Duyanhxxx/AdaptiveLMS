import type { AuthTokens, User } from '@/types';

const ACCESS_KEY = 'adaptive_access_token';
const REFRESH_KEY = 'adaptive_refresh_token';
const USER_KEY = 'adaptive_user';

export const authStorage = {
  getAccessToken: () =>
    typeof window !== 'undefined' ? localStorage.getItem(ACCESS_KEY) : null,

  getRefreshToken: () =>
    typeof window !== 'undefined' ? localStorage.getItem(REFRESH_KEY) : null,

  getUser: (): User | null => {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  },

  setAuth: (user: User, tokens: AuthTokens) => {
    localStorage.setItem(ACCESS_KEY, tokens.accessToken);
    localStorage.setItem(REFRESH_KEY, tokens.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  clear: () => {
    localStorage.removeItem(ACCESS_KEY);
    localStorage.removeItem(REFRESH_KEY);
    localStorage.removeItem(USER_KEY);
  },
};

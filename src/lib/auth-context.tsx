import * as React from "react";
import {
  ADMIN_TOKEN_PREFIX,
  QUOTA_STORAGE_KEY,
  TOKEN_STORAGE_KEY,
  USER_STORAGE_KEY,
} from "./scraper-types";

export type AuthUser = {
  username: string;
  isAdmin: boolean;
};

export type Quota = {
  used: number;
  limit: number;
};

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  quota: Quota;
  hydrated: boolean;
  login: (token: string) => AuthUser;
  logout: () => void;
  incrementQuota: () => void;
  setQuota: (q: Quota) => void;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

function parseUser(token: string): AuthUser {
  const isAdmin = token.toUpperCase().startsWith(ADMIN_TOKEN_PREFIX);
  return {
    username: isAdmin ? "admin" : `user-${token.slice(-4).toLowerCase()}`,
    isAdmin,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [quota, setQuotaState] = React.useState<Quota>({ used: 0, limit: 50 });
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const t = localStorage.getItem(TOKEN_STORAGE_KEY);
      const u = localStorage.getItem(USER_STORAGE_KEY);
      const q = localStorage.getItem(QUOTA_STORAGE_KEY);
      if (t) setToken(t);
      if (u) setUser(JSON.parse(u));
      else if (t) setUser(parseUser(t));
      if (q) setQuotaState(JSON.parse(q));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  const login = React.useCallback((tok: string) => {
    const u = parseUser(tok);
    setToken(tok);
    setUser(u);
    try {
      localStorage.setItem(TOKEN_STORAGE_KEY, tok);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(u));
    } catch {
      /* ignore */
    }
    return u;
  }, []);

  const logout = React.useCallback(() => {
    setToken(null);
    setUser(null);
    try {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
    } catch {
      /* ignore */
    }
  }, []);

  const setQuota = React.useCallback((q: Quota) => {
    setQuotaState(q);
    try {
      localStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify(q));
    } catch {
      /* ignore */
    }
  }, []);

  const incrementQuota = React.useCallback(() => {
    setQuotaState((prev) => {
      const next = { ...prev, used: prev.used + 1 };
      try {
        localStorage.setItem(QUOTA_STORAGE_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value: AuthContextValue = {
    token,
    user,
    quota,
    hydrated,
    login,
    logout,
    incrementQuota,
    setQuota,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}

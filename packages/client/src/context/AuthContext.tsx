import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { loginRequest } from "@/api/auth";
import { SESSION_INVALIDATED_EVENT } from "@/auth/sessionEvents";
import { clearStoredToken, getStoredToken, setStoredToken } from "@/auth/tokenStorage";
import { clearReadCaches } from "@/mocks/mockApi";

type AuthContextValue = {
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());

  useEffect(() => {
    const onSessionInvalidated = () => {
      clearReadCaches();
      setToken(null);
    };
    window.addEventListener(SESSION_INVALIDATED_EVENT, onSessionInvalidated);
    return () => window.removeEventListener(SESSION_INVALIDATED_EVENT, onSessionInvalidated);
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await loginRequest(email, password);
    clearReadCaches();
    setStoredToken(res.token);
    setToken(res.token);
  }, []);

  const logout = useCallback(() => {
    clearReadCaches();
    clearStoredToken();
    setToken(null);
  }, []);

  const value = useMemo(
    () => ({
      token,
      login,
      logout,
      isAuthenticated: Boolean(token),
    }),
    [token, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return ctx;
}

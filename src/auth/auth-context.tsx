import React from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import type { AuthUser } from "@/services/tokenStorage";

type AuthContextValue = {
  user: AuthUser | null;
  accessToken: string | null;
  logout: () => void;
};

const AuthContext = React.createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const accessToken = useAppSelector((s) => s.auth.accessToken);

  const value = React.useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      logout: () => dispatch(logout()),
    }),
    [user, accessToken, dispatch]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

"use client";

import { createContext, useContext, useMemo } from "react";
import { authClient } from "@/lib/auth-client";

type BetterAuthSession = typeof authClient.$Infer.Session;
export type AuthUser = BetterAuthSession["user"];

interface AuthContextValue {
  user: AuthUser | null;
  session: BetterAuthSession["session"] | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  refetch: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data, isPending, refetch } = authClient.useSession();

  const value = useMemo<AuthContextValue>(() => {
    const user = data?.user ?? null;
    const session = data?.session ?? null;

    const roles = user?.role?.split(",").map((r) => r.trim().toLowerCase()) ?? [];
    const isAdmin = roles.includes("admin");

    return {
      user,
      session,
      isAuthenticated: Boolean(user && session),
      isAdmin,
      isLoading: isPending,
      refetch,
    };
  }, [data, isPending, refetch]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth harus digunakan di dalam <AuthProvider>");
  }
  return context;
}

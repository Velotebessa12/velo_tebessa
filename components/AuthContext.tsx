"use client";

import { createContext, useContext, useEffect, useState } from "react";

/* =====================
   Types
===================== */

export type User = {
  id: string;
  email: string;
  name?: string;
};

export type Admin = any

type AuthContextType = {
  user: User | null;
  admin: Admin | null;
  isUser: boolean;
  isAdmin: boolean;
  loading: boolean;
};

/* =====================
   Context
===================== */

const AuthContext = createContext<AuthContextType | null>(null);

/* =====================
   Provider
===================== */

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  // ONLY read from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedAdmin = localStorage.getItem("admin");

      if (storedUser) setUser(JSON.parse(storedUser));
      if (storedAdmin) setAdmin(JSON.parse(storedAdmin));
    } catch {
      localStorage.removeItem("user");
      localStorage.removeItem("admin");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        admin,
        isUser: !!user,
        isAdmin: !!admin,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* =====================
   Hook
===================== */

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return ctx;
};

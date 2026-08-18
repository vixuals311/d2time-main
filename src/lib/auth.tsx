import React, { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  initials: string;
  role: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => void;
}

// ─── Dummy users for local testing ───────────────────────────────────────────
const DUMMY_USERS: Array<AuthUser & { password: string }> = [
  {
    id: "usr_001",
    email: "admin@dossier.com",
    password: "password123",
    name: "Shamshad PA",
    initials: "SP",
    role: "Executive PA",
  },
  {
    id: "usr_002",
    email: "test@dossier.com",
    password: "test1234",
    name: "Test User",
    initials: "TU",
    role: "Guest",
  },
];

const STORAGE_KEY = "dossier_auth_user";

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setUser(JSON.parse(stored));
    } catch {
      // ignore
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<{ error?: string }> => {
    const match = DUMMY_USERS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );
    if (!match) {
      return { error: "Invalid email or password." };
    }
    const { password: _pw, ...authUser } = match;
    setUser(authUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(authUser));
    return {};
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

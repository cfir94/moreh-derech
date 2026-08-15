"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { clearUser, readUser, writeUser, type LocalUser } from "@/lib/localAuth";

type UserContextValue = {
  user: LocalUser | null;
  ready: boolean;
  login: (user: LocalUser) => void;
  logout: () => void;
};

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<LocalUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUser(readUser());
    setReady(true);
  }, []);

  const login = (nextUser: LocalUser) => {
    writeUser(nextUser);
    setUser(nextUser);
  };

  const logout = () => {
    clearUser();
    setUser(null);
  };

  return (
    <UserContext.Provider value={{ user, ready, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used within UserProvider");
  return ctx;
}

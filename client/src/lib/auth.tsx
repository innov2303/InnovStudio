import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import type { User } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const authRequestId = useRef(0);

  const fetchUser = async () => {
    const requestId = ++authRequestId.current;
    try {
      const response = await fetch("/api/auth/me", {
        credentials: "include",
      });
      if (requestId !== authRequestId.current) return;

      if (response.ok) {
        const data = await response.json();
        if (requestId !== authRequestId.current) return;
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch {
      if (requestId !== authRequestId.current) return;
      setUser(null);
    } finally {
      if (requestId === authRequestId.current) {
        setIsLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const login = (nextUser: User) => {
    authRequestId.current += 1;
    if (user?.id !== nextUser.id) {
      queryClient.removeQueries();
    }
    setUser(nextUser);
    setIsLoading(false);
  };

  const logout = () => {
    authRequestId.current += 1;
    queryClient.removeQueries();
    setUser(null);
    setIsLoading(false);
  };

  const refetch = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, refetch }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

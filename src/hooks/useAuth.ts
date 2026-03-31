import { useCallback, useEffect, useState } from "react";
import { api } from "../lib/apiClient";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  isGuest?: boolean;
  faction: string | null;
  subFaction: string | null;
  chapter: string | null;
  profileImage: string | null;
  bannerImage: string | null;
};

export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await api.request<{ user: AuthUser }>("/auth/me");
      setUser(res.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.request<{ user: AuthUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setUser(res.user);
  }, []);

  const register = useCallback(
    async (payload: {
      name: string;
      email: string;
      password: string;
      faction?: string;
      subFaction?: string;
      chapter?: string;
    }) => {
      const res = await api.request<{ user: AuthUser }>("/auth/register", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setUser(res.user);
    },
    []
  );

  const logout = useCallback(async () => {
    await api.request("/auth/logout", { method: "POST" });
    setUser(null);
  }, []);

  const loginAsGuest = useCallback(async () => {
    const res = await api.request<{ user: AuthUser }>("/auth/guest", {
      method: "POST",
    });
    setUser(res.user);
  }, []);

  return { user, loading, refresh, login, register, logout, loginAsGuest };
}

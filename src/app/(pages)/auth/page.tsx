"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { AuthScreen } from "@/components/screens/AuthScreen";
import { useAuth } from "@/hooks/useAuth";

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login, register } = useAuth();

  const initialMode =
    searchParams.get("mode") === "register" ? "register" : "login";
  const nextPath = searchParams.get("next") || "/menu";

  return (
    <AuthScreen
      onLogin={async (email, password) => {
        await login(email, password);
        router.push(nextPath);
      }}
      onRegister={async (payload) => {
        await register(payload);
        router.push(nextPath);
      }}
      initialMode={initialMode}
      onClose={() => router.push("/menu")}
    />
  );
}

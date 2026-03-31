"use client";

import { useRouter, useSearchParams } from "next/navigation";


import { useAuth } from "../../../hooks/useAuth";
import { LoadingScreen } from "@/components/LoadingScreen";
import { MainMenuScreen } from "@/components/screens/MainMenuScreen";
import { PlayChoiceModal } from "@/components/screens/PlayChoiceModal";

export default function MenuPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading, loginAsGuest } = useAuth();
  const showPlayChoiceModal = searchParams.get("play") === "1";

  if (loading) {
    return (
      <LoadingScreen
        size={180}
        animationSpeed={6}
        message="Verificando autenticação..."
        progress={35}
      />
    );
  }

  return (
    <>
      <MainMenuScreen
        onPlay={() => {
          if (user) {
            router.push("/menu/game");
            return;
          }
          router.push("/menu?play=1");
        }}
        onCreateAccount={() => router.push("/auth?mode=register&next=/menu")}
      />
      <PlayChoiceModal
        open={showPlayChoiceModal}
        onGuestPlay={async () => {
          try {
            await loginAsGuest();
            router.push("/menu/game");
          } catch {
            window.alert("Falha ao iniciar sessão guest.");
          }
        }}
        onCreateAccount={() => router.push("/auth?mode=register&next=/menu/game")}
        onClose={() => router.push("/menu")}
      />
    </>
  );
}

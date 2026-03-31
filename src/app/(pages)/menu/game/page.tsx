"use client";

import { useRouter } from "next/navigation";

import { GameChoiceScreen } from "@/components/screens/GameChoiceScreen";
import { useAuth } from "../../../../hooks/useAuth";

export default function GameChoicePage() {
  const router = useRouter();
  const { user } = useAuth();
  const isGuest = Boolean(user?.isGuest);

  return (
    <GameChoiceScreen
      open
      isGuest={isGuest}
      onStartCampaign={() => router.push("/menu/game/campaign")}
      onTimeline={() => window.alert("Timeline estará disponível em breve.")}
      onCollectibles={() => window.alert("Coletáveis estarão disponíveis em breve.")}
      onAchievements={() => window.alert("Conquistas estarão disponíveis em breve.")}
      onClose={() => router.push("/menu")}
    />
  );
}

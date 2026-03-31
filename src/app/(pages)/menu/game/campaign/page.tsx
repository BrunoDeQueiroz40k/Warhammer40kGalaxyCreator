"use client";

import { useRouter } from "next/navigation";

import {
  CampaignSetupConfig,
  CampaignSetupScreen,
} from "@/components/screens/CampaignSetupScreen";
import { startCampaign } from "@/lib/campaignApi";
import { useAuth } from "@/hooks/useAuth";

export default function CampaignSetupPage() {
  const router = useRouter();
  const { user } = useAuth();

  const handlePlay = async (config: CampaignSetupConfig) => {
    localStorage.setItem("game-setup-config", JSON.stringify(config));
    try {
      await startCampaign(config);
    } catch {
      alert("Falha ao iniciar campanha no servidor.");
      return;
    }
    router.push("/game");
  };

  return (
    <CampaignSetupScreen
      isGuest={Boolean(user?.isGuest)}
      onPlay={handlePlay}
      onBack={() => router.push("/menu/game")}
    />
  );
}

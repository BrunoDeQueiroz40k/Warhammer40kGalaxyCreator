"use client";

import Image from "next/image";

import { useAnimatedBackground } from "@/hooks/useAnimatedBackground";
import { AnimatedWallpaperBackground } from "@/components/shared/AnimatedWallpaperBackground";

type GameChoiceScreenProps = {
  open: boolean;
  isGuest: boolean;
  onStartCampaign: () => void;
  onTimeline: () => void;
  onCollectibles: () => void;
  onAchievements: () => void;
  onClose: () => void;
};

export function GameChoiceScreen({
  open,
  isGuest,
  onStartCampaign,
  onTimeline,
  onCollectibles,
  onAchievements,
  onClose,
}: GameChoiceScreenProps) {
  const { showBackground, currentBackground } = useAnimatedBackground();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[135] bg-black overflow-hidden">
      <AnimatedWallpaperBackground
        showBackground={showBackground}
        currentBackground={currentBackground}
        alt="Fundo de seleção"
        panOpacityClassName="opacity-30"
        overlayClassName="bg-zinc-100/85"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/35" />

      <div className="relative z-10 h-full w-full px-8 md:px-16 py-8 text-zinc-900">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl tracking-[0.2em] font-light text-zinc-800">
              GALAXY WAR
            </h1>
            <p className="text-xs mt-1 text-zinc-700">
              {isGuest ? "Jogando como Guest" : "Conta conectada"}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 border border-red-900 bg-red-950 text-red-200 text-xl leading-none hover:bg-red-900/90 transition"
          >
            X
          </button>
        </div>

        <div className="grid grid-cols-12 gap-3 h-[calc(100%-90px)] max-h-[620px]">
          <button
            type="button"
            onClick={onStartCampaign}
            className="col-span-12 md:col-span-6 relative border-2 border-zinc-100 overflow-hidden group text-left"
          >
            <Image
              src="/assets/imgs/loading/loadingWallpapers/w5.png"
              alt="Nova campanha"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/35 group-hover:bg-black/25 transition" />
            <div className="absolute left-4 top-3 text-zinc-100 tracking-[0.12em] text-xl md:text-2xl">
              CAMPANHA
            </div>
            <div className="absolute left-4 bottom-4 text-zinc-100 text-2xl md:text-3xl font-light">
              NOVA CAMPANHA
            </div>
          </button>

          <button
            type="button"
            onClick={onTimeline}
            className="col-span-12 md:col-span-3 relative overflow-hidden text-left group"
          >
            <Image
              src="/assets/imgs/loading/loadingWallpapers/w7.png"
              alt="Timeline"
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-black/45 group-hover:bg-black/30 transition" />
            <div className="absolute left-4 top-3 text-zinc-100 tracking-[0.08em] text-xl">GLADIATOR</div>
            <div className="absolute left-4 bottom-4 text-zinc-100 text-3xl font-light">TIMELINE</div>
          </button>

          <div className="col-span-12 md:col-span-3 grid grid-rows-2 gap-3">
            <button
              type="button"
              onClick={onCollectibles}
              className="relative bg-gradient-to-br from-red-900 to-red-950 text-zinc-100 border border-zinc-200/30 hover:brightness-110 transition"
            >
              <span className="absolute left-4 top-4 text-xl tracking-wide">HERO</span>
              <span className="absolute left-4 bottom-4 text-2xl font-light">COLETÁVEIS</span>
            </button>
            <button
              type="button"
              onClick={onAchievements}
              className="relative bg-gradient-to-br from-zinc-900 to-black text-zinc-100 border border-zinc-200/20 hover:brightness-110 transition"
            >
              <span className="absolute left-4 top-4 text-sm tracking-wide">REGISTROS</span>
              <span className="absolute left-4 bottom-4 text-2xl font-light">CONQUISTAS</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

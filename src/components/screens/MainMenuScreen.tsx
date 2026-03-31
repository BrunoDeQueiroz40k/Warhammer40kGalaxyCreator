"use client";

import { useState } from "react";

import { useAnimatedBackground } from "@/hooks/useAnimatedBackground";
import { AnimatedWallpaperBackground } from "@/components/shared/AnimatedWallpaperBackground";
import { Button } from "../ui/button";

type MainMenuScreenProps = {
  onPlay: () => void;
  onCreateAccount: () => void;
};

type MenuPanel = "none" | "options" | "credits" | "howto";

export function MainMenuScreen({ onPlay, onCreateAccount }: MainMenuScreenProps) {
  const { showBackground, currentBackground } = useAnimatedBackground();
  const [panel, setPanel] = useState<MenuPanel>("none");

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black overflow-hidden">
      <AnimatedWallpaperBackground
        showBackground={showBackground}
        currentBackground={currentBackground}
        alt="Fundo do menu"
        panOpacityClassName="opacity-35"
        overlayClassName="bg-black/70"
      />

      <div className="relative z-10 w-full max-w-2xl px-6">
        <div className="rounded-2xl border border-amber-500/30 bg-black/80 backdrop-blur-sm p-8">
          <h1 className="text-3xl md:text-4xl font-semibold text-amber-200 text-center mb-2">
            Warhammer: Galaxy Conquest
          </h1>
          <p className="text-center text-slate-300 text-sm mb-8">
            Escolha seu destino no setor e lidere sua facção na guerra eterna.
          </p>

          <div className="flex flex-col gap-3 max-w-sm mx-auto">
            <Button className="px-4 py-2 text-base" onClick={onPlay}>
              Jogar
            </Button>
            <Button className="px-4 py-2 text-base" variant="secundus" onClick={() => setPanel("options")}>
              Opções
            </Button>
            <Button className="px-4 py-2 text-base" variant="secundus" onClick={() => setPanel("howto")}>
              Como jogar
            </Button>
            <Button className="px-4 py-2 text-base" variant="secundus" onClick={() => setPanel("credits")}>
              Créditos
            </Button>
          </div>

          {panel !== "none" && (
            <div className="mt-6 rounded-lg border border-amber-500/25 bg-black/60 p-4 text-sm text-slate-200">
              {panel === "options" && (
                <p>Opções em desenvolvimento: áudio, controles e qualidade gráfica.</p>
              )}
              {panel === "howto" && (
                <p>
                  Expanda sua galáxia, gerencie planetas e fortaleça sua estratégia em cada setor.
                </p>
              )}
              {panel === "credits" && (
                <p>Projeto desenvolvido por Bruno com suporte de IA no Cursor.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="absolute bottom-4 left-4 z-20">
        <button
          type="button"
          onClick={onCreateAccount}
          className="text-sm text-amber-300 hover:text-amber-200 underline underline-offset-4"
        >
          Não tem conta? Criar uma
        </button>
      </div>
    </div>
  );
}

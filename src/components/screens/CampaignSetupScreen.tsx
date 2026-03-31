"use client";

import Image from "next/image";
import { useMemo, useState } from "react";

import { useAnimatedBackground } from "@/hooks/useAnimatedBackground";
import { AnimatedWallpaperBackground } from "@/components/shared/AnimatedWallpaperBackground";
import {
  FACTIONS,
  SPACE_MARINES_CHAPTERS,
  SUB_FACTIONS_BY_FACTION,
} from "@/types/factions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type CampaignSetupConfig = {
  difficulty: "facil" | "medio" | "dificil";
  galaxyShape: "spiral-4";
  stars: number;
  faction: string;
  subFaction: string;
  chapter?: string;
  botsRangeEnabled: boolean;
  bots: number;
  botsMin: number;
  botsMax: number;
};

type CampaignSetupScreenProps = {
  isGuest: boolean;
  onPlay: (config: CampaignSetupConfig) => void;
  onBack: () => void;
};

export function CampaignSetupScreen({
  isGuest,
  onPlay,
  onBack,
}: CampaignSetupScreenProps) {
  const { showBackground, currentBackground } = useAnimatedBackground();
  const [difficulty, setDifficulty] = useState<"facil" | "medio" | "dificil">("medio");
  const [stars, setStars] = useState(80);
  const [faction, setFaction] = useState("Imperium");
  const [subFaction, setSubFaction] = useState("Space Marines");
  const [chapter, setChapter] = useState("Ultramarines");
  const [botsRangeEnabled, setBotsRangeEnabled] = useState(false);
  const [bots, setBots] = useState(4);
  const [botsMin, setBotsMin] = useState(2);
  const [botsMax, setBotsMax] = useState(6);

  const normalizedBotsMax = useMemo(() => Math.max(botsMin, botsMax), [botsMin, botsMax]);
  const requiresChapter = subFaction === "Space Marines";

  return (
    <div className="fixed inset-0 z-[136] bg-black overflow-hidden p-4 flex items-center justify-center">
      <AnimatedWallpaperBackground
        showBackground={showBackground}
        currentBackground={currentBackground}
        alt="Fundo da campanha"
        panOpacityClassName="opacity-30"
        overlayClassName="bg-black/55"
      />

      <div className="relative z-10 w-full text-zinc-100">
        <div className="max-w-5xl mx-auto h-full rounded-xl border border-zinc-200/40 bg-black/45 backdrop-blur-sm p-5 md:p-7">
          <div className="flex items-start justify-between mb-5">
            <div>
              <h1 className="text-2xl md:text-3xl tracking-[0.14em] font-light text-zinc-100">
                NOVA CAMPANHA
              </h1>
              <p className="text-xs mt-1 text-zinc-300">
                {isGuest ? "Jogando como Guest" : "Conta conectada"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 h-[calc(100%-82px)]">
            <div className="col-span-12 lg:col-span-5 relative border border-zinc-200/40 overflow-hidden rounded-md group text-left min-h-[260px]">
              <Image
                src="/assets/imgs/loading/loadingWallpapers/w5.png"
                alt="Prévia da galáxia"
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/35 group-hover:bg-black/25 transition" />
              <div className="absolute left-4 top-3 text-zinc-100 tracking-[0.12em] text-lg md:text-xl">
                GAME DETAILS
              </div>
            </div>

            <div className="col-span-12 lg:col-span-7 rounded-md border border-zinc-200/30 bg-black/55 p-4 md:p-5 text-zinc-100">
              <div className="mb-5">
                <p className="text-xs uppercase tracking-wider text-zinc-400 mb-2">Dificuldade</p>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "facil", label: "Fácil" },
                    { id: "medio", label: "Médio" },
                    { id: "dificil", label: "Difícil" },
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setDifficulty(item.id as "facil" | "medio" | "dificil")}
                      className={`rounded border px-3 py-2 text-sm transition ${difficulty === item.id
                        ? "border-amber-400 bg-amber-500/20 text-amber-100"
                        : "border-zinc-500/40 bg-black/40 hover:bg-black/60"
                        }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-5">
                <p className="text-xs uppercase tracking-wider text-zinc-400 mb-2">Galáxia</p>
                <div className="rounded border border-amber-500/35 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
                  Espiral (4 caudas)
                </div>
              </div>

              <div className="mb-5 grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-zinc-400 mb-2">Facção do jogador</p>
                  <Select
                    value={faction}
                    onValueChange={(value) => {
                      setFaction(value);
                      const nextSub = (SUB_FACTIONS_BY_FACTION[value] ?? [])[0] ?? "";
                      setSubFaction(nextSub);
                      setChapter("Ultramarines");
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a facção" />
                    </SelectTrigger>
                    <SelectContent className="z-[250]">
                      {FACTIONS.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-zinc-400 mb-2">Subfacção</p>
                  <Select
                    value={subFaction}
                    onValueChange={(value) => {
                      setSubFaction(value);
                      if (value !== "Space Marines") setChapter("");
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione a subfacção" />
                    </SelectTrigger>
                    <SelectContent className="z-[250]">
                      {(SUB_FACTIONS_BY_FACTION[faction] ?? []).map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {requiresChapter && (
                <div className="mb-5">
                  <p className="text-xs uppercase tracking-wider text-zinc-400 mb-2">Capítulo (Space Marines)</p>
                  <Select value={chapter} onValueChange={setChapter}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione o capítulo" />
                    </SelectTrigger>
                    <SelectContent className="z-[250]">
                      {SPACE_MARINES_CHAPTERS.map((item) => (
                        <SelectItem key={item} value={item}>
                          {item}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="mb-5">
                <p className="text-xs uppercase tracking-wider text-zinc-400 mb-2">
                  Estrelas / Planetas: <span className="text-amber-200">{stars}</span>
                </p>
                <input
                  type="range"
                  min={50}
                  max={150}
                  value={stars}
                  onChange={(e) => setStars(Number(e.target.value))}
                  className="w-full accent-amber-500"
                />
              </div>

              <div className="mb-6 rounded border border-zinc-400/30 bg-black/35 p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs uppercase tracking-wider text-zinc-300">
                    Bots com Range (N-N)
                  </p>
                  <button
                    type="button"
                    onClick={() => setBotsRangeEnabled((prev) => !prev)}
                    className={`relative h-6 w-11 rounded-full transition ${botsRangeEnabled ? "bg-amber-500/70" : "bg-zinc-600/60"
                      }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${botsRangeEnabled ? "left-5" : "left-0.5"
                        }`}
                    />
                  </button>
                </div>

                {!botsRangeEnabled ? (
                  <div className="mt-3">
                    <p className="text-xs text-zinc-300 mb-1">
                      Quantidade fixa de bots: <span className="text-amber-200">{bots}</span>
                    </p>
                    <input
                      type="range"
                      min={1}
                      max={12}
                      value={bots}
                      onChange={(e) => setBots(Number(e.target.value))}
                      className="w-full accent-amber-500"
                    />
                  </div>
                ) : (
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-xs text-zinc-300 mb-1">
                        Mínimo: <span className="text-amber-200">{botsMin}</span>
                      </p>
                      <input
                        type="range"
                        min={1}
                        max={12}
                        value={botsMin}
                        onChange={(e) => setBotsMin(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>
                    <div>
                      <p className="text-xs text-zinc-300 mb-1">
                        Máximo: <span className="text-amber-200">{normalizedBotsMax}</span>
                      </p>
                      <input
                        type="range"
                        min={1}
                        max={12}
                        value={normalizedBotsMax}
                        onChange={(e) => setBotsMax(Number(e.target.value))}
                        className="w-full accent-amber-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={onBack}
                  className="rounded border border-zinc-500/40 bg-black/45 px-4 py-2 text-zinc-200 hover:bg-black/70 transition"
                >
                  Voltar
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onPlay({
                      difficulty,
                      galaxyShape: "spiral-4",
                      stars,
                      faction,
                      subFaction,
                      chapter: requiresChapter ? chapter : undefined,
                      botsRangeEnabled,
                      bots,
                      botsMin,
                      botsMax: normalizedBotsMax,
                    })
                  }
                  className="rounded border border-amber-500/40 bg-amber-500/15 px-5 py-2 text-amber-100 hover:bg-amber-500/25 transition"
                >
                  Jogar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

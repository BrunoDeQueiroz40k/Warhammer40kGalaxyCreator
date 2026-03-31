import { useState } from "react";

import { X } from "lucide-react";

import { PlanetCardProps } from "@/types/interfaces";
import { formatPopulation, getFactionVariant } from "@/types/functions";

import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

export function PlanetCard({ planet, position, onClose }: PlanetCardProps) {
  const [isVisible, setIsVisible] = useState(true);
  const domainLabel = planet.domain || "Sem dominio";

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  return (
    <div
      className={`
        fixed z-50 transition-opacity duration-300 pointer-events-auto
        ${isVisible ? "opacity-100" : "opacity-0"}
      `}
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: "translate(-50%, -120%)", // Centraliza horizontalmente e posiciona acima do planeta
      }}
    >
      <div
        className={`
        bg-black/95 border border-amber-500/30 rounded-lg w-96 max-h-[85vh] overflow-y-auto overflow-x-hidden
        transform transition-all duration-300
        ${isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}
      `}
      >
        {/* Header com banner */}
        <div className="relative">
          <div
            className="h-32 bg-gradient-to-br from-amber-500/20 via-amber-600/30 to-amber-700/20 rounded-t-lg flex items-end p-6 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: planet.image
                ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${planet.image})`
                : undefined,
            }}
          >
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                {planet.name}
              </h1>
              <h2 className="text-[15px] font-semibold text-amber-400 drop-shadow-lg">
                {planet.segmentum || "Segmentum Solar"}
              </h2>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute top-2 right-2 text-white hover:bg-white/10 w-8 h-8 p-0 min-w-8"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-4">
            <div className="border border-amber-500/30 rounded-md p-4 px-5 space-y-2 w-full">
              <p className="text-slate-400 font-bold text-xs">DOMINIO</p>
              <div className="flex items-center gap-2 text-slate-300 flex-wrap">
                <Badge variant={getFactionVariant(domainLabel)}>{domainLabel}</Badge>
                <Badge variant="normal">{planet.planetType || "Não especificado"}</Badge>
                {planet.chapter && <Badge variant="imperium">{planet.chapter}</Badge>}
              </div>
            </div>

            <div className="flex justify-between gap-4">
              <div className="border border-amber-500/30 rounded-md p-4 px-5 space-y-1 w-full">
                <p className="text-slate-400 font-bold text-xs">POPULAÇÃO</p>
                <p className="text-slate-200 font-bold">
                  {formatPopulation(planet.population || 0)}
                </p>
              </div>
              <div className="border border-amber-500/30 rounded-md p-4 px-6 space-y-1 w-full">
                <p className="text-slate-400 font-bold text-xs">STATUS</p>
                <p
                  className={`font-bold ${planet.status === "destruido"
                    ? "text-red-500"
                    : "text-green-500"
                    }`}
                >
                  {planet.status === "destruido" ? "Destruído" : "Ativo"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="bg-black h-8 w-28 [clip-path:polygon(50%_100%,0_0,100%_0)] absolute left-1/2 -bottom-7 -translate-x-1/2"></div>
    </div>
  );
}

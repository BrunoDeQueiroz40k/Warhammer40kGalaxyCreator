import { useState } from "react";
import { Button } from "./ui/button";
import { X, PencilLine } from "lucide-react";
import { Badge, badgeVariants } from "./ui/badge";
import { VariantProps } from "class-variance-authority";
import { PlanetData } from "./galaxyComponent/objects/planet";

interface PlanetCardProps {
  planet: PlanetData;
  position: { x: number; y: number }; // Posição na tela onde o card deve aparecer
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function PlanetCard({
  planet,
  position,
  onClose,
}: PlanetCardProps) {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Delay para animação
  };

  // Função para formatar população
  const formatPopulation = (value: number): string => {
    if (value === 0) return "0";

    const absValue = Math.abs(value);

    if (absValue >= 1e12) {
      const trillions = Math.floor(absValue / 1e12);
      return trillions === 1 ? "1 trilhão" : `${trillions} trilhões`;
    } else if (absValue >= 1e9) {
      const billions = Math.floor(absValue / 1e9);
      return billions === 1 ? "1 bilhão" : `${billions} bilhões`;
    } else if (absValue >= 1e6) {
      const millions = Math.floor(absValue / 1e6);
      return millions === 1 ? "1 milhão" : `${millions} milhões`;
    } else if (absValue >= 1e3) {
      const thousands = Math.floor(absValue / 1e3);
      return `${thousands} mil`;
    } else {
      return value.toString();
    }
  };



  // Função para mapear facções para variantes do badgeF
  const getFactionVariant = (
    faction: string
  ): VariantProps<typeof badgeVariants>["variant"] => {
    switch (faction) {
      case "Imperium":
        return "imperium"; // Azul
      case "Necrons":
        return "necrons"; // Cinza
      case "Caos":
        return "caos"; // Vermelho
      case "Orks":
        return "orks"; // Verde
      case "Xenos":
        return "xenos"; // Cinza
      case "Tau":
        return "tau"; // Azul
      case "Aeldari":
        return "aeldari"; // Verde
      default:
        return "normal"; // Cinza padrão
    }
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
        bg-black/95 border border-amber-500/30 rounded-lg shadow-2xl w-96 max-h-[90vh] overflow-y-auto overflow-x-hidden
        transform transition-all duration-300
        ${isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}
      `}
      >
        {/* Header com banner */}
        <div className="relative">
          <div 
            className="h-36 bg-gradient-to-br from-amber-500/20 via-amber-600/30 to-amber-700/20 rounded-t-lg flex items-end p-6 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: planet.image 
                ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${planet.image})`
                : undefined
            }}
          >
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">{planet.name}</h1>
              <h2 className="text-[15px] font-semibold text-amber-400 drop-shadow-lg">
                {`Segmentum ${planet.segmentum || "Solar"}`}
              </h2>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClose}
            className="absolute top-2 left-2 text-white hover:bg-white/10 w-8 h-8 p-0 min-w-8"
          >
            <PencilLine className="w-4 h-4" />
          </Button>
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
            <div className="flex items-center gap-2 text-slate-300">
              <Badge variant={getFactionVariant(planet.faction)}>
                {planet.faction || "Não especificada"}
              </Badge>
              <Badge variant="normal">
                {planet.planetType || "Não especificado"}
              </Badge>
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
                <p className={`font-bold ${planet.status === "destruido" ? "text-red-500" : "text-green-500"
                  }`}>
                  {planet.status === "destruido" ? "Destruído" : "Ativo"}
                </p>
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div className="border border-amber-500/30 rounded-md p-4 px-6 space-y-1 w-full">
            <p className="text-slate-400 font-bold text-xs">
              RELATÓRIO IMPERIAL
            </p>
            <p className="text-slate-100">
              {planet.description || "Nenhum relatório disponível ou atribuído"}
            </p>
          </div>
        </div>
      </div>
      <div className="bg-black h-8 w-28 [clip-path:polygon(50%_100%,0_0,100%_0)] absolute left-1/2 -bottom-7 -translate-x-1/2"></div>
    </div>
  );
}

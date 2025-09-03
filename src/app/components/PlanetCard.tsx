import { useState } from "react";
import { Button } from "./ui/button";
import { planetTypes } from "./icons/icons";
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



  // Função para mapear facções para variantes do badge
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
          <div className="h-36 bg-gradient-to-br from-amber-500/20 via-amber-600/30 to-amber-700/20 rounded-t-lg flex items-end p-6">
            <div>
              <h1 className="text-3xl font-bold text-white">{planet.name}</h1>
              <h2 className="text-[15px] font-semibold text-amber-400">
                {planet.segmentum || "Segmentum Solar"}
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
                <p className="text-slate-200 font-bold text-xl">8.1 Bilhões</p>
              </div>
              <div className="border border-amber-500/30 rounded-md p-4 px-6 space-y-1 w-full">
                <p className="text-slate-400 font-bold text-xs">STATUS</p>
                <p className="text-green-500 font-bold text-xl">Ativos</p>
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

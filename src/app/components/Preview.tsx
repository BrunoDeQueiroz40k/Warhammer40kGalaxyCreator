import { PlanetData } from "./galaxyComponent/objects/planet";
import { Badge, badgeVariants } from "./ui/badge";
import { VariantProps } from "class-variance-authority";
import { ExternalLink } from "lucide-react";
import { LinkPreview } from "./LinkPreview";

interface PreviewProps {
  planetData: PlanetData;
  selectedColor: string;
  selectedSegmentum: string | null;
}

export function Preview({
  planetData,
  selectedColor,
  selectedSegmentum,
}: PreviewProps) {
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

  // Função para mapear facções para variantes do badge
  const getFactionVariant = (
    faction: string
  ): VariantProps<typeof badgeVariants>["variant"] => {
    switch (faction) {
      case "Imperium":
        return "imperium";
      case "Necrons":
        return "necrons";
      case "Caos":
        return "caos";
      case "Orks":
        return "orks";
      case "Xenos":
        return "xenos";
      case "Tau":
        return "tau";
      case "Aeldari":
        return "aeldari";
      default:
        return "normal";
    }
  };

  return (
    <div className="space-y-2">
      <p className="text-white font-bold text-lg">PREVIEW DO PLANETA</p>
      <div className="w-96 bg-black/95 border border-amber-500/30 rounded-lg min-h-[400px] max-h-[60vh] overflow-y-auto overflow-x-hidden">
        {/* Header com banner */}
        <div className="relative">
          <div
            className="h-36 bg-gradient-to-br from-amber-500/20 via-amber-600/30 to-amber-700/20 rounded-t-lg flex items-end p-6 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: planetData.image
                ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6)), url(${planetData.image})`
                : undefined,
            }}
          >
            <div>
              <h1 className="text-3xl font-bold text-white drop-shadow-lg">
                {planetData.name || "Nome do Planeta"}
              </h1>
              <h2 className="text-[15px] font-semibold text-amber-400 drop-shadow-lg">
                {`Segmentum ${selectedSegmentum || "Solar"}`}
              </h2>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-300">
              <Badge variant={getFactionVariant(planetData.faction)}>
                {planetData.faction || "Não especificada"}
              </Badge>
              <Badge variant="normal">
                {planetData.planetType || "Não especificado"}
              </Badge>
            </div>

            <div className="flex justify-between gap-4">
              <div className="border border-amber-500/30 rounded-md p-4 px-5 space-y-1 w-full">
                <p className="text-slate-400 font-bold text-xs">POPULAÇÃO</p>
                <p className="text-slate-200 font-bold">
                  {formatPopulation(planetData.population || 0)}
                </p>
              </div>
              <div className="border border-amber-500/30 rounded-md p-4 px-6 space-y-1 w-full">
                <p className="text-slate-400 font-bold text-xs">STATUS</p>
                <p
                  className={`font-bold ${
                    planetData.status === "destruido"
                      ? "text-red-500"
                      : "text-green-500"
                  }`}
                >
                  {planetData.status === "destruido" ? "Destruído" : "Ativo"}
                </p>
              </div>
            </div>
          </div>

          {/* Descrição */}
          <div className="border border-amber-500/30 rounded-md p-4 px-6 space-y-1 w-full">
            <p className="text-slate-400 font-bold text-xs">
              RELATÓRIO IMPERIAL
            </p>
            <p className="text-slate-100 text-xs">
              {planetData.description ||
                "Nenhum relatório disponível ou atribuído"}
            </p>
          </div>

          {/* {planetData.image && (
            <div className="border border-amber-500/30 rounded-md overflow-hidden">
              <div className="relative group">
                <Image
                  width={192}
                  height={144}
                  src={planetData.image}
                  alt={`Preview de ${planetData.name}`}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <ExternalLink className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>
          )} */}

          {/* Link VRChat - Estilo Notion */}
          {planetData.vrchatUrl ? (
            <LinkPreview url={planetData.vrchatUrl} />
          ) : (
            <div className="border border-amber-500/20 rounded-lg p-4 bg-amber-500/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ExternalLink className="w-4 h-4 text-amber-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-amber-400 font-medium text-sm mb-1">
                    Link VRChat
                  </h4>
                  <p className="text-slate-400 text-xs">
                    Nenhum link de mapa VRChat foi especificado para este
                    planeta
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Cor do Planeta */}
          {selectedColor && (
            <div className="border border-amber-500/30 rounded-md p-4 px-6 space-y-1 w-full">
              <p className="text-slate-400 font-bold text-xs">COR DO PLANETA</p>
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-full border-2 border-amber-500/30"
                  style={{
                    backgroundColor:
                      selectedColor === "Azul"
                        ? "#0080ff"
                        : selectedColor === "Verde"
                        ? "#00ff80"
                        : selectedColor === "Vermelho"
                        ? "#ff0000"
                        : selectedColor === "Amarelo"
                        ? "#ffcc00"
                        : selectedColor === "Roxo"
                        ? "#cc00ff"
                        : "#ffffff",
                  }}
                />
                <p className="text-slate-200 font-medium">{selectedColor}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";

import { Download, CheckCircle, XCircle } from "@phosphor-icons/react";

import { ExportablePlanetData, PlanetEntry } from "../../ts/interfaces";
import { getWindowGalaxyProvider, readPlanets } from "../../ts/functions";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Button } from "./ui/button";
import { api } from "../../lib/apiClient";
import { GalaxyExporter } from "../../lib/galaxyExport";

export function ExportButton() {
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [resultType, setResultType] = useState<"success" | "error">("success");

  const handleExportClick = async () => {
    try {
      // Acessar a instância da galáxia
      const galaxyInstance = getWindowGalaxyProvider<PlanetEntry<ExportablePlanetData>>();

      if (!galaxyInstance) {
        setResultMessage("Erro: Instância da galáxia não encontrada");
        setResultType("error");
        setShowResultDialog(true);
        return;
      }

      // Obter todos os planetas usando o método correto
      const planets = readPlanets(galaxyInstance);

      if (planets.length === 0) {
        setResultMessage("Nenhum planeta encontrado para exportar");
        setResultType("error");
        setShowResultDialog(true);
        return;
      }

      // Converter planetas para formato exportável
      const exportablePlanets: ExportablePlanetData[] = planets.map(
        (planet) => ({
          name: planet.data?.name || "",
          faction: planet.data?.faction || "",
          planetType: planet.data?.planetType || "",
          description: planet.data?.description || "",
          population: planet.data?.population || 0,
          status: planet.data?.status || "ativo",
          image: planet.data?.image || "",
          vrchatUrl: planet.data?.vrchatUrl || "",
          color: planet.data?.color || "",
          segmentum: planet.data?.segmentum || "",
          position: {
            x: planet.position?.x || 0,
            y: planet.position?.y || 0,
            z: planet.position?.z || 0,
          },
        })
      );

      // Exportar galáxia
      await GalaxyExporter.exportGalaxy(exportablePlanets);

      // Persistir snapshot/histórico no backend (se logado)
      try {
        const { snapshot } = await api.request<{ snapshot: { id: string } }>(
          "/snapshots",
          {
            method: "POST",
            body: JSON.stringify({
              payload: {
                planets: exportablePlanets,
                exportDate: new Date().toISOString(),
                version: "1.0.0",
              },
            }),
          }
        );
        await api.request("/downloads", {
          method: "POST",
          body: JSON.stringify({
            fileName: "galaxy_export.zip",
            format: "zip",
            snapshotId: snapshot.id,
          }),
        });
      } catch {
        // Usuário pode não estar logado ainda; export local continua funcionando.
      }

      setResultMessage(
        `Galáxia exportada com sucesso! ${exportablePlanets.length} planetas exportados.`
      );
      setResultType("success");
      setShowResultDialog(true);
    } catch (error) {
      console.error("Error exporting galaxy:", error);
      setResultMessage("Erro ao exportar galáxia. Tente novamente.");
      setResultType("error");
      setShowResultDialog(true);
    }
  };

  return (
    <>
      <div>
        <TooltipProvider>
          <Tooltip delayDuration={0.5}>
            <TooltipTrigger asChild>
              <Button className="p-2" onClick={handleExportClick}>
                <Download className="!w-6 !h-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="z-[9999] bg-black text-white border border-gray-600 px-2 py-1 rounded text-sm"
            >
              Exportar dados da galáxia
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Diálogo de Resultado */}
      <Dialog.Root open={showResultDialog} onOpenChange={setShowResultDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Dialog.Content className="bg-black/90 rounded-md border border-amber-500/30 p-6 w-full max-w-md text-white">
              <div className="flex items-center gap-3 mb-4">
                {resultType === "success" ? (
                  <CheckCircle className="h-6 w-6 text-green-500" />
                ) : (
                  <XCircle className="h-6 w-6 text-red-500" />
                )}
                <Dialog.Title className="text-xl font-semibold">
                  {resultType === "success"
                    ? "Exportação Concluída"
                    : "Erro na Exportação"}
                </Dialog.Title>
              </div>

              <div className="text-left mb-6">
                <p>{resultMessage}</p>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setShowResultDialog(false)}
                  variant={resultType === "success" ? "accept" : "cancel"}
                  className="px-4 py-2"
                >
                  OK
                </Button>
              </div>
            </Dialog.Content>
          </Dialog.Overlay>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

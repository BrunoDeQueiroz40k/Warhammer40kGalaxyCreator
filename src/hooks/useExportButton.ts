import { useState } from "react";

import { createSnapshotAndRecordExport } from "../lib/activityApi";
import { GalaxyExporter } from "../lib/galaxyExport";
import { getWindowGalaxyProvider, readPlanets } from "../ts/functions";
import { ExportablePlanetData, PlanetEntry } from "../ts/interfaces";

type ResultType = "success" | "error";

export function useExportButton() {
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [resultType, setResultType] = useState<ResultType>("success");

  const handleExportClick = async () => {
    try {
      const galaxyInstance = getWindowGalaxyProvider<PlanetEntry<ExportablePlanetData>>();

      if (!galaxyInstance) {
        setResultMessage("Erro: Instância da galáxia não encontrada");
        setResultType("error");
        setShowResultDialog(true);
        return;
      }

      const planets = readPlanets(galaxyInstance);

      if (planets.length === 0) {
        setResultMessage("Nenhum planeta encontrado para exportar");
        setResultType("error");
        setShowResultDialog(true);
        return;
      }

      const exportablePlanets: ExportablePlanetData[] = planets.map((planet) => ({
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
      }));

      await GalaxyExporter.exportGalaxy(exportablePlanets);

      try {
        await createSnapshotAndRecordExport({
          planets: exportablePlanets,
          fileName: "galaxy_export.zip",
        });
      } catch {
        // Usuario pode nao estar logado ainda; export local continua funcionando.
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

  return {
    showResultDialog,
    setShowResultDialog,
    resultMessage,
    resultType,
    handleExportClick,
  };
}

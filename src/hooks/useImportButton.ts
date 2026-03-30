import { ChangeEvent, useRef, useState } from "react";

import { recordImportDownloadActivity } from "../lib/activityApi";
import { GalaxyExporter } from "../lib/galaxyExport";

type ResultType = "success" | "error";

export function useImportButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [resultType, setResultType] = useState<ResultType>("success");
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const isValid = await GalaxyExporter.validateGalaxyFile(file);
      if (!isValid) {
        setResultMessage(
          "Arquivo inválido. Por favor, selecione um arquivo de galáxia válido."
        );
        setResultType("error");
        setShowResultDialog(true);
        return;
      }

      setPendingFile(file);
      setShowConfirmDialog(true);
    } catch (error) {
      console.error("Error validating file:", error);
      setResultMessage("Erro ao validar arquivo. Verifique se o arquivo é válido.");
      setResultType("error");
      setShowResultDialog(true);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleConfirmImport = async () => {
    if (!pendingFile) return;

    setShowConfirmDialog(false);

    try {
      const importedPlanets = await GalaxyExporter.importGalaxy(pendingFile);
      const galaxyInstance = (
        window as {
          galaxyInstance?: {
            addPlanetWithoutEditMode?: (planetData: unknown) => void;
            clearAllPlanets?: () => void;
          };
        }
      ).galaxyInstance;

      if (!galaxyInstance) {
        setResultMessage("Erro: Instância da galáxia não encontrada");
        setResultType("error");
        setShowResultDialog(true);
        return;
      }

      if (galaxyInstance.clearAllPlanets) {
        galaxyInstance.clearAllPlanets();
      }

      for (const planet of importedPlanets) {
        if (galaxyInstance.addPlanetWithoutEditMode) {
          galaxyInstance.addPlanetWithoutEditMode(planet);
        }
      }

      setResultMessage(
        `Galáxia importada com sucesso! ${importedPlanets.length} planetas carregados.`
      );
      setResultType("success");
      setShowResultDialog(true);

      try {
        await recordImportDownloadActivity({
          fileName: pendingFile.name,
          planetCount: importedPlanets.length,
        });
      } catch {
        // ignore if not authenticated / backend unavailable
      }
    } catch (error) {
      console.error("Error importing galaxy:", error);
      setResultMessage("Erro ao importar galáxia. Verifique se o arquivo é válido.");
      setResultType("error");
      setShowResultDialog(true);
    } finally {
      setPendingFile(null);
    }
  };

  const handleCancelImport = () => {
    setShowConfirmDialog(false);
    setPendingFile(null);
  };

  return {
    fileInputRef,
    showConfirmDialog,
    setShowConfirmDialog,
    showResultDialog,
    setShowResultDialog,
    resultMessage,
    resultType,
    handleImportClick,
    handleFileChange,
    handleConfirmImport,
    handleCancelImport,
  };
}

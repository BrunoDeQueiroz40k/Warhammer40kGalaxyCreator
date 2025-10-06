import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Button } from "./ui/button";
import * as Dialog from "@radix-ui/react-dialog";
import { Upload, Warning, CheckCircle, XCircle } from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { GalaxyExporter } from "../../lib/galaxyExport";

export function ImportButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [resultMessage, setResultMessage] = useState("");
  const [resultType, setResultType] = useState<"success" | "error">("success");
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      // Validar se é um arquivo de galáxia válido
      const isValid = await GalaxyExporter.validateGalaxyFile(file);
      if (!isValid) {
        setResultMessage(
          "Arquivo inválido. Por favor, selecione um arquivo de galáxia válido."
        );
        setResultType("error");
        setShowResultDialog(true);
        return;
      }

      // Armazenar arquivo e mostrar diálogo de confirmação
      setPendingFile(file);
      setShowConfirmDialog(true);
    } catch (error) {
      console.error("Erro ao validar arquivo:", error);
      setResultMessage(
        "Erro ao validar arquivo. Verifique se o arquivo é válido."
      );
      setResultType("error");
      setShowResultDialog(true);
    }

    // Limpar o input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleConfirmImport = async () => {
    if (!pendingFile) return;

    setShowConfirmDialog(false);

    try {
      // Importar dados
      const importedPlanets = await GalaxyExporter.importGalaxy(pendingFile);

      // Acessar a instância da galáxia
      const galaxyInstance = (
        window as {
          galaxyInstance?: {
            addPlanetWithoutEditMode?: (planetData: unknown) => void;
            clearAllPlanets?: () => void;
          };
        }
      ).galaxyInstance;

      if (galaxyInstance) {
        // Limpar planetas existentes
        if (galaxyInstance.clearAllPlanets) {
          galaxyInstance.clearAllPlanets();
        }

        // Adicionar planetas importados
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
      } else {
        console.error("Instância da galáxia não encontrada");
        setResultMessage("Erro: Instância da galáxia não encontrada");
        setResultType("error");
        setShowResultDialog(true);
      }
    } catch (error) {
      console.error("Erro ao importar galáxia:", error);
      setResultMessage(
        "Erro ao importar galáxia. Verifique se o arquivo é válido."
      );
      setResultType("error");
      setShowResultDialog(true);
    }

    setPendingFile(null);
  };

  const handleCancelImport = () => {
    setShowConfirmDialog(false);
    setPendingFile(null);
  };

  return (
    <>
      <div>
        <TooltipProvider>
          <Tooltip delayDuration={0.5}>
            <TooltipTrigger asChild>
              <Button className="p-2" onClick={handleImportClick}>
                <Upload className="!w-6 !h-6" />
              </Button>
            </TooltipTrigger>
            <TooltipContent
              side="bottom"
              className="z-[9999] bg-black text-white border border-gray-600 px-2 py-1 rounded text-sm"
            >
              Importar dados da galáxia
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <input
          ref={fileInputRef}
          type="file"
          accept=".zip"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>

      {/* Diálogo de Confirmação */}
      <Dialog.Root open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Dialog.Content className="bg-black/90 rounded-md border border-amber-500/30 p-6 w-full max-w-md text-white">
              <div className="flex items-center gap-3 mb-4">
                <Warning className="h-6 w-6 text-amber-500" />
                <Dialog.Title className="text-xl font-semibold">
                  Confirmar Importação
                </Dialog.Title>
              </div>

              <div className="text-left space-y-3 mb-6">
                <p>
                  <strong>Atenção:</strong> Esta ação irá substituir todas as
                  configurações atuais da galáxia.
                </p>
                <p>
                  Certifique-se de que você salvou sua galáxia atual antes de
                  continuar, caso contrário, todas as alterações não salvas
                  serão perdidas.
                </p>
                <p className="text-sm text-gray-400">
                  Deseja continuar com a importação?
                </p>
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="cancel"
                  onClick={handleCancelImport}
                  className="px-4 py-2"
                >
                  Cancelar
                </Button>
                <Button
                  variant="accept"
                  onClick={handleConfirmImport}
                  className="px-4 py-2"
                >
                  Sim, Importar
                </Button>
              </div>
            </Dialog.Content>
          </Dialog.Overlay>
        </Dialog.Portal>
      </Dialog.Root>

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
                    ? "Importação Concluída"
                    : "Erro na Importação"}
                </Dialog.Title>
              </div>

              <div className="text-left mb-6">
                <p>{resultMessage}</p>
              </div>

              <div className="flex justify-end">
                <Button
                  onClick={() => setShowResultDialog(false)}
                  variant={resultType === "success" ? "blue" : "cancel"}
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

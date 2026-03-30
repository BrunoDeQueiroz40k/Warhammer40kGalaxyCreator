import * as Dialog from "@radix-ui/react-dialog";

import { Upload, Warning, CheckCircle, XCircle } from "@phosphor-icons/react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Button } from "./ui/button";
import { useImportButton } from "../../hooks/useImportButton";

export function ImportButton() {
  const {
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
  } = useImportButton();

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

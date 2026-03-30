import * as Dialog from "@radix-ui/react-dialog";

import { Download, CheckCircle, XCircle } from "@phosphor-icons/react";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { Button } from "./ui/button";
import { useExportButton } from "../../hooks/useExportButton";

export function ExportButton() {
  const {
    showResultDialog,
    setShowResultDialog,
    resultMessage,
    resultType,
    handleExportClick,
  } = useExportButton();

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

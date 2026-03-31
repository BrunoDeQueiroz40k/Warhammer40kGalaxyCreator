"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Settings, X } from "lucide-react";

type GameActionsModalProps = {
  onOptions: () => void;
  onResetCampaign: () => void;
  onExitGame: () => void;
};

export function GameActionsModal({
  onOptions,
  onResetCampaign,
  onExitGame,
}: GameActionsModalProps) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="bg-black/70 border border-amber-500/30 rounded px-3 py-2 text-white text-sm flex items-center gap-2 hover:bg-black/80 transition"
          aria-label="Acoes do jogo"
        >
          <Settings className="w-4 h-4 text-amber-300" />
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-sm rounded-xl border border-amber-500/30 bg-black/95 p-5 text-white z-50">
          <Dialog.Title className="text-lg font-semibold text-amber-200 mb-4 flex items-center justify-between">
            Menu do Jogo
            <Dialog.Close asChild>
              <button
                type="button"
                className="rounded border border-amber-500/30 p-1.5 hover:bg-amber-500/15 transition"
                aria-label="Fechar"
              >
                <X className="w-4 h-4" />
              </button>
            </Dialog.Close>
          </Dialog.Title>

          <div className="flex flex-col gap-2">
            <button
              type="button"
              onClick={onOptions}
              className="rounded border border-amber-500/30 bg-black/60 px-3 py-2 text-left hover:bg-black/80 transition"
            >
              Opcoes
            </button>
            <button
              type="button"
              onClick={onResetCampaign}
              className="rounded border border-amber-500/30 bg-amber-500/15 px-3 py-2 text-left text-amber-100 hover:bg-amber-500/25 transition"
            >
              Resetar campanha
            </button>
            <button
              type="button"
              onClick={onExitGame}
              className="rounded border border-red-500/40 bg-red-500/15 px-3 py-2 text-left text-red-100 hover:bg-red-500/25 transition"
            >
              Sair do jogo
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

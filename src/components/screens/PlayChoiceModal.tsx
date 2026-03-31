"use client";

type PlayChoiceModalProps = {
  open: boolean;
  onGuestPlay: () => void;
  onCreateAccount: () => void;
  onClose: () => void;
};

export function PlayChoiceModal({
  open,
  onGuestPlay,
  onCreateAccount,
  onClose,
}: PlayChoiceModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[130] bg-black/70 flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-xl border border-amber-500/30 bg-black/90 p-5 text-white">
        <h2 className="text-lg font-semibold text-amber-200 mb-2">
          Escolha como deseja jogar
        </h2>
        <p className="text-sm text-slate-300 mb-4">
          Você pode jogar como visitante agora ou criar uma conta para salvar
          seu progresso.
        </p>
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={onGuestPlay}
            className="rounded border border-amber-500/30 bg-amber-500/15 px-3 py-2 text-amber-100 hover:bg-amber-500/25 transition"
          >
            Jogar como Guest
          </button>
          <button
            type="button"
            onClick={onCreateAccount}
            className="rounded border border-amber-500/30 bg-black/60 px-3 py-2 text-white hover:bg-black/80 transition"
          >
            Criar uma conta
          </button>
          <button
            type="button"
            onClick={onClose}
            className="rounded border border-slate-500/30 bg-slate-500/10 px-3 py-2 text-slate-200 hover:bg-slate-500/20 transition"
          >
            Voltar
          </button>
        </div>
      </div>
    </div>
  );
}

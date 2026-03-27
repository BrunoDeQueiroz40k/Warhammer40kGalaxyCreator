"use client";

import { Input } from "../ui/input";
import { Button } from "../ui/button";

type RegisterFormProps = {
  name: string;
  email: string;
  password: string;
  faction: string;
  chapter: string;
  error: string | null;
  isSubmitting: boolean;
  canSubmit: boolean;
  onChangeName: (value: string) => void;
  onChangeEmail: (value: string) => void;
  onChangePassword: (value: string) => void;
  onChangeFaction: (value: string) => void;
  onChangeChapter: (value: string) => void;
  onSubmit: () => void;
  onSwitchToLogin: () => void;
};

export function RegisterForm({
  name,
  email,
  password,
  faction,
  chapter,
  error,
  isSubmitting,
  canSubmit,
  onChangeName,
  onChangeEmail,
  onChangePassword,
  onChangeFaction,
  onChangeChapter,
  onSubmit,
  onSwitchToLogin,
}: RegisterFormProps) {
  return (
    <div>
      <h2 className="text-white text-2xl font-semibold mb-1">Crie sua conta</h2>
      <div className="space-y-2">
        <Input
          placeholder="nome"
          value={name}
          onChange={(e) => onChangeName(e.target.value)}
          className="h-8 text-xs bg-black/40 border-amber-500/20 text-slate-100"
        />
        <Input
          type="email"
          placeholder="email"
          value={email}
          onChange={(e) => onChangeEmail(e.target.value)}
          className="h-8 text-xs bg-black/40 border-amber-500/20 text-slate-100"
        />
        <Input
          type="password"
          placeholder="senha (min 8)"
          value={password}
          onChange={(e) => onChangePassword(e.target.value)}
          className="h-8 text-xs bg-black/40 border-amber-500/20 text-slate-100"
        />
        <div className="grid grid-cols-2 gap-2">
          <Input
            placeholder="facção"
            value={faction}
            onChange={(e) => onChangeFaction(e.target.value)}
            className="h-8 text-xs bg-black/40 border-amber-500/20 text-slate-100"
          />
          <Input
            placeholder="capítulo"
            value={chapter}
            onChange={(e) => onChangeChapter(e.target.value)}
            className="h-8 text-xs bg-black/40 border-amber-500/20 text-slate-100"
          />
        </div>
      </div>

      {error && (
        <div className="mt-3 text-[11px] text-red-300 bg-red-500/10 border border-red-500/30 rounded-md p-2">
          {error}
        </div>
      )}

      <Button
        variant="accept"
        className="w-full mt-3 h-8 text-xs"
        onClick={onSubmit}
        disabled={!canSubmit || isSubmitting}
      >
        {isSubmitting ? "Criando..." : "Criar conta"}
      </Button>

      <button
        type="button"
        onClick={onSwitchToLogin}
        className="text-[10px] text-slate-300 underline mt-3 hover:text-amber-200 transition"
      >
        já tenho uma conta
      </button>
    </div>
  );
}

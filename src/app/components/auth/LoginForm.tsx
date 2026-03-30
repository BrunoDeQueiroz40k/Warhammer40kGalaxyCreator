"use client";

import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { FaFacebook, FaGithub, FaGoogle } from "react-icons/fa";

type LoginFormProps = {
  email: string;
  password: string;
  error: string | null;
  isSubmitting: boolean;
  canSubmit: boolean;
  onChangeEmail: (value: string) => void;
  onChangePassword: (value: string) => void;
  onSubmit: () => void;
  onSwitchToRegister: () => void;
};

export function LoginForm({
  email,
  password,
  error,
  isSubmitting,
  canSubmit,
  onChangeEmail,
  onChangePassword,
  onSubmit,
  onSwitchToRegister,
}: LoginFormProps) {
  return (
    <div className="py-4">
      <h2 className="text-white text-2xl font-semibold mb-8 text-center">Faça o seu login</h2>
      <div className="space-y-3">
        <div>
          <Label>E-mail</Label>
          <Input
            type="email"
            value={email}
            onChange={(e) => onChangeEmail(e.target.value)}
          />
        </div>
        <div>
          <Label>Senha</Label>
          <Input
            type="password"
            value={password}
            onChange={(e) => onChangePassword(e.target.value)}
            className="mb-0"
          />
        </div>
      </div>

      <div className="flex justify-end mt-1 mb-3">
        <button
          type="button"
          className="text-[11.5px] text-slate-300 underline hover:text-amber-200 transition cursor-pointer"
        >
          esqueci minha senha
        </button>
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
        {isSubmitting ? "Entrando..." : "Entrar"}
      </Button>

      <div className="mb-5">
        <div className="flex items-center gap-2 py-4">
          <div className="h-px w-full bg-slate-300/15" />
          <span className="text-[11px] text-slate-300">ou</span>
          <div className="h-px w-full bg-slate-300/15" />
        </div>
        <div className="flex items-center justify-center gap-6">
          <button
            type="button"
            className="cursor-pointer"
            title="Entrar com Google"
            aria-label="Entrar com Google"
          >
            <FaGoogle className="w-8 h-8 text-slate-100 hover:text-slate-400 transition-all" />
          </button>
          <button
            type="button"
            className="cursor-pointer"
            title="Entrar com GitHub"
            aria-label="Entrar com GitHub"
          >
            <FaGithub className="w-8 h-8 text-slate-100 hover:text-slate-400 transition-all" />
          </button>
          <button
            type="button"
            className="cursor-pointer"
            title="Entrar com Facebook"
            aria-label="Entrar com Facebook"
          >
            <FaFacebook className="w-8 h-8 text-slate-100 hover:text-slate-400 transition-all" />
          </button>
        </div>
      </div>

      <div className="text-center">
        <button
          type="button"
          onClick={onSwitchToRegister}
          className="text-[11px] text-slate-300 underline mt-3 hover:text-amber-200 transition cursor-pointer"
        >
          ainda não tenho uma conta
        </button>
      </div>
    </div>
  );
}

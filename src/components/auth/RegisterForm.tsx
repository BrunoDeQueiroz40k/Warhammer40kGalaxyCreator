"use client";

import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import {
  FACTIONS,
  SPACE_MARINES_CHAPTERS,
  SUB_FACTIONS_BY_FACTION,
} from "@/types/factions";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

type RegisterFormProps = {
  name: string;
  email: string;
  password: string;
  faction: string;
  subFaction: string;
  chapter: string;
  error: string | null;
  isSubmitting: boolean;
  canSubmit: boolean;
  onChangeName: (value: string) => void;
  onChangeEmail: (value: string) => void;
  onChangePassword: (value: string) => void;
  onChangeFaction: (value: string) => void;
  onChangeSubFaction: (value: string) => void;
  onChangeChapter: (value: string) => void;
  onSubmit: () => void;
  onSwitchToLogin: () => void;
};

export function RegisterForm({
  name,
  email,
  password,
  faction,
  subFaction,
  chapter,
  error,
  isSubmitting,
  canSubmit,
  onChangeName,
  onChangeEmail,
  onChangePassword,
  onChangeFaction,
  onChangeSubFaction,
  onChangeChapter,
  onSubmit,
  onSwitchToLogin,
}: RegisterFormProps) {
  return (
    <div className="py-4">
      <h2 className="text-white text-2xl font-semibold mb-8 text-center">Crie sua conta</h2>
      <div className="space-y-3">
        <div>
          <Label>Nome</Label>
          <Input
            value={name}
            onChange={(e) => onChangeName(e.target.value)}
          />
        </div>
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
          />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Facção</Label>
            <Select
              value={faction}
              onValueChange={(value) => {
                onChangeFaction(value);
                onChangeSubFaction("");
                onChangeChapter("");
              }}
            >
              <SelectTrigger className="w-full mb-0">
                <SelectValue placeholder="Selecione a facção" />
              </SelectTrigger>
              <SelectContent className="z-[250]">
                {FACTIONS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Sub-facção</Label>
            {faction ? (
              <Select
                value={subFaction}
                onValueChange={(value) => {
                  onChangeSubFaction(value);
                  onChangeChapter("");
                }}
              >
                <SelectTrigger className="w-full mb-0">
                  <SelectValue placeholder="sub-facção" />
                </SelectTrigger>
                <SelectContent className="z-[250]">
                  {(SUB_FACTIONS_BY_FACTION[faction] ?? []).map((item) => (
                    <SelectItem key={item} value={item}>
                      {item}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                value=""
                readOnly
                placeholder="Escolha a facção primeiro"
                className="mb-0 opacity-60"
              />
            )}
          </div>
        </div>
        {subFaction === "Space Marines" && (
          <div>
            <Label>Capítulo</Label>
            <Select value={chapter} onValueChange={onChangeChapter}>
              <SelectTrigger className="w-full mb-0">
                <SelectValue placeholder="Selecione o capítulo" />
              </SelectTrigger>
              <SelectContent className="z-[250]">
                {SPACE_MARINES_CHAPTERS.map((item) => (
                  <SelectItem key={item} value={item}>
                    {item}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-3 text-[11px] text-red-300 bg-red-500/10 border border-red-500/30 rounded-md p-2">
          {error}
        </div>
      )}

      <Button
        variant="accept"
        className="w-full mt-6 h-8 text-xs"
        onClick={onSubmit}
        disabled={!canSubmit || isSubmitting}
      >
        {isSubmitting ? "Criando..." : "Criar conta"}
      </Button>
      <div className="text-center">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-[11px] text-slate-300 underline mt-6 hover:text-amber-200 transition cursor-pointer"
        >
          já tenho uma conta
        </button>
      </div>
    </div>
  );
}

"use client";

import Image from "next/image";
import { Camera, Sparkles } from "lucide-react";
import * as Dialog from "@radix-ui/react-dialog";
import { useMemo, useRef, useState } from "react";

import { AuthUser } from "@/hooks/useAuth";

import { Button } from "../ui/button";
import { useUserProfileModalData } from "@/hooks/useUserProfileModalData";

type UserProfileModalProps = {
  user: AuthUser;
  onLogout: () => Promise<void>;
};

export function UserProfileModal({ user, onLogout }: UserProfileModalProps) {
  const [open, setOpen] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);
  const {
    profile,
    planetCount,
    handleAvatarUpload,
    handleBannerUpload,
  } = useUserProfileModalData(user, open);

  const initial = useMemo(() => {
    return (profile.name?.trim()?.[0] || "?").toUpperCase();
  }, [profile.name]);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          className="bg-black/70 border border-amber-500/30 rounded px-3 py-2 text-white text-sm flex items-center gap-3 hover:bg-black/80 transition cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-200 font-semibold">
            {initial}
          </div>
          <div className="text-left">
            <p className="font-semibold leading-tight">{user.name}</p>
            <p className="text-xs text-slate-300 leading-tight">Perfil</p>
          </div>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/70 z-50" />
        <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[96vw] max-w-6xl max-h-[92vh] overflow-y-auto rounded-2xl border border-amber-500/25 bg-black/95 text-white z-50">
          <Dialog.Title className="sr-only">Perfil do usuário</Dialog.Title>
          <div className="relative">
            <div className="relative h-64 w-full">
              {profile.bannerImage ? (
                <Image src={profile.bannerImage} alt="Banner do perfil" fill className="object-cover" />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-r from-black via-zinc-950 to-amber-950/70" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 h-px" />
              <button
                type="button"
                onClick={() => bannerInputRef.current?.click()}
                className="absolute right-4 top-4 flex items-center gap-1 rounded border border-amber-500/35 bg-black/65 px-2 py-1 text-xs text-amber-100 hover:bg-black/85 transition"
              >
                <Camera className="w-3 h-3" />
                Alterar banner
              </button>
              <input
                ref={bannerInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => void handleBannerUpload(e.target.files?.[0])}
              />
            </div>

            <div className="px-6 md:px-8 pb-8">
              <div className="-mt-14 rounded-xl border border-amber-500/25 bg-black/80 backdrop-blur p-4 md:p-5">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      className="relative w-24 h-24 rounded-full border-[3px] border-amber-200/80 bg-black overflow-hidden flex items-center justify-center shadow-xl"
                    >
                      {profile.profileImage ? (
                        <Image src={profile.profileImage} alt="Avatar" fill className="object-cover" />
                      ) : (
                        <span className="text-3xl font-bold text-amber-200">{initial}</span>
                      )}
                    </button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => void handleAvatarUpload(e.target.files?.[0])}
                    />
                    <div className="min-w-0">
                      <h2 className="text-2xl md:text-3xl font-semibold leading-tight truncate">{profile.name}</h2>
                      <p className="text-sm text-slate-300 mt-1 truncate">{profile.email}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-2">
                        <span className="text-[11px] rounded px-2 py-1 border border-amber-500/35 bg-amber-500/15 text-amber-200">
                          {profile.faction || "Sem facção"}
                        </span>
                        {profile.subFaction && (
                          <span className="text-[11px] rounded px-2 py-1 border border-amber-400/35 bg-amber-400/10 text-amber-100">
                            {profile.subFaction}
                          </span>
                        )}
                        {profile.chapter && (
                          <span className="text-[11px] rounded px-2 py-1 border border-amber-400/35 bg-amber-400/10 text-amber-100">
                            {profile.chapter}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="cancel"
                      onClick={() => void onLogout()}
                      className="px-4 py-2 [clip-path:none] overflow-hidden [&>div.absolute]:hidden focus-visible:ring-0 focus-visible:ring-offset-0"
                    >
                      Sair
                    </Button>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="rounded-lg border border-amber-500/25 bg-black/60 p-4 text-center">
                  <p className="text-xs text-slate-300">Planetas criados</p>
                  <p className="text-3xl font-semibold mt-1">{planetCount}</p>
                </div>
                <div className="rounded-lg border border-amber-500/25 bg-black/60 p-4 text-center">
                  <p className="text-xs text-slate-300">Conta</p>
                  <p className="text-lg font-semibold mt-2 text-amber-200">Ativa</p>
                </div>
                <div className="rounded-lg border border-amber-500/25 bg-black/60 p-4 text-center">
                  <p className="text-xs text-slate-300">Status</p>
                  <p className="text-lg font-semibold mt-2 text-amber-200">Pronto para jogar</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4">
                <section className="rounded-lg border border-amber-500/25 bg-black/60 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <h3 className="font-semibold">Resumo do usuário</h3>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="rounded border border-amber-500/20 bg-black/25 px-3 py-2">
                      <p className="text-[11px] text-slate-400">Nome</p>
                      <p className="text-slate-100">{profile.name}</p>
                    </div>
                    <div className="rounded border border-amber-500/20 bg-black/25 px-3 py-2">
                      <p className="text-[11px] text-slate-400">E-mail</p>
                      <p className="text-slate-100 break-all">{profile.email}</p>
                    </div>
                    <div className="rounded border border-amber-500/20 bg-black/25 px-3 py-2">
                      <p className="text-[11px] text-slate-400">Facção</p>
                      <p className="text-slate-100">{profile.faction || "Sem facção"}</p>
                    </div>
                    <div className="rounded border border-amber-500/20 bg-black/25 px-3 py-2">
                      <p className="text-[11px] text-slate-400">Subfacção</p>
                      <p className="text-slate-100">{profile.subFaction || "Não definida"}</p>
                    </div>
                    <div className="rounded border border-amber-500/20 bg-black/25 px-3 py-2">
                      <p className="text-[11px] text-slate-400">Capítulo</p>
                      <p className="text-slate-100">{profile.chapter || "Não definido"}</p>
                    </div>
                  </div>
                </section>
              </div>
            </div>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

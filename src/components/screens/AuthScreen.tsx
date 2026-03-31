"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import { useAnimatedBackground } from "@/hooks/useAnimatedBackground";
import { AnimatedWallpaperBackground } from "@/components/shared/AnimatedWallpaperBackground";  

import { LoginForm } from "../auth/LoginForm";
import { RegisterForm } from "../auth/RegisterForm";

import img from "@/../public/assets/imgs/loading/loadingWallpapers/w5.png";

type AuthMode = "login" | "register";

type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  faction?: string;
  subFaction?: string;
  chapter?: string;
};

type AuthScreenProps = {
  onLogin: (email: string, password: string) => Promise<void>;
  onRegister: (payload: RegisterPayload) => Promise<void>;
  initialMode?: AuthMode;
  onClose?: () => void;
};

export function AuthScreen({ onLogin, onRegister, initialMode = "login", onClose }: AuthScreenProps) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const { showBackground, currentBackground } = useAnimatedBackground();
  const [currentQuote, setCurrentQuote] = useState({ quote: "", author: "" });
  const [imageFailed, setImageFailed] = useState(false);

  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [registerName, setRegisterName] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerFaction, setRegisterFaction] = useState("");
  const [registerSubFaction, setRegisterSubFaction] = useState("");
  const [registerChapter, setRegisterChapter] = useState("");

  const [loginError, setLoginError] = useState<string | null>(null);
  const [registerError, setRegisterError] = useState<string | null>(null);
  const [isLoginSubmitting, setIsLoginSubmitting] = useState(false);
  const [isRegisterSubmitting, setIsRegisterSubmitting] = useState(false);

  const canLogin = useMemo(
    () => loginEmail.length > 3 && loginPassword.length > 0,
    [loginEmail, loginPassword]
  );
  const canRegister = useMemo(
    () =>
      registerName.length > 1 &&
      registerEmail.length > 3 &&
      registerPassword.length >= 8 &&
      registerFaction.length > 0 &&
      registerSubFaction.length > 0 &&
      (registerSubFaction !== "Space Marines" || registerChapter.length > 0),
    [
      registerName,
      registerEmail,
      registerPassword,
      registerFaction,
      registerSubFaction,
      registerChapter,
    ]
  );

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  useEffect(() => {
    const quotes = [
      { quote: "In the grim darkness of the far future, there is only war.", author: "Warhammer 40,000 Motto" },
      { quote: "Knowledge is power, guard it well.", author: "Belisarius Cawl" },
      { quote: "Innocence proves nothing.", author: "Inquisitor Eisenhorn" },
      { quote: "The Emperor's light guides us through the darkness.", author: "Vulkan" },
      { quote: "Victory needs no explanation, defeat allows none.", author: "Perturabo" },
      { quote: "I am the Emperor's wrath.", author: "Lion El'Jonson" },
    ];

    const pickQuote = () => quotes[Math.floor(Math.random() * quotes.length)];
    setCurrentQuote(pickQuote());
    const quoteTimer = setInterval(() => setCurrentQuote(pickQuote()), 5000);

    return () => {
      clearInterval(quoteTimer);
    };
  }, []);

  const handleLogin = async () => {
    if (!canLogin || isLoginSubmitting) return;
    setIsLoginSubmitting(true);
    setLoginError(null);
    try {
      await onLogin(loginEmail, loginPassword);
    } catch (e) {
      setLoginError(e instanceof Error ? e.message : "Falha ao autenticar");
    } finally {
      setIsLoginSubmitting(false);
    }
  };

  const handleRegister = async () => {
    if (!canRegister || isRegisterSubmitting) return;
    setIsRegisterSubmitting(true);
    setRegisterError(null);
    try {
      await onRegister({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
        faction: registerFaction || undefined,
        subFaction: registerSubFaction || undefined,
        chapter:
          registerSubFaction === "Space Marines"
            ? registerChapter || undefined
            : undefined,
      });
    } catch (e) {
      setRegisterError(e instanceof Error ? e.message : "Falha ao criar conta");
    } finally {
      setIsRegisterSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black overflow-hidden p-4">
      <AnimatedWallpaperBackground
        showBackground={showBackground}
        currentBackground={currentBackground}
        alt="Fundo de autenticação"
        panOpacityClassName="opacity-35"
        overlayClassName="bg-black/65 backdrop-blur-[2px]"
      />

      <div className="relative z-10 w-full max-w-4xl">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="mb-3 rounded border border-amber-500/30 bg-black/50 px-3 py-1 text-xs text-amber-200 hover:bg-black/70 transition"
          >
            Voltar ao menu
          </button>
        )}
        <div className="rounded-2xl overflow-hidden bg-black/85">
          <div className="grid grid-cols-2">
            <div className="p-6 md:p-8 bg-black/70">
              {mode === "login" ? (
                <LoginForm
                  email={loginEmail}
                  password={loginPassword}
                  error={loginError}
                  isSubmitting={isLoginSubmitting}
                  canSubmit={canLogin}
                  onChangeEmail={setLoginEmail}
                  onChangePassword={setLoginPassword}
                  onSubmit={handleLogin}
                  onSwitchToRegister={() => {
                    setMode("register");
                    setLoginError(null);
                  }}
                />
              ) : (
                <RegisterForm
                  name={registerName}
                  email={registerEmail}
                  password={registerPassword}
                  faction={registerFaction}
                  subFaction={registerSubFaction}
                  chapter={registerChapter}
                  error={registerError}
                  isSubmitting={isRegisterSubmitting}
                  canSubmit={canRegister}
                  onChangeName={setRegisterName}
                  onChangeEmail={setRegisterEmail}
                  onChangePassword={setRegisterPassword}
                  onChangeFaction={setRegisterFaction}
                  onChangeSubFaction={setRegisterSubFaction}
                  onChangeChapter={setRegisterChapter}
                  onSubmit={handleRegister}
                  onSwitchToLogin={() => {
                    setMode("login");
                    setRegisterError(null);
                  }}
                />
              )}
            </div>

            <div className="relative block">
              {!imageFailed ? (
                <Image
                  src={img}
                  alt="Ilustração da autenticação"
                  fill
                  className="object-cover object-center"
                  onError={() => setImageFailed(true)}
                />
              ) : (
                <div className="absolute inset-0 bg-gradient-to-tr from-black via-slate-900 to-slate-800">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_65%_30%,rgba(120,170,255,0.35),transparent_45%)]" />
                  <div className="absolute bottom-5 right-5 text-right">
                    <p className="text-xs text-amber-200">Espaço para imagem customizada</p>
                    <p className="text-[10px] text-slate-300 mt-1">{img.src}</p>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-r from-black" />
            </div>
          </div>
        </div>

        <div className="mt-5 text-center">
          <p className="text-sm md:text-base text-amber-300 italic">
            &ldquo;{currentQuote.quote}&rdquo;
          </p>
          <p className="text-xs text-slate-400 mt-1">— {currentQuote.author}</p>
        </div>
      </div>
    </div>
  );
}

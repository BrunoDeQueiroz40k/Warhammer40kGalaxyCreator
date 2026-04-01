"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { Loading } from "@/components/Loading";
import { HelpButton } from "@/components/HelpButton";
import { useGalaxyCache } from "@/hooks/useGalaxyCache";
import { CacheStatus } from "@/components/CacheStatus";
import { CookieConsent } from "@/components/CookieConsent";
import { Visualization } from "@/components/Visualization";
import { LoadingScreen } from "@/components/LoadingScreen";
import { PlanetList } from "@/components/planet/PlanetList";
import { SearchInput } from "@/components/planet/SearchInput";
import { ResetCameraButton } from "@/components/ResetCameraButton";
import { UserProfileModal } from "@/components/screens/UserProfileModal";
import { GameActionsModal } from "@/components/screens/GameActionsModal";
import { getPlanets, getRoutes, resetCampaign } from "@/lib/campaignApi";
import { GalaxyCache } from "@/lib/galaxyCache";

import GalaxyComponent from "@/components/galaxyComponent/GalaxyComponent";

declare global {
  interface Window {
    showLoading?: () => void;
    updateLoadingProgress?: (progress: number, message: string) => void;
    hideLoading?: () => void;
  }
}

export default function GamePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [showSegmentums, setShowSegmentums] = useState(false);
  const [showPlanetNames, setShowPlanetNames] = useState(false);

  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const initializedFromServerRef = useRef(false);

  const clearLocalGameState = () => {
    const galaxyInstance = (
      window as {
        galaxyInstance?: {
          clearAllPlanets?: () => void;
        };
      }
    ).galaxyInstance;
    galaxyInstance?.clearAllPlanets?.();
    GalaxyCache.clearCache();
    localStorage.removeItem("game-setup-config");
    initializedFromServerRef.current = false;
  };

  const handleResetCampaign = async () => {
    try {
      await resetCampaign();
      clearLocalGameState();
      window.alert("Campanha resetada com sucesso.");
    } catch {
      window.alert("Falha ao resetar a campanha.");
    }
  };

  const handleExitGame = async () => {
    try {
      await resetCampaign();
    } catch {
      // Mesmo com falha do backend, limpar estado local para sair.
    } finally {
      clearLocalGameState();
      router.push("/menu");
    }
  };

  useGalaxyCache();

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace("/menu?play=1");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    const handleLoadingStart = () => setIsLoading(true);
    const handleLoadingProgress = () => { };
    const handleLoadingEnd = () => setIsLoading(false);

    window.showLoading = handleLoadingStart;
    window.updateLoadingProgress = handleLoadingProgress;
    window.hideLoading = handleLoadingEnd;

    return () => {
      delete window.showLoading;
      delete window.updateLoadingProgress;
      delete window.hideLoading;
    };
  }, []);

  useEffect(() => {
    if (authLoading || !user || initializedFromServerRef.current) return;

    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 12;

    const loadFromServer = async () => {
      if (cancelled) return;
      attempts += 1;

      const galaxyInstance = (
        window as {
          galaxyInstance?: {
            clearAllPlanets?: () => void;
            addPlanetWithoutEditMode?: (planet: unknown) => void;
            setRoutes?: (routes: unknown[]) => void;
          };
        }
      ).galaxyInstance;

      if (!galaxyInstance?.addPlanetWithoutEditMode) {
        if (attempts < maxAttempts) {
          setTimeout(loadFromServer, 300);
        }
        return;
      }

      try {
        const planets = await getPlanets();
        const routes = await getRoutes();
        if (cancelled) return;

        galaxyInstance.clearAllPlanets?.();
        planets.forEach((planet) => galaxyInstance.addPlanetWithoutEditMode?.(planet));
        galaxyInstance.setRoutes?.(routes);
        initializedFromServerRef.current = true;
      } catch {
        if (attempts < maxAttempts) {
          setTimeout(loadFromServer, 600);
        }
      }
    };

    void loadFromServer();
    return () => {
      cancelled = true;
    };
  }, [authLoading, user]);

  if (authLoading) {
    return (
      <LoadingScreen
        size={180}
        animationSpeed={6}
        message="Carregando sessão..."
        progress={35}
      />
    );
  }

  if (!user) return null;

  return (
    <main className="w-screen h-screen overflow-hidden relative">
      {isLoading && (
        <div className="fixed bottom-3.5 right-[70px] z-40 pointer-events-none">
          <Loading size={32} animationSpeed={7} />
        </div>
      )}

      <div className="w-full h-full relative">
        <GalaxyComponent
          showSegmentums={showSegmentums}
          showPlanetNames={showPlanetNames}
          playerFaction={user.faction}
        />
      </div>

      <div className="fixed top-3.5 left-3.5 z-30 flex items-center gap-2">
        {user && <UserProfileModal user={user} onLogout={logout} />}
        <GameActionsModal
          onOptions={() => window.alert("Opcoes em desenvolvimento.")}
          onResetCampaign={() => {
            void handleResetCampaign();
          }}
          onExitGame={() => {
            void handleExitGame();
          }}
        />
      </div>

      <CookieConsent />

      <div className="flex gap-8 fixed top-3.5 right-3.5 z-20">
        <div className="flex gap-3">
          <PlanetList />
          <SearchInput />
        </div>
      </div>

      <div className="flex flex-col gap-3 fixed bottom-3.5 right-3.5 z-20">
        <ResetCameraButton />
        <Visualization
          showSegmentums={showSegmentums}
          onToggleSegmentums={setShowSegmentums}
          showPlanetNames={showPlanetNames}
          onTogglePlanetNames={setShowPlanetNames}
        />
        <CacheStatus />
        <HelpButton />
      </div>
    </main>
  );
}

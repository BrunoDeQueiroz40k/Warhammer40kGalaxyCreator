"use client";

import { useAuth } from "../hooks/useAuth";
import { useEffect, useState } from "react";

// Extensão do tipo Window para incluir as funções de loading
declare global {
  interface Window {
    showLoading?: () => void;
    updateLoadingProgress?: (progress: number, message: string) => void;
    hideLoading?: () => void;
  }
}

import { AuthScreen } from "./components/AuthScreen";
import { useGalaxyCache } from "../hooks/useGalaxyCache";
import { UserProfileModal } from "./components/UserProfileModal";

import { Loading } from "./components/Loading";
import { HelpButton } from "./components/HelpButton";
import { CacheStatus } from "./components/CacheStatus";
import { ImportButton } from "./components/ImportButton";
import { ExportButton } from "./components/ExportButton";
import { AddButton } from "./components/planet/AddButton";
import { CookieConsent } from "./components/CookieConsent";
import { Visualization } from "./components/Visualization";
import { LoadingScreen } from "./components/LoadingScreen";
import { PlanetList } from "./components/planet/PlanetList";
import { SearchInput } from "./components/planet/SearchInput";
import { ResetCameraButton } from "./components/ResetCameraButton";
import GalaxyComponent from "./components/galaxyComponent/GalaxyComponent";

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [showSegmentums, setShowSegmentums] = useState(false);
  const [showPlanetNames, setShowPlanetNames] = useState(false);
  const { user, loading: authLoading, login, register, logout } = useAuth();

  // Inicializar sistema de cache
  useGalaxyCache();

  useEffect(() => {
    const handleLoadingStart = () => {
      setIsLoading(true);
    };

    const handleLoadingProgress = () => { };

    const handleLoadingEnd = () => {
      setIsLoading(false);
    };

    window.showLoading = handleLoadingStart;
    window.updateLoadingProgress = handleLoadingProgress;
    window.hideLoading = handleLoadingEnd;

    // Cleanup
    return () => {
      delete window.showLoading;
      delete window.updateLoadingProgress;
      delete window.hideLoading;
    };
  }, []);

  return (
    <main className="w-screen h-screen overflow-hidden relative">
      {isLoading && (
        <div className="fixed bottom-3.5 right-[70px] z-40 pointer-events-none">
          <Loading size={32} animationSpeed={7} />
        </div>
      )}
      {authLoading && (
        <LoadingScreen
          size={180}
          animationSpeed={6}
          message="Verificando autenticação..."
          progress={35}
        />
      )}
      {!authLoading && !user && (
        <AuthScreen onLogin={login} onRegister={register} />
      )}
      {!authLoading && user && (
        <>
          <div className="w-full h-full relative">
            <GalaxyComponent
              showSegmentums={showSegmentums}
              showPlanetNames={showPlanetNames}
            />
          </div>
          <div className="fixed top-3.5 left-3.5 z-30 flex items-center gap-2">
            <UserProfileModal user={user} onLogout={logout} />
          </div>
          <AddButton />
          <CookieConsent />
          <div className="flex gap-8 fixed top-3.5 right-3.5 z-20">
            <div className="flex gap-3">
              <ImportButton />
              <ExportButton />
            </div>
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
        </>
      )}
    </main>
  );
}

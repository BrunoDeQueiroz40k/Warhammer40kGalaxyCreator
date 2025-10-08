"use client";

import { useEffect, useState } from "react";

// Extensão do tipo Window para incluir as funções de loading
declare global {
  interface Window {
    showLoading?: () => void;
    updateLoadingProgress?: (progress: number, message: string) => void;
    hideLoading?: () => void;
  }
}

//import { SideBar } from "./components/SideBar";
import { AddButton } from "./components/AddButton";
import { HelpButton } from "./components/HelpButton";
import { SearchInput } from "./components/SearchInput";
import { PlanetList } from "./components/PlanetList";
import { CacheStatus } from "./components/CacheStatus";
import { ImportButton } from "./components/ImportButton";
import { useGalaxyCache } from "../hooks/useGalaxyCache";
import { ExportButton } from "./components/ExportButton";
import { CookieConsent } from "./components/CookieConsent";
import { Visualization } from "./components/Visualization";
import { LoadingScreen } from "./components/LoadingScreen";
import { ResetCameraButton } from "./components/ResetCameraButton";
import GalaxyComponent from "./components/galaxyComponent/GalaxyComponent";

export default function Home() {
  const [showSegmentums, setShowSegmentums] = useState(false);
  const [showPlanetNames, setShowPlanetNames] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState("Inicializando Galáxia...");

  // Inicializar sistema de cache
  useGalaxyCache();

  // Carregamento inicial simulado
  useEffect(() => {
    const initialLoadingSteps = [
      { message: "Inicializando Galáxia...", duration: 600 },
      { message: "Carregando Segmentums...", duration: 700 },
      { message: "Mapeando Sistemas Estelares...", duration: 700 },
      { message: "Preparando Visualização...", duration: 500 }
    ];

    let currentStep = 0;
    let progress = 0;

    const simulateInitialLoading = () => {
      if (currentStep < initialLoadingSteps.length) {
        const step = initialLoadingSteps[currentStep];
        setLoadingMessage(step.message);

        const stepProgress = 100 / initialLoadingSteps.length;
        const targetProgress = (currentStep + 1) * stepProgress;

        const progressInterval = setInterval(() => {
          progress += 2;
          if (progress >= targetProgress) {
            progress = targetProgress;
            clearInterval(progressInterval);
            currentStep++;
            setTimeout(simulateInitialLoading, step.duration);
          }
          setLoadingProgress(progress);
        }, 50);
      } else {
        // Loading inicial completo - aguardar um pouco mais para garantir que a galáxia carregue
        setTimeout(() => {
          setIsLoading(false);
        }, 1000);
      }
    };

    // Iniciar carregamento inicial
    simulateInitialLoading();

    // Timeout de segurança para garantir que a galáxia sempre carregue
    const safetyTimeout = setTimeout(() => {
      setIsLoading(false);
    }, 5000); // 5 segundos máximo

    return () => {
      clearTimeout(safetyTimeout);
    };
  }, []);

  // Hook para detectar carregamentos reais
  useEffect(() => {
    const handleLoadingStart = () => {
      setIsLoading(true);
      setLoadingProgress(0);
      setLoadingMessage("Carregando dados...");
    };

    const handleLoadingProgress = (progress: number, message: string) => {
      setLoadingProgress(progress);
      setLoadingMessage(message);
    };

    const handleLoadingEnd = () => {
      setLoadingProgress(100);
      setTimeout(() => {
        setIsLoading(false);
      }, 500);
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
      {isLoading && <LoadingScreen size={200} animationSpeed={7} message={loadingMessage} progress={loadingProgress} />}
      <div className="w-full h-full relative">
        <GalaxyComponent
          showSegmentums={showSegmentums}
          showPlanetNames={showPlanetNames}
        />
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
    </main>
  );
}

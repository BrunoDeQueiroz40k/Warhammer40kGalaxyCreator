"use client";

import { useEffect, useState } from "react";
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
import { ResetCameraButton } from "./components/ResetCameraButton";
import GalaxyComponent from "./components/galaxyComponent/GalaxyComponent";
import { Loading } from "./components/Loading";

export default function Home() {
  const [showSegmentums, setShowSegmentums] = useState(false);
  const [showPlanetNames, setShowPlanetNames] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Inicializar sistema de cache
  useGalaxyCache();

  useEffect(() => {
    const handleReady = () => setIsLoading(false);

    // Se o documento já estiver pronto após uma navegação, escondemos rápido
    if (document.readyState === "complete") {
      const id = window.setTimeout(() => setIsLoading(false), 9999999);
      return () => window.clearTimeout(id);
    }

    // Caso contrário, esperamos o evento de load
    window.addEventListener("load", handleReady, { once: true });
    // Fallback: garantir sumiço após um tempo
    const fallback = window.setTimeout(() => setIsLoading(false), 9999999);
    return () => {
      window.removeEventListener("load", handleReady);
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <main className="w-screen h-screen overflow-hidden relative">
      {isLoading && <Loading />}
      {/* <SideBar /> */}
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

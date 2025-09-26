"use client";

import { useState } from "react";
import { SideBar } from "./components/SideBar";
import { AddButton } from "./components/AddButton";
import { HelpButton } from "./components/HelpButton";
import { SearchInput } from "./components/SearchInput";
import { CacheStatus } from "./components/CacheStatus";
import { ImportButton } from "./components/ImportButton";
import { useGalaxyCache } from "../hooks/useGalaxyCache";
import { ExportButton } from "./components/ExportButton";
import { CookieConsent } from "./components/CookieConsent";
import { Visualization } from "./components/Visualization";
import GalaxyComponent from "./components/galaxyComponent/GalaxyComponent";

export default function Home() {
  const [showSegmentums, setShowSegmentums] = useState(false);

  // Inicializar sistema de cache
  useGalaxyCache();

  return (
    <main>
      <SideBar />
      <div className="flex-1 z-[-1]">
        <GalaxyComponent showSegmentums={showSegmentums} />
      </div>
      <AddButton />
      <Visualization
        showSegmentums={showSegmentums}
        onToggleSegmentums={setShowSegmentums}
      />
      <HelpButton />
      <SearchInput />
      <ImportButton />
      <ExportButton />
      <CookieConsent />
      <CacheStatus />
    </main>
  );
}

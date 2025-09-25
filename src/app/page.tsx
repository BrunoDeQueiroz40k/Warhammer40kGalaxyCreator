"use client";

import { useState } from "react";
import { SideBar } from "./components/SideBar";
import { AddButton } from "./components/AddButton";
import { HelpButton } from "./components/HelpButton";
import { SearchInput } from "./components/SearchInput";
import { Visualization } from "./components/Visualization";
import GalaxyComponent from "./components/galaxyComponent/GalaxyComponent";

export default function Home() {
  const [showSegmentums, setShowSegmentums] = useState(false);

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
    </main>
  );
}

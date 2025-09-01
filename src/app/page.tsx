"use client";

import { SideBar } from "./components/SideBar";
import { AddButton } from "./components/AddButton";
import { HelpButton } from "./components/HelpButton";
import GalaxyComponent from "./components/galaxyComponent/GalaxyComponent";

export default function Home() {
  return (
    <main>
      <SideBar />
      <div className="flex-1 z-[-1]">
        <GalaxyComponent />
      </div>
      <AddButton />
      <HelpButton />
    </main>
  );
}

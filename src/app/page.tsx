"use client";

import { AddButton } from "./components/AddButton";
import GalaxyComponent from "./components/galaxyComponent/GalaxyComponent";
import { SideBar } from "./components/SideBar";

export default function Home() {
  return (
    <main>
      <SideBar />
      <div className="flex-1 z-[-1]">
        <GalaxyComponent />
      </div>
      <AddButton />
    </main>
  );
}

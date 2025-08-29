"use client";

import { SideBar } from "@/components/SideBar";
import GalaxyComponent from "./components/galaxyComponent/GalaxyComponent";
import { AddButton } from "@/components/AddButton";

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

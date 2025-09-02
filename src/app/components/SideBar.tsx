"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { Menu, Shell, X } from "lucide-react";
import { GiGalaxy, GiRingedPlanet } from "react-icons/gi";

const sideLinks = [
  { name: "Galáxia", icon: GiGalaxy, href: "" },
  { name: "Planetas", icon: GiRingedPlanet, href: "" },
  { name: "Segmentum", icon: Shell, href: "" },
];

export function SideBar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      <Button
        onClick={toggleSidebar}
        className={cn(
          "fixed top-3.5 z-50 transition-all duration-300 ease-in-out p-2",
          isOpen ? "left-71" : "left-3.5"
        )}
      >
        {isOpen ? (
          <X className="!w-5 !h-5 text-white" />
        ) : (
          <Menu className="!w-5 !h-5 text-white" />
        )}
      </Button>

      {isOpen && <div className="fixed inset-0 z-40" onClick={toggleSidebar} />}

      <div
        className={cn(
          "fixed bottom-3.5 top-3.5 left-0 w-64 bg-black/90 border border-amber-500/30",
          "transform transition-all duration-300 ease-in-out rounded-md z-50",
          isOpen ? "translate-x-3.5" : "-translate-x-full"
        )}
      >
        <div className="p-4 px-2">
          <h2 className="pl-2 text-lg font-semibold text-amber-400 mb-4">
            Galaxy Creator
          </h2>

          <div className="space-y-2 text-white">
            {sideLinks.map((item) => (
              <Button
                key={item.name}
                className="relative w-full justify-start py-1.5 pl-2 text-white bg-transparent border-transparent hover:bg-amber-500/15 hover:border-amber-500/30"
              >
                <item.icon className="!h-5 !w-5" />
                <span className="text-lg font-medium">{item.name}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

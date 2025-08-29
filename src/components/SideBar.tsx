"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export function SideBar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative">
      {/* Botão que será empurrado */}
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

      {/* Overlay para fechar ao clicar fora */}
      {isOpen && <div className="fixed inset-0 z-40" onClick={toggleSidebar} />}

      {/* Sidebar simples */}
      <div
        className={cn(
          "fixed bottom-3.5 top-3.5 left-0 w-64 bg-black/90 border border-amber-500/30",
          "transform transition-all duration-300 ease-in-out rounded-md z-50",
          isOpen ? "translate-x-3.5" : "-translate-x-full"
        )}
      >
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Galaxy Creator
          </h2>

          <div className="space-y-2 text-white">
            <div className="p-2 rounded hover:bg-gray-100 cursor-pointer">
              Galáxia
            </div>
            <div className="p-2 rounded hover:bg-gray-100 cursor-pointer">
              Configurações
            </div>
            <div className="p-2 rounded hover:bg-gray-100 cursor-pointer">
              Ajuda
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Eye, X } from "lucide-react";
import { Checkbox } from "./ui/checkbox";
import { Label } from "./ui/label";

interface VisualizationProps {
  showSegmentums: boolean;
  onToggleSegmentums: (show: boolean) => void;
}

export function Visualization({
  showSegmentums,
  onToggleSegmentums,
}: VisualizationProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="fixed bottom-32 right-3.5 z-20 p-2 transition-all duration-300"
        >
          <Eye className="!w-6 !h-6" />
        </Button>
      )}
      <div
        className={`fixed bottom-32 right-3.5 z-50 bg-black/90 border border-amber-500/30 rounded-lg text-white pointer-events-auto transform transition-all duration-500 ease-out ${
          isOpen
            ? "w-80 h-64 px-4 py-2 opacity-100 scale-100"
            : "w-12 h-12 p-2 opacity-0 scale-0"
        }`}
      >
        {!isOpen && (
          <div className="w-full h-full flex items-center justify-center">
            <Eye className="w-6 h-6 text-amber-400" />
          </div>
        )}
        {isOpen && (
          <div className="w-full h-full">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-amber-400">
                Visualização
              </h3>
              <Button
                onClick={() => setIsOpen(false)}
                variant="ghost"
                className="!p-1"
              >
                <X className="!w-4 !h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="show-segmentums"
                  checked={showSegmentums}
                  onCheckedChange={(checked) =>
                    onToggleSegmentums(checked as boolean)
                  }
                />
                <Label
                  htmlFor="show-segmentums"
                  className="text-sm font-medium text-white cursor-pointer"
                >
                  Mostrar Segmentos
                </Label>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

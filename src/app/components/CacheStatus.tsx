"use client";

import { useState, useEffect } from "react";
import { GalaxyCache } from "../../lib/galaxyCache";
import { Button } from "./ui/button";
import { Trash2 } from "lucide-react";
import { Cookie } from "@phosphor-icons/react";

export function CacheStatus() {
  const [cacheInfo, setCacheInfo] = useState(GalaxyCache.getCacheInfo());
  const [isVisible, setIsVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const updateInfo = () => {
      setCacheInfo(GalaxyCache.getCacheInfo());
    };

    // Atualizar a cada 5 segundos
    const interval = setInterval(updateInfo, 5000);
    updateInfo();

    return () => clearInterval(interval);
  }, []);

  const handleClearCache = () => {
    GalaxyCache.clearCache();
    setCacheInfo(GalaxyCache.getCacheInfo());
  };

  if (!isMounted || !cacheInfo.hasConsent) return null;

  return (
    <div>
      <Button
        onClick={() => setIsVisible(!isVisible)}
        className={`p-2 border-amber-500/30 text-amber-500 hover:bg-gray-800 ${!isVisible ? "bg-gray-900/80" : "bg-gray-700/80"}`}
      >
        <Cookie className="!w-6 !h-6" />
      </Button>

      {isVisible && (
        <div className="fixed bottom-30 right-3.5 z-50 bg-gray-900 border border-amber-500/30 rounded-lg p-3 w-64 shadow-lg">
          <div className="text-xs text-gray-300 space-y-1">
            <div className="font-semibold text-amber-500 mb-2">
              Status do Cache
            </div>

            <div className="flex justify-between">
              <span>Consentimento:</span>
              <span
                className={
                  cacheInfo.hasConsent ? "text-green-400" : "text-red-400"
                }
              >
                {cacheInfo.hasConsent ? "✓" : "✗"}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Cache válido:</span>
              <span
                className={
                  cacheInfo.isValid ? "text-green-400" : "text-red-400"
                }
              >
                {cacheInfo.isValid ? "✓" : "✗"}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Sessão ativa:</span>
              <span
                className={
                  cacheInfo.isSessionActive
                    ? "text-green-400"
                    : "text-yellow-400"
                }
              >
                {cacheInfo.isSessionActive ? "✓" : "✗"}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Planetas:</span>
              <span className="text-white">{cacheInfo.planetCount}</span>
            </div>

            {cacheInfo.lastSave && (
              <div className="text-xs text-gray-400 mt-2">
                Último save: {cacheInfo.lastSave}
              </div>
            )}

            <Button
              onClick={handleClearCache}
              variant="cancel"
              size="sm"
              className="w-full mt-2 text-red-400 border-red-400/30 hover:bg-red-900/20"
            >
              <Trash2 className="w-3 h-3 mr-1" />
              Limpar Cache
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

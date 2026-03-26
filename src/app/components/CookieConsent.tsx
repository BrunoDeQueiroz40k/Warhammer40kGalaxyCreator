"use client";

import { useState, useEffect } from "react";
import { Button } from "./ui/button";
import { X } from "lucide-react";

export function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    // Aguardar um pouco para garantir que o localStorage esteja disponível
    const checkConsent = () => {
      try {
        const consent = localStorage.getItem("galaxy-cookie-consent");
        if (!consent) {
          setShowConsent(true);
        }
      } catch (error) {
        console.error("Error checking consent:", error);
        setShowConsent(true);
      }
    };

    // Verificar imediatamente e também após um pequeno delay
    checkConsent();
    const timer = setTimeout(checkConsent, 100);

    return () => clearTimeout(timer);
  }, []);

  const handleAccept = () => {
    localStorage.setItem("galaxy-cookie-consent", "accepted");
    localStorage.setItem("galaxy-cookie-timestamp", Date.now().toString());
    setShowConsent(false);
  };

  const handleDecline = () => {
    localStorage.setItem("galaxy-cookie-consent", "declined");
    setShowConsent(false);
  };

  if (!isMounted || !showConsent) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[99] bg-gray-900 border border-amber-500/30 rounded-lg p-4 w-165.5">
      <div className="flex items-start">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">
            🍪 Uso de Cookies e Armazenamento Local
          </h3>
          <p className="text-gray-300 text-sm mb-4">
            Este site utiliza cookies e armazenamento local para:
            <br />
            • Salvar suas configurações de galaxia até o site ser fechado (30
            minutos até tudo ser apagado)
            <br />
            • Lembrar suas preferências de interface
            <br />
            • Melhorar sua experiência de navegação
            <br />
            <br />
            <strong>
              Seus dados são mantidos apenas localmente no seu navegador.
            </strong>
          </p>
          <div className="flex gap-2">
            <Button
              onClick={handleAccept}
              variant="accept"
              className="px-4 py-1"
            >
              Aceitar
            </Button>
            <Button
              onClick={handleDecline}
              variant="cancel"
              className="px-4 py-1"
            >
              Recusar
            </Button>
          </div>
        </div>
        <Button
          onClick={handleDecline}
          variant="ghost"
          size="sm"
          className="text-gray-400 hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

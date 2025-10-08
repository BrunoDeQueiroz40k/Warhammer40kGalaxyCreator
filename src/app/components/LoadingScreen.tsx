"use client";

import { useState, useEffect } from "react";
import { Loading } from "./Loading";
import Image from "next/image";

// Array de backgrounds disponíveis - adicione mais números aqui conforme adicionar imagens
const availableBackgrounds = [1, 2, 3, 4, 5, 6];

interface LoadingScreenProps {
  size?: number;
  width?: number;
  height?: number;
  animationSpeed?: number;
  message?: string;
  progress?: number;
  className?: string;
}

export function LoadingScreen({
  size,
  width,
  height,
  animationSpeed = 5,
  message = "Carregando...",
  progress = 0,
  className = "",
}: LoadingScreenProps) {
  const [currentQuote, setCurrentQuote] = useState({ quote: "", author: "" });
  const [currentBackground, setCurrentBackground] = useState(1);
  const [showBackground, setShowBackground] = useState(false);

  useEffect(() => {
    const warhammerQuotes = [
      {
        quote: "In the grim darkness of the far future, there is only war.",
        author: "Warhammer 40,000 Motto",
      },
      {
        quote: "I was there the day Horus slew the Emperor.",
        author: "Garviel Loken",
      },
      { quote: "I am Alpharius.", author: "Alpharius Omegon" },
      {
        quote: "The Emperor protects, but the Emperor is dead.",
        author: "Konrad Curze",
      },
      { quote: "I am the Emperor's will made manifest.", author: "Rogal Dorn" },
      {
        quote: "Knowledge is power, guard it well.",
        author: "Belisarius Cawl",
      },
      {
        quote: "The Emperor's light shines on the righteous.",
        author: "Roboute Guilliman",
      },
      {
        quote: "Hope is the first step on the road to disappointment.",
        author: "Lorgar Aurelian",
      },
      { quote: "Innocence proves nothing.", author: "Inquisitor Eisenhorn" },
      {
        quote: "A small mind is easily filled with faith.",
        author: "Magnus the Red",
      },
      {
        quote: "Victory needs no explanation, defeat allows none.",
        author: "Perturabo",
      },
      {
        quote: "The difference between heresy and treachery is ignorance.",
        author: "Inquisitor Kryptman",
      },
      {
        quote: "A mind without purpose will wander in dark places.",
        author: "Ahriman",
      },
      { quote: "The Emperor's will is absolute.", author: "Sanguinius" },
      { quote: "Duty is its own reward.", author: "Ferrus Manus" },
      {
        quote: "There is no such thing as innocence, only degrees of guilt.",
        author: "Inquisitor Amberley Vail",
      },
      { quote: "The Emperor's enemies shall know no mercy.", author: "Angron" },
      { quote: "Faith is the strongest shield.", author: "Leman Russ" },
      {
        quote: "In the Emperor's name, let none survive.",
        author: "Ragnar Blackmane",
      },
      {
        quote: "The Emperor's light guides us through the darkness.",
        author: "Vulkan",
      },
      {
        quote: "I am the hammer. I am the sword in His hand.",
        author: "Sigismund",
      },
      { quote: "The galaxy burns, and we are the flame.", author: "Fulgrim" },
      { quote: "Death to the False Emperor!", author: "Horus Lupercal" },
      { quote: "I am the Emperor's wrath.", author: "Lion El'Jonson" },
      { quote: "The warp is my domain.", author: "Ahriman" },
    ];

    // Mostrar uma frase aleatória inicial
    const randomQuote =
      warhammerQuotes[Math.floor(Math.random() * warhammerQuotes.length)];
    setCurrentQuote(randomQuote);

    // Trocar frase a cada 3 segundos
    const interval = setInterval(() => {
      const randomQuote =
        warhammerQuotes[Math.floor(Math.random() * warhammerQuotes.length)];
      setCurrentQuote(randomQuote);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    // Selecionar background aleatório apenas no cliente
    const randomInitialBackground =
      availableBackgrounds[
        Math.floor(Math.random() * availableBackgrounds.length)
      ];
    setCurrentBackground(randomInitialBackground);

    // Mostrar background após um pequeno delay para evitar flash
    const timer = setTimeout(() => {
      setShowBackground(true);
    }, 50);

    // Trocar background a cada 8 segundos
    const backgroundInterval = setInterval(() => {
      setCurrentBackground((prev) => {
        const currentIndex = availableBackgrounds.indexOf(prev);
        const nextIndex = (currentIndex + 1) % availableBackgrounds.length;
        return availableBackgrounds[nextIndex];
      });
    }, 8000);

    return () => {
      clearTimeout(timer);
      clearInterval(backgroundInterval);
    };
  }, []);

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black overflow-hidden ${className}`}
    >
      {/* Background animado */}
      {showBackground && (
        <div className="absolute inset-0 w-full h-full overflow-hidden">
          <div className="absolute inset-0 w-full h-full animate-pan-right opacity-35">
            <Image
              src={`/assets/imgs/loading/loadingWallpapers/w${currentBackground}.png`}
              alt="Background animado"
              fill
              className="object-cover object-center"
              priority
            />
          </div>
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center justify-center min-h-0 w-full max-w-4xl px-4 overflow-hidden">
        <Loading
          size={size}
          width={width}
          height={height}
          animationSpeed={animationSpeed}
        />

        <div className="mt-8 text-center w-full max-w-2xl overflow-hidden">
          <p className="text-xl text-gray-300 font-medium animate-pulse mb-4">
            {message}
          </p>

          {/* Barra de Progresso */}
          <div className="w-full max-w-96 bg-gray-700 rounded-full h-2 mb-6 mx-auto">
            <div
              className="bg-gradient-to-r from-amber-600 to-amber-400 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <div className="max-h-32 overflow-y-auto scrollbar-hide">
            <p className="text-lg text-amber-400 italic font-light leading-relaxed">
              &ldquo;{currentQuote.quote}&rdquo;
            </p>
            <p className="text-sm text-gray-400 mt-2">
              — {currentQuote.author}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

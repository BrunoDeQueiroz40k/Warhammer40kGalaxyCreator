"use client";

import { useEffect, useState } from "react";

const DEFAULT_BACKGROUNDS = [1];
let cachedBackgrounds: number[] | null = null;

export function useAnimatedBackground() {
  const [showBackground, setShowBackground] = useState(false);
  const [currentBackground, setCurrentBackground] = useState(1);

  useEffect(() => {
    let mounted = true;
    const timer = setTimeout(() => {
      if (mounted) setShowBackground(true);
    }, 50);

    const pickRandom = (list: number[]) => {
      const idx = Math.floor(Math.random() * list.length);
      setCurrentBackground(list[idx] ?? 1);
    };

    if (cachedBackgrounds && cachedBackgrounds.length > 0) {
      pickRandom(cachedBackgrounds);
    } else {
      void fetch("/api/loading-backgrounds")
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error("fetch"))))
        .then((data: { backgrounds?: number[] }) => {
          const list =
            data.backgrounds && data.backgrounds.length > 0
              ? data.backgrounds
              : DEFAULT_BACKGROUNDS;
          cachedBackgrounds = list;
          if (mounted) pickRandom(list);
        })
        .catch(() => {
          cachedBackgrounds = DEFAULT_BACKGROUNDS;
          if (mounted) pickRandom(DEFAULT_BACKGROUNDS);
        });
    }

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, []);

  return { showBackground, currentBackground };
}

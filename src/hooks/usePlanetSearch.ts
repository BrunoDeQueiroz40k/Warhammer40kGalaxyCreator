import { useState, useEffect, useCallback } from "react";

import { PlanetEntry, PlanetSummaryData, SearchResult } from "@/types/interfaces";
import { getWindowGalaxyProvider, readPlanets } from "@/lib/galaxyHelpers";

interface UsePlanetSearchOptions {
  maxResults?: number;
  showAllWhenEmpty?: boolean;
}

function getAllPlanets(): PlanetEntry<PlanetSummaryData>[] {
  if (typeof window === "undefined") return [];

  const galaxyInstance = getWindowGalaxyProvider<PlanetEntry<PlanetSummaryData>>();
  if (!galaxyInstance) return [];

  try {
    return readPlanets(galaxyInstance);
  } catch (error) {
    console.error("Erro ao obter planetas:", error);
    return [];
  }
}

function scorePlanets(
  planets: PlanetEntry<PlanetSummaryData>[],
  query: string
): SearchResult[] {
  if (!query.trim()) {
    return planets.map((planet) => ({
      planet,
      matchScore: 50,
      matchType: "name" as const,
    }));
  }

  const results: SearchResult[] = [];
  const queryLower = query.toLowerCase();

  planets.forEach((planet) => {
    const name = planet.data?.name?.toLowerCase() || "";
    const domain = (planet.data?.domain || planet.data?.faction || "").toLowerCase();
    const planetType = planet.data?.planetType?.toLowerCase() || "";
    const segmentum = planet.data?.segmentum?.toLowerCase() || "";

    let matchScore = 0;
    let matchType: "name" | "faction" | "type" = "name";

    if (name.includes(queryLower)) {
      matchScore = 100;
      if (name.startsWith(queryLower)) matchScore = 150;
      matchType = "name";
    } else if (domain.includes(queryLower)) {
      matchScore = 80;
      if (domain.startsWith(queryLower)) matchScore = 120;
      matchType = "faction";
    } else if (planetType.includes(queryLower)) {
      matchScore = 60;
      if (planetType.startsWith(queryLower)) matchScore = 90;
      matchType = "type";
    } else if (segmentum.includes(queryLower)) {
      matchScore = 70;
      if (segmentum.startsWith(queryLower)) matchScore = 100;
      matchType = "name";
    }

    if (matchScore > 0) {
      results.push({ planet, matchScore, matchType });
    }
  });

  return results.sort((a, b) => b.matchScore - a.matchScore);
}

export function usePlanetSearch(
  query: string,
  options: UsePlanetSearchOptions = {}
) {
  const { maxResults, showAllWhenEmpty = true } = options;

  const [allPlanets, setAllPlanets] = useState<PlanetEntry<PlanetSummaryData>[]>([]);
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const refreshPlanets = useCallback(() => {
    setAllPlanets(getAllPlanets());
  }, []);

  useEffect(() => {
    let filtered: SearchResult[];

    if (!query.trim() && !showAllWhenEmpty) {
      filtered = allPlanets.slice(0, maxResults ?? 5).map((planet) => ({
        planet,
        matchScore: 50,
        matchType: "name" as const,
      }));
    } else {
      filtered = scorePlanets(allPlanets, query);
      if (maxResults) {
        filtered = filtered.slice(0, maxResults);
      }
    }

    setResults(filtered);
    setSelectedIndex(-1);
  }, [query, allPlanets, maxResults, showAllWhenEmpty]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (results.length === 0) return;

      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev < results.length - 1 ? prev + 1 : 0
          );
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : results.length - 1
          );
          break;
      }
    },
    [results.length]
  );

  const handleSelect = useCallback((): PlanetEntry<PlanetSummaryData> | null => {
    if (selectedIndex >= 0 && selectedIndex < results.length) {
      return results[selectedIndex].planet;
    }
    return null;
  }, [selectedIndex, results]);

  return {
    results,
    selectedIndex,
    setSelectedIndex,
    handleKeyDown,
    handleSelect,
    allPlanets,
    refreshPlanets,
  };
}

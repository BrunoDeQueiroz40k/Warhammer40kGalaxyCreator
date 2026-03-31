import { useState, useEffect, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";

import { Search, X, List } from "lucide-react";

import { PlanetEntry, PlanetSummaryData, SearchResult } from "@/types/interfaces";
import { getFactionVariant, getWindowGalaxyProvider, readPlanets } from "@/types/functions";

import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { GalaxyNavigator } from "@/lib/galaxyNavigator";

export function PlanetList() {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [allPlanets, setAllPlanets] = useState<PlanetEntry<PlanetSummaryData>[]>([]);
  const [filteredPlanets, setFilteredPlanets] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLInputElement>(null);

  const getAllPlanets = (): PlanetEntry<PlanetSummaryData>[] => {
    if (typeof window === "undefined") return [];

    const galaxyInstance = getWindowGalaxyProvider<PlanetEntry<PlanetSummaryData>>();
    if (!galaxyInstance) return [];

    try {
      return readPlanets(galaxyInstance);
    } catch (error) {
      console.error("Erro ao obter planetas:", error);
      return [];
    }
  };

  // Carregar todos os planetas quando o dialog abrir
  useEffect(() => {
    if (open) {
      const planets = getAllPlanets();
      setAllPlanets(planets);
      setSearchValue("");
      setSelectedIndex(-1);
      // Focar no input após um pequeno delay para garantir que o dialog está renderizado
      setTimeout(() => {
        searchRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // Filtrar planetas baseado na pesquisa
  useEffect(() => {
    const filterPlanets = (query: string): SearchResult[] => {
      if (!query.trim()) {
        // Se não há query, mostrar todos os planetas
        return allPlanets.map((planet) => ({
          planet,
          matchScore: 50,
          matchType: "name" as const,
        }));
      }

      const results: SearchResult[] = [];
      const queryLower = query.toLowerCase();

      allPlanets.forEach((planet) => {
        const name = planet.data?.name?.toLowerCase() || "";
        const domain = (planet.data?.domain || planet.data?.faction || "").toLowerCase();
        const planetType = planet.data?.planetType?.toLowerCase() || "";
        const segmentum = planet.data?.segmentum?.toLowerCase() || "";

        let matchScore = 0;
        let matchType: "name" | "faction" | "type" = "name";

        // Verificar correspondência exata no nome (maior prioridade)
        if (name.includes(queryLower)) {
          matchScore = 100;
          if (name.startsWith(queryLower)) matchScore = 150;
          matchType = "name";
        }
        // Verificar correspondência na facção
        else if (domain.includes(queryLower)) {
          matchScore = 80;
          if (domain.startsWith(queryLower)) matchScore = 120;
          matchType = "faction";
        }
        // Verificar correspondência no tipo de planeta
        else if (planetType.includes(queryLower)) {
          matchScore = 60;
          if (planetType.startsWith(queryLower)) matchScore = 90;
          matchType = "type";
        }
        // Verificar correspondência no segmentum
        else if (segmentum.includes(queryLower)) {
          matchScore = 70;
          if (segmentum.startsWith(queryLower)) matchScore = 100;
          matchType = "name";
        }

        if (matchScore > 0) {
          results.push({ planet, matchScore, matchType });
        }
      });

      // Ordenar por score (maior primeiro)
      return results.sort((a, b) => b.matchScore - a.matchScore);
    };

    const filtered = filterPlanets(searchValue);
    setFilteredPlanets(filtered);
    setSelectedIndex(-1);
  }, [searchValue, allPlanets]);

  // Navegação com teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filteredPlanets.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredPlanets.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : filteredPlanets.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < filteredPlanets.length) {
          const selectedPlanet = filteredPlanets[selectedIndex].planet;
          GalaxyNavigator.navigateToPlanet(selectedPlanet);
          setOpen(false);
        }
        break;
      case "Escape":
        setOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const clearSearch = () => {
    setSearchValue("");
    setSelectedIndex(-1);
    searchRef.current?.focus();
  };

  const handlePlanetClick = (planet: PlanetEntry<PlanetSummaryData>) => {
    GalaxyNavigator.navigateToPlanet(planet);
    setOpen(false);
    setSelectedIndex(-1);
  };

  return (
    <>
      <Dialog.Root open={open} onOpenChange={setOpen}>
        <Dialog.Trigger asChild>
          <Button className="p-2">
            <List className="!w-6 !h-6" />
          </Button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <Dialog.Content className="bg-black/90 rounded-lg border border-amber-500/30 p-6 w-full max-w-xl max-h-[90vh] text-white">
              <Dialog.Title className="text-2xl mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold">
                  <List className="w-6 h-6 text-amber-400" />
                  Lista de Planetas
                </div>
                <div className="text-sm text-slate-400">
                  Total de {allPlanets.length} planetas
                </div>
              </Dialog.Title>

              {/* Barra de pesquisa */}
              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400 w-4 h-4" />
                <Input
                  ref={searchRef}
                  type="text"
                  placeholder="Pesquisar planetas..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  className="w-full pl-10 pr-10 bg-black/50 border-amber-500/30 focus:border-amber-500 text-white placeholder:text-slate-400"
                />
                {searchValue && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-400 hover:text-amber-300 transition-colors duration-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Lista de planetas */}
              <div className="max-h-96 overflow-y-auto border border-amber-500/30 rounded-lg">
                {filteredPlanets.length > 0 ? (
                  filteredPlanets.map((result, index) => (
                    <div
                      key={`${result.planet.data?.name}-${index}`}
                      onClick={() => handlePlanetClick(result.planet)}
                      className={`px-4 py-3 cursor-pointer border-b border-amber-500/30 last:border-b-0 hover:bg-amber-500/10 transition-colors ${index === selectedIndex ? "bg-amber-500/20" : ""
                        }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="text-white font-medium text-lg truncate">
                              {result.planet.data?.name || "Planeta sem nome"}
                            </div>
                            <div className="text-slate-300 text-sm">
                              {result.planet.data?.segmentum || "Segmentum indefinido"}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge
                              variant={getFactionVariant(
                                result.planet.data?.domain || result.planet.data?.faction || ""
                              )}
                              className="px-2 py-1 text-xs"
                            >
                              {result.planet.data?.domain ||
                                result.planet.data?.faction ||
                                "Não especificado"}
                            </Badge>
                            {result.planet.data?.chapter && (
                              <Badge variant="imperium" className="px-2 py-1 text-xs">
                                {result.planet.data.chapter}
                              </Badge>
                            )}
                            <Badge
                              variant="normal"
                              className="px-2 py-1 text-xs"
                            >
                              {result.planet.data?.planetType ||
                                "Não especificado"}
                            </Badge>
                            {result.planet.data?.status && (
                              <Badge
                                variant={
                                  result.planet.data.status === "destruido"
                                    ? "caos"
                                    : "orks"
                                }
                                className="px-2 py-1 text-xs"
                              >
                                {result.planet.data.status}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-slate-400">
                    {searchValue.trim() ? (
                      <>
                        Nenhum planeta encontrado para &quot;{searchValue}&quot;
                      </>
                    ) : (
                      <>Nenhum planeta encontrado</>
                    )}
                  </div>
                )}
              </div>
              <Dialog.Close asChild>
                <div className="flex justify-end mt-4">
                  <Button variant="gray" className="py-2 px-3">
                    Fechar
                  </Button>
                </div>
              </Dialog.Close>
            </Dialog.Content>
          </Dialog.Overlay>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}

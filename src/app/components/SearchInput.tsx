import { useState, useEffect, useRef } from "react";
import { Input } from "./ui/input";
import { Search, X, MapPin, Users, Zap } from "lucide-react";
import { Badge } from "./ui/badge";
import { GalaxyNavigator } from "../../lib/GalaxyNavigator";

interface Planet {
  data: {
    name: string;
    faction: string;
    planetType: string;
    description: string;
    population: number;
    status: string;
    color: string;
    segmentum: string;
  };
  position: { x: number; y: number; z: number };
}

interface SearchResult {
  planet: Planet;
  matchScore: number;
  matchType: "name" | "faction" | "type" | "description";
}

export function SearchInput() {
  const [searchValue, setSearchValue] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Obter todos os planetas
  const getAllPlanets = (): Planet[] => {
    if (typeof window === "undefined") return [];

    const galaxyInstance = (
      window as {
        galaxyInstance?: {
          getAllPlanetsData?: () => Planet[];
          getPlanets?: () => Planet[];
        };
      }
    ).galaxyInstance;
    if (!galaxyInstance) return [];

    try {
      const planets = galaxyInstance.getAllPlanetsData
        ? galaxyInstance.getAllPlanetsData()
        : galaxyInstance.getPlanets
        ? galaxyInstance.getPlanets()
        : [];
      return planets;
    } catch (error) {
      console.error("Erro ao obter planetas:", error);
      return [];
    }
  };

  // Atualizar resultados da pesquisa
  useEffect(() => {
    const filterPlanets = (query: string): SearchResult[] => {
      if (!query.trim()) return [];

      const planets = getAllPlanets();
      const results: SearchResult[] = [];

      planets.forEach((planet) => {
        const name = planet.data?.name?.toLowerCase() || "";
        const faction = planet.data?.faction?.toLowerCase() || "";
        const planetType = planet.data?.planetType?.toLowerCase() || "";
        const description = planet.data?.description?.toLowerCase() || "";
        const queryLower = query.toLowerCase();

        let matchScore = 0;
        let matchType: "name" | "faction" | "type" | "description" = "name";

        // Verificar correspondência exata no nome (maior prioridade)
        if (name.includes(queryLower)) {
          matchScore = 100;
          if (name.startsWith(queryLower)) matchScore = 150;
          matchType = "name";
        }
        // Verificar correspondência na facção
        else if (faction.includes(queryLower)) {
          matchScore = 80;
          if (faction.startsWith(queryLower)) matchScore = 120;
          matchType = "faction";
        }
        // Verificar correspondência no tipo de planeta
        else if (planetType.includes(queryLower)) {
          matchScore = 60;
          if (planetType.startsWith(queryLower)) matchScore = 90;
          matchType = "type";
        }
        // Verificar correspondência na descrição
        else if (description.includes(queryLower)) {
          matchScore = 40;
          matchType = "description";
        }

        if (matchScore > 0) {
          results.push({ planet, matchScore, matchType });
        }
      });

      // Ordenar por score (maior primeiro)
      return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 8);
    };

    const getFirstFivePlanets = (): SearchResult[] => {
      const planets = getAllPlanets();
      return planets.slice(0, 5).map((planet) => ({
        planet,
        matchScore: 50, // Score neutro para planetas sem filtro
        matchType: "name" as const,
      }));
    };

    if (searchValue.trim()) {
      const results = filterPlanets(searchValue);
      setSearchResults(results);
      setShowResults(true);
      setSelectedIndex(-1);
    } else {
      // Quando não há query, mostrar primeiros 5 planetas
      const firstFive = getFirstFivePlanets();
      setSearchResults(firstFive);
      setShowResults(false);
      setSelectedIndex(-1);
    }
  }, [searchValue]);

  // Fechar resultados ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setShowResults(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Navegação com teclado
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || searchResults.length === 0) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < searchResults.length - 1 ? prev + 1 : 0
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : searchResults.length - 1
        );
        break;
      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < searchResults.length) {
          const selectedPlanet = searchResults[selectedIndex].planet;
          GalaxyNavigator.navigateToPlanet(selectedPlanet);
          setSearchValue("");
          setShowResults(false);
        }
        break;
      case "Escape":
        setShowResults(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const clearSearch = () => {
    setSearchValue("");
    setShowResults(false);
    setSelectedIndex(-1);
    inputRef.current?.focus();
  };

  const handleInputFocus = () => {
    const planets = getAllPlanets();
    const firstFive = planets.slice(0, 5).map((planet) => ({
      planet,
      matchScore: 50, // Score neutro para planetas sem filtro
      matchType: "name" as const,
    }));
    setSearchResults(firstFive);
    setShowResults(true);
  };

  const handleResultClick = (planet: Planet) => {
    GalaxyNavigator.navigateToPlanet(planet);
    setSearchValue("");
    setShowResults(false);
    setSelectedIndex(-1);
  };

  const getMatchTypeIcon = (matchType: string) => {
    switch (matchType) {
      case "name":
        return <MapPin className="w-4 h-4" />;
      case "faction":
        return <Users className="w-4 h-4" />;
      case "type":
        return <Zap className="w-4 h-4" />;
      default:
        return <Search className="w-4 h-4" />;
    }
  };

  const getFactionBadgeVariant = (
    faction: string
  ):
    | "normal"
    | "imperium"
    | "necrons"
    | "caos"
    | "orks"
    | "xenos"
    | "tau"
    | "aeldari"
    | "dark_eldar" => {
    switch (faction) {
      case "Imperium":
        return "imperium";
      case "Necrons":
        return "necrons";
      case "Caos":
        return "caos";
      case "Orks":
        return "orks";
      case "Xenos":
        return "xenos";
      case "Tau":
        return "tau";
      case "Aeldari":
        return "aeldari";
      default:
        return "normal";
    }
  };

  return (
    <div className="text-lg" ref={searchRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400 w-4 h-4" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Pesquisar planetas..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={handleInputFocus}
          className="w-92 pl-10 pr-10 m-0 bg-black/50 border-amber-500/30 focus:border-amber-500 text-white placeholder:text-slate-400"
        />
        {searchValue && (
          <button
            onClick={clearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-amber-400 hover:text-amber-300 transition-colors duration-200"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Dropdown de resultados */}
        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-black/70 border border-amber-500/30 rounded-lg max-h-80 overflow-y-auto z-50">
            {searchResults.map((result, index) => (
              <div
                key={`${result.planet.data?.name}-${index}`}
                onClick={() => handleResultClick(result.planet)}
                className={`px-3 py-2 cursor-pointer border-b border-amber-500/30 last:border-b-0 hover:bg-amber-500/10 transition-colors ${
                  index === selectedIndex ? "bg-amber-500/20" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="text-amber-400">
                    {getMatchTypeIcon(result.matchType)}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-white font-medium truncate">
                      {result.planet.data?.name || "Planeta sem nome"}
                    </div>
                    <div className="text-slate-300 text-xs truncate flex items-center gap-2">
                      <Badge
                        variant={getFactionBadgeVariant(
                          result.planet.data?.faction
                        )}
                        className="px-1.5 py-0.5 text-[10px]"
                      >
                        {result.planet.data?.faction || "Não especificado"}
                      </Badge>
                      <Badge
                        variant="normal"
                        className="px-1.5 py-0.5 text-[10px]"
                      >
                        {result.planet.data?.planetType || "Não especificado"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Mensagem quando não há resultados */}
        {showResults && searchResults.length === 0 && searchValue.trim() && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800/20 border border-amber-500/30 rounded-md p-4 text-center text-slate-200 text-sm">
            Nenhum planeta encontrado para &quot;{searchValue}&quot;
          </div>
        )}
      </div>
    </div>
  );
}

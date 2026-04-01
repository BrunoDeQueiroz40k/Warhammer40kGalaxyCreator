import { useState, useEffect, useRef } from "react";

import { Search, X, MapPin, Users, Zap } from "lucide-react";

import { PlanetEntry, PlanetSummaryData } from "@/types/interfaces";
import { getFactionVariant } from "@/lib/formatters";

import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { GalaxyNavigator } from "@/lib/galaxyNavigator";
import { usePlanetSearch } from "@/hooks/usePlanetSearch";

export function SearchInput() {
  const [searchValue, setSearchValue] = useState("");
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const {
    results: searchResults,
    selectedIndex,
    setSelectedIndex,
    handleKeyDown: onArrowNav,
    handleSelect,
    refreshPlanets,
  } = usePlanetSearch(searchValue, { maxResults: 8, showAllWhenEmpty: false });

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

  useEffect(() => {
    if (searchValue.trim()) {
      setShowResults(true);
    } else {
      setShowResults(false);
    }
  }, [searchValue]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showResults || searchResults.length === 0) return;

    onArrowNav(e);

    switch (e.key) {
      case "Enter":
        e.preventDefault();
        const planet = handleSelect();
        if (planet) {
          GalaxyNavigator.navigateToPlanet(planet);
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
    refreshPlanets();
    setShowResults(true);
  };

  const handleResultClick = (planet: PlanetEntry<PlanetSummaryData>) => {
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

        {showResults && searchResults.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-black/70 border border-amber-500/30 rounded-lg max-h-80 overflow-y-auto z-50">
            {searchResults.map((result, index) => (
              <div
                key={`${result.planet.data?.name}-${index}`}
                onClick={() => handleResultClick(result.planet)}
                className={`px-3 py-2 cursor-pointer border-b border-amber-500/30 last:border-b-0 hover:bg-amber-500/10 transition-colors ${index === selectedIndex ? "bg-amber-500/20" : ""
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
                      {result.planet.data?.isHomePlanet && (
                        <Badge className="px-1.5 py-0.5 text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/50">
                          Capital
                        </Badge>
                      )}
                      <Badge
                        variant={getFactionVariant(
                          result.planet.data?.domain || result.planet.data?.faction || ""
                        )}
                        className="px-1.5 py-0.5 text-[10px]"
                      >
                        {result.planet.data?.domain ||
                          result.planet.data?.faction ||
                          "Nao especificado"}
                      </Badge>
                      {result.planet.data?.chapter && (
                        <Badge variant="imperium" className="px-1.5 py-0.5 text-[10px]">
                          {result.planet.data.chapter}
                        </Badge>
                      )}
                      <Badge
                        variant="normal"
                        className="px-1.5 py-0.5 text-[10px]"
                      >
                        {result.planet.data?.planetType || "Nao especificado"}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showResults && searchResults.length === 0 && searchValue.trim() && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800/20 border border-amber-500/30 rounded-md p-4 text-center text-slate-200 text-sm">
            Nenhum planeta encontrado para &quot;{searchValue}&quot;
          </div>
        )}
      </div>
    </div>
  );
}

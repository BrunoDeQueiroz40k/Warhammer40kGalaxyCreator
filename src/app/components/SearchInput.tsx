import { useState } from "react";
import { Input } from "./ui/input";
import { Search, X } from "lucide-react";

export function SearchInput() {
  const [searchValue, setSearchValue] = useState("");

  const clearSearch = () => {
    setSearchValue("");
  };

  return (
    <div className="fixed top-3.5 right-3.5 z-20 text-lg">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-400 w-4 h-4" />
        <Input
          type="text"
          placeholder="Pesquisar planetas..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-80 pl-10 pr-10 bg-black/50 border-amber-500/30 focus:border-amber-500 text-white placeholder:text-slate-400"
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
    </div>
  );
}

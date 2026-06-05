import React, { useState, useEffect, useRef } from "react";
import { Compass, MapPin, Loader2 } from "lucide-react";

interface NeighborhoodAutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  city?: string;
}

interface SuggestionItem {
  term: string;
  desc: string;
  fullName: string;
}

export default function NeighborhoodAutocompleteInput({
  value,
  onChange,
  placeholder = "Ex: Copacabana, Pinheiros, Brooklyn...",
  className = "",
  id,
  city = "",
}: NeighborhoodAutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Click outside to close suggestion dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Filter and search suggestions dynamically with debouncing
  useEffect(() => {
    const queryClean = value.trim();
    if (queryClean.length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const delayDebounceFn = setTimeout(async () => {
      try {
        let searchQuery = queryClean;
        // Make the search incredibly smart: if a city was provided, append it to restrict or boost local results
        if (city && city.trim()) {
          const onlyCityName = city.split(",")[0].trim();
          searchQuery = `${queryClean}, ${onlyCityName}`;
        }

        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&addressdetails=1&limit=8&accept-language=pt-BR,pt`;
        const res = await fetch(url, {
          headers: {
            "User-Agent": "PrecisoAppletNeighborhoodSearch/1.0"
          }
        });

        if (res.ok) {
          const data = await res.json();
          
          if (Array.isArray(data)) {
            const formatted: SuggestionItem[] = data.map((item: any) => {
              const addr = item.address || {};
              
              // Extract the most specific neighborhood key
              const neighborhoodName = 
                addr.neighbourhood || 
                addr.suburb || 
                addr.quarter || 
                addr.city_district || 
                addr.subdivision || 
                addr.village ||
                addr.residential ||
                addr.commercial ||
                item.name;

              // Build high-quality context details
              const cityOrTown = addr.city || addr.town || addr.municipality || addr.village;
              const state = addr.state || addr.region;
              const country = addr.country;

              let descParts: string[] = [];
              if (cityOrTown) descParts.push(cityOrTown);
              if (state) descParts.push(state);
              if (country && country !== "Brasil") descParts.push(country); // omit Brazil for clean localized display

              const desc = descParts.join(", ");
              const term = neighborhoodName || item.display_name.split(",")[0];

              return {
                term: term,
                desc: desc || country || "Localização encontrada",
                fullName: `${term} (${desc})`
              };
            });

            // Filter out exact duplicate fullNames
            const unique = formatted.filter((v, i, a) => 
              a.findIndex(t => t.term === v.term && t.desc === v.desc) === i
            );

            setSuggestions(unique);
          }
        }
      } catch (err) {
        console.error("Erro ao buscar localizações no OpenStreetMap:", err);
      } finally {
        setLoading(false);
      }
    }, 450); // 450ms debounce for natural feeling typing and API safety

    return () => clearTimeout(delayDebounceFn);
  }, [value, city]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setShowDropdown(true);
    setActiveIndex(-1);
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
  };

  const selectSuggestion = (selectedTerm: string) => {
    onChange(selectedTerm);
    setShowDropdown(false);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((prev) => (prev + 1 >= suggestions.length ? 0 : prev + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((prev) => (prev - 1 < 0 ? suggestions.length - 1 : prev - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        selectSuggestion(suggestions[activeIndex].term);
      } else if (suggestions.length > 0) {
        selectSuggestion(suggestions[0].term);
      }
    } else if (e.key === "Escape") {
      setShowDropdown(false);
      setActiveIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-faint pointer-events-none">
        {loading ? (
          <Loader2 size={16} className="animate-spin text-accent" />
        ) : (
          <Compass size={16} className="text-slate-400" />
        )}
      </span>
      <input
        ref={inputRef}
        id={id}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoComplete="new-password"
        className={`w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-white text-text text-sm placeholder:text-text-faint focus:outline-none focus:border-accent transition-colors ${className}`}
      />

      {showDropdown && (suggestions.length > 0 || loading || (value.trim().length > 0 && value.trim().length < 2)) && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden max-h-60 overflow-y-auto animate-fade-in divide-y divide-slate-100">
          {loading && suggestions.length === 0 ? (
            <div className="flex items-center gap-2 px-4 py-3 text-xs text-slate-500 bg-slate-50">
              <Loader2 size={14} className="animate-spin text-accent" />
              <span>Pesquisando bairro e região em tempo real...</span>
            </div>
          ) : value.trim().length > 0 && value.trim().length < 2 ? (
            <div className="px-4 py-3.5 text-xs text-slate-400 font-semibold bg-slate-50/50">
              Digite mais letras para buscar...
            </div>
          ) : suggestions.length === 0 ? (
            <div className="px-4 py-3.5 text-xs text-slate-400 font-semibold bg-slate-50/50">
              Nenhum bairro encontrado. Continue digitando...
            </div>
          ) : (
            <ul>
              {suggestions.map((item, idx) => (
                <li key={`${item.term}-${item.desc}-${idx}`}>
                  <button
                    type="button"
                    onClick={() => selectSuggestion(item.term)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`w-full text-left px-4 py-3 text-xs border-b border-slate-50 transition-colors flex items-center justify-between cursor-pointer ${
                      idx === activeIndex
                        ? "bg-accent/10 text-accent font-semibold"
                        : "hover:bg-slate-50 text-text"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <MapPin size={13} className={idx === activeIndex ? "text-accent shrink-0" : "text-slate-400 shrink-0"} />
                      <span className="font-extrabold text-slate-800 truncate">{item.term}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-bold truncate max-w-[180px] ml-2 text-right">
                      {item.desc}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

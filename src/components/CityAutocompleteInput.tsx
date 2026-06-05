import React, { useState, useEffect, useRef } from "react";
import { MapPin, Loader2 } from "lucide-react";

interface CityAutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  autoFocus?: boolean;
}

interface IBGECity {
  nome: string;
  microrregiao?: {
    mesorregiao?: {
      UF?: {
        sigla?: string;
      };
    };
  };
}

export default function CityAutocompleteInput({
  value,
  onChange,
  placeholder = "Ex: São Paulo, SP",
  className = "",
  id,
  autoFocus = false,
}: CityAutocompleteInputProps) {
  const [allCities, setAllCities] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load IBGE cities data
  const loadCities = async () => {
    if (allCities.length > 0 || loading) return;
    setLoading(true);
    try {
      const cached = sessionStorage.getItem("preciso_brazil_cities");
      if (cached) {
        setAllCities(JSON.parse(cached));
        setLoading(false);
        return;
      }

      const res = await fetch("https://servicodados.ibge.gov.br/api/v1/localidades/municipios?orderBy=nome");
      if (!res.ok) throw new Error("Erro ao buscar cidades do IBGE");
      
      const data: IBGECity[] = await res.json();
      const formatted = data
        .map((item) => {
          const uf = item.microrregiao?.mesorregiao?.UF?.sigla;
          return uf ? `${item.nome}, ${uf}` : item.nome;
        })
        .filter(Boolean);

      sessionStorage.setItem("preciso_brazil_cities", JSON.stringify(formatted));
      setAllCities(formatted);
    } catch (err) {
      console.error("Erro ao carregar cidades do IBGE:", err);
    } finally {
      setLoading(false);
    }
  };

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

  // Filter and sort suggestions whenever "value" or "allCities" changes
  useEffect(() => {
    const inputClean = value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    if (inputClean.length < 2 || allCities.length === 0) {
      setSuggestions([]);
      return;
    }

    const matched = allCities
      .map((city) => {
        const cityClean = city.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
        const index = cityClean.indexOf(inputClean);
        
        let score = -1;
        if (index === 0) {
          score = 0; // Starts with query
        } else if (index > 0) {
          // Starts with on a new word (e.g. searching "paulo" in "São Paulo" -> index after space/hyphen)
          if (cityClean[index - 1] === " " || cityClean[index - 1] === "-" || cityClean[index - 1] === "/") {
            score = 1;
          } else {
            score = 2; // Mid-word match
          }
        }

        return { city, score };
      })
      .filter((item) => item.score !== -1)
      .sort((a, b) => a.score - b.score)
      .map((item) => item.city)
      .slice(0, 8);

    setSuggestions(matched);
  }, [value, allCities]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onChange(val);
    setShowDropdown(true);
    setActiveIndex(-1);
    
    // Lazy-load cities when user starts typing
    if (allCities.length === 0) {
      loadCities();
    }
  };

  const handleInputFocus = () => {
    setShowDropdown(true);
    loadCities();
  };

  const selectSuggestion = (selectedCity: string) => {
    onChange(selectedCity);
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
        selectSuggestion(suggestions[activeIndex]);
      } else if (suggestions.length > 0) {
        selectSuggestion(suggestions[0]);
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
          <MapPin size={16} />
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
        placeholder={loading ? "Carregando cidades do Brasil..." : placeholder}
        autoComplete="new-password"
        autoFocus={autoFocus}
        className={`w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-surface-raised text-text text-sm placeholder:text-text-faint focus:outline-none focus:border-accent transition-colors ${className}`}
      />

      {showDropdown && (suggestions.length > 0 || (loading && value.length >= 2)) && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white border border-border rounded-xl shadow-lg z-50 overflow-hidden max-h-60 overflow-y-auto animate-fade-in">
          {loading && suggestions.length === 0 ? (
            <div className="flex items-center gap-2 px-4 py-3 text-xs text-text-muted">
              <Loader2 size={14} className="animate-spin text-accent" />
              <span>Buscando cidades no banco de dados...</span>
            </div>
          ) : (
            <ul>
              {suggestions.map((city, idx) => (
                <li key={city}>
                  <button
                    type="button"
                    onClick={() => selectSuggestion(city)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`w-full text-left px-4 py-3 text-xs text-text border-b border-slate-50 transition-colors flex items-center gap-2 cursor-pointer ${
                      idx === activeIndex
                        ? "bg-accent/10 text-accent font-semibold"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <MapPin size={12} className="text-text-faint shrink-0" />
                    <span>{city}</span>
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

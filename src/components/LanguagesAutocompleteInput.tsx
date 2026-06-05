import React, { useState, useEffect, useRef } from "react";
import { Globe, Check } from "lucide-react";

interface LanguagesAutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

const COMMON_LANGUAGES = [
  "Português",
  "Inglês",
  "Espanhol",
  "Libras (Sinais)",
  "Francês",
  "Italiano",
  "Alemão",
  "Japonês",
  "Mandarim"
];

export default function LanguagesAutocompleteInput({
  value,
  onChange,
  placeholder = "Ex: Português, Inglês, Espanhol",
  className = "",
  id,
}: LanguagesAutocompleteInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [filterQuery, setFilterQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Click outside closes the dropdown
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

  // Parse currently selected languages in a list of trimmed strings safely
  const getSelectedLanguages = (): string[] => {
    return value
      .split(",")
      .map((lang) => lang.trim())
      .filter((lang) => lang.length > 0);
  };

  // Toggle a language in the comma-separated string
  const toggleLanguage = (lang: string) => {
    const selected = getSelectedLanguages();
    const index = selected.indexOf(lang);
    
    let newSelected: string[];
    if (index > -1) {
      // Remove
      newSelected = selected.filter((item) => item !== lang);
    } else {
      // Add
      newSelected = [...selected, lang];
    }
    
    onChange(newSelected.join(", "));
    // Recenter filter query
    setFilterQuery("");
  };

  // Build filtered autocomplete list
  const filteredCommonLanguages = COMMON_LANGUAGES.filter((lang) => {
    const normalizedLang = lang.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
    const normalizedFilter = filterQuery.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();
    return normalizedLang.includes(normalizedFilter);
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
    setFilterQuery(e.target.value);
    setShowDropdown(true);
  };

  const currentSelectionList = getSelectedLanguages();

  return (
    <div ref={containerRef} className="relative w-full">
      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-faint pointer-events-none">
        <Globe size={16} className="text-slate-400" />
      </span>
      <input
        id={id}
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => {
          setShowDropdown(true);
          setFilterQuery(""); // clear sub-query when focused to show all languages
        }}
        placeholder={placeholder}
        autoComplete="new-password"
        className={`w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-white text-text text-sm placeholder:text-text-faint focus:outline-none focus:border-accent transition-colors ${className}`}
      />

      {showDropdown && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in divide-y divide-slate-100 p-4 space-y-3 max-h-80 overflow-y-auto">
          {/* Section title */}
          <div>
            <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569] mb-1.5 flex items-center gap-1">
              <Globe size={12} className="text-accent" />
              <span>Selecione seus idiomas falados</span>
            </h4>
            <p className="text-[10px] text-slate-400">
              Você pode clicar em vários idiomas para adicioná-los ou digitar um idioma personalizado.
            </p>
          </div>

          {/* Quick interactive grid */}
          <div className="pt-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {filteredCommonLanguages.map((lang) => {
                const isSelected = currentSelectionList.includes(lang);
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => toggleLanguage(lang)}
                    className={`px-3 py-2 rounded-lg text-xs font-semibold text-left border transition-all flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-accent/10 border-accent text-accent scale-[0.98]"
                        : "bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    <span className="truncate">{lang}</span>
                    {isSelected && <Check size={12} className="text-accent shrink-0 ml-1" />}
                  </button>
                );
              })}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}

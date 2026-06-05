import React, { useState, useEffect, useRef } from "react";
import { Clock, Check, Calendar } from "lucide-react";

interface AvailabilityAutocompleteInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  id?: string;
}

const PRESET_SCHEDULES = [
  { term: "Segunda a Sexta — Horário Comercial (08:00 às 18:00)", tag: "Comercial" },
  { term: "Qualquer dia e horário (Flexibilidade total)", tag: "Flexível" },
  { term: "Segunda a Sexta — Período da Noite (18:00 às 22:00)", tag: "Noturno" },
  { term: "Sábados, Domingos e Feriados", tag: "Fim de Semana" },
  { term: "Somente aos Sábados (08:00 às 17:00)", tag: "Sábados" },
  { term: "Período da Manhã (08:00 às 12:00)", tag: "Manhã" },
  { term: "Período da Tarde (13:00 às 18:00)", tag: "Tarde" },
  { term: "Apenas sob agendamento prévio (Alinhar no WhatsApp)", tag: "Agendamento" }
];

export default function AvailabilityAutocompleteInput({
  value,
  onChange,
  placeholder = "Ex: Segunda a Sexta das 08:00 às 18:00...",
  className = "",
  id,
}: AvailabilityAutocompleteInputProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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

  const selectPreset = (term: string) => {
    onChange(term);
    setShowDropdown(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-faint pointer-events-none">
        <Clock size={16} className="text-slate-400" />
      </span>
      <input
        id={id}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setShowDropdown(true)}
        placeholder={placeholder}
        autoComplete="new-password"
        className={`w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-white text-text text-sm placeholder:text-text-faint focus:outline-none focus:border-accent transition-colors ${className}`}
      />

      {showDropdown && (
        <div className="absolute left-0 right-0 mt-1.5 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden animate-fade-in p-3 max-h-80 overflow-y-auto">
          {/* Section header */}
          <div className="pb-2 mb-2 border-b border-slate-100">
            <h4 className="text-[11px] font-extrabold uppercase tracking-widest text-[#475569] mb-0.5 flex items-center gap-1">
              <Calendar size={12} className="text-accent" />
              <span>Opções de Horários Pré-definidos</span>
            </h4>
            <p className="text-[10px] text-slate-400">
              Clique em uma das opções prontas abaixo para preencher o seu horário instantaneamente.
            </p>
          </div>

          <div className="space-y-1">
            {PRESET_SCHEDULES.map((schedule) => {
              const isSelected = value === schedule.term;
              return (
                <button
                  key={schedule.term}
                  type="button"
                  onClick={() => selectPreset(schedule.term)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-xs transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                    isSelected
                      ? "bg-accent/10 text-accent font-extrabold"
                      : "hover:bg-slate-50 text-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-2 max-w-[85%] truncate">
                    <Clock size={12} className={isSelected ? "text-accent" : "text-slate-400"} />
                    <span className="truncate">{schedule.term}</span>
                  </div>
                  
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded ${
                      isSelected ? "bg-accent/20 text-accent" : "bg-slate-100 text-slate-500"
                    }`}>
                      {schedule.tag}
                    </span>
                    {isSelected && <Check size={12} className="text-accent" />}
                  </div>
                </button>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
}

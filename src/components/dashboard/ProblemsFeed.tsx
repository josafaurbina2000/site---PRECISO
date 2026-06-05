import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Search, MapPin, Briefcase, Filter, Loader2, Info } from "lucide-react";
import { motion } from "motion/react";

interface Problem {
  id: string;
  title: string;
  description: string;
  category: string;
  city: string;
  budget: string | null;
  status: string;
  created_at: string;
  interested_count: number;
}

export default function ProblemsFeed({ city }: { city: string }) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("Todas");
  
  const categories = ["Todas", "Manutenção", "Tecnologia", "Aulas", "Design", "Eventos", "Outros"];

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("problems")
        .select("*")
        .eq("status", "open")
        .order("created_at", { ascending: false });
        
      if (error) {
        // Ignora erros de tabela não existente caso o schema não esteja aplicado ainda
        if (error.code !== "PGRST205") {
          console.error(error);
        }
        setProblems([]);
      } else {
        setProblems(data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatBudgetDisplay = (budget: string | null) => {
    if (!budget) return "A combinar";
    if (budget.includes("R$")) return budget;
    
    // Convert to number if it's a raw numeric string like "150"
    const parsed = parseFloat(budget.replace(",", "."));
    if (!isNaN(parsed)) {
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(parsed);
    }
    return budget;
  };

  const filteredProblems = problems.filter(p => {
    const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "Todas" || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white border border-[#E5E7EB] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative flex-1 w-full">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text" 
            placeholder="Buscar problemas em aberto..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-all"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter size={16} className="text-slate-400 shrink-0" />
          <select 
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-700 outline-none w-full sm:w-48 appearance-none"
          >
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 size={32} className="animate-spin text-accent mb-4" />
          <p className="text-sm font-semibold">Buscando oportunidades...</p>
        </div>
      ) : filteredProblems.length === 0 ? (
        <div className="bg-white border text-center border-[#E5E7EB] rounded-2xl p-12 shadow-sm text-slate-500 flex flex-col items-center">
          <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mb-4">
            <Info size={24} className="text-slate-400" />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">Nenhum problema encontrado</h3>
          <p className="text-sm">Não há demandas ativas que correspondam aos seus filtros.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredProblems.map(problem => (
            <motion.div 
              key={problem.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-[#E5E7EB] hover:border-accent/40 rounded-2xl p-5 shadow-sm hover:shadow-lg transition-all duration-300 group flex flex-col"
            >
              <div className="flex justify-between items-start gap-4 mb-3">
                <h3 className="text-base font-bold text-slate-800 leading-tight group-hover:text-accent transition-colors line-clamp-2">
                  {problem.title}
                </h3>
                <span className="shrink-0 bg-emerald-50 text-emerald-700 font-extrabold text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border border-emerald-200">
                  Aberto
                </span>
              </div>
              
              <div className="flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-500 mb-4">
                <span className="flex items-center gap-1"><MapPin size={14} className="text-accent" /> {problem.city}</span>
                <span className="w-1 h-1 rounded-full bg-slate-300" />
                <span className="flex items-center gap-1"><Briefcase size={14} className="text-amber-500" /> {problem.category}</span>
              </div>
              
              <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-5 flex-1">
                {problem.description}
              </p>
              
              <div className="flex items-center justify-between pt-4 border-t border-[#E5E7EB] mt-auto">
                <div className="flex flex-col">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Orçamento</span>
                  <span className="text-sm font-black text-slate-800">{formatBudgetDisplay(problem.budget)}</span>
                </div>
                
                <a 
                  href={`#problema/${problem.id}`}
                  className="bg-accent text-white font-bold text-xs px-4 py-2 rounded-xl shadow-sm hover:bg-accent/90 transition-colors inline-block"
                >
                  Ver Detalhes
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

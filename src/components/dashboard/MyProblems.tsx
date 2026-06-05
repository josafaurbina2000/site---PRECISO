import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { Plus, Loader2, Info, Pencil, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "motion/react";

interface Problem {
  id: string;
  title: string;
  description: string;
  category: string;
  city: string;
  status: string;
  created_at: string;
  interested_count: number;
  proposals?: { id: string }[];
}

interface MyProblemsProps {
  onCreateClick: () => void;
  userId: string;
}

export default function MyProblems({ onCreateClick, userId }: MyProblemsProps) {
  const [problems, setProblems] = useState<Problem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyProblems();
  }, [userId]);

  const fetchMyProblems = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("problems")
        .select(`
          *,
          proposals (id)
        `)
        .eq("author_id", userId)
        .order("created_at", { ascending: false });
        
      if (error && error.code !== "PGRST205") {
        console.error(error);
      }
      setProblems(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusInfo = (status: string) => {
    switch(status) {
      case 'open': return { label: "Aberto", color: "text-emerald-700 bg-emerald-50 border-emerald-200" };
      case 'in_progress': return { label: "Em Andamento", color: "text-amber-700 bg-amber-50 border-amber-200" };
      case 'resolved': return { label: "Resolvido", color: "text-blue-700 bg-blue-50 border-blue-200" };
      case 'cancelled': return { label: "Cancelado", color: "text-slate-700 bg-slate-100 border-slate-300" };
      default: return { label: status, color: "text-slate-700 bg-slate-100 border-slate-300" };
    }
  };

  return (
    <div className="space-y-6">
      <div className="mb-2">
        <h2 className="text-xl font-extrabold text-slate-800">Meus Problemas</h2>
        <p className="text-sm font-medium text-slate-500 mt-1">Gerencie os problemas que você publicou.</p>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center text-slate-400">
          <Loader2 size={32} className="animate-spin text-accent mb-4" />
          <p className="text-sm font-semibold">Carregando seus problemas...</p>
        </div>
      ) : problems.length === 0 ? (
        <div className="bg-white border border-dashed border-[#CBD5E1] rounded-2xl p-12 text-center flex flex-col items-center justify-center group hover:bg-slate-50/50 transition-colors">
          <div className="w-16 h-16 bg-[#F1F5F9] text-slate-400 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 group-hover:text-accent group-hover:bg-accent/10 transition-all duration-300">
            <Info size={24} />
          </div>
          <h3 className="text-base font-bold text-slate-800 mb-1">Você não possui problemas publicados</h3>
          <p className="text-xs text-slate-500 mb-6 max-w-md">Ao publicar um problema, ajudantes na sua cidade poderão enviar propostas e orçamentos para resolvê-lo.</p>
          <button 
            onClick={onCreateClick}
            className="text-accent text-xs font-bold uppercase tracking-wider hover:underline"
          >
            Publicar primeiro problema
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {problems.map(problem => {
            const statusInfo = getStatusInfo(problem.status);
            return (
              <motion.div 
                key={problem.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-[#E5E7EB] hover:border-slate-300 rounded-2xl p-5 shadow-sm transition-all flex flex-col"
              >
                <div className="flex justify-between items-start gap-4 mb-3">
                  <h3 className="text-sm font-bold text-slate-800 leading-tight">
                    {problem.title}
                  </h3>
                  <span className={`shrink-0 font-extrabold text-[10px] uppercase tracking-wider px-2 py-1 rounded-full border ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                </div>
                
                <p className="text-xs text-slate-600 line-clamp-2 mb-4 flex-1">
                  {problem.description}
                </p>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500">
                     <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                     {problem.proposals ? problem.proposals.length : (problem.interested_count || 0)} propostas recebidas
                  </div>
                  
                  <a 
                    href={`#problema/${problem.id}`}
                    className="text-accent text-[11px] font-bold hover:underline"
                  >
                    Ver Propostas
                  </a>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

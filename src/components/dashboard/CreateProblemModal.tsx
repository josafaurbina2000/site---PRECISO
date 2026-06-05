import React, { useState } from "react";
import { supabase } from "../../lib/supabase";
import { X, Loader2, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import CityAutocompleteInput from "../CityAutocompleteInput";

interface CreateProblemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
  defaultCity: string;
}

export default function CreateProblemModal({ isOpen, onClose, onSuccess, userId, defaultCity }: CreateProblemModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Manutenção");
  const [city, setCity] = useState(defaultCity);
  const [budget, setBudget] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categories = ["Manutenção", "Tecnologia", "Aulas", "Design", "Eventos", "Outros"];

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    value = value.replace(/\D/g, "");
    
    if (value === "") {
      setBudget("");
      return;
    }
    
    const numericValue = parseInt(value, 10) / 100;
    const formattedValue = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(numericValue);
    
    setBudget(formattedValue);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !city.trim()) {
      setError("Título, descrição e cidade são obrigatórios.");
      return;
    }
    
    setSaving(true);
    setError(null);
    
    try {
      const { error: insertError } = await supabase.from("problems").insert({
        title: title.trim(),
        description: description.trim(),
        category,
        city: city.trim(),
        budget: budget.trim() || null,
        author_id: userId,
        status: "open",
        interested_count: 0
      });
      
      if (insertError) throw insertError;
      
      onSuccess();
      setTitle("");
      setDescription("");
      setBudget("");
      onClose();
    } catch (err: any) {
      setError(err.message || "Erro ao publicar o problema.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b border-border flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur z-10 rounded-t-3xl">
              <div>
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Sparkles size={18} className="text-accent" />
                  Publicar Problema
                </h2>
                <p className="text-xs text-text-muted mt-1">Descreva o que você precisa resolver.</p>
              </div>
              <button 
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
                disabled={saving}
              >
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {error && (
                <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-100 font-medium">
                  {error}
                </div>
              )}
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-slate-700 mb-1.5">Título do Problema</label>
                  <input
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Ex: Torneira vazando, Formatação de PC..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm px-4 py-3 rounded-xl transition-all"
                    maxLength={100}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-slate-700 mb-1.5">Categoria</label>
                    <select
                      value={category}
                      onChange={e => setCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm px-4 py-3 rounded-xl transition-all"
                    >
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-bold text-slate-700 mb-1.5">Orçamento Esperado</label>
                    <input
                      type="text"
                      value={budget}
                      onChange={handleBudgetChange}
                      placeholder="Ex: R$ 150,00 (Opcional)"
                      className="w-full bg-slate-50 border border-slate-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm px-4 py-3 rounded-xl transition-all"
                    />
                  </div>
                </div>
                
                <div className="relative">
                  <label className="block text-xs uppercase tracking-wider font-bold text-slate-700 mb-1.5">Cidade e UF</label>
                  <div className="[&>div]:w-full text-sm">
                    <CityAutocompleteInput
                      value={city}
                      onChange={setCity}
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-xs uppercase tracking-wider font-bold text-slate-700 mb-1.5">Descrição Detalhada</label>
                  <textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder="Explique com detalhes o que precisa ser feito..."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm px-4 py-3 rounded-xl transition-all h-32 resize-none"
                    required
                  />
                  <p className="text-[10px] text-slate-400 font-medium mt-1 text-right">{description.length}/1000</p>
                </div>
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                 <button
                   type="button"
                   onClick={onClose}
                   disabled={saving}
                   className="px-5 py-2.5 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                 >
                   Cancelar
                 </button>
                 <button
                   type="submit"
                   disabled={saving}
                   className="px-6 py-2.5 bg-accent hover:bg-accent/90 text-white text-sm font-bold rounded-xl transition-colors shadow-sm shadow-accent/20 flex items-center justify-center min-w-[120px]"
                 >
                   {saving ? <Loader2 size={18} className="animate-spin" /> : "Publicar"}
                 </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

import React from "react";
import { motion } from "motion/react";
import { Home, List, MessageSquare, Star, User, ChevronLeft, ChevronRight, LogOut, Clock } from "lucide-react";
import Logo from "../Logo";

interface SidebarProps {
  activeView: string;
  setActiveView: (view: string) => void;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  onLogout: () => void;
  role: "customer" | "solver";
  userName: string;
}

export default function Sidebar({
  activeView,
  setActiveView,
  isExpanded,
  setIsExpanded,
  onLogout,
  role,
  userName
}: SidebarProps) {
  
  const navItems = [
    { id: "overview", icon: Home, label: "Início" },
    { id: "problems", icon: List, label: "Problemas" },
    { id: "messages", icon: MessageSquare, label: "Mensagens" },
    { id: "reputation", icon: Star, label: "Reputação" },
    { id: "profile", icon: User, label: "Perfil" },
  ];

  return (
    <motion.aside
      className="fixed left-0 top-0 h-screen bg-white border-r border-[#E5E7EB] z-50 flex flex-col"
      initial={{ width: isExpanded ? 240 : 80 }}
      animate={{ width: isExpanded ? 240 : 80 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
    >
      <div className="flex h-16 items-center flex-shrink-0 px-4 border-b border-[#E5E7EB] justify-between">
        <div className="flex items-center">
          {isExpanded ? (
            <Logo />
          ) : (
            <div className="flex bg-accent text-white font-extrabold w-10 h-10 rounded-xl items-center justify-center shrink-0 shadow-lg text-lg ml-0.5">
              P
            </div>
          )}
        </div>
      </div>

      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="absolute -right-3.5 top-20 bg-white border border-[#E5E7EB] rounded-full p-1.5 text-slate-400 hover:text-accent hover:border-accent shadow-[0_2px_8px_rgba(0,0,0,0.05)] hover:shadow-md transition-all z-50 cursor-pointer"
      >
        {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
      </button>

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-6 px-3 flex flex-col gap-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all cursor-pointer relative group ${
              activeView === item.id 
                ? "bg-accent/[0.08] text-accent font-bold" 
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800 font-medium"
            }`}
          >
            {activeView === item.id && (
              <motion.div 
                layoutId="activeIndicator"
                className="absolute left-0 top-1/2 -mt-3 h-6 w-1 rounded-r-full bg-accent"
                initial={false}
              />
            )}
            <item.icon size={20} className={`shrink-0 ${activeView === item.id ? "text-accent" : "text-slate-400 group-hover:text-slate-600"}`} />
            
            {isExpanded && (
              <span className="truncate">{item.label}</span>
            )}
            
            {!isExpanded && (
               <div className="absolute left-full ml-4 bg-slate-800 text-white text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                 {item.label}
               </div>
            )}
          </button>
        ))}
      </div>

      <div className="p-4 border-t border-[#E5E7EB]">
         <div className={`flex items-center gap-3 ${isExpanded ? 'mb-4' : 'mb-0 justify-center'}`}>
            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
               <User size={18} className="text-slate-500" />
            </div>
            {isExpanded && (
              <div className="overflow-hidden">
                <p className="text-xs font-bold text-slate-800 truncate">{userName || "Usuário"}</p>
                <p className="text-[10px] font-semibold text-slate-500 uppercase">{role === "solver" ? "Quero Resolver" : "Preciso de Ajuda"}</p>
              </div>
            )}
         </div>
         {isExpanded && (
            <button
              onClick={onLogout}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs font-bold text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut size={16} /> Sair da conta
            </button>
         )}
      </div>
    </motion.aside>
  );
}

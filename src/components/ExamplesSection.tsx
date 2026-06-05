import { useState } from "react";
import { 
  ArrowUpRight, 
  Wrench, 
  Sparkles, 
  Laptop, 
  BookOpen, 
  Video, 
  Home, 
  Terminal 
} from "lucide-react";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

const iconMap: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  Wrench,
  Sparkles,
  Laptop,
  BookOpen,
  Video,
  Home,
  Terminal
};

const examples = [
  { 
    problem: "Preciso de um eletricista urgente", 
    category: "Serviços", 
    iconName: "Wrench",
    description: "Revisão completa de disjuntores e fiação elétrica residencial.",
    badgeColor: "text-orange-600 bg-orange-500/5 border-orange-500/15",
    status: "8 propostas"
  },
  { 
    problem: "Criar uma logo para minha empresa", 
    category: "Design", 
    iconName: "Sparkles",
    description: "Identidade visual minimalista e moderna projetada do zero.",
    badgeColor: "text-accent bg-accent/5 border-accent/15",
    status: "14 propostas"
  },
  { 
    problem: "Meu notebook parou de ligar", 
    category: "Suporte Técnico", 
    iconName: "Laptop",
    description: "Diagnóstico técnico de placa-mãe e recuperação segura de dados.",
    badgeColor: "text-orange-600 bg-orange-500/5 border-orange-500/15",
    status: "5 propostas"
  },
  { 
    problem: "Aulas de matemática preparatória", 
    category: "Educação", 
    iconName: "BookOpen",
    description: "Reforço focado em limites, derivadas e cálculo diferencial.",
    badgeColor: "text-accent bg-accent/5 border-accent/15",
    status: "3 propostas"
  },
  { 
    problem: "Editar vídeos para canal do YouTube", 
    category: "Vídeo", 
    iconName: "Video",
    description: "Edição com cortes dinâmicos, sonorização e legendagem profissional.",
    badgeColor: "text-orange-600 bg-orange-500/5 border-orange-500/15",
    status: "9 propostas"
  },
  { 
    problem: "Montar computador gamer do zero", 
    category: "Hardware", 
    iconName: "Laptop",
    description: "Montagem física, cabeamento limpo e testes térmicos minuciosos.",
    badgeColor: "text-orange-600 bg-orange-500/5 border-orange-500/15",
    status: "7 propostas"
  },
  { 
    problem: "Reformar meu quarto de estudos", 
    category: "Arquitetura & Design", 
    iconName: "Home",
    description: "Planejamento estrutural de iluminação e marcenaria inteligente.",
    badgeColor: "text-accent bg-accent/5 border-accent/15",
    status: "4 propostas"
  },
  { 
    problem: "Criar um site rápido institucional", 
    category: "Desenvolvimento", 
    iconName: "Terminal",
    description: "Website moderno em React de altíssima performance estrutural.",
    badgeColor: "text-accent bg-accent/5 border-accent/15",
    status: "11 propostas"
  }
];

export default function ExamplesSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation(0.3);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section id="exemplos" className="py-12 sm:py-16 relative overflow-hidden bg-white">
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      {/* Background glow refined */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-accent/3 blur-[140px] rounded-full pointer-events-none select-none" />

      <div className="relative max-w-7xl xl:max-w-[1360px] 2xl:max-w-[1540px] mx-auto px-6">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-20">
          <p className={`text-accent text-sm font-semibold tracking-wide uppercase mb-4 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            Exemplos
          </p>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text transition-all duration-700 delay-100 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            O que você pode resolver?
          </h2>
          <p className={`mt-4 text-base sm:text-lg text-text-muted max-w-2xl mx-auto transition-all duration-700 delay-200 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            De serviços domésticos emergenciais a complexos projetos digitais. Encontre o especialista perfeito.
          </p>
        </div>

        {/* Grid of Examples */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 lg:gap-6">
          {examples.map((item, index) => (
            <ExampleCard 
              key={index} 
              item={item} 
              index={index}
              isHovered={hoveredIndex === index}
              anyHovered={hoveredIndex !== null}
              onHover={() => setHoveredIndex(index)}
              onLeave={() => setHoveredIndex(null)}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function ExampleCard({ 
  item, 
  index, 
  isHovered, 
  anyHovered, 
  onHover, 
  onLeave 
}: { 
  item: typeof examples[0]; 
  index: number;
  isHovered: boolean;
  anyHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  const { ref, isVisible } = useScrollAnimation(0.1);
  const IconComponent = iconMap[item.iconName] || Terminal;

  return (
    <div
      ref={ref}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      className={`group relative cursor-pointer rounded-2xl border bg-white p-5 lg:p-6 transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] flex flex-col justify-between h-full min-h-[220px] ${
        isHovered 
          ? "border-accent/40 shadow-[0_16px_40px_rgba(16,185,129,0.08)] scale-[1.03] -translate-y-1.5 z-10" 
          : anyHovered 
            ? "border-slate-100 opacity-40 scale-[0.98]" 
            : "border-slate-100 hover:border-accent/20"
      } ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
      style={{ transitionDelay: isVisible ? `${index * 50}ms` : "0ms" }}
    >
      <div>
        {/* Badges/Tags Header Row */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className={`px-2.5 py-1 text-[10px] font-bold rounded-full border flex items-center gap-1.5 uppercase tracking-wider ${item.badgeColor}`}>
            <IconComponent size={12} className="stroke-[2.5]" />
            {item.category}
          </div>
          
          <div className="flex items-center gap-1.5 text-[10px] font-semibold text-text-muted">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent/60 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-accent"></span>
            </span>
            <span>Ativo</span>
          </div>
        </div>

        {/* Title */}
        <h3 className={`text-base font-bold text-text mb-2 tracking-tight transition-colors duration-300 ${isHovered ? "text-accent" : ""}`}>
          {item.problem}
        </h3>

        {/* Description description */}
        <p className="text-xs text-text-muted leading-relaxed mb-4">
          {item.description}
        </p>
      </div>

      {/* Footer Details showing propostas count */}
      <div className="pt-3 border-t border-slate-50 flex items-center justify-between">
        <span className="text-[11px] font-medium text-text-faint">
          {item.status}
        </span>
        
        {/* Fancy Arrow sliding on hover */}
        <div className={`transition-all duration-300 ${isHovered ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-1"}`}>
          <ArrowUpRight size={15} className="text-accent stroke-[2.5]" />
        </div>
      </div>
    </div>
  );
}

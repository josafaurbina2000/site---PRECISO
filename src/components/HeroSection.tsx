import { ArrowRight } from "lucide-react";
import { useTypingAnimation } from "../hooks/useTypingAnimation";

const problems = [
  "um eletricista",
  "alguém para criar uma logo",
  "editar vídeos",
  "montar meu computador",
  "aulas de inglês",
  "reformar meu quarto",
];

export default function HeroSection() {
  const { currentText } = useTypingAnimation(problems, 60, 30, 2500);

  return (
    <section className="relative min-h-[90vh] md:min-h-screen flex items-center justify-center bg-white pt-28 pb-16 overflow-hidden">
      {/* Elementos sutis de fundo */}
      <div className="absolute inset-0 grid-bg opacity-30" />
      
      {/* Container principal */}
      <div className="relative z-10 w-full max-w-7xl xl:max-w-[1360px] 2xl:max-w-[1540px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Container proporção 16:9 que engloba a imagem e o texto */}
        <div className="relative w-full aspect-[4/3] md:aspect-[16/9] rounded-[2.5rem] bg-white border border-slate-100 overflow-hidden shadow-[0_24px_50px_rgba(0,0,0,0.05)] flex items-center">
          
          {/* Ilustração/Render do lado direito com transições e efeitos */}
          <div className="absolute inset-0 w-full h-full select-none pointer-events-none">
            <img 
              src="https://i.ibb.co/RGMwjfR4/Chat-GPT-Image-2-de-jun-de-2026-23-56-04.png"
              alt="Preciso Soluções"
              className="w-full h-full object-cover object-center md:object-right opacity-95 transition-all duration-700 hover:scale-[1.01]"
              referrerPolicy="no-referrer"
            />
            {/* Fade gradiente elegante na esquerda para desktop - garante contraste impecável com o texto */}
            <div className="absolute inset-y-0 left-0 w-full md:w-[60%] lg:w-[50%] bg-gradient-to-r from-white via-white/95 to-white/0 md:block hidden" />
            {/* Overlay opaco para mobile garantindo total legibilidade */}
            <div className="absolute inset-0 bg-white/92 md:hidden" />
          </div>

          {/* Conteúdo de Texto e Ações sobreposto na Esquerda */}
          <div className="relative z-20 w-full md:w-[55%] lg:w-[48%] h-full flex flex-col justify-center p-6 sm:p-12 lg:p-16 xl:p-20 text-left space-y-6 md:space-y-8">
            
            {/* Pill de Boas-Vindas */}
            <div 
              className="inline-flex items-center gap-2.5 self-start rounded-full bg-slate-100 border border-slate-200/50 px-4 py-1.5 text-[11px] font-extrabold text-slate-800 uppercase tracking-widest opacity-0 animate-fade-up"
              style={{ animationDelay: "0.1s" }}
            >
              <span className="relative flex h-2 w-2">
                <span className="absolute inset-0 rounded-full bg-[#12B76A] animate-pulse-ring" />
                <span className="relative h-2 w-2 rounded-full bg-[#12B76A]" />
              </span>
              Resolução imediata de problemas
            </div>

            {/* Manchete Principal (Conforme solicitado) */}
            <div className="space-y-4">
              <h1 
                className="text-4xl sm:text-5xl lg:text-5.5xl xl:text-6xl font-black text-[#111827] tracking-tight leading-[1.1] opacity-0 animate-fade-up"
                style={{ animationDelay: "0.25s" }}
              >
                O que você <br className="hidden sm:inline" />
                <span className="text-[#12B76A] relative inline-block">
                  precisa
                  <span className="absolute bottom-1 left-0 right-0 h-1 bg-[#12B76A]/20 rounded-full animate-underline-grow" style={{ animationDelay: "0.65s" }} />
                </span>{" "}
                resolver hoje?
              </h1>
              
              <p 
                className="text-sm sm:text-base md:text-lg text-[#ff8800] font-black leading-relaxed opacity-0 animate-fade-up"
                style={{ animationDelay: "0.4s" }}
              >
                Publique seu problema e encontre a solução.
              </p>
            </div>

            {/* Bloco de Digitação Animado (mantido e redesenhado) */}
            <div 
              className="opacity-0 animate-fade-up max-w-sm"
              style={{ animationDelay: "0.55s" }}
            >
              <div className="inline-flex items-center gap-2.5 rounded-xl border border-slate-100 bg-white/90 shadow-sm px-4 py-2.5">
                <span className="text-slate-400 text-[10px] font-black uppercase tracking-wider">Preciso de</span>
                <span className="text-[#12B76A] font-black text-xs min-w-[150px]">
                  {currentText}
                  <span className="inline-block w-[2px] h-3.5 bg-[#12B76A] ml-0.5 animate-pulse align-middle" />
                </span>
              </div>
            </div>

            {/* Botões de Ação (Conforme solicitado) */}
            <div 
              className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 pt-2 opacity-0 animate-fade-up"
              style={{ animationDelay: "0.7s" }}
            >
              {/* Botão: Publicar meu problema */}
              <a
                href="#cadastro"
                className="group relative flex items-center justify-center gap-2 rounded-2xl bg-[#12B76A] hover:bg-[#12B76A]/90 px-8 py-3.5 text-xs font-extrabold text-white transition-all duration-300 hover:scale-[1.02] hover:shadow-[0_12px_24px_rgba(18,183,106,0.22)] active:scale-[0.98] overflow-hidden text-center cursor-pointer"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Publicar meu problema
                  <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
              </a>

              {/* Botão: Como funciona */}
              <a
                href="#como-funciona"
                className="group flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white/95 hover:bg-slate-50 px-8 py-3.5 text-xs font-extrabold text-[#374151] transition-all duration-300 hover:border-slate-300 hover:text-slate-900 text-center cursor-pointer"
              >
                Como funciona
              </a>
            </div>

          </div>

        </div>

        {/* Seção Restaurada de Tipos de Problemas (Carrossel Infinito / Marquee) */}
        <div className="mt-16 sm:mt-20 md:mt-24 space-y-6 w-full animate-fade-in" style={{ animationDelay: "0.85s" }}>
          
          {/* Título de seção sutil */}
          <div className="text-center">
            <h3 className="text-[10px] md:text-xs font-black uppercase tracking-[0.25em] text-[#9CA3AF] select-none">
              Tipos de Problemas
            </h3>
          </div>

          {/* Container do Carousel Marquee com fade nas bordas para efeito infinito */}
          <div className="relative w-full overflow-hidden py-4 select-none mask-fade-x">
            {/* Gradientes elegantes nas extremidades para suavizar a transição lateral das pílulas */}
            <div className="absolute left-0 top-0 bottom-0 w-20 md:w-36 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 md:w-36 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />

            {/* Marquee Row */}
            <div className="flex w-max items-center gap-4 animate-marquee whitespace-nowrap">
              {/* Primeiro Grupo de Categorias */}
              <div className="flex items-center gap-4">
                {[
                  "Tecnologia",
                  "Serviços",
                  "Educação",
                  "Reformas",
                  "Vídeo",
                  "Desenvolvimento",
                  "Consultoria",
                  "Design",
                ].map((category, idx) => (
                  <span
                    key={`cat-1-${idx}`}
                    className="inline-block px-5 py-2.5 rounded-full bg-white border border-[#E5E7EB] hover:border-slate-300 hover:bg-slate-50/50 text-[#4B5563] text-xs font-bold transition-all duration-300 hover:scale-[1.03] cursor-default shadow-sm"
                  >
                    {category}
                  </span>
                ))}
              </div>
              
              {/* Duplicação do Grupo para garantir efeito perfeitamente infinito */}
              <div className="flex items-center gap-4">
                {[
                  "Tecnologia",
                  "Serviços",
                  "Educação",
                  "Reformas",
                  "Vídeo",
                  "Desenvolvimento",
                  "Consultoria",
                  "Design",
                ].map((category, idx) => (
                  <span
                    key={`cat-2-${idx}`}
                    className="inline-block px-5 py-2.5 rounded-full bg-white border border-[#E5E7EB] hover:border-slate-300 hover:bg-slate-50/50 text-[#4B5563] text-xs font-bold transition-all duration-300 hover:scale-[1.03] cursor-default shadow-sm"
                  >
                    {category}
                  </span>
                ))}
              </div>

              {/* Triplicação para segurança em telas ultra-wide */}
              <div className="flex items-center gap-4">
                {[
                  "Tecnologia",
                  "Serviços",
                  "Educação",
                  "Reformas",
                  "Vídeo",
                  "Desenvolvimento",
                  "Consultoria",
                  "Design",
                ].map((category, idx) => (
                  <span
                    key={`cat-3-${idx}`}
                    className="inline-block px-5 py-2.5 rounded-full bg-white border border-[#E5E7EB] hover:border-slate-300 hover:bg-slate-50/50 text-[#4B5563] text-xs font-bold transition-all duration-300 hover:scale-[1.03] cursor-default shadow-sm"
                  >
                    {category}
                  </span>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

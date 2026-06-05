import { 
  ArrowRight, 
  CheckCircle2, 
  ShieldCheck 
} from "lucide-react";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

export default function CTASection() {
  const { ref, isVisible } = useScrollAnimation(0.2);

  return (
    <section id="comecar" className="py-12 sm:py-16 relative overflow-hidden bg-white">
      {/* Solid horizontal border dividers */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent pointer-events-none" />

      <div className="relative max-w-7xl xl:max-w-[1360px] 2xl:max-w-[1540px] mx-auto px-6">
        
        {/* Container proporção similar ao do FAQ englobando imagem de fundo e as informações sobrepostas ao centro */}
        <div className="relative w-full min-h-[580px] md:min-h-0 md:aspect-[16/8.5] rounded-[2.5rem] bg-white border border-slate-100 overflow-hidden shadow-[0_24px_50px_rgba(0,0,0,0.04)] flex items-center justify-center">
          
          {/* Ilustração de Fundo Inteira (Elementos nas pontas, espaço em branco ao centro) */}
          <div className="absolute inset-0 w-full h-full select-none pointer-events-none">
            <img 
              src="https://i.ibb.co/WvVGVKFF/RECRIE-ESTA-IMAGEM-NA-PROPOR-AO-202606030108.jpg"
              alt="Plano de fundo descritivo com clientes e resolvedores"
              className="w-full h-full object-cover object-center opacity-95 transition-all duration-700 hover:scale-[1.01]"
              referrerPolicy="no-referrer"
            />
            {/* Soft vertical fade gradient in the middle to enhance contrast and readability */}
            <div className="absolute inset-y-0 left-1/4 right-1/4 bg-white/75 blur-md md:block hidden" />
            {/* Monochromatic overlay behind absolute middle content area */}
            <div className="absolute inset-0 bg-white/94 md:bg-white/10" />
          </div>

          {/* MAIN HERO CTA CONTENT BOX (Overlaid beautifully in the center whitespace) */}
          <div ref={ref} className="relative z-10 max-w-xl mx-auto text-center flex flex-col items-center px-4 py-12 sm:py-16">
            
            {/* Top trust visual badge */}
            <div className={`mb-6 inline-flex items-center gap-2 rounded-full border border-slate-100 bg-white/90 backdrop-blur-md px-3.5 py-1.5 transition-all duration-700 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <ShieldCheck size={14} className="text-accent" />
              <span className="text-[10px] font-bold text-text-muted uppercase tracking-wider">Conexão 100% Segura & Verificada</span>
            </div>

            <p className={`text-accent text-[11px] sm:text-xs font-black tracking-widest uppercase mb-3 transition-all duration-700 delay-75 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              Comece agora
            </p>

            <h2 className={`text-3xl sm:text-4xl md:text-[2.6rem] font-black tracking-tight text-text leading-[1.15] mb-5 transition-all duration-700 delay-150 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              Pronto para <span className="text-accent relative inline-block">resolver<span className="absolute bottom-1 right-0 w-full h-[6px] bg-accent/15 -z-10 rounded-full" /></span>?
            </h2>

            <p className={`text-xs sm:text-sm md:text-base text-text-muted max-w-md mx-auto leading-relaxed transition-all duration-700 delay-200 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              Publique seu problema de forma gratuita e encontre um resolvedor qualificado perto de você de maneira simples e descomplicada.
            </p>
            
            {/* Call to action button with preserved beloved animation style */}
            <div className={`mt-8 transition-all duration-700 delay-300 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <a
                href="#"
                className="group relative inline-flex items-center gap-2 rounded-full bg-accent px-8 py-4 text-sm sm:text-base font-bold text-white transition-all duration-300 hover:bg-accent-hover hover:scale-[1.03] hover:shadow-[0_12px_40px_rgba(16,185,129,0.25)] active:scale-[0.98] overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Começar agora — é grátis
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-1" />
                </span>
                <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              </a>
            </div>

            {/* Dynamic bullet list highlighting real platform value props below */}
            <div className={`mt-7 flex flex-wrap justify-center items-center gap-y-2 gap-x-4 text-[10px] font-bold text-text-faint transition-all duration-700 delay-[400ms] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={12} className="text-accent" /> Sem cartão de crédito
              </span>
              <span className="text-slate-200">•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={12} className="text-orange-500" /> Sem compromisso
              </span>
              <span className="text-slate-200">•</span>
              <span className="flex items-center gap-1">
                <CheckCircle2 size={12} className="text-accent" /> Publique ilimitado
              </span>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}

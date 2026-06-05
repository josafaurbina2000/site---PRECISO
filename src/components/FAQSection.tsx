import { useState } from "react";
import { Plus } from "lucide-react";
import { useScrollAnimation } from "../hooks/useScrollAnimation";

const faqs = [
  {
    question: "O que é o Preciso?",
    answer: "O Preciso é uma plataforma que conecta pessoas que possuem necessidades com pessoas capazes de resolvê-las. Não somos um catálogo de profissionais — somos um sistema de resolução de problemas.",
  },
  {
    question: "Como funciona a publicação de problemas?",
    answer: "Você descreve o que precisa resolver, adiciona contexto relevante e publica. Pessoas com experiência no assunto demonstram interesse, e você escolhe com quem conversar e negociar.",
  },
  {
    question: "É gratuito para publicar?",
    answer: "Sim. Publicar problemas é gratuito. A plataforma foi pensada para ser acessível a todos que precisam de ajuda.",
  },
  {
    question: "Como sei se posso confiar em alguém?",
    answer: "Cada pessoa possui um perfil com histórico de soluções, avaliações de outros usuários e um índice de confiança baseado em entregas reais.",
  },
  {
    question: "Posso usar o Preciso para oferecer serviços?",
    answer: "Sim. Se você sabe resolver problemas, pode demonstrar interesse em publicações e construir sua reputação ajudando outras pessoas.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation(0.3);

  return (
    <section id="faq" className="py-12 sm:py-16 relative overflow-hidden bg-white">
      {/* Divider */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-slate-100 to-transparent" />

      <div className="max-w-7xl xl:max-w-[1360px] 2xl:max-w-[1540px] mx-auto px-6">
        
        {/* Container proporção 16:9 englobando imagem de fundo e as perguntas sobrepostas */}
        <div className="relative w-full min-h-[660px] md:min-h-0 md:aspect-[16/9] rounded-[2.5rem] bg-white border border-slate-100 overflow-hidden shadow-[0_24px_50px_rgba(0,0,0,0.05)] flex items-center justify-start">
          
          {/* Ilustração de Fundo (Elementos na direita, espaço limpo na esquerda) */}
          <div className="absolute inset-0 w-full h-full select-none pointer-events-none">
            <img 
              src="https://i.ibb.co/bg6b3Cg2/Chat-GPT-Image-3-de-jun-de-2026-00-05-05.png"
              alt="Perguntas frequentes"
              className="w-full h-full object-cover object-right opacity-95 transition-all duration-700 hover:scale-[1.01]"
              referrerPolicy="no-referrer"
            />
            {/* Fade gradiente elegante na esquerda para desktop - garante contraste impecável com as perguntas */}
            <div className="absolute inset-y-0 left-0 w-full md:w-[60%] lg:w-[50%] bg-gradient-to-r from-white via-white/95 to-white/0 md:block hidden" />
            {/* Overlay opaco para mobile garantindo total legibilidade */}
            <div className="absolute inset-0 bg-white/92 md:hidden" />
          </div>

          {/* Conteúdo de Perguntas (FAQ) sobreposto na Esquerda */}
          <div className="relative z-20 w-full md:w-[54%] lg:w-[48%] xl:w-[42%] h-full flex flex-col justify-center p-6 sm:p-10 lg:p-12 xl:p-14 text-left">
            {/* Header */}
            <div ref={headerRef} className="text-left mb-8">
              <p className={`text-accent text-sm font-semibold tracking-wide uppercase mb-3 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                FAQ
              </p>
              <h2 className={`text-2xl sm:text-3xl lg:text-4.5xl font-black tracking-tight text-text transition-all duration-700 delay-100 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                Perguntas frequentes
              </h2>
              <p className={`mt-3 text-xs sm:text-sm text-text-muted leading-relaxed transition-all duration-700 delay-200 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
                Tudo o que você precisa saber para começar a usar a plataforma e resolver os seus problemas.
              </p>
            </div>

            {/* Questions Container */}
            <div className="space-y-2.5 sm:space-y-3 w-full">
              {faqs.map((faq, index) => (
                <FAQItem 
                  key={index} 
                  faq={faq} 
                  index={index}
                  isOpen={openIndex === index}
                  toggle={() => setOpenIndex(openIndex === index ? null : index)}
                />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function FAQItem({ faq, index, isOpen, toggle }: { 
  faq: typeof faqs[0]; 
  index: number; 
  isOpen: boolean; 
  toggle: () => void;
}) {
  const { ref, isVisible } = useScrollAnimation(0.1);

  return (
    <div
      ref={ref}
      className={`rounded-xl border transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isOpen 
          ? "border-accent/25 bg-accent/2 shadow-[0_8px_20px_rgba(16,185,129,0.04)]" 
          : "border-slate-100 bg-white hover:border-slate-200"
      } ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
      }`}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      <button
        onClick={toggle}
        className="w-full flex items-center justify-between text-left p-4 sm:p-5 group"
      >
        <span className={`text-sm sm:text-base font-bold pr-4 transition-colors duration-300 ${isOpen ? "text-accent" : "text-text group-hover:text-text-secondary"}`}>
          {faq.question}
        </span>
        <div className={`shrink-0 h-7 w-7 rounded-full border flex items-center justify-center transition-all duration-500 ${
          isOpen 
            ? "bg-accent border-accent rotate-45" 
            : "bg-transparent border-slate-200 group-hover:border-accent/30"
        }`}>
          <Plus size={14} className={`transition-colors duration-300 ${isOpen ? "text-white" : "text-text-muted"}`} />
        </div>
      </button>
      
      <div className={`grid transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
        isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
      }`}>
        <div className="overflow-hidden">
          <p className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-text-muted leading-relaxed">
            {faq.answer}
          </p>
        </div>
      </div>
    </div>
  );
}

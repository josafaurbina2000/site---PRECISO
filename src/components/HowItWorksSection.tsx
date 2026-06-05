import { useScrollAnimation } from "../hooks/useScrollAnimation";

const steps = [
  {
    number: "01",
    title: "Descreva o problema",
    description: "Conte o que você precisa resolver. Seja específico — quanto mais contexto, melhores as respostas.",
  },
  {
    number: "02",
    title: "Receba interessados",
    description: "Pessoas com experiência no assunto demonstram interesse em ajudar. Você analisa os perfis.",
  },
  {
    number: "03",
    title: "Converse e negocie",
    description: "Tire dúvidas, alinhe expectativas e escolha a pessoa certa para resolver seu problema.",
  },
  {
    number: "04",
    title: "Resolva e avalie",
    description: "Finalize a solução e compartilhe sua experiência. Sua avaliação ajuda outras pessoas.",
  },
];

export default function HowItWorksSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation(0.3);

  return (
    <section id="como-funciona" className="py-12 sm:py-16 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />

      <div className="max-w-7xl xl:max-w-[1360px] 2xl:max-w-[1540px] mx-auto px-6">
        {/* Header */}
        <div ref={headerRef} className="text-center mb-16">
          <p className={`text-accent text-sm font-semibold tracking-wide uppercase mb-4 transition-all duration-700 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            Processo
          </p>
          <h2 className={`text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-text transition-all duration-700 delay-100 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            Como funciona
          </h2>
          <p className={`mt-4 text-lg text-text-muted max-w-xl mx-auto transition-all duration-700 delay-200 ${headerVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}>
            Do problema à solução em quatro passos.
          </p>
        </div>

        {/* 16:9 Aspect container with illustration background and overlaid steps */}
        <div className="relative w-full min-h-[660px] md:min-h-0 md:aspect-[16/9] rounded-[2.5rem] bg-white border border-slate-100 overflow-hidden shadow-[0_24px_50px_rgba(0,0,0,0.05)] flex items-center justify-end">
          
          {/* Background Illustration */}
          <div className="absolute inset-0 w-full h-full select-none pointer-events-none">
            <img 
              src="https://i.ibb.co/npC31Jf/Chat-GPT-Image-3-de-jun-de-2026-00-02-06.png"
              alt="Como funciona"
              className="w-full h-full object-cover object-left opacity-95 transition-all duration-700 hover:scale-[1.01]"
              referrerPolicy="no-referrer"
            />
            {/* Fade gradiente elegante na direita para desktop - garante contraste impecável com o texto */}
            <div className="absolute inset-y-0 right-0 w-full md:w-[60%] lg:w-[55%] bg-gradient-to-l from-white via-white/95 to-white/0 md:block hidden" />
            {/* Overlay opaco para mobile garantindo total legibilidade */}
            <div className="absolute inset-0 bg-white/92 md:hidden" />
          </div>

          {/* Steps Content Overlay on the Right side (perfectly matching spacing on diagram) */}
          <div className="relative z-20 w-full md:w-[44%] lg:w-[38%] xl:w-[33%] h-full flex flex-col justify-center p-6 sm:p-8 lg:p-10 md:mr-6 lg:mr-10 xl:mr-14 text-left">
            <div className="flex flex-col gap-3 lg:gap-3.5 w-full">
              {steps.map((step, index) => (
                <StepCard key={step.number} step={step} index={index} />
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
  const { ref, isVisible } = useScrollAnimation(0.2);

  return (
    <div
      ref={ref}
      className={`group relative rounded-2xl border border-slate-100 bg-white/90 backdrop-blur-sm p-3.5 sm:p-4 lg:p-4.5 xl:p-5 transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.05)] hover:border-accent/35 hover:bg-white ${
        isVisible 
          ? "opacity-100 translate-x-0" 
          : "opacity-0 translate-x-6"
      }`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      {/* Number — scales on hover */}
      <span className="text-5xl sm:text-6xl font-black text-accent/8 absolute top-3 right-5 select-none transition-all duration-500 group-hover:text-accent/15 group-hover:scale-[1.08]">
        {step.number}
      </span>

      {/* Progress dot */}
      <div className="flex items-center gap-2.5 mb-4">
        <div className="relative">
          <div className="h-2 w-2 rounded-full bg-accent transition-transform duration-300 group-hover:scale-125" />
          <div className="absolute inset-0 h-2 w-2 rounded-full bg-accent/40 animate-ping" style={{ animationDuration: "2s" }} />
        </div>
        <span className="text-[10px] font-black text-accent uppercase tracking-wider">Passo {step.number}</span>
      </div>
      
      {/* Content */}
      <div className="relative">
        <h3 className="text-base sm:text-lg font-bold text-text mb-2 transition-colors duration-300 group-hover:text-accent">
          {step.title}
        </h3>
        <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
          {step.description}
        </p>
      </div>

      {/* Bottom accent line — grows on hover */}
      <div className="absolute bottom-0 left-6 right-6 h-[2px] bg-accent/0 transition-all duration-500 group-hover:bg-accent/30 rounded-full scale-x-0 group-hover:scale-x-100" />
    </div>
  );
}

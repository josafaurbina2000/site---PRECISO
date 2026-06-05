import { useState, useEffect, useRef, useCallback } from "react";
import { ArrowRight, LayoutDashboard, LogOut } from "lucide-react";
import Logo from "./Logo";
import { supabase } from "../lib/supabase";

/**
 * Header — Minimal floating pill, dark theme.
 */

const navLinks = [
  { label: "Como funciona", href: "#como-funciona" },
  { label: "Exemplos", href: "#exemplos" },
  { label: "Perguntas", href: "#faq" },
];

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isScrolled, setIsScrolled] = useState(false);
  const [session, setSession] = useState<any>(null);
  const lastScrollY = useRef(0);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: activeSession } }) => {
      setSession(activeSession);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, activeSession) => {
      setSession(activeSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleScroll = useCallback(() => {
    const currentY = window.scrollY;
    setIsScrolled(currentY > 20);
    
    if (currentY <= 20) {
      setIsVisible(true);
    } else if (currentY > lastScrollY.current + 5) {
      setIsVisible(false);
      setIsMenuOpen(false);
    } else if (currentY < lastScrollY.current - 5) {
      setIsVisible(true);
    }
    lastScrollY.current = currentY;
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMenuOpen]);

  return (
    <>
      <div
        className={`fixed inset-x-0 top-0 z-50 flex justify-center transition-all duration-500 ease-out ${
          isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
        }`}
      >
        <header
          className={`mt-4 mx-4 flex h-14 w-full items-center justify-between gap-4 rounded-full border px-2 pl-5 transition-all duration-500 ease-out ${
            isScrolled
              ? "max-w-4xl lg:max-w-[900px] border-border bg-white/80 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)] scale-[0.98]"
              : "max-w-7xl xl:max-w-[1360px] 2xl:max-w-[1540px] border-transparent bg-transparent scale-100"
          }`}
        >
          <a href="#" className="shrink-0">
            <Logo />
          </a>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="group relative px-4 py-2 text-[13px] font-medium text-text-secondary hover:text-accent transition-colors"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] w-0 bg-accent rounded-full transition-all duration-300 group-hover:w-2/3" />
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {session ? (
              <>
                <a
                  href="#dashboard"
                  className="group flex items-center gap-1.5 rounded-full border border-border bg-white px-3.5 py-1.5 text-[12px] font-semibold text-text-secondary hover:text-accent hover:border-accent/30 transition-all"
                >
                  <LayoutDashboard size={13} />
                  Painel
                </a>
                <button
                  onClick={async () => {
                    await supabase.auth.signOut();
                    window.location.hash = "#";
                  }}
                  className="text-[12px] font-medium text-text-muted hover:text-red-500 px-2 py-1.5 transition-colors cursor-pointer"
                >
                  Sair
                </button>
              </>
            ) : (
              <>
                <a
                  href="#login"
                  className="text-[13px] font-medium text-text-secondary hover:text-accent px-3 py-1.5 transition-colors"
                >
                  Entrar
                </a>
                <a
                  href="#cadastro"
                  className="group flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-[13px] font-semibold text-white transition-all hover:bg-accent-hover"
                >
                  Começar
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </a>
              </>
            )}

            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-raised transition-colors"
              aria-label="Menu"
            >
              <div className="flex flex-col gap-1">
                <span className={`h-0.5 w-4 bg-text transition-all ${isMenuOpen ? "rotate-45 translate-y-1.5" : ""}`} />
                <span className={`h-0.5 w-4 bg-text transition-all ${isMenuOpen ? "opacity-0" : ""}`} />
                <span className={`h-0.5 w-4 bg-text transition-all ${isMenuOpen ? "-rotate-45 -translate-y-1.5" : ""}`} />
              </div>
            </button>
          </div>
        </header>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-40 bg-bg/95 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col items-center justify-center h-full gap-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className="text-2xl font-medium text-text-secondary hover:text-text transition-colors"
              >
                {link.label}
              </a>
            ))}
            {session ? (
              <>
                <a
                  href="#dashboard"
                  onClick={() => setIsMenuOpen(false)}
                  className="mt-4 flex items-center gap-2 rounded-full bg-accent px-8 py-3 text-base font-semibold text-white"
                >
                  Acessar Painel
                  <LayoutDashboard size={18} />
                </a>
                <button
                  onClick={async () => {
                    setIsMenuOpen(false);
                    await supabase.auth.signOut();
                    window.location.hash = "#";
                  }}
                  className="text-base font-medium text-text-muted hover:text-red-500 cursor-pointer"
                >
                  Sair da Conta
                </button>
              </>
            ) : (
              <>
                <a
                  href="#login"
                  onClick={() => setIsMenuOpen(false)}
                  className="text-xl font-medium text-text-secondary hover:text-accent"
                >
                  Fazer Login
                </a>
                <a
                  href="#cadastro"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-2 rounded-full bg-accent px-8 py-3 text-base font-semibold text-white"
                >
                  Criar conta grátis
                  <ArrowRight size={18} />
                </a>
              </>
            )}
          </nav>
        </div>
      )}
    </>
  );
}

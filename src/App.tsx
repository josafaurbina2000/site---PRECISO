import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Header from "./components/Header";
import HeroSection from "./components/HeroSection";
import HowItWorksSection from "./components/HowItWorksSection";
import ExamplesSection from "./components/ExamplesSection";
import FAQSection from "./components/FAQSection";
import CTASection from "./components/CTASection";
import Footer from "./components/Footer";
import DesignSystemPage from "./pages/DesignSystemPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import DashboardPage from "./pages/DashboardPage";
import ProblemPage from "./pages/ProblemPage";
import LoadingScreen from "./components/LoadingScreen";
import { supabase } from "./lib/supabase";

/**
 * Preciso Landing Page
 *
 * Dark theme, typography-driven, minimal design.
 * Inspired by Linear, Vercel, Stripe.
 */

export default function App() {
  const [hash, setHash] = useState(() => {
    // Toda vez que a aplicação é carregada/reiniciada no navegador, se o hash contiver caminhos de
    // autenticação (como login, cadastro, recuperar-senha), limpamos o hash para garantir que a
    // Landing Page seja sempre a PRIMEIRA página que o usuário vê de verdade.
    const currentHash = window.location.hash;
    if (
      currentHash === "#login" ||
      currentHash === "#cadastro" ||
      currentHash === "#recuperar-senha" ||
      currentHash === "#design-system"
    ) {
      window.location.hash = "";
      return "";
    }
    return currentHash;
  });
  const [session, setSession] = useState<any>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const handleHashChange = () => setHash(window.location.hash);
    window.addEventListener("hashchange", handleHashChange);

    // Coleta sessão imediata inicial antes de exibir a página
    supabase.auth.getSession().then(({ data: { session: activeSession } }) => {
      setSession(activeSession);

      // Garante que se carregar a página direto no #dashboard sem sessão, manda pra home
      if (!activeSession && window.location.hash === "#dashboard") {
        window.location.hash = "";
        setHash("");
      }
      setAuthLoading(false);
    });

    // Registra listener do estado de autenticação global para controle de rotas
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, activeSession) => {
      setSession(activeSession);
      setAuthLoading(false);

      // Se não há sessão ativa e tenta estar ou ir no dashboard, force home
      if (!activeSession && window.location.hash === "#dashboard") {
        window.location.hash = "";
        setHash("");
      }
    });

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
      subscription.unsubscribe();
    };
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={
            authLoading
              ? "loading"
              : hash === "#dashboard" || hash.startsWith("#problema/")
                ? "dashboard"
                : hash || "home"
          }
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="w-full min-h-screen"
        >
          {authLoading ? (
            <LoadingScreen />
          ) : hash === "#design-system" ? (
            <DesignSystemPage />
          ) : hash === "#login" ? (
            <LoginPage />
          ) : hash === "#cadastro" ? (
            <RegisterPage />
          ) : hash === "#recuperar-senha" ? (
            <ResetPasswordPage />
          ) : hash === "#dashboard" || hash.startsWith("#problema/") ? (
            session ? (
              <DashboardPage />
            ) : null
          ) : (
            <div className="min-h-screen bg-bg">
              <Header />
              <main>
                <HeroSection />
                <HowItWorksSection />
                <ExamplesSection />
                <FAQSection />
                <CTASection />
              </main>
              <Footer />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Render modalities that need fixed positioning outside of transform containing block */}
      {!authLoading && session && hash.startsWith("#problema/") && (
        <ProblemPage id={hash.replace("#problema/", "")} session={session} />
      )}
    </>
  );
}

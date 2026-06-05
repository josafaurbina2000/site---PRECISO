import { useState, FormEvent, useEffect } from "react";
import { ArrowLeft, Loader2, Mail, Lock, AlertCircle, CheckCircle2, ShieldCheck, Eye, EyeOff } from "lucide-react";
import { motion } from "motion/react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import SupabaseMissingBanner from "../components/SupabaseMissingBanner";
import Logo from "../components/Logo";

// Stagger variants for cohesive visual flow
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { 
    opacity: 1, 
    y: 0, 
    transition: { 
      type: "spring", 
      stiffness: 100, 
      damping: 15 
    } 
  }
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Redireciona se já estiver logado
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        window.location.hash = "#dashboard";
      }
    });
  }, []);

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Por favor, preencha todos os campos do seu acesso.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw authError;
      }

      if (data.session) {
        setSuccess("Login efetuado! Preparando o seu painel...");
        setTimeout(() => {
          window.location.hash = "#dashboard";
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || "Erro desconhecido ao entrar. Verifique seus dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50 text-[#111827] flex flex-col justify-between py-6 md:py-8 overflow-x-hidden">
      
      {/* HEADER SECTION */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-6 mb-4 flex items-center justify-between">
        <div className="scale-105">
          <Logo />
        </div>
        <a
          href="#"
          className="inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest text-[#6B7280] hover:text-[#111827] transition-all group"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-0.5" />
          Voltar para Home
        </a>
      </header>

      {/* MAIN CONTENT CONTAINER with 16:9 CARD wrapper */}
      <main className="relative z-10 flex-grow flex items-center justify-center w-full max-w-7xl mx-auto px-4 sm:px-6 py-4">
        
        {/* PREMIUM ROUNDED CARD (Like Hero / CTA) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full min-h-[640px] md:min-h-0 md:aspect-[16/9.5] rounded-[2.5rem] bg-white border border-slate-100 overflow-hidden shadow-[0_24px_50px_rgba(0,0,0,0.04)] flex items-center"
        >
          
          {/* RIGHT SIDE BEAUTIFUL ARTWORK (Contained inside the card) */}
          <div className="absolute inset-0 w-full h-full select-none pointer-events-none z-0">
            <motion.img 
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.95, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              src="https://i.ibb.co/0jggjw66/Max-a-Create-a-premium-edi-2.png" 
              alt="Clientes e resolvedores do Preciso"
              className="w-full h-full object-cover object-center md:object-right transition-all duration-700"
              referrerPolicy="no-referrer"
            />
            {/* Smooth transition gradients ensuring content visibility */}
            <div className="absolute inset-y-0 left-0 w-full md:w-[60%] lg:w-[48%] bg-gradient-to-r from-white via-white/180 to-white/0 md:block hidden" />
            {/* Opaco backdrop overlay for mobile view to guarantee accessibility of forms */}
            <div className="absolute inset-0 bg-white/94 md:hidden" />
          </div>

          {/* LEFT SIDE ACCESSIBLE TEXT & FORM */}
          <motion.div 
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="relative z-10 w-full md:w-[55%] lg:w-[46%] xl:w-[42%] h-full flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-8 md:py-12 text-left space-y-6"
          >
            
            {/* Missing Supabase configuration alerts */}
            {!isSupabaseConfigured && (
              <motion.div variants={itemVariants}>
                <SupabaseMissingBanner />
              </motion.div>
            )}

            {/* Title, Badge and Info */}
            <motion.div variants={itemVariants} className="space-y-3">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-100 bg-slate-50/80 px-3 py-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                <ShieldCheck size={12} className="text-[#12B76A]" />
                Sessão Própria & Criptografada
              </div>
              <h1 className="text-3xl font-black text-[#111827] tracking-tight leading-none">
                Bem-vindo de volta!
              </h1>
              <p className="text-xs text-[#6B7280] leading-relaxed font-semibold">
                Insira os dados da sua conta para continuar a resolver problemas.
              </p>
            </motion.div>

            {/* FORM */}
            <form onSubmit={handleLogin} className="space-y-4">
              
              {/* Feedback messages */}
              {error && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  className="flex gap-2.5 rounded-2xl border border-red-100 bg-red-50/50 p-4 text-xs text-red-700"
                >
                  <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
                  <span className="leading-relaxed font-semibold">{error}</span>
                </motion.div>
              )}

              {success && (
                <motion.div 
                  initial={{ opacity: 0, height: 0, y: -10 }}
                  animate={{ opacity: 1, height: "auto", y: 0 }}
                  className="flex gap-2.5 rounded-2xl border border-[#12B76A]/20 bg-emerald-50/60 p-4 text-xs text-emerald-800"
                >
                  <CheckCircle2 size={16} className="shrink-0 mt-0.5 text-[#12B76A]" />
                  <span className="leading-relaxed font-semibold">{success}</span>
                </motion.div>
              )}

              <div className="space-y-3.5">
                {/* Email field */}
                <motion.div variants={itemVariants} className="space-y-1">
                  <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-wider text-[#6B7280]">
                    E-mail de acesso
                  </label>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#9CA3AF] group-focus-within:text-[#12B76A] transition-colors">
                      <Mail size={16} />
                    </span>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="exemplo@dominio.com"
                      disabled={loading}
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-[#E5E7EB] bg-white text-[#111827] text-xs font-semibold placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#12B76A] focus:ring-4 focus:ring-[#12B76A]/10 transition-all disabled:opacity-60 shadow-[0_4px_12px_rgba(0,0,0,0.01)]"
                    />
                  </div>
                </motion.div>

                {/* Password field */}
                <motion.div variants={itemVariants} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-wider text-[#6B7280]">
                      Senha de segurança
                    </label>
                  </div>
                  <div className="relative group">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#9CA3AF] group-focus-within:text-[#12B76A] transition-colors">
                      <Lock size={16} />
                    </span>
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Sua senha secreta"
                      disabled={loading}
                      className="w-full pl-11 pr-12 py-3.5 rounded-2xl border border-[#E5E7EB] bg-white text-[#111827] text-xs font-semibold placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#12B76A] focus:ring-4 focus:ring-[#12B76A]/10 transition-all disabled:opacity-60 shadow-[0_4px_12px_rgba(0,0,0,0.01)]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#9CA3AF] hover:text-[#111827] transition-all cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  <div className="flex justify-end pt-0.5">
                    <a
                      href="#recuperar-senha"
                      className="text-[10px] font-black text-[#6B7280] hover:text-[#12B76A] transition-colors"
                    >
                      Esqueceu sua senha?
                    </a>
                  </div>
                </motion.div>
              </div>

              {/* Login Button with Framer Animation scale state */}
              <motion.button
                variants={itemVariants}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className={`group relative w-full flex items-center justify-center gap-2 rounded-2xl text-white font-black text-xs h-13.5 transition-all duration-300 cursor-pointer overflow-hidden ${
                  loading
                    ? "bg-[#6B7280] cursor-not-allowed opacity-80"
                    : "bg-accent hover:bg-accent-hover hover:scale-[1.01] hover:shadow-[0_12px_32px_rgba(16,185,129,0.22)]"
                }`}
              >
                {loading ? (
                  <span className="flex items-center gap-1.5 justify-center">
                    <Loader2 size={15} className="animate-spin text-white" />
                    Acessando plataforma...
                  </span>
                ) : (
                  <>
                    <span className="relative z-10 flex items-center gap-1.5">
                      Entrar no Preciso
                    </span>
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                  </>
                )}
              </motion.button>
            </form>

            {/* Link to SignUp */}
            <motion.p variants={itemVariants} className="text-xs text-[#6B7280] font-semibold">
              Não tem uma conta no Preciso?{" "}
              <a
                href="#cadastro"
                className="font-black text-[#12B76A] hover:text-[#12B76A]/80 hover:underline underline-offset-4 decoration-2 decoration-[#12B76A]/30 transition-all"
              >
                Crie uma gratuitamente
              </a>
            </motion.p>

          </motion.div>

        </motion.div>
      </main>

      {/* FOOTER SECTION */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-6 py-2 border-t border-slate-100/40 mt-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-[10px] text-text-faint font-semibold text-center sm:text-left">
          © {new Date().getFullYear()} Preciso. Todos os direitos reservados à sua privacidade.
        </p>
        <div className="flex items-center gap-4 text-[10px] text-text-faint font-bold">
          <span className="flex items-center gap-1">Conexão TLS v1.3</span>
          <span>•</span>
          <span>Selo Seguro</span>
        </div>
      </footer>

    </div>
  );
}

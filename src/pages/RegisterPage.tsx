import { useState, FormEvent, useEffect } from "react";
import { ArrowLeft, Loader2, Mail, Lock, User, AlertCircle, CheckCircle2, HelpCircle, Hammer, Eye, EyeOff, ShieldCheck } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import SupabaseMissingBanner from "../components/SupabaseMissingBanner";
import Logo from "../components/Logo";

type RoleType = "customer" | "solver";

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

export default function RegisterPage() {
  const [roleSelected, setRoleSelected] = useState<RoleType | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
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

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!roleSelected) {
      setError("Por favor, selecione qual o seu perfil para podermos configurar sua conta.");
      return;
    }

    if (!fullName || !email || !password || !confirmPassword) {
      setError("Por favor, preencha todos os campos do formulário.");
      return;
    }

    if (password.length < 6) {
      setError("Por segurança, sua senha deve conter no mínimo 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("A confirmação de senha não confere com a senha digitada.");
      return;
    }

    setLoading(true);

    try {
      // 1. Cadastra no Supabase Auth com metadados do profile
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role: roleSelected,
          }
        }
      });

      if (signUpError) {
        throw signUpError;
      }

      if (data.user) {
        // 2. Criação direta na tabela 'profiles' para consistência imediata
        const { error: profileError } = await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: fullName,
          email: email,
          role: roleSelected,
          created_at: new Date().toISOString()
        });

        if (profileError && profileError.code !== "PGRST116") {
          console.warn("Aviso ao criar profile no cadastro:", profileError.message);
        }

        if (data.session) {
          setSuccess("Sua conta foi criada com absoluto sucesso! Entrando...");
          setTimeout(() => {
            window.location.hash = "#dashboard";
          }, 1550);
        } else {
          setSuccess("Cadastro recebido! Enviamos um link de confirmação para o seu e-mail.");
          setFullName("");
          setEmail("");
          setPassword("");
          setConfirmPassword("");
          setRoleSelected(null);
        }
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro inesperado ao registrar sua conta.");
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

      {/* MAIN REGISTER CHANNELS with 16:9 CARD wrapper */}
      <main className="relative z-10 flex-grow flex items-center justify-center w-full max-w-7xl mx-auto px-4 sm:px-6 py-4">
        
        {/* PREMIUM ROUNDED CARD (Like Hero / CTA) */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.98, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full min-h-[660px] md:min-h-0 md:aspect-[16/9.5] rounded-[2.5rem] bg-white border border-slate-100 overflow-hidden shadow-[0_24px_50px_rgba(0,0,0,0.04)] flex items-center"
        >
          
          {/* RIGHT SIDE BEAUTIFUL ARTWORK (Contained inside the card) */}
          <div className="absolute inset-0 w-full h-full select-none pointer-events-none z-0">
            <motion.img 
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ opacity: 0.95, scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              src="https://i.ibb.co/GQwBTwML/Create-a-premium-editorial-vector-202606030200.jpg" 
              alt="Segurança e Proteção Preciso"
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
            className="relative z-10 w-full md:w-[55%] lg:w-[46%] xl:w-[42%] h-full flex flex-col justify-center px-6 sm:px-12 lg:px-16 py-8 md:py-12 text-left space-y-5"
          >
            
            {/* Missing Supabase configuration banner */}
            {!isSupabaseConfigured && (
              <motion.div variants={itemVariants}>
                <SupabaseMissingBanner />
              </motion.div>
            )}

            {/* Title, Badge and Info */}
            <motion.div variants={itemVariants} className="space-y-2.5">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-100 bg-slate-50/80 px-3 py-1 text-[10px] font-bold text-text-muted uppercase tracking-wider">
                <ShieldCheck size={12} className="text-[#12B76A]" />
                Conectando Você com Total Privacidade
              </div>
              <h1 className="text-3xl font-black text-[#111827] tracking-tight leading-none">
                Criar sua conta
              </h1>
              <p className="text-xs text-[#6B7280] leading-relaxed font-semibold">
                Comece no Preciso hoje mesmo. Simples, rápido e confiável.
              </p>
            </motion.div>

            {/* Form results reports */}
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

            {/* Profile Onboarding Choices */}
            <motion.div variants={itemVariants} className="space-y-1.5">
              <label className="block text-[10px] font-black uppercase tracking-wide text-[#6B7280]">
                Selecione o seu perfil de uso:
              </label>
              
              <div className="grid grid-cols-2 gap-2.5">
                {/* Customer choice */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setRoleSelected("customer")}
                  className={`flex flex-col p-3 rounded-2xl border text-left transition-all duration-300 cursor-pointer overflow-hidden relative ${
                    roleSelected === "customer"
                      ? "border-[#12B76A] bg-emerald-50/[0.08] ring-4 ring-[#12B76A]/10"
                      : "border-[#E5E7EB] bg-white hover:border-slate-300 hover:bg-slate-50/30 shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
                  }`}
                >
                  <div className={`p-1.5 w-fit rounded-xl border mb-2.5 transition-colors ${
                    roleSelected === "customer" ? "bg-[#12B76A] text-white border-transparent" : "bg-slate-50 text-[#6B7280] border-[#E5E7EB]"
                  }`}>
                    <HelpCircle size={13} />
                  </div>
                  <span className="block text-[10px] font-black text-[#111827] uppercase tracking-wide leading-none">
                    Cliente
                  </span>
                  <span className="block text-[8.5px] text-[#6B7280] font-medium leading-tight mt-1">
                    Preciso de ajuda
                  </span>
                </motion.button>

                {/* Solver choice */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => setRoleSelected("solver")}
                  className={`flex flex-col p-3 rounded-2xl border text-left transition-all duration-300 cursor-pointer overflow-hidden relative ${
                    roleSelected === "solver"
                      ? "border-[#12B76A] bg-emerald-50/[0.08] ring-4 ring-[#12B76A]/10"
                      : "border-[#E5E7EB] bg-white hover:border-slate-300 hover:bg-slate-50/30 shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
                  }`}
                >
                  <div className={`p-1.5 w-fit rounded-xl border mb-2.5 transition-colors ${
                    roleSelected === "solver" ? "bg-[#12B76A] text-white border-transparent" : "bg-slate-50 text-[#6B7280] border-[#E5E7EB]"
                  }`}>
                    <Hammer size={13} />
                  </div>
                  <span className="block text-[10px] font-black text-[#111827] uppercase tracking-wide leading-none">
                    Resolver
                  </span>
                  <span className="block text-[8.5px] text-[#6B7280] font-medium leading-tight mt-1">
                    Quero dar soluções
                  </span>
                </motion.button>
              </div>

              <AnimatePresence>
                {roleSelected && (
                  <motion.div
                    initial={{ opacity: 0, height: 0, y: -6 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -6 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <div className="mt-1.5 rounded-2xl border border-amber-200/60 bg-amber-50/40 p-3.5 text-[10px] text-amber-800 flex gap-2.5 font-semibold leading-relaxed shadow-[0_2px_10px_rgba(245,158,11,0.02)]">
                      <AlertCircle size={14} className="shrink-0 mt-0.5 text-amber-600" />
                      <span>
                        <strong className="font-extrabold text-amber-900">Atenção:</strong> A escolha do perfil é definitiva. Para alterar o seu tipo de conta posteriormente (ex: mudar de Cliente para Resolver ou vice-versa), será necessário excluir esta conta e criar uma nova.
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* FORM */}
            <form onSubmit={handleRegister} className="space-y-3 w-full">
              <AnimatePresence mode="wait">
                {roleSelected ? (
                  <motion.div 
                    key="form-details"
                    initial={{ opacity: 0, height: 0, y: 15 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    exit={{ opacity: 0, height: 0, y: -15 }}
                    transition={{ type: "spring", stiffness: 120, damping: 16 }}
                    className="space-y-3.5"
                  >
                    
                    {/* Full name input */}
                    <div className="space-y-1">
                      <label htmlFor="fullName" className="block text-[10px] font-black uppercase tracking-wider text-[#6B7280]">
                        Nome e sobrenome completo
                      </label>
                      <div className="relative group">
                        <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-[#9CA3AF] group-focus-within:text-[#12B76A] transition-colors">
                          <User size={16} />
                        </span>
                        <input
                          id="fullName"
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="Ex: Mariana Lima de Souza"
                          disabled={loading}
                          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#E5E7EB] bg-white text-[#111827] text-xs font-semibold placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#12B76A] focus:ring-4 focus:ring-[#12B76A]/10 transition-all disabled:opacity-60 shadow-[0_4px_12px_rgba(0,0,0,0.01)]"
                        />
                      </div>
                    </div>

                    {/* Email input */}
                    <div className="space-y-1">
                      <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-wider text-[#6B7280]">
                        Endereço de e-mail
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
                          placeholder="mariana@exemplo.com"
                          disabled={loading}
                          className="w-full pl-11 pr-4 py-3 rounded-2xl border border-[#E5E7EB] bg-white text-[#111827] text-xs font-semibold placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#12B76A] focus:ring-4 focus:ring-[#12B76A]/10 transition-all disabled:opacity-60 shadow-[0_4px_12px_rgba(0,0,0,0.01)]"
                        />
                      </div>
                    </div>

                    {/* Passwords grid */}
                    <div className="grid grid-cols-2 gap-3.5">
                      <div className="space-y-1">
                        <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-wider text-[#6B7280]">
                          Senha
                        </label>
                        <div className="relative group">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#9CA3AF] group-focus-within:text-[#12B76A] transition-colors">
                            <Lock size={15} />
                          </span>
                          <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Senha"
                            disabled={loading}
                            className="w-full pl-9.5 pr-8 py-3 rounded-2xl border border-[#E5E7EB] bg-white text-[#111827] text-xs font-semibold placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#12B76A] focus:ring-4 focus:ring-[#12B76A]/10 transition-all disabled:opacity-60 shadow-[0_4px_12px_rgba(0,0,0,0.01)]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#9CA3AF] hover:text-[#111827] transition-all cursor-pointer"
                          >
                            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label htmlFor="confirmPassword" className="block text-[10px] font-black uppercase tracking-wider text-[#6B7280]">
                          Confirmar
                        </label>
                        <div className="relative group">
                          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#9CA3AF] group-focus-within:text-[#12B76A] transition-colors">
                            <Lock size={15} />
                          </span>
                          <input
                            id="confirmPassword"
                            type={showConfirmPassword ? "text" : "password"}
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="Confirmar"
                            disabled={loading}
                            className="w-full pl-9.5 pr-8 py-3 rounded-2xl border border-[#E5E7EB] bg-white text-[#111827] text-xs font-semibold placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#12B76A] focus:ring-4 focus:ring-[#12B76A]/10 transition-all disabled:opacity-60 shadow-[0_4px_12px_rgba(0,0,0,0.01)]"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-[#9CA3AF] hover:text-[#111827] transition-all cursor-pointer"
                          >
                            {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Submission register button */}
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={loading}
                      className={`group relative w-full flex items-center justify-center gap-2 rounded-2xl text-white font-black text-xs h-13.5 transition-all duration-300 cursor-pointer overflow-hidden ${
                        loading
                          ? "bg-[#6B7280] cursor-not-allowed opacity-80"
                          : "bg-[#12B76A] hover:bg-[#12B76A]/90 hover:scale-[1.01] hover:shadow-[0_12px_32px_rgba(18,183,106,0.22)]"
                      }`}
                    >
                      {loading ? (
                        <span className="flex items-center gap-1.5 justify-center">
                          <Loader2 size={15} className="animate-spin text-white" />
                          Criando seu cadastro...
                        </span>
                      ) : (
                        <>
                          <span className="relative z-10">Concluir meu cadastro no Preciso</span>
                          <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                        </>
                      )}
                    </motion.button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="no-role-selected"
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.96 }}
                    className="text-center py-5 px-4 text-[#6B7280] text-xs border border-slate-200/60 rounded-2xl bg-slate-50/50 backdrop-blur-sm shadow-[0_2px_12px_rgba(0,0,0,0.01)] font-semibold"
                  >
                    Selecione acima se você é <span className="font-extrabold text-[#111827]">Cliente</span> ou <span className="font-extrabold text-[#111827]">Resolvedor</span> para liberar seus campos de cadastro.
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Back to Login page */}
            <motion.p variants={itemVariants} className="text-xs text-[#6B7280] font-semibold">
              Já possui uma conta ativa?{" "}
              <a
                href="#login"
                className="font-black text-[#12B76A] hover:text-[#12B76A]/80 hover:underline underline-offset-4 decoration-2 decoration-[#12B76A]/30 transition-all"
              >
                Fazer login
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

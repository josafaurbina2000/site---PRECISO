import { useState, FormEvent, useEffect } from "react";
import { ArrowLeft, Loader2, Mail, Lock, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import SupabaseMissingBanner from "../components/SupabaseMissingBanner";
import Logo from "../components/Logo";

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

export default function ResetPasswordPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Se for "true", significa que o usuário usou o link do e-mail e está pronto para atualizar a senha
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    // Escuta estado de password recovery do Supabase
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "PASSWORD_RECOVERY" || session) {
        setIsUpdatingPassword(true);
      }
    });

    // Como alternativa, verifica se a URL tem o hash de acesso
    const hasRecoveryToken = window.location.href.includes("type=recovery") || 
                             window.location.hash.includes("access_token=");
    if (hasRecoveryToken) {
      setIsUpdatingPassword(true);
    }
  }, []);

  const handleRequestLink = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!email) {
      setError("Por favor, preencha o campo de e-mail.");
      return;
    }

    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/#recuperar-senha`,
      });

      if (resetError) {
        throw resetError;
      }

      setSuccess("Link de redefinição de senha enviado para seu e-mail!");
      setEmail("");
    } catch (err: any) {
      setError(err.message || "Erro ao solicitar redefinição de senha. Verifique se o e-mail está cadastrado.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!password || !confirmPassword) {
      setError("Por favor, preencha todas as senhas.");
      return;
    }

    if (password.length < 6) {
      setError("A nova senha deve ter no mínimo 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setLoading(true);

    try {
      const { error: updateError } = await supabase.auth.updateUser({
        password: password,
      });

      if (updateError) {
        throw updateError;
      }

      setSuccess("Senha atualizada com sucesso! Você será redirecionado para a página de login...");
      setTimeout(() => {
        window.location.hash = "#login";
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar a senha.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col justify-between py-12 px-6">
      <div className="relative max-w-md w-full mx-auto my-auto">
        
        {/* Back and Logo */}
        <div className="flex items-center justify-between mb-10">
          <a
            href="#login"
            className="inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-text transition-colors group"
          >
            <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-0.5" />
            Voltar para o Login
          </a>
          <Logo />
        </div>

        {/* Warning banner if not configured */}
        {!isSupabaseConfigured && <SupabaseMissingBanner />}

        {/* Auth Card wrapped with springy entry */}
        <motion.div 
          initial={{ opacity: 0, y: 15, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white border border-border rounded-2xl p-8 shadow-[0_4px_30px_rgba(0,0,0,0.02)]"
        >
          {isUpdatingPassword ? (
            /* STATE 2: NEW PASSWORD INPUT */
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={itemVariants} className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-text">
                  Definir nova senha
                </h1>
                <p className="text-sm text-text-muted mt-1.5">
                  Digite sua nova senha abaixo para recuperar o acesso.
                </p>
              </motion.div>

              <form onSubmit={handleUpdatePassword} className="space-y-5">
                {/* Error Message */}
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    className="flex gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                  >
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Success Message */}
                {success && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    className="flex gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
                  >
                    <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                    <span>{success}</span>
                  </motion.div>
                )}

                {/* Password field */}
                <motion.div variants={itemVariants}>
                  <label htmlFor="password" className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                    Nova Senha
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-faint">
                      <Lock size={16} />
                    </span>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-border bg-surface-raised text-text text-sm placeholder:text-text-faint focus:outline-none focus:border-accent transition-colors disabled:opacity-60"
                    />
                  </div>
                </motion.div>

                {/* Confirm Password field */}
                <motion.div variants={itemVariants}>
                  <label htmlFor="confirmPassword" className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                    Confirmar Nova Senha
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-faint">
                      <Lock size={16} />
                    </span>
                    <input
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirme sua nova senha"
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-border bg-surface-raised text-text text-sm placeholder:text-text-faint focus:outline-none focus:border-accent transition-colors disabled:opacity-60"
                    />
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  variants={itemVariants}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-accent hover:bg-accent-hover text-white font-semibold text-sm h-12 transition-all duration-300 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center gap-1.5 justify-center">
                      <Loader2 size={16} className="animate-spin" />
                      Salvando nova senha...
                    </span>
                  ) : (
                    "Atualizar senha"
                  )}
                </motion.button>
              </form>
            </motion.div>
          ) : (
            /* STATE 1: REQUEST EMAIL LINK */
            <motion.div 
              variants={containerVariants}
              initial="hidden"
              animate="show"
            >
              <motion.div variants={itemVariants} className="mb-8">
                <h1 className="text-2xl font-bold tracking-tight text-text">
                  Recuperar senha
                </h1>
                <p className="text-sm text-text-muted mt-1.5">
                  Informe seu e-mail para receber um link de redefinição de senha.
                </p>
              </motion.div>

              <form onSubmit={handleRequestLink} className="space-y-5">
                {/* Error Message */}
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    className="flex gap-2.5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 animate-fade-in/10"
                  >
                    <AlertCircle size={18} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </motion.div>
                )}

                {/* Success Message */}
                {success && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0, y: -10 }}
                    animate={{ opacity: 1, height: "auto", y: 0 }}
                    className="flex gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 animate-fade-in/10"
                  >
                    <CheckCircle2 size={18} className="shrink-0 mt-0.5" />
                    <span>{success}</span>
                  </motion.div>
                )}

                {/* E-mail field */}
                <motion.div variants={itemVariants}>
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                    E-mail
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-faint">
                      <Mail size={16} />
                    </span>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="exemplo@gmail.com"
                      disabled={loading}
                      className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-border bg-surface-raised text-text text-sm placeholder:text-text-faint focus:outline-none focus:border-accent transition-colors disabled:opacity-60"
                    />
                  </div>
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  variants={itemVariants}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-full bg-accent hover:bg-accent-hover text-white font-semibold text-sm h-12 transition-all duration-300 disabled:opacity-75 disabled:cursor-not-allowed cursor-pointer"
                >
                  {loading ? (
                    <span className="flex items-center gap-1.5 justify-center">
                      <Loader2 size={16} className="animate-spin" />
                      Enviando...
                    </span>
                  ) : (
                    "Solicitar link"
                  )}
                </motion.button>
              </form>
            </motion.div>
          )}

          {/* Create Account/Login helper link */}
          <motion.div variants={itemVariants} className="mt-8 pt-6 border-t border-border/60 text-center">
            <p className="text-sm text-text-muted">
              Lembrou sua senha?{" "}
              <a
                href="#login"
                className="font-semibold text-accent hover:text-accent-hover hover:underline transition-all"
              >
                Ir para o login
              </a>
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Small design footer */}
      <div className="text-center text-xs text-text-faint mt-10">
        © {new Date().getFullYear()} Preciso. Todos os direitos reservados.
      </div>
    </div>
  );
}

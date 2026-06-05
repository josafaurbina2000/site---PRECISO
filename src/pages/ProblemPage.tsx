import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import {
  ArrowLeft,
  MapPin,
  Briefcase,
  Calendar,
  Clock,
  CheckCircle,
  FileText,
  User as UserIcon,
  Star,
  Check,
  ChevronRight,
  Loader2,
  AlertCircle,
  MessageSquare,
  Info,
} from "lucide-react";
import LoadingScreen from "../components/LoadingScreen";

interface Problem {
  id: string;
  title: string;
  description: string;
  category: string;
  city: string;
  budget: string | null;
  status: string;
  created_at: string;
  author_id: string;
}

interface Proposal {
  id: string;
  problem_id: string;
  solver_id: string;
  amount: number;
  estimated_time: string;
  message: string;
  status: string;
  created_at: string;
  solver: {
    full_name: string;
    avatar_url: string;
    bio: string;
  };
}

export default function ProblemPage({
  id,
  session,
}: {
  id: string;
  session: any;
}) {
  const [problem, setProblem] = useState<Problem | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [myProposal, setMyProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);

  // Form para submeter
  const [formAmount, setFormAmount] = useState("");
  const [formTime, setFormTime] = useState("");
  const [formMessage, setFormMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [authorProfile, setAuthorProfile] = useState<any>(null);
  const [authorMetrics, setAuthorMetrics] = useState({
    published: 0,
    completed: 0,
  });

  useEffect(() => {
    fetchProblemData();
  }, [id]);

  const fetchProblemData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Problem
      const { data: problemData, error: problemError } = await supabase
        .from("problems")
        .select("*")
        .eq("id", id)
        .single();

      if (problemError) throw problemError;
      setProblem(problemData);

      // Fetch Author Details
      const { data: authData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", problemData.author_id)
        .single();

      if (authData) setAuthorProfile(authData);

      // Fetch Author Metrics (Published / Completed)
      const { count: pubCount } = await supabase
        .from("problems")
        .select("*", { count: "exact", head: true })
        .eq("author_id", problemData.author_id);

      const { count: compCount } = await supabase
        .from("problems")
        .select("*", { count: "exact", head: true })
        .eq("author_id", problemData.author_id)
        .in("status", ["resolved", "closed", "completed"]);

      setAuthorMetrics({
        published: pubCount || 0,
        completed: compCount || 0,
      });

      // 2. Fetch Proposals Se o usuário for o autor, pega todas. Se não, tenta pegar a própria.
      if (problemData.author_id === session.user.id) {
        // Usuário é o autor do problema
        const { data: proposalsData, error: proposalsError } = await supabase
          .from("proposals")
          .select(
            `
            id, problem_id, solver_id, amount, estimated_time, message, status, created_at,
            solver:profiles(full_name, avatar_url, bio)
          `,
          )
          .eq("problem_id", id)
          .order("created_at", { ascending: false });

        if (proposalsError && proposalsError.code !== "PGRST205")
          console.error(proposalsError);
        // PGRST205 = tabela não existe

        if (proposalsData) {
          // @ts-ignore
          setProposals(proposalsData);
        }
      } else {
        // Usuário é um solver
        const { data: myPropData, error: myPropError } = await supabase
          .from("proposals")
          .select("*")
          .eq("problem_id", id)
          .eq("solver_id", session.user.id)
          .maybeSingle();

        if (myPropError && myPropError.code !== "PGRST205")
          console.error(myPropError);

        if (myPropData) {
          setMyProposal(myPropData);
          setFormAmount(myPropData.amount.toString());
          setFormTime(myPropData.estimated_time);
          setFormMessage(myPropData.message);
        }
      }
    } catch (err: any) {
      console.error(err);
      setError("Problema não encontrado ou erro de conexão.");
    } finally {
      setLoading(false);
    }
  };

  const handleBudgetChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "");
    if (value === "") {
      setFormAmount("");
      return;
    }
    const numericValue = parseInt(value, 10) / 100;
    setFormAmount(numericValue.toString());
  };

  const formatCurrency = (val: string | number) => {
    const num = typeof val === "string" ? parseFloat(val) : val;
    if (isNaN(num)) return "R$ 0,00";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(num);
  };

  const formatBudgetDisplay = (budget: string | null) => {
    if (!budget) return "A combinar";
    if (budget.includes("R$")) return budget;
    const parsed = parseFloat(budget.replace(",", "."));
    if (!isNaN(parsed)) return formatCurrency(parsed);
    return budget;
  };

  const submitProposal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const amountNum = parseFloat(formAmount);
    if (!amountNum || amountNum <= 0) {
      setError("Informe um valor válido.");
      setSubmitting(false);
      return;
    }

    if (!formTime.trim() || !formMessage.trim()) {
      setError("Preencha todos os campos.");
      setSubmitting(false);
      return;
    }

    try {
      if (myProposal) {
        // Update
        const { error: updateError } = await supabase
          .from("proposals")
          .update({
            amount: amountNum,
            estimated_time: formTime,
            message: formMessage,
            updated_at: new Date().toISOString(),
          })
          .eq("id", myProposal.id);

        if (updateError) throw updateError;
      } else {
        // Insert
        const { error: insertError } = await supabase.from("proposals").insert([
          {
            problem_id: id,
            solver_id: session.user.id,
            amount: amountNum,
            estimated_time: formTime,
            message: formMessage,
          },
        ]);

        if (insertError) throw insertError;
      }

      await fetchProblemData();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro ao salvar a proposta. Tente novamente.");
    } finally {
      setSubmitting(false);
    }
  };

  const acceptProposal = async (proposalId: string) => {
    try {
      const selectedProp = proposals.find((p) => p.id === proposalId);
      if (!selectedProp) return;

      // 1. Atualizar a proposta selecionada para accepted
      const { error: pError } = await supabase
        .from("proposals")
        .update({ status: "accepted" })
        .eq("id", proposalId);

      if (pError) throw pError;

      // 2. Atualizar o problema para "in_progress" (em andamento)
      const { error: probError } = await supabase
        .from("problems")
        .update({ status: "in_progress" })
        .eq("id", id);

      if (probError) throw probError;

      // 3. Criar a sala de chat automaticamente
      const { error: chatError } = await supabase.from("chats").insert([
        {
          problem_id: id,
          author_id: session.user.id,
          solver_id: selectedProp.solver_id,
        },
      ]);

      if (chatError && chatError.code !== "PGRST205")
        console.error("Erro ao criar chat:", chatError);

      // Recarregar os dados
      await fetchProblemData();
    } catch (err: any) {
      console.error(err);
      alert("Erro ao selecionar profissional.");
    }
  };

  if (loading)
    return (
      <div className="fixed inset-0 z-[100] flex justify-center items-center">
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" />
        <Loader2 className="animate-spin text-white relative z-10" size={48} />
      </div>
    );

  if (error || !problem) {
    return (
      <div className="fixed inset-0 z-[100] flex justify-center items-center p-4 sm:p-6 overflow-y-auto selection:bg-accent/20">
        <div
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
          onClick={() => (window.location.hash = "#dashboard")}
        />
        <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl flex flex-col p-8 items-center text-center">
          <AlertCircle className="text-red-500 mb-4" size={48} />
          <h1 className="text-2xl font-black text-slate-800 mb-2">
            Ops! Algo deu errado.
          </h1>
          <p className="text-slate-500 mb-8 max-w-md text-center">
            {error || "Não conseguimos carregar este problema."}
          </p>
          <button
            onClick={() => (window.location.hash = "#dashboard")}
            className="w-full bg-slate-800 text-white font-bold px-6 py-3 rounded-xl hover:bg-slate-700 transition"
          >
            Voltar
          </button>
        </div>
      </div>
    );
  }

  const isAuthor = problem.author_id === session.user.id;

  // Status mapping
  // "open" -> Publicado / Recebendo Propostas
  // "in_progress" -> Profissional Selecionado / Em Andamento
  // "resolved" / "closed" -> Concluído

  const getTimelineStep = () => {
    if (problem.status === "open") return 2;
    if (problem.status === "in_progress") return 4;
    return 5;
  };

  const currentStep = getTimelineStep();
  const selectedProposal = proposals?.find((p) => p.status === "accepted");

  return (
    <div className="fixed inset-0 z-[100] flex justify-center items-center p-4 sm:p-6 selection:bg-accent/20">
      {/* OVERLAY */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={() => (window.location.hash = "#dashboard")}
      />

      {/* MODAL CONTENT */}
      <div className="relative w-full max-w-5xl max-h-[90vh] flex flex-col bg-bg-subtle text-slate-900 font-sans rounded-3xl shadow-2xl overflow-hidden">
        {/* HEADER SIMPLES ESTILO NOTION */}
        <header className="shrink-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#E5E7EB] px-6 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => (window.location.hash = "#dashboard")}
              className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold transition-colors group"
            >
              <ArrowLeft
                size={18}
                className="group-hover:-translate-x-1 transition-transform"
              />
              Voltar
            </button>

            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-1 text-[11px] uppercase tracking-wider font-extrabold rounded-full ${
                  problem.status === "open"
                    ? "bg-emerald-100 text-emerald-700"
                    : problem.status === "in_progress"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-slate-200 text-slate-700"
                }`}
              >
                {problem.status === "open"
                  ? "Aberto"
                  : problem.status === "in_progress"
                    ? "Em andamento"
                    : "Concluído"}
              </span>
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1 space-y-8">
              {/* INFORMAÇÕES DO PROBLEMA */}
              <section className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-sm">
                <div className="flex flex-col gap-5">
                  <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
                    {problem.title}
                  </h1>

                  <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-slate-600">
                    <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                      <Briefcase size={16} className="text-slate-400" />{" "}
                      {problem.category}
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                      <MapPin size={16} className="text-slate-400" />{" "}
                      {problem.city}
                    </span>
                    <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-lg">
                      <Calendar size={16} className="text-slate-400" />{" "}
                      {new Date(problem.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>

                  <div className="w-full h-px bg-[#E5E7EB] my-2" />

                  <div className="prose prose-slate max-w-none">
                    <p className="text-slate-700 whitespace-pre-wrap leading-relaxed text-lg">
                      {problem.description}
                    </p>
                  </div>

                  <div className="mt-4 flex flex-col items-start">
                    <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1.5">
                      Orçamento Esperado
                    </span>
                    <span className="text-2xl font-black text-slate-800">
                      {formatBudgetDisplay(problem.budget)}
                    </span>
                  </div>
                </div>
              </section>

              {/* TIMELINE */}
              <section className="px-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-8">
                  Progresso
                </h3>

                <div className="relative flex flex-col md:flex-row items-start justify-between gap-6 md:gap-0">
                  {/* Linha conectora md */}
                  <div className="hidden md:block absolute top-[11px] left-8 right-8 h-0.5 bg-slate-100 z-0">
                    <div
                      className="h-full bg-slate-800 transition-all duration-1000 ease-out"
                      style={{ width: `${(currentStep / 5) * 100}%` }}
                    />
                  </div>

                  {[
                    { num: 1, label: "Publicado" },
                    { num: 2, label: "Propostas" },
                    { num: 3, label: "Selecionado" },
                    { num: 4, label: "Em Andamento" },
                    { num: 5, label: "Concluído" },
                  ].map((step, idx) => {
                    const isActive = step.num === currentStep;
                    const isPast = step.num < currentStep;

                    return (
                      <div
                        key={idx}
                        className="relative z-10 flex md:flex-col items-center gap-4 md:gap-3 md:w-32"
                      >
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                            isActive
                              ? "bg-slate-800 border-slate-800 text-white shadow-md"
                              : isPast
                                ? "bg-slate-800 border-slate-800 text-white"
                                : "bg-white border-slate-200 text-slate-300"
                          }`}
                        >
                          {isPast ? (
                            <Check size={12} strokeWidth={3} />
                          ) : (
                            <span className="text-[10px] font-bold">
                              {step.num}
                            </span>
                          )}
                        </div>
                        <span
                          className={`text-xs font-bold tracking-wide ${isActive || isPast ? "text-slate-800" : "text-slate-400"}`}
                        >
                          {step.label}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* ÁREA DE PROPOSTAS - AUTOR VS SOLVER */}
              {isAuthor ? (
                <section>
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black text-slate-800">
                      Propostas Recebidas
                    </h2>
                    <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                      {proposals?.length || 0}
                    </span>
                  </div>

                  {selectedProposal ? (
                    <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-8 mb-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 p-4">
                        <span className="bg-emerald-100 text-emerald-800 px-3 py-1 text-[10px] uppercase tracking-wider font-black rounded-full flex items-center gap-1.5">
                          <CheckCircle size={12} /> Profissional Selecionado
                        </span>
                      </div>

                      <h3 className="text-emerald-900 font-bold mb-6">
                        Você selecionou este profissional para o trabalho.
                      </h3>

                      <div className="flex items-start gap-6 border-t border-emerald-200/50 pt-6">
                        {selectedProposal.solver?.avatar_url ? (
                          <img
                            src={selectedProposal.solver.avatar_url}
                            alt=""
                            className="w-16 h-16 rounded-xl object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
                            <UserIcon size={24} className="text-emerald-600" />
                          </div>
                        )}

                        <div className="flex-1">
                          <h4 className="font-extrabold text-lg text-emerald-950">
                            {selectedProposal.solver?.full_name || "Usuário"}
                          </h4>
                          <p className="text-sm text-emerald-800/80 mb-4">
                            {selectedProposal.solver?.bio || "Sem biografia"}
                          </p>

                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                            <div className="bg-white/60 p-3 rounded-xl border border-emerald-100/50">
                              <span className="block text-[10px] uppercase font-bold text-emerald-600 mb-1">
                                Valor
                              </span>
                              <span className="font-black text-emerald-950">
                                {formatCurrency(selectedProposal.amount)}
                              </span>
                            </div>
                            <div className="bg-white/60 p-3 rounded-xl border border-emerald-100/50">
                              <span className="block text-[10px] uppercase font-bold text-emerald-600 mb-1">
                                Prazo
                              </span>
                              <span className="font-black text-emerald-950">
                                {selectedProposal.estimated_time}
                              </span>
                            </div>
                          </div>

                          <div className="bg-white p-4 rounded-xl border border-emerald-100 text-sm text-emerald-900 leading-relaxed shadow-sm">
                            "{selectedProposal.message}"
                          </div>

                          <div className="mt-8 flex gap-3">
                            {/* Preparação para o Chat */}
                            <button className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl shadow-sm hover:bg-emerald-700 transition active:scale-95 flex items-center justify-center gap-2">
                              <MessageSquare size={18} /> Iniciar Conversa
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : proposals && proposals.length > 0 ? (
                    <div className="grid gap-6">
                      {proposals.map((proposal) => (
                        <div
                          key={proposal.id}
                          className="bg-white border border-[#E5E7EB] rounded-2xl p-6 sm:p-8 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="flex flex-col sm:flex-row gap-6 items-start">
                            {/* Avatar e Perfil */}
                            <div className="flex flex-col items-center gap-3 w-full sm:w-32 shrink-0">
                              {proposal.solver?.avatar_url ? (
                                <img
                                  src={proposal.solver.avatar_url}
                                  alt=""
                                  className="w-20 h-20 rounded-2xl object-cover shadow-sm"
                                />
                              ) : (
                                <div className="w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center shadow-sm">
                                  <UserIcon
                                    size={32}
                                    className="text-slate-400"
                                  />
                                </div>
                              )}
                              <span className="font-extrabold text-sm text-center line-clamp-1 w-full">
                                {proposal.solver?.full_name || "Usuário"}
                              </span>

                              <div className="flex items-center gap-1 text-slate-500 text-xs font-bold">
                                <Star
                                  size={12}
                                  className="fill-amber-400 text-amber-400"
                                />{" "}
                                5.0
                              </div>

                              <button className="text-[10px] uppercase tracking-widest font-black text-slate-400 hover:text-accent transition-colors underline underline-offset-4 decoration-slate-200 hover:decoration-accent mt-1">
                                Ver Perfil
                              </button>
                            </div>

                            {/* Dados da Proposta */}
                            <div className="flex-1 w-full space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                                  <span className="block text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1.5">
                                    Valor Proposto
                                  </span>
                                  <span className="text-xl font-black text-slate-800">
                                    {formatCurrency(proposal.amount)}
                                  </span>
                                </div>
                                <div className="bg-slate-50 border border-slate-100 p-4 rounded-xl">
                                  <span className="block text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1.5">
                                    Prazo Estimado
                                  </span>
                                  <span className="text-xl font-black text-slate-800">
                                    {proposal.estimated_time}
                                  </span>
                                </div>
                              </div>

                              <div>
                                <span className="block text-[10px] text-slate-400 uppercase font-black tracking-widest mb-2">
                                  Mensagem do Profissional
                                </span>
                                <p className="text-sm text-slate-600 bg-white border border-[#E5E7EB] p-4 rounded-xl leading-relaxed whitespace-pre-wrap">
                                  {proposal.message}
                                </p>
                              </div>

                              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <button
                                  onClick={() => acceptProposal(proposal.id)}
                                  className="flex-1 bg-accent text-white font-bold py-3 rounded-xl hover:bg-accent/90 transition shadow-sm active:scale-95"
                                >
                                  Escolher este Profissional
                                </button>
                                <button className="sm:w-32 bg-white border border-[#E5E7EB] text-slate-600 font-bold py-3 rounded-xl hover:bg-slate-50 transition shadow-sm flex justify-center items-center gap-2">
                                  Conversar
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-24 bg-white border border-dashed border-slate-300 rounded-2xl">
                      <FileText
                        className="mx-auto text-slate-300 mb-4"
                        size={48}
                      />
                      <h3 className="text-lg font-bold text-slate-800 mb-1">
                        Nenhuma proposta ainda
                      </h3>
                      <p className="text-sm text-slate-500">
                        Seu problema está visível e aguardando profissionais
                        interessados.
                      </p>
                    </div>
                  )}
                </section>
              ) : (
                <section>
                  <div className="mb-6">
                    <h2 className="text-2xl font-black text-slate-800">
                      Sua Proposta
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      {myProposal
                        ? "Você já enviou sua proposta para este problema."
                        : "Envie uma proposta de valor e prazo para resolver este problema."}
                    </p>
                  </div>

                  {myProposal ? (
                    <div className="bg-white border border-[#E5E7EB] shadow-sm rounded-2xl p-6 sm:p-8 space-y-6">
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-start gap-3">
                        <CheckCircle
                          className="text-emerald-500 shrink-0 mt-0.5"
                          size={20}
                        />
                        <div>
                          <h4 className="font-bold">
                            Proposta enviada com sucesso!
                          </h4>
                          <p className="text-sm text-emerald-700/80 mt-1">
                            O autor do problema foi avisado. Você será
                            notificado caso seja escolhido para o trabalho.
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-[#E5E7EB]">
                        <div>
                          <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-1">
                            Valor Cobrado
                          </label>
                          <div className="text-lg font-black text-slate-800">
                            {formatCurrency(myProposal.amount)}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-1">
                            Prazo Estimado
                          </label>
                          <div className="text-lg font-bold text-slate-800">
                            {myProposal.estimated_time}
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-wider font-bold text-slate-500 mb-1">
                          Mensagem enviada
                        </label>
                        <p className="text-slate-700 whitespace-pre-wrap">
                          {myProposal.message}
                        </p>
                      </div>
                    </div>
                  ) : problem.status !== "open" ? (
                    <div className="bg-slate-50 border border-slate-200 rounded-2xl p-8 text-center">
                      <CheckCircle
                        className="mx-auto text-slate-400 mb-4"
                        size={48}
                      />
                      <h3 className="text-lg font-bold text-slate-800 mb-2">
                        Status Encerrado
                      </h3>
                      <p className="text-slate-500 text-sm">
                        Este problema já não aceita novas propostas no momento
                        porque já possui um profissional ou foi concluído.
                      </p>
                    </div>
                  ) : (
                    <form
                      onSubmit={submitProposal}
                      className="bg-white border border-[#E5E7EB] shadow-sm rounded-2xl p-6 sm:p-8 space-y-6"
                    >
                      {error && (
                        <div className="p-4 bg-red-50 text-red-700 text-sm font-bold border border-red-200 rounded-xl">
                          {error}
                        </div>
                      )}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-xs uppercase tracking-wider font-bold text-slate-700 mb-2">
                            Valor Cobrado
                          </label>
                          <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                              R$
                            </span>
                            <input
                              type="text"
                              required
                              value={
                                formAmount
                                  ? formatCurrency(formAmount)
                                      .replace("R$", "")
                                      .trim()
                                  : ""
                              }
                              onChange={handleBudgetChange}
                              placeholder="0,00"
                              className="w-full pl-10 pr-4 py-3.5 bg-slate-50 border border-slate-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none text-base font-black rounded-xl transition-all"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs uppercase tracking-wider font-bold text-slate-700 mb-2">
                            Prazo Estimado
                          </label>
                          <input
                            type="text"
                            required
                            value={formTime}
                            onChange={(e) => setFormTime(e.target.value)}
                            placeholder="Ex: 2 dias, 4 horas..."
                            className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm font-semibold rounded-xl transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs uppercase tracking-wider font-bold text-slate-700 mb-2">
                          Mensagem para o cliente
                        </label>
                        <textarea
                          required
                          value={formMessage}
                          onChange={(e) => setFormMessage(e.target.value)}
                          placeholder="Descreva por que você é a pessoa certa para este problema..."
                          rows={4}
                          className="w-full px-4 py-3.5 bg-slate-50 border border-slate-200 focus:border-accent focus:ring-1 focus:ring-accent outline-none text-sm rounded-xl transition-all resize-none"
                        />
                      </div>

                      <div className="pt-4 border-t border-[#E5E7EB]">
                        <div className="mb-6 bg-blue-50 border border-blue-200 p-4 rounded-xl flex items-start gap-3 text-blue-800">
                          <Info
                            className="shrink-0 mt-0.5 text-blue-500"
                            size={20}
                          />
                          <div>
                            <h4 className="font-bold text-sm">
                              Atenção antes de enviar
                            </h4>
                            <p className="text-sm mt-0.5 text-blue-700/80">
                              Revise os valores e o prazo. Após enviada, a
                              proposta será definitiva e não poderá ser
                              alterada.
                            </p>
                          </div>
                        </div>
                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-full sm:w-auto px-8 py-3.5 bg-accent text-white font-bold rounded-xl shadow-sm hover:bg-accent/90 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {submitting ? (
                            <Loader2 size={18} className="animate-spin" />
                          ) : (
                            <Check size={18} />
                          )}
                          Enviar Proposta
                        </button>
                      </div>
                    </form>
                  )}
                </section>
              )}
            </div>

            {/* AUTOR PROFILE CARD - RIGHT SIDEBAR */}
            <div className="w-full lg:w-80 shrink-0 space-y-6">
              <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm text-center">
                <div className="p-6">
                  {/* Photo and basic info */}
                  <div className="w-24 h-24 mx-auto rounded-full bg-slate-100 border border-slate-200 overflow-hidden mb-4 shadow-sm flex items-center justify-center">
                    {authorProfile?.avatar_url ? (
                      <img
                        src={authorProfile.avatar_url}
                        alt="Profile"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <UserIcon size={36} className="text-slate-400" />
                    )}
                  </div>
                  <h3 className="text-lg font-black text-slate-800 leading-tight">
                    {authorProfile?.full_name || "Desconhecido"}
                  </h3>
                  {authorProfile?.city && (
                    <p className="text-xs text-slate-500 font-semibold mt-1 flex items-center justify-center gap-1">
                      <MapPin size={12} /> {authorProfile.city}
                    </p>
                  )}
                  {authorProfile?.created_at && (
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-3">
                      Membro desde{" "}
                      {new Date(authorProfile.created_at).getFullYear()}
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 divide-x divide-[#E5E7EB] border-y border-[#E5E7EB] bg-slate-50/50">
                  <div className="p-4 text-center">
                    <span className="block text-xl font-black text-slate-800 mb-0.5">
                      {authorMetrics.published}
                    </span>
                    <span className="block text-[9px] uppercase tracking-wider font-extrabold text-slate-500">
                      Publicados
                    </span>
                  </div>
                  <div className="p-4 text-center">
                    <span className="block text-xl font-black text-slate-800 mb-0.5">
                      {authorMetrics.completed}
                    </span>
                    <span className="block text-[9px] uppercase tracking-wider font-extrabold text-slate-500">
                      Concluídos
                    </span>
                  </div>
                </div>

                {authorProfile?.bio && (
                  <div className="p-6 text-left">
                    <span className="block text-[10px] uppercase tracking-wider font-bold text-slate-400 mb-2">
                      Sobre
                    </span>
                    <p className="text-[13px] text-slate-600 leading-relaxed font-medium line-clamp-4">
                      {authorProfile.bio.split("===")[0].trim()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

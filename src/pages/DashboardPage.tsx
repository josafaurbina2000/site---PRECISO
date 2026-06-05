import { useEffect, useState } from "react";
import { supabase, isSupabaseConfigured } from "../lib/supabase";
import {
  LogOut,
  User,
  Mail,
  Calendar,
  MapPin,
  FileText,
  Compass,
  AlertTriangle,
  Loader2,
  Save,
  Undo,
  Sparkles,
  Building,
  Briefcase,
  Plus,
  Search,
  ArrowRight,
  ChevronRight,
  Info,
  X,
  AlertCircle,
  Smartphone,
  ShieldCheck,
  Eye,
  EyeOff,
  MessageCircle,
  Check,
  Globe,
  Clock,
  Activity,
  List,
  MessageSquare,
  Star,
} from "lucide-react";
import Logo from "../components/Logo";
import LoadingScreen from "../components/LoadingScreen";
import CityAutocompleteInput from "../components/CityAutocompleteInput";
import NeighborhoodAutocompleteInput from "../components/NeighborhoodAutocompleteInput";
import LanguagesAutocompleteInput from "../components/LanguagesAutocompleteInput";
import AvailabilityAutocompleteInput from "../components/AvailabilityAutocompleteInput";
import Sidebar from "../components/dashboard/Sidebar";
import ProblemsFeed from "../components/dashboard/ProblemsFeed";
import ChatsView from "../components/dashboard/ChatsView";

import MyProblems from "../components/dashboard/MyProblems";
import CreateProblemModal from "../components/dashboard/CreateProblemModal";

type Profile = {
  id: string;
  created_at: string;
  full_name: string;
  email: string;
  avatar_url: string;
  city: string;
  bio: string;
  role: "customer" | "solver";
  whatsapp?: string;
  specialties?: string;
  skills?: string;
  portfolio?: string;
  experience?: string;
  gender?: string;
  birthdate?: string;
  neighborhood?: string;
  languages?: string;
  contact_preference?: string;
  availability?: string;
  instagram?: string;
  linkedin?: string;
};

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [schemaWarning, setSchemaWarning] = useState(false);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCompactDate = (date: Date) => {
    const dayName = date.toLocaleDateString("pt-BR", { weekday: "long" });
    const capitalizedDay = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    const timeStr = date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    return `${capitalizedDay} • ${timeStr}`;
  };

  // Navegação Interna da Área Logada
  const [activeView, setActiveView] = useState("overview");
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isCreateProblemModalOpen, setIsCreateProblemModalOpen] =
    useState(false);
  const [feedRefreshTrigger, setFeedRefreshTrigger] = useState(0);

  // Campos do formulário de atualização de perfil
  const [fullName, setFullName] = useState("");
  const [city, setCity] = useState("");
  const [bio, setBio] = useState("");
  const [role, setRole] = useState<"customer" | "solver">("customer");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  // Campos adicionais / complementares do perfil
  const [gender, setGender] = useState("");
  const [birthdate, setBirthdate] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [languages, setLanguages] = useState("");
  const [contactPreference, setContactPreference] = useState("whatsapp");
  const [availability, setAvailability] = useState("");
  const [instagram, setInstagram] = useState("");
  const [linkedin, setLinkedin] = useState("");

  // Campos adicionais profissionais para perfil "Quero Resolver" (solver)
  const [specialties, setSpecialties] = useState("");
  const [skills, setSkills] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [experience, setExperience] = useState("");

  const hasChanges =
    fullName.trim() !== (profile?.full_name || "").trim() ||
    city.trim() !== (profile?.city || "").trim() ||
    bio.trim() !== (profile?.bio || "").trim() ||
    role !== (profile?.role || "customer") ||
    avatarUrl !== (profile?.avatar_url || "") ||
    whatsapp.trim() !== (profile?.whatsapp || "").trim() ||
    gender !== (profile?.gender || "") ||
    birthdate !== (profile?.birthdate || "") ||
    neighborhood.trim() !== (profile?.neighborhood || "").trim() ||
    languages.trim() !== (profile?.languages || "").trim() ||
    contactPreference !== (profile?.contact_preference || "whatsapp") ||
    availability !== (profile?.availability || "") ||
    instagram.trim() !== (profile?.instagram || "").trim() ||
    linkedin.trim() !== (profile?.linkedin || "").trim() ||
    (role === "solver" &&
      (specialties.trim() !== (profile?.specialties || "").trim() ||
        skills.trim() !== (profile?.skills || "").trim() ||
        portfolio.trim() !== (profile?.portfolio || "").trim() ||
        experience.trim() !== (profile?.experience || "").trim()));

  // Estado para validação de Cidade Obrigatória
  const [showCityRequiredModal, setShowCityRequiredModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<
    "publish" | "explore" | null
  >(null);

  const checkCityAndProceed = (action: "publish" | "explore") => {
    if (!city.trim() && !profile?.city?.trim()) {
      setPendingAction(action);
      setShowCityRequiredModal(true);
      return false;
    }
    return true;
  };

  const getProfileCompleteness = () => {
    let score = 0;
    if (fullName && fullName.trim()) score += 15;
    if (city && city.trim()) score += 15;
    if (avatarUrl) score += 15;
    if (bio && bio.trim()) score += 15;
    if (whatsapp && whatsapp.trim()) score += 15;
    if (neighborhood && neighborhood.trim()) score += 10;
    if (gender) score += 5;
    if (birthdate) score += 5;
    if (languages && languages.trim()) score += 5;
    if ((instagram && instagram.trim()) || (linkedin && linkedin.trim()))
      score += 5;
    return score;
  };

  const formatWhatsApp = (value: string) => {
    const digits = value.replace(/\D/g, "");
    const truncated = digits.slice(0, 11);

    if (truncated.length === 0) return "";
    if (truncated.length <= 2) return `(${truncated}`;
    if (truncated.length <= 6)
      return `(${truncated.slice(0, 2)}) ${truncated.slice(2)}`;
    if (truncated.length <= 10)
      return `(${truncated.slice(0, 2)}) ${truncated.slice(2, 6)}-${truncated.slice(6)}`;
    return `(${truncated.slice(0, 2)}) ${truncated.slice(2, 7)}-${truncated.slice(7)}`;
  };

  const getMaskedWhatsapp = (num: string) => {
    if (!num) return "Não cadastrado";
    const cleaned = num.replace(/\D/g, "");
    if (cleaned.length < 4) return "(••) •••••-••••";
    // For Brazilian numbers, format gracefully
    const prefix = cleaned.slice(0, 2);
    const suffix = cleaned.slice(-4);
    return `(${prefix}) 9••••-••${suffix}`;
  };

  const getWhatsAppLink = (num: string) => {
    if (!num) return "#";
    const cleaned = num.replace(/\D/g, "");
    const fullNumber = cleaned.startsWith("55") ? cleaned : `55${cleaned}`;
    return `https://wa.me/${fullNumber}`;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === "string") {
        const img = new Image();
        img.onload = () => {
          // Utiliza diâmetro de 512px para garantir excelente qualidade em telas de alta densidade (Retina/DPI)
          const targetSize = 512;
          const canvas = document.createElement("canvas");
          canvas.width = targetSize;
          canvas.height = targetSize;
          const ctx = canvas.getContext("2d");

          if (ctx) {
            // Habilita filtros de suavização premium
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";

            // Recorta a imagem no centro exato em formato quadrado perfeito para evitar esticar ou achatar a face
            const minDim = Math.min(img.width, img.height);
            const sx = (img.width - minDim) / 2;
            const sy = (img.height - minDim) / 2;

            ctx.drawImage(
              img,
              sx,
              sy,
              minDim,
              minDim, // Pega a porção quadrada central original
              0,
              0,
              targetSize,
              targetSize, // Redimensiona para o canvas de 512x512
            );

            // Exporta em qualidade máxima sem perda visível (qualidade 0.95)
            const highResDataUrl = canvas.toDataURL("image/jpeg", 0.95);
            setAvatarUrl(highResDataUrl);
          } else {
            // Fallback simples
            setAvatarUrl(reader.result as string);
          }
        };
        img.src = reader.result;
      }
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    let active = true;

    async function checkAuthAndFetchProfile() {
      try {
        // 1. Obtém o usuário atualmente autenticado
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) throw sessionError;

        if (!session || !session.user) {
          // Se não houver sessão ativa, redireciona ao home
          window.location.hash = "#";
          return;
        }

        if (active) {
          setUser(session.user);
        }

        const userId = session.user.id;

        // 2. Busca o registro na tabela 'profiles'
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userId)
          .maybeSingle();

        if (profileError && profileError.code !== "PGRST116") {
          throw profileError;
        }

        if (profileData) {
          if (active) {
            setProfile(profileData);
            setFullName(profileData.full_name || "");
            setCity(profileData.city || "");

            // Parser double-safe para carregar dados profissionais e complementares caso não existam colunas separadas
            const bioText = profileData.bio || "";
            let parsedSpecialties = profileData.specialties || "";
            let parsedSkills = profileData.skills || "";
            let parsedPortfolio = profileData.portfolio || "";
            let parsedExperience = profileData.experience || "";

            let parsedGender = profileData?.gender || "";
            let parsedBirthdate = profileData?.birthdate || "";
            let parsedNeighborhood = profileData?.neighborhood || "";
            let parsedLanguages = profileData?.languages || "";
            let parsedContactPref =
              profileData?.contact_preference || "whatsapp";
            let parsedAvailability = profileData?.availability || "";
            let parsedInstagram = profileData?.instagram || "";
            let parsedLinkedIn = profileData?.linkedin || "";

            if (profileData && !("gender" in profileData)) {
              setSchemaWarning(true);
            }

            let cleanBio = bioText;

            // Extrair dados complementares se serializados
            if (bioText.includes("=== DADOS COMPLEMENTARES ===")) {
              const parts = bioText.split("=== DADOS COMPLEMENTARES ===");
              const complementaryPart = parts[1] || "";
              const mainBioAndProfessional = parts[0];

              let currentKey: string | null = null;
              const complementaryLines = complementaryPart.split("\n");
              complementaryLines.forEach((line) => {
                const trimmed = line.trim();

                let isKnownKey = false;
                const knownKeys = [
                  "Gênero",
                  "Nascimento",
                  "Bairro",
                  "Idiomas",
                  "Preferência de Contato",
                  "Disponibilidade",
                  "Instagram",
                  "LinkedIn",
                ];

                const colonIdx = trimmed.indexOf(":");
                if (colonIdx !== -1) {
                  const potentialKey = trimmed.substring(0, colonIdx).trim();
                  if (knownKeys.includes(potentialKey)) {
                    currentKey = potentialKey;
                    isKnownKey = true;
                    const val = trimmed.substring(colonIdx + 1).trim();

                    if (currentKey === "Gênero") parsedGender = val;
                    else if (currentKey === "Nascimento") parsedBirthdate = val;
                    else if (currentKey === "Bairro") parsedNeighborhood = val;
                    else if (currentKey === "Idiomas") parsedLanguages = val;
                    else if (currentKey === "Preferência de Contato")
                      parsedContactPref = val;
                    else if (currentKey === "Disponibilidade")
                      parsedAvailability = val;
                    else if (currentKey === "Instagram") parsedInstagram = val;
                    else if (currentKey === "LinkedIn") parsedLinkedIn = val;
                  }
                }

                if (!isKnownKey && currentKey && trimmed) {
                  if (currentKey === "Disponibilidade") {
                    parsedAvailability = parsedAvailability
                      ? `${parsedAvailability}\n${trimmed}`
                      : trimmed;
                  }
                }
              });

              if (
                mainBioAndProfessional.includes("=== DADOS PROFISSIONAIS ===")
              ) {
                const subParts = mainBioAndProfessional.split(
                  "=== DADOS PROFISSIONAIS ===",
                );
                cleanBio = subParts[0].trim();
                const details = subParts[1] || "";

                const professionalLines = details.split("\n");
                professionalLines.forEach((line) => {
                  const trimmed = line.trim();
                  const idx = trimmed.indexOf(":");
                  if (idx !== -1) {
                    const key = trimmed.substring(0, idx).trim();
                    const val = trimmed.substring(idx + 1).trim();

                    if (key === "Especialidades") parsedSpecialties = val;
                    else if (key === "Habilidades") parsedSkills = val;
                    else if (key === "Portfólio") parsedPortfolio = val;
                    else if (key === "Experiência") parsedExperience = val;
                  }
                });
              } else {
                cleanBio = mainBioAndProfessional.trim();
              }
            } else if (bioText.includes("=== DADOS PROFISSIONAIS ===")) {
              const parts = bioText.split("=== DADOS PROFISSIONAIS ===");
              cleanBio = parts[0].trim();
              const details = parts[1] || "";

              const professionalLines = details.split("\n");
              professionalLines.forEach((line) => {
                const trimmed = line.trim();
                const idx = trimmed.indexOf(":");
                if (idx !== -1) {
                  const key = trimmed.substring(0, idx).trim();
                  const val = trimmed.substring(idx + 1).trim();

                  if (key === "Especialidades") parsedSpecialties = val;
                  else if (key === "Habilidades") parsedSkills = val;
                  else if (key === "Portfólio") parsedPortfolio = val;
                  else if (key === "Experiência") parsedExperience = val;
                }
              });
            }

            // Proactive Data Healing for legacy parser corruption where Instagram or LinkedIn was parsed inside Availability
            if (
              parsedAvailability &&
              parsedAvailability.includes("Instagram:")
            ) {
              const partsAvail = parsedAvailability.split("Instagram:");
              parsedAvailability = partsAvail[0]
                .replace("Instagram:", "")
                .trim();
              if (
                partsAvail[1] &&
                (!parsedInstagram || parsedInstagram === "")
              ) {
                parsedInstagram = partsAvail[1].trim();
              }
            }

            if (
              parsedAvailability &&
              parsedAvailability.includes("LinkedIn:")
            ) {
              const partsAvail = parsedAvailability.split("LinkedIn:");
              parsedAvailability = partsAvail[0]
                .replace("LinkedIn:", "")
                .trim();
              if (partsAvail[1] && (!parsedLinkedIn || parsedLinkedIn === "")) {
                parsedLinkedIn = partsAvail[1].trim();
              }
            }

            setBio(cleanBio);
            setSpecialties(parsedSpecialties);
            setSkills(parsedSkills);
            setPortfolio(parsedPortfolio);
            setExperience(parsedExperience);

            setGender(parsedGender);
            setBirthdate(parsedBirthdate);
            setNeighborhood(parsedNeighborhood);
            setLanguages(parsedLanguages);
            setContactPreference(parsedContactPref || "whatsapp");
            setAvailability(parsedAvailability);
            setInstagram(parsedInstagram);
            setLinkedin(parsedLinkedIn);

            setRole(profileData.role || "customer");
            setAvatarUrl(profileData.avatar_url || "");
            setWhatsapp(profileData.whatsapp || "");
          }
        } else {
          // Fallback: Se por qualquer motivo o perfil correspondente na tabela não existir ainda,
          // criamos um automático com as informações básicas do login.
          const fallbackProfile: Partial<Profile> = {
            id: userId,
            full_name:
              session.user.user_metadata?.full_name || "Usuário do Preciso",
            email: session.user.email || "",
            role: session.user.user_metadata?.role || "customer",
            city: "",
            bio: "",
            avatar_url: session.user.user_metadata?.avatar_url || "",
            whatsapp: "",
            created_at: new Date().toISOString(),
          };

          // Insere o profile no banco de dados
          const { error: insertError } = await supabase
            .from("profiles")
            .upsert(fallbackProfile);

          if (!insertError && active) {
            setProfile(fallbackProfile as Profile);
            setFullName(fallbackProfile.full_name || "");
            setRole(fallbackProfile.role || "customer");
            setAvatarUrl(fallbackProfile.avatar_url || "");
            setWhatsapp("");
            setSpecialties("");
            setSkills("");
            setPortfolio("");
            setExperience("");
          }
        }
      } catch (err: any) {
        if (active) {
          setGlobalError(err.message || "Erro ao coletar dados do perfil.");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    checkAuthAndFetchProfile();

    return () => {
      active = false;
    };
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setGlobalError(null);
    setSuccess(null);

    try {
      let professionalString = "";
      if (role === "solver") {
        professionalString = `\n\n=== DADOS PROFISSIONAIS ===\nEspecialidades: ${specialties}\nHabilidades: ${skills}\nPortfólio: ${portfolio}\nExperiência: ${experience}`;
      }

      const complementaryString = `\n\n=== DADOS COMPLEMENTARES ===\nGênero: ${gender}\nNascimento: ${birthdate}\nBairro: ${neighborhood}\nIdiomas: ${languages}\nPreferência de Contato: ${contactPreference}\nDisponibilidade: ${availability}\nInstagram: ${instagram}\nLinkedIn: ${linkedin}`;

      const serializedBio = `${bio}${professionalString}${complementaryString}`;

      let updatedData: any = {
        id: user.id,
        full_name: fullName,
        city: city,
        bio: serializedBio,
        role: role,
        whatsapp: whatsapp,
        email: user.email,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
        specialties: role === "solver" ? specialties : undefined,
        skills: role === "solver" ? skills : undefined,
        portfolio: role === "solver" ? portfolio : undefined,
        experience: role === "solver" ? experience : undefined,
        gender: gender,
        birthdate: birthdate,
        neighborhood: neighborhood,
        languages: languages,
        contact_preference: contactPreference,
        availability: availability,
        instagram: instagram,
        linkedin: linkedin,
      };

      let { error: updateError } = await supabase
        .from("profiles")
        .upsert(updatedData);

      // Se houver erro de coluna não encontrada (código de erro de banco PGRST102/42703 ou similar),
      // fazemos o fallback automático serializando na bio
      if (
        updateError &&
        (updateError.message?.includes("column") ||
          updateError.code === "PGRST102" ||
          updateError.code === "42703" ||
          updateError.message?.includes("não existe") ||
          updateError.message?.includes("no existe"))
      ) {
        console.warn(
          "Colunas específicas não estão presentes no banco. Salvando via parser fallback.",
        );
        setSchemaWarning(true);

        updatedData = {
          id: user.id,
          full_name: fullName,
          city: city,
          bio: serializedBio,
          role: role,
          whatsapp: whatsapp,
          email: user.email,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        };

        const retryResult = await supabase.from("profiles").upsert(updatedData);

        if (retryResult.error) {
          throw retryResult.error;
        }
      } else if (updateError) {
        throw updateError;
      } else {
        setSchemaWarning(false);
      }

      setProfile(updatedData as any);
      setSuccess("Perfil atualizado com sucesso!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setGlobalError(
        err.message || "Erro ao atualizar dados do banco de dados.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;
    const confirmed = window.confirm(
      "⚠️ EXCLUSÃO DE CONTA PERMANENTE ⚠️\n\nIsso removerá completamente seu perfil e dados do Preciso. Você será deslogado de forma irreversível.\n\nPara alterar seu tipo de perfil, você deverá excluir esta conta e fazer um novo cadastro escolhendo a outra modalidade.\n\nDeseja realmente excluir sua conta agora?",
    );
    if (!confirmed) return;

    setSaving(true);
    setGlobalError(null);
    try {
      // Deleta o perfil público
      const { error: deleteError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", user.id);

      if (deleteError) throw deleteError;

      // Desloga o usuário
      await supabase.auth.signOut();
      window.location.hash = "#cadastro";
    } catch (err: any) {
      setGlobalError(err.message || "Erro ao excluir conta do banco de dados.");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.hash = "#";
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex min-h-screen bg-bg-subtle text-text">
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        isExpanded={isSidebarExpanded}
        setIsExpanded={setIsSidebarExpanded}
        onLogout={handleLogout}
        role={role}
        userName={fullName}
      />

      <div
        className={`flex-1 transition-all duration-300 ${isSidebarExpanded ? "ml-[240px]" : "ml-[80px]"} h-screen overflow-y-auto`}
      >
        {/* Main Dashboard Panel */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Welcome Eyebrow */}
          <div className="mb-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-border/60">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight">
                Olá, {fullName || "Usuário"}!
              </h1>
              <p className="text-text-muted text-sm mt-1">
                {activeView === "overview" && "Bem-vindo ao seu painel"}
                {activeView === "profile" && "Configurações do seu perfil"}
                {activeView === "problems" && "Explore o feed de oportunidades"}
                {activeView === "messages" && "Suas conversas ativas"}
                {activeView === "reputation" && "Seu histórico de confiança"}
              </p>
            </div>

            <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 text-xs font-semibold text-slate-500 shadow-sm">
              <Clock size={13} className="text-[#0ea5e9] shrink-0" />
              <span className="font-bold text-slate-600">
                {formatCompactDate(currentTime)}
              </span>
            </div>
          </div>

          {/* Global Error Alerts */}
          {globalError && (
            <div className="mb-8 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
              <AlertTriangle
                size={20}
                className="shrink-0 mt-0.5 text-red-600"
              />
              <div>
                <h4 className="font-bold mb-1">
                  Algo deu errado com as requisições
                </h4>
                <p className="text-xs opacity-90 leading-relaxed">
                  {globalError}
                </p>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-8">
            {/* Column 1: Profile Summary Card & Sidebar metrics */}
            <div className="md:col-span-1 lg:col-span-1 space-y-6">
              {/* Visual profile detail */}
              <div className="bg-white border border-border rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] text-center animate-fade-in">
                <div className="h-16 w-16 mx-auto rounded-full overflow-hidden border border-border flex items-center justify-center bg-surface-raised mb-4 shadow-sm">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={fullName}
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-accent bg-accent/10">
                      <User size={32} />
                    </div>
                  )}
                </div>

                <h2 className="text-lg font-bold text-text mb-1 leading-snug">
                  {fullName || "Sem nome"}
                </h2>
                <p className="text-xs text-text-faint truncate px-4 mb-4">
                  {user?.email}
                </p>

                {/* Unique Unified Account Badge */}
                <div className="inline-flex flex-col items-center gap-1">
                  <span
                    className={`inline-flex items-center rounded-full px-3.5 py-1.5 text-xs font-bold leading-none ${
                      role === "solver"
                        ? "bg-[#E3F2FD] text-[#0D47A1] border border-[#BBDEFB]"
                        : "bg-[#E8F5E9] text-[#1B5E20] border border-[#C8E6C9]"
                    }`}
                  >
                    {role === "solver"
                      ? "Perfil: Quero Resolver"
                      : "Perfil: Preciso de Ajuda"}
                  </span>
                  <span className="text-[10px] text-text-faint font-semibold mt-1">
                    Conta Verificada
                  </span>
                </div>

                {/* Exibição dos dados profissionais adicionais do perfil (Apenas Solver/Ajudante) */}
                {role === "solver" &&
                  (specialties || skills || experience || portfolio) && (
                    <div className="mt-5 pt-4 border-t border-border/85 text-left space-y-3 text-xs bg-slate-50/40 p-3 rounded-xl">
                      <span className="text-[10px] font-black uppercase text-accent tracking-wider block mb-2">
                        Dados Profissionais
                      </span>
                      {specialties && (
                        <div>
                          <h4 className="font-extrabold text-[#374151] uppercase text-[9px] tracking-wider">
                            Especialidades
                          </h4>
                          <p className="text-text-muted text-[11px] leading-snug mt-0.5">
                            {specialties}
                          </p>
                        </div>
                      )}
                      {skills && (
                        <div>
                          <h4 className="font-extrabold text-[#374151] uppercase text-[9px] tracking-wider">
                            Habilidades
                          </h4>
                          <p className="text-text-muted text-[11px] leading-snug mt-0.5">
                            {skills}
                          </p>
                        </div>
                      )}
                      {experience && (
                        <div>
                          <h4 className="font-extrabold text-[#374151] uppercase text-[9px] tracking-wider">
                            Experiência
                          </h4>
                          <p className="text-text-muted text-[11px] leading-snug mt-0.5">
                            {experience}
                          </p>
                        </div>
                      )}
                      {portfolio && (
                        <div>
                          <h4 className="font-extrabold text-[#374151] uppercase text-[9px] tracking-wider">
                            Portfólio / Website
                          </h4>
                          <a
                            href={
                              portfolio.startsWith("http")
                                ? portfolio
                                : `https://${portfolio}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="text-accent font-semibold hover:underline block truncate text-[11px] leading-snug mt-0.5"
                          >
                            {portfolio}
                          </a>
                        </div>
                      )}
                    </div>
                  )}

                {/* Informações adicionais gerais de identidade para todos os tipos (Customer/Solver) */}
                {(neighborhood ||
                  availability ||
                  contactPreference ||
                  instagram ||
                  linkedin ||
                  languages ||
                  gender ||
                  birthdate) && (
                  <div className="mt-4 pt-4 border-t border-border/80 text-left space-y-3 text-xs">
                    <span className="text-[10px] font-black uppercase text-[#4B5563] tracking-wider block mb-2">
                      Dados do Perfil
                    </span>

                    {neighborhood && (
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-text-faint font-medium">
                          Bairro/Região:
                        </span>
                        <strong className="text-text-secondary">
                          {neighborhood}
                        </strong>
                      </div>
                    )}
                    {gender && (
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-text-faint font-medium">
                          Gênero:
                        </span>
                        <strong className="text-text-secondary capitalize">
                          {gender}
                        </strong>
                      </div>
                    )}
                    {birthdate && (
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-text-faint font-medium">
                          Nascimento:
                        </span>
                        <strong className="text-text-secondary">
                          {new Date(birthdate + "T00:00:00").toLocaleDateString(
                            "pt-BR",
                          )}
                        </strong>
                      </div>
                    )}
                    {languages && (
                      <div className="flex flex-col gap-0.5 text-[11px] border-b border-dashed border-slate-100 pb-2">
                        <span className="text-text-faint font-medium">
                          Idiomas:
                        </span>
                        <strong className="text-text-secondary font-bold text-left block text-wrap leading-relaxed">
                          {languages}
                        </strong>
                      </div>
                    )}
                    {availability && (
                      <div className="flex flex-col gap-0.5 text-[11px] border-b border-dashed border-slate-100 pb-2">
                        <span className="text-text-faint font-medium">
                          Horários de Atendimento / Disponibilidade:
                        </span>
                        <strong className="text-text-secondary font-bold text-left block whitespace-pre-line leading-relaxed">
                          {availability}
                        </strong>
                      </div>
                    )}
                    {contactPreference && (
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-text-faint font-medium">
                          Pref. Contato:
                        </span>
                        <span className="bg-[#E0F2FE] text-[#0369A1] font-bold px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wide">
                          {contactPreference === "whatsapp"
                            ? "WhatsApp"
                            : contactPreference === "email"
                              ? "E-mail"
                              : "Ligação"}
                        </span>
                      </div>
                    )}
                    {(instagram || linkedin) && (
                      <div className="pt-2 flex items-center gap-2 border-t border-dashed border-slate-200">
                        {instagram && (
                          <a
                            href={
                              instagram.startsWith("http")
                                ? instagram
                                : `https://instagram.com/${instagram.replace("@", "")}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-[11px] font-bold text-[#E1306C] hover:underline"
                          >
                            <span className="w-3.5 h-3.5 rounded bg-[#E1306C]/10 text-[#E1306C] text-[8px] font-black flex items-center justify-center">
                              IG
                            </span>
                            <span>Instagram</span>
                          </a>
                        )}
                        {linkedin && (
                          <a
                            href={
                              linkedin.startsWith("http")
                                ? linkedin
                                : `https://linkedin.com/in/${linkedin}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center gap-1.5 text-[11px] font-bold text-[#0077B5] hover:underline ml-auto"
                          >
                            <span className="w-3.5 h-3.5 rounded bg-[#0077B5]/10 text-[#0077B5] text-[8px] font-black flex items-center justify-center">
                              LN
                            </span>
                            <span>LinkedIn</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Visual profile completeness meter */}
              <div className="bg-white border border-border rounded-2xl p-5 shadow-[0_2px_12px_rgba(0,0,0,0.01)] text-left animate-fade-in space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-black uppercase text-[#111827] tracking-wider flex items-center gap-1.5">
                    <Activity size={13} className="text-accent" />
                    Força do Perfil
                  </h3>
                  <span className="text-xs font-bold text-accent">
                    {getProfileCompleteness()}%
                  </span>
                </div>

                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-accent h-full rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${getProfileCompleteness()}%` }}
                  />
                </div>

                <div className="text-[10px] text-[#6B7280] leading-normal font-semibold">
                  {getProfileCompleteness() < 100 ? (
                    <p className="flex items-center gap-1">
                      <span className="text-amber-500">●</span> Preencha mais
                      campos no seu perfil para alcançar 100%!
                    </p>
                  ) : (
                    <p className="flex items-center gap-1 text-emerald-600 font-extrabold">
                      <span>✓</span> Perfil super completo e pronto para ser
                      exposto!
                    </p>
                  )}
                </div>
              </div>

              {/* Metrics Dashboard Widget (Always visible on sidebar) */}
              <div className="bg-white border border-border rounded-2xl p-6 shadow-[0_2px_12px_rgba(0,0,0,0.01)] text-left">
                <h3 className="text-xs font-black uppercase text-text-secondary tracking-wider mb-4 flex items-center gap-2">
                  <Compass size={13} className="text-accent" />
                  Métricas e Reputação
                </h3>

                {role === "solver" ? (
                  /* Solver Metrics */
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="bg-surface-raised p-3 border border-border/80 rounded-xl">
                      <p className="text-[10px] text-text-faint uppercase font-bold">
                        Resolvidos
                      </p>
                      <p className="text-xl font-black mt-1 text-text">0</p>
                    </div>
                    <div className="bg-surface-raised p-3 border border-border/80 rounded-xl">
                      <p className="text-[10px] text-text-faint uppercase font-bold">
                        Avaliação
                      </p>
                      <p className="text-xs font-extrabold mt-2 text-text-faint leading-none">
                        —
                      </p>
                    </div>
                    <div className="bg-surface-raised p-3 border border-border/80 rounded-xl">
                      <p className="text-[10px] text-text-faint uppercase font-bold">
                        Atendidos
                      </p>
                      <p className="text-xl font-black mt-1 text-text">0</p>
                    </div>
                    <div className="bg-surface-raised p-3 border border-border/80 rounded-xl">
                      <p className="text-[10px] text-text-faint uppercase font-bold">
                        Conclusão
                      </p>
                      <p className="text-xs font-extrabold mt-2 text-text-faint leading-none">
                        —
                      </p>
                    </div>
                  </div>
                ) : (
                  /* Customer Metrics */
                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="bg-surface-raised p-3 border border-border/80 rounded-xl">
                      <p className="text-[10px] text-text-faint uppercase font-bold">
                        Criados
                      </p>
                      <p className="text-xl font-black mt-1 text-text">0</p>
                    </div>
                    <div className="bg-surface-raised p-3 border border-border/80 rounded-xl">
                      <p className="text-[10px] text-text-faint uppercase font-bold">
                        Resolvidos
                      </p>
                      <p className="text-xl font-black mt-1 text-text">0</p>
                    </div>
                    <div className="col-span-2 bg-surface-raised p-3 border border-border/80 rounded-xl">
                      <p className="text-[10px] text-text-faint uppercase font-bold">
                        Soluções Recebidas
                      </p>
                      <p className="text-xl font-black mt-1 text-text">0</p>
                    </div>
                  </div>
                )}

                <div className="mt-4 pt-4 border-t border-border/60">
                  <h4 className="text-[11px] font-bold text-text-secondary mb-2">
                    Resumo Geral
                  </h4>
                  <ul className="space-y-2 text-[11px] text-text-muted">
                    <li className="flex justify-between">
                      <span>Cidade ativa:</span>
                      <strong className="text-text">
                        {city || "Não informada"}
                      </strong>
                    </li>
                    <li className="flex justify-between">
                      <span>Tipo do Perfil:</span>
                      <strong className="text-text">
                        {role === "solver" ? "Ajudante" : "Interessado"}
                      </strong>
                    </li>
                    <li className="flex justify-between">
                      <span>WhatsApp:</span>
                      <strong className="text-text">
                        {whatsapp ? "Definido" : "Não cadastrado"}
                      </strong>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Column 2: Dinamic tab rendering */}
            <div className="md:col-span-2 lg:col-span-3 space-y-6">
              {activeView === "overview" ? (
                <div className="space-y-6">
                  {role === "customer" ? (
                    /* Customer Dashboard Home */
                    <div className="animate-fade-in space-y-6">
                      <div className="bg-white border border border-slate-100 rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all">
                        <div className="mb-6">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-2">
                            <Sparkles size={14} className="animate-pulse" />
                            Painel de Ajuda
                          </h3>
                          <p className="text-xl font-bold text-text mt-1">
                            O que você precisa resolver hoje?
                          </p>
                        </div>
                        <div className="flex gap-4">
                          <button
                            onClick={() => {
                              if (checkCityAndProceed("publish")) {
                                setIsCreateProblemModalOpen(true);
                              }
                            }}
                            className="flex items-center gap-2 bg-accent text-white font-bold text-sm px-6 py-3.5 rounded-xl shadow-lg shadow-accent/20 hover:bg-accent/90 transition-all group"
                          >
                            <Plus
                              size={18}
                              className="transition-transform group-hover:scale-110"
                            />
                            Publicar Novo Problema
                          </button>
                        </div>
                      </div>

                      <MyProblems
                        key={feedRefreshTrigger}
                        userId={user?.id}
                        onCreateClick={() => {
                          if (checkCityAndProceed("publish")) {
                            setIsCreateProblemModalOpen(true);
                          }
                        }}
                      />
                    </div>
                  ) : (
                    /* Solver Dashboard Home */
                    <div className="animate-fade-in space-y-6">
                      <div className="bg-white border border-slate-100 rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all">
                        <div className="mb-2">
                          <h3 className="text-xs font-bold uppercase tracking-wider text-accent flex items-center gap-2">
                            <Search size={14} />
                            Oportunidades
                          </h3>
                          <p className="text-xl font-bold text-text mt-1">
                            Problemas disponíveis na sua região
                          </p>
                        </div>
                      </div>

                      <ProblemsFeed
                        key={feedRefreshTrigger}
                        city={city || ""}
                      />
                    </div>
                  )}
                </div>
              ) : activeView === "profile" ? (
                /* TAB 2: PROFILE CONFIGURATION (EDIT FORM DATABASE INTERACTION) */
                <div className="bg-white border border-border rounded-2xl p-8 shadow-[0_2px_12px_rgba(0,0,0,0.01)] animate-fade-in">
                  {/* Back Link */}
                  <button
                    onClick={() => setActiveView("overview")}
                    className="mb-6 inline-flex items-center gap-1.5 text-xs font-bold text-accent hover:underline cursor-pointer"
                  >
                    <Undo size={14} />
                    Voltar para o Início
                  </button>

                  <div className="mb-6 flex justify-between items-center pb-4 border-b">
                    <div>
                      <h2 className="text-xl font-bold">
                        Configuração de Perfil
                      </h2>
                      <p className="text-xs text-text-muted mt-1">
                        Altere seus dados reais gravados na tabela `profiles`
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleUpdateProfile} className="space-y-5">
                    {success && (
                      <div className="flex gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 animate-fade-in/10">
                        <span>{success}</span>
                      </div>
                    )}

                    {schemaWarning && (
                      <div className="flex flex-col gap-3 rounded-xl border border-amber-300 bg-amber-50/40 p-5 text-xs text-amber-900 animate-fade-in [text-align:left]">
                        <div className="flex gap-2.5 items-start">
                          <AlertTriangle
                            size={18}
                            className="text-amber-600 shrink-0 mt-0.5"
                          />
                          <div>
                            <h4 className="font-bold text-amber-950 text-sm mb-1">
                              Ajuste SQL de Banco de Dados Recomendado
                            </h4>
                            <p className="leading-relaxed">
                              Detectamos que faltam as colunas adicionais para
                              salvar os dados individualmente na tabela{" "}
                              <code className="font-mono bg-amber-100/80 px-1 py-0.5 rounded text-[10px] font-bold text-amber-950">
                                profiles
                              </code>{" "}
                              de seu Supabase.
                              <strong>
                                {" "}
                                Seus campos foram salvos com sucesso
                              </strong>{" "}
                              usando o nosso sistema inteligente de fallback (na
                              coluna{" "}
                              <code className="font-mono bg-amber-100/80 px-1 py-0.5 rounded text-[10px] font-bold text-amber-950">
                                bio
                              </code>
                              ), mas para habilitar buscas e filtros futuros,
                              recomendamos que você execute o SQL abaixo em seu
                              painel do Supabase:
                            </p>
                          </div>
                        </div>

                        <div className="bg-slate-900 text-slate-100 font-mono text-[11px] p-3 rounded-lg border border-slate-800 relative select-all scrollbar-thin">
                          <pre className="overflow-x-auto whitespace-pre leading-relaxed text-slate-200">
                            {`ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS gender text,
ADD COLUMN IF NOT EXISTS birthdate text,
ADD COLUMN IF NOT EXISTS neighborhood text,
ADD COLUMN IF NOT EXISTS languages text,
ADD COLUMN IF NOT EXISTS contact_preference text,
ADD COLUMN IF NOT EXISTS availability text,
ADD COLUMN IF NOT EXISTS instagram text,
ADD COLUMN IF NOT EXISTS linkedin text,
ADD COLUMN IF NOT EXISTS specialties text,
ADD COLUMN IF NOT EXISTS skills text,
ADD COLUMN IF NOT EXISTS portfolio text,
ADD COLUMN IF NOT EXISTS experience text;`}
                          </pre>
                        </div>
                        <p className="text-[10px] text-amber-800/95 leading-relaxed font-semibold">
                          💡 Copie e execute o comando acima no editor SQL do
                          seu painel Supabase para criar as novas colunas e
                          desativar o aviso.
                        </p>
                      </div>
                    )}

                    {/* Photo picker & upload */}
                    <div className="flex flex-col sm:flex-row items-center gap-5 p-4 border border-border bg-surface-raised rounded-xl">
                      <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-accent/20 flex items-center justify-center bg-white shrink-0 shadow-sm relative group">
                        {avatarUrl ? (
                          <img
                            src={avatarUrl}
                            alt="Avatar de perfil"
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <User size={36} className="text-text-muted" />
                        )}
                      </div>
                      <div className="text-center sm:text-left flex-1">
                        <h4 className="text-sm font-bold text-text">
                          Foto de Perfil
                        </h4>
                        <p className="text-xs text-text-muted mt-1 mb-3">
                          Escolha um arquivo de imagem diretamente para a sua
                          conta do Preciso
                        </p>

                        <div className="flex flex-wrap gap-2.5 justify-center sm:justify-start">
                          <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-accent hover:bg-accent-hover text-white rounded-full text-xs font-bold cursor-pointer transition-colors shadow-[0_2px_8px_rgba(16,185,129,0.15)]">
                            <Plus size={13} />
                            Enviar Foto
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              className="hidden"
                            />
                          </label>
                          {avatarUrl && (
                            <button
                              type="button"
                              onClick={() => setAvatarUrl("")}
                              className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-semibold cursor-pointer transition-colors"
                            >
                              <X size={13} />
                              Remover
                            </button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* SEÇÃO 1: DADOS ESSENCIAIS */}
                    <div className="bg-[#FAFBFD] border border-slate-100 rounded-2xl p-6 space-y-4 shadow-sm">
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                        <div className="h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                          <User size={13} />
                        </div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                          1. Informações Básicas e Identidade
                        </h3>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        {/* Full Name input */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                            Nome e Sobrenome
                          </label>
                          <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="Ex: João Silva"
                            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-text text-sm placeholder:text-text-faint focus:outline-none focus:border-accent transition-colors shadow-none"
                          />
                        </div>

                        {/* City input */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                            Cidade / Estado
                          </label>
                          <CityAutocompleteInput
                            value={city}
                            onChange={setCity}
                            placeholder="Ex: São Paulo, SP"
                          />
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        {/* Neighborhood input */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                            Bairro / Região
                          </label>
                          <NeighborhoodAutocompleteInput
                            value={neighborhood}
                            onChange={setNeighborhood}
                            city={city}
                            placeholder="Ex: Copacabana, Pinheiros, Brooklyn..."
                          />
                        </div>

                        {/* Languages input */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                            Idiomas falados
                          </label>
                          <LanguagesAutocompleteInput
                            value={languages}
                            onChange={setLanguages}
                            placeholder="Ex: Português, Inglês básico"
                          />
                        </div>
                      </div>

                      {/* Bio text area */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                          Biografia / Sobre mim
                        </label>
                        <div className="relative">
                          <span className="absolute top-3 left-3.5 text-text-faint">
                            <FileText size={16} />
                          </span>
                          <textarea
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="Fale um pouco sobre você, seu trabalho de ajudante, ou suas necessidades como cliente do Preciso..."
                            rows={4}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border bg-white text-text text-sm placeholder:text-text-faint focus:outline-none focus:border-accent transition-colors resize-none shadow-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* SEÇÃO 2: DADOS PESSOAIS & DISPONIBILIDADE */}
                    <div className="bg-[#FAFBFD] border border-slate-100 rounded-2xl p-6 space-y-4 shadow-sm">
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                        <div className="h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                          <Calendar size={13} />
                        </div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                          2. Dados de Cadastro e Disponibilidade
                        </h3>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        {/* Gender select input */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                            Gênero
                          </label>
                          <select
                            value={gender}
                            onChange={(e) => setGender(e.target.value)}
                            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-text text-sm focus:outline-none focus:border-accent transition-colors cursor-pointer"
                          >
                            <option value="">Selecione...</option>
                            <option value="masculino">Masculino</option>
                            <option value="feminino">Feminino</option>
                            <option value="não-binário">Não-binário</option>
                            <option value="prefiro não dizer">
                              Prefiro não dizer
                            </option>
                          </select>
                        </div>

                        {/* Birthdate input */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                            Data de Nascimento
                          </label>
                          <input
                            type="date"
                            value={birthdate}
                            onChange={(e) => setBirthdate(e.target.value)}
                            className="w-full rounded-xl border border-border bg-white px-4 py-2.5 text-text text-sm focus:outline-none focus:border-accent transition-colors"
                          />
                        </div>
                      </div>

                      {/* Availability input */}
                      <div>
                        <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                          Seu horário preferencial de atendimento / contato
                        </label>
                        <AvailabilityAutocompleteInput
                          value={availability}
                          onChange={setAvailability}
                          placeholder="Ex: Seg a Sex das 08:00 às 18:00 | Sábado de manhã"
                        />
                      </div>
                    </div>

                    {/* SEÇÃO 3: CONTATO E REDES SOCIAIS */}
                    <div className="bg-[#FAFBFD] border border-slate-200/60 rounded-2xl p-6 space-y-4 shadow-sm">
                      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
                        <div className="h-6 w-6 rounded-full bg-accent/10 flex items-center justify-center text-accent">
                          <Smartphone size={13} />
                        </div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#374151]">
                          3. Canais de Contato e Conexões
                        </h3>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        {/* WhatsApp input with premium lock indicator */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2 flex items-center gap-1.5">
                            WhatsApp Principal
                          </label>
                          <div className="relative">
                            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-text-muted font-bold text-xs border-r border-[#E5E7EB] pr-3 select-none">
                              +55
                            </span>
                            <input
                              type="text"
                              value={whatsapp}
                              onChange={(e) => {
                                setWhatsapp(formatWhatsApp(e.target.value));
                              }}
                              placeholder="Ex: (11) 98765-4321"
                              className="w-full pl-16 pr-4 py-3 rounded-xl border border-border bg-white text-text text-sm placeholder:text-text-faint focus:outline-none focus:border-accent transition-colors"
                            />
                          </div>
                        </div>

                        {/* Contact preference select option */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                            Preferência de Contato
                          </label>
                          <select
                            value={contactPreference}
                            onChange={(e) =>
                              setContactPreference(e.target.value)
                            }
                            className="w-full rounded-xl border border-border bg-white px-4 py-3 text-text text-sm focus:outline-none focus:border-accent transition-colors cursor-pointer"
                          >
                            <option value="whatsapp">
                              Prefiro somente WhatsApp
                            </option>
                            <option value="email">
                              Prefiro receber E-mail
                            </option>
                            <option value="call">
                              Aceito receber ligações normais
                            </option>
                          </select>
                        </div>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-4">
                        {/* Instagram input */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#E1306C] mb-2 flex items-center gap-1.5">
                            <span className="text-[10px] bg-[#E1306C]/10 text-[#E1306C] font-black px-1 py-0.5 rounded">
                              IG
                            </span>
                            Instagram (Nome de usuário)
                          </label>
                          <input
                            type="text"
                            value={instagram}
                            onChange={(e) => setInstagram(e.target.value)}
                            placeholder="Ex: @seu_usuario"
                            className="w-full rounded-xl border border-[#F3E8FF] bg-white px-4 py-3 text-text text-sm placeholder:text-text-faint focus:outline-none focus:border-[#E1306C]/70 transition-colors"
                          />
                        </div>

                        {/* LinkedIn input */}
                        <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-[#0077B5] mb-2 flex items-center gap-1.5">
                            <span className="text-[10px] bg-[#0077B5]/10 text-[#0077B5] font-black px-1 py-0.5 rounded">
                              LN
                            </span>
                            LinkedIn (Apenas o nome de usuário)
                          </label>
                          <input
                            type="text"
                            value={linkedin}
                            onChange={(e) => setLinkedin(e.target.value)}
                            placeholder="Ex: joao-silva-ajuda"
                            className="w-full rounded-xl border border-[#E0F2FE] bg-white px-4 py-3 text-text text-sm placeholder:text-text-faint focus:outline-none focus:border-[#0077B5]/70 transition-colors"
                          />
                        </div>
                      </div>

                      <div className="flex gap-2.5 text-xs text-text-muted bg-slate-50/50 p-4 rounded-xl border border-slate-100">
                        <ShieldCheck
                          size={16}
                          className="text-emerald-500 shrink-0 mt-0.5"
                        />
                        <p className="leading-relaxed">
                          <strong className="text-text">
                            Segurança de Dados Compartilhados:
                          </strong>{" "}
                          O seu número real do WhatsApp e canais de contato
                          direto estarão{" "}
                          <span className="text-accent font-semibold">
                            totalmente seguros e ocultos
                          </span>{" "}
                          para visitantes genéricos. Eles só serão
                          compartilhados quando as propostas de auxílio/vagas de
                          trabalho forem mutuamente aceitas.
                        </p>
                      </div>
                    </div>

                    {/* SEÇÃO 4: QUALIFICAÇÕES PROFISSIONAIS (Condicional Solver) */}
                    {role === "solver" && (
                      <div className="border border-indigo-100 bg-indigo-50/10 rounded-2xl p-6 space-y-4 animate-fade-in">
                        <div className="flex items-center gap-2 pb-2.5 border-b border-indigo-100/50">
                          <Sparkles size={16} className="text-accent" />
                          <h4 className="text-xs font-extrabold uppercase tracking-widest text-[#1E3A8A]">
                            4. Qualificações Profissionais (Ajudante / Resolver)
                          </h4>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          {/* Specialties input */}
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                              Especialidades principais
                            </label>
                            <input
                              type="text"
                              value={specialties}
                              onChange={(e) => setSpecialties(e.target.value)}
                              placeholder="Ex: Encanamento, Pet Sitting, Limpeza"
                              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-text text-sm placeholder:text-text-faint focus:outline-none focus:border-indigo-400 transition-colors shadow-sm"
                            />
                          </div>

                          {/* Skills input */}
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                              Habilidades Chave
                            </label>
                            <input
                              type="text"
                              value={skills}
                              onChange={(e) => setSkills(e.target.value)}
                              placeholder="Ex: Troca de registros, reparo de vazamentos"
                              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-text text-sm placeholder:text-text-faint focus:outline-none focus:border-indigo-400 transition-colors shadow-sm"
                            />
                          </div>

                          {/* Experience input */}
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                              Tempo de Experiência / Atuação
                            </label>
                            <input
                              type="text"
                              value={experience}
                              onChange={(e) => setExperience(e.target.value)}
                              placeholder="Ex: 5 anos de experiência prática"
                              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-text text-sm placeholder:text-text-faint focus:outline-none focus:border-indigo-400 transition-colors shadow-sm"
                            />
                          </div>

                          {/* Portfolio input */}
                          <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-text-muted mb-2">
                              Link do Portfólio ou Website
                            </label>
                            <input
                              type="text"
                              value={portfolio}
                              onChange={(e) => setPortfolio(e.target.value)}
                              placeholder="Ex: instagram.com/servico-joao"
                              className="w-full rounded-xl border border-border bg-white px-4 py-3 text-text text-sm placeholder:text-text-faint focus:outline-none focus:border-indigo-400 transition-colors shadow-sm"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Locked Role Warning and Permanent Rule Explanation */}
                    <div className="p-5 border border-amber-200 bg-amber-50 rounded-2xl space-y-3.5">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={16} className="text-amber-700" />
                        <h4 className="text-xs font-black uppercase tracking-wider text-amber-900">
                          Tipo de Perfil Permanente
                        </h4>
                      </div>
                      <p className="text-xs text-amber-800 leading-relaxed">
                        Sua conta do Preciso está definida no modo{" "}
                        <strong className="underline">
                          {role === "solver"
                            ? "Ajudante (Quero Resolver)"
                            : "Interessado (Preciso de Ajuda)"}
                        </strong>
                        . Esta escolha realizada no momento do cadastro é
                        permanente e não pode ser convertida diretamente.
                      </p>
                      <p className="text-[11px] text-amber-700">
                        Caso deseje alterar sua função para a outra modalidade,
                        você precisa clicar abaixo para remover sua conta e
                        cadastrar-se novamente.
                      </p>

                      <button
                        type="button"
                        onClick={handleDeleteAccount}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm"
                      >
                        <X size={14} />
                        Excluir Conta Permanentemente
                      </button>
                    </div>

                    {/* Submit button */}
                    <div className="pt-2 flex justify-end">
                      <button
                        type="submit"
                        disabled={!hasChanges || saving}
                        className={`flex items-center gap-2 rounded-full font-semibold text-xs px-6 py-3.5 transition-all duration-300 ${
                          hasChanges && !saving
                            ? "bg-accent hover:bg-accent-hover text-white shadow-md cursor-pointer"
                            : "bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-80"
                        }`}
                      >
                        {saving ? (
                          <>
                            <Loader2 size={14} className="animate-spin" />
                            Gravando...
                          </>
                        ) : (
                          <>
                            <Save size={14} />
                            Salvar dados
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              ) : activeView === "problems" ? (
                <div className="bg-white border text-center border-border rounded-2xl p-8 animate-fade-in shadow-sm py-20 flex flex-col items-center">
                  <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mb-4">
                    <List size={24} />
                  </div>
                  <h2 className="text-xl font-bold mb-2">Seus Problemas</h2>
                  <p className="text-sm text-slate-500 mb-6">
                    Em breve você poderá gerenciar as postagens aqui de forma
                    dedicada.
                  </p>
                  <button
                    onClick={() => setActiveView("overview")}
                    className="text-accent font-bold hover:underline"
                  >
                    Voltar ao Início
                  </button>
                </div>
              ) : activeView === "messages" ? (
                <ChatsView user={user} role={role} />
              ) : activeView === "reputation" ? (
                <div className="bg-white border text-center border-border rounded-2xl p-8 animate-fade-in shadow-sm py-20 flex flex-col items-center">
                  <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center mb-4">
                    <Star size={24} />
                  </div>
                  <h2 className="text-xl font-bold mb-2">
                    Reputação e Confiança
                  </h2>
                  <p className="text-sm text-slate-500 mb-6">
                    Seu histórico e avaliações recebidas ficarão aqui.
                  </p>
                  <button
                    onClick={() => setActiveView("overview")}
                    className="text-accent font-bold hover:underline"
                  >
                    Voltar ao Início
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </main>

        {/* MODAL: CIDADE OBRIGATÓRIA DETECTADA */}
        {showCityRequiredModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-fade-in">
            <div className="bg-white border border-border rounded-2xl max-w-sm w-full p-6 shadow-2xl relative">
              <button
                onClick={() => setShowCityRequiredModal(false)}
                className="absolute top-4 right-4 text-text-faint hover:text-text p-1 transition-colors rounded-lg bg-surface-raised hover:bg-border/30 cursor-pointer"
              >
                <X size={16} />
              </button>
              <div className="flex gap-3 mb-4">
                <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <MapPin size={22} />
                </div>
                <div>
                  <span className="text-[10px] uppercase font-black text-amber-600 tracking-widest block mb-0.5">
                    Localização Necessária
                  </span>
                  <h3 className="text-lg font-bold text-text leading-snug">
                    Cidade Obrigatória
                  </h3>
                </div>
              </div>

              <p className="text-xs text-text-muted leading-relaxed mb-4">
                Para publicar ou explorar problemas e ajudar alguém no{" "}
                <strong>Preciso</strong>, você precisa necessariamente preencher
                o campo de <strong>Cidade / Estado</strong> no seu perfil.
              </p>

              {/* Quick mini-form input */}
              <div className="bg-slate-50 border border-border p-4 rounded-xl mb-5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-text-muted mb-2">
                  Qual é a sua Cidade / Estado?
                </label>
                <CityAutocompleteInput
                  value={city}
                  onChange={setCity}
                  placeholder="Ex: São Paulo, SP"
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowCityRequiredModal(false);
                    setActiveTab("profile");
                  }}
                  className="flex-1 flex items-center justify-center rounded-full border border-border bg-surface-raised text-text-secondary font-semibold text-xs h-10 hover:bg-border/25 transition-all cursor-pointer"
                >
                  Editar Perfil Completo
                </button>
                <button
                  onClick={async () => {
                    if (!city.trim()) return;
                    setSaving(true);
                    try {
                      const updatedData = {
                        id: user.id,
                        full_name: fullName,
                        city: city,
                        bio: bio,
                        role: role,
                        whatsapp: whatsapp,
                        email: user?.email || "",
                        avatar_url: avatarUrl,
                        updated_at: new Date().toISOString(),
                      };
                      const { error: updateError } = await supabase
                        .from("profiles")
                        .upsert(updatedData);

                      if (updateError) throw updateError;

                      setProfile(updatedData as any);
                      setShowCityRequiredModal(false);

                      // Proceed to intended action
                      if (pendingAction === "publish") {
                        setIsCreateProblemModalOpen(true);
                      } else if (pendingAction === "explore") {
                        setActiveView("problems");
                      }
                    } catch (err: any) {
                      setGlobalError(err.message || "Erro ao salvar cidade.");
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={!city.trim() || saving}
                  className="flex-1 flex items-center justify-center rounded-full bg-accent hover:bg-accent-hover text-white font-semibold text-xs h-10 transition-all duration-300 disabled:opacity-50 cursor-pointer"
                >
                  {saving ? "Salvando..." : "Confirmar e Ir"}
                </button>
              </div>
            </div>
          </div>
        )}

        <CreateProblemModal
          isOpen={isCreateProblemModalOpen}
          onClose={() => setIsCreateProblemModalOpen(false)}
          onSuccess={() => {
            setFeedRefreshTrigger((prev) => prev + 1);
          }}
          userId={user?.id || ""}
          defaultCity={city || ""}
        />
      </div>
      {/* End flex-1 wrapper */}
    </div>
  );
}

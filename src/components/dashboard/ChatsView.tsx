import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../../lib/supabase";
import {
  Loader2,
  MessageSquare,
  ArrowLeft,
  Send,
  CheckCircle,
  XCircle,
  Info,
  ExternalLink,
  User as UserIcon,
  CheckCheck,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface ChatsViewProps {
  user: any;
  role: "customer" | "solver";
}

export default function ChatsView({ user, role }: ChatsViewProps) {
  const [chats, setChats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState<any | null>(null);

  useEffect(() => {
    fetchChats();
  }, [user]);

  const fetchChats = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("chats")
        .select(
          `
          id, updated_at, problem_id, author_id, solver_id,
          problems (title, status),
          author:profiles!chats_author_id_fkey(full_name, avatar_url),
          solver:profiles!chats_solver_id_fkey(full_name, avatar_url)
        `,
        )
        .or(`author_id.eq.${user.id},solver_id.eq.${user.id}`)
        .order("updated_at", { ascending: false });

      if (error && error.code !== "PGRST205") console.error(error);

      if (data) setChats(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-accent" size={32} />
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="bg-white border text-center border-slate-200 rounded-2xl p-8 shadow-sm flex flex-col items-center py-20">
        <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center mb-4">
          <MessageSquare size={24} />
        </div>
        <h2 className="text-xl font-bold mb-2 text-slate-800">
          Nenhuma conversa encontrada
        </h2>
        <p className="text-sm text-slate-500 max-w-md">
          As conversas serão criadas automaticamente assim que um profissional
          for escolhido para um problema.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm flex overflow-hidden min-h-[600px] h-[75vh]">
      {/* Lista de Chats */}
      <div
        className={`${activeChat ? "hidden sm:flex" : "flex"} flex-col w-full sm:w-80 border-r border-[#E5E7EB] shrink-0`}
      >
        <div className="p-4 border-b border-[#E5E7EB] bg-slate-50">
          <h2 className="font-bold text-slate-800">Mensagens</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {chats.map((chat) => {
            const isAuthor = chat.author_id === user.id;
            const otherPerson = isAuthor ? chat.solver : chat.author;
            const title = chat.problems?.title || "Problema excluído";

            return (
              <button
                key={chat.id}
                onClick={() => setActiveChat(chat)}
                className={`w-full text-left p-4 border-b border-[#E5E7EB] transition-colors flex gap-3 items-center ${activeChat?.id === chat.id ? "bg-slate-50" : "hover:bg-slate-50"}`}
              >
                <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-slate-200 bg-slate-100 flex items-center justify-center">
                  {otherPerson?.avatar_url ? (
                    <img
                      src={otherPerson.avatar_url}
                      className="w-full h-full object-cover"
                      alt=""
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <UserIcon size={20} className="text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-bold text-slate-800 text-sm truncate">
                      {otherPerson?.full_name || "Usuário"}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-semibold truncate block">
                    {title}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Janela de Chat */}
      <div
        className={`flex-1 flex flex-col min-w-0 bg-slate-50/50 ${!activeChat ? "hidden sm:flex items-center justify-center" : ""}`}
      >
        {activeChat ? (
          <ActiveChatWindow
            chat={activeChat}
            user={user}
            onBack={() => setActiveChat(null)}
          />
        ) : (
          <div className="text-center">
            <MessageSquare size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold">
              Selecione uma conversa para começar
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ActiveChatWindow({
  chat,
  user,
  onBack,
}: {
  chat: any;
  user: any;
  onBack: () => void;
}) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isAuthor = chat.author_id === user.id;
  const otherPerson = isAuthor ? chat.solver : chat.author;

  useEffect(() => {
    fetchMessages();

    const channel = supabase
      .channel(`public:messages:chat_id=eq.${chat.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chat.id}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [chat.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = async () => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("chat_id", chat.id)
      .order("created_at", { ascending: true });
    if (data) setMessages(data);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    const msg = newMessage.trim();
    setNewMessage("");

    await supabase.from("messages").insert([
      {
        chat_id: chat.id,
        user_id: user.id,
        content: msg,
      },
    ]);

    setSending(false);
  };

  const handleComplete = async () => {
    if (!confirm("Tem certeza que deseja marcar este serviço como concluído?"))
      return;
    try {
      await supabase
        .from("problems")
        .update({ status: "resolved" })
        .eq("id", chat.problem_id);
      chat.problems.status = "resolved";
    } catch (err) {}
  };

  const handleCancel = async () => {
    if (
      !confirm(
        "Tem certeza que deseja cancelar a contratação? Isso liberará o problema de volta ao status 'Aberto'.",
      )
    )
      return;
    try {
      // Return problem status to open
      await supabase
        .from("problems")
        .update({ status: "open" })
        .eq("id", chat.problem_id);
      // Delete the chat
      await supabase.from("chats").delete().eq("id", chat.id);
      // Proposals could be updated or just let the problem be open
      await supabase
        .from("proposals")
        .update({ status: "pending" })
        .eq("solver_id", chat.solver_id)
        .eq("problem_id", chat.problem_id);

      onBack(); // go back to list
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="h-16 px-4 border-b border-[#E5E7EB] bg-white flex items-center justify-between shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="sm:hidden p-2 -ml-2 text-slate-400 hover:text-slate-800"
          >
            <ArrowLeft size={20} />
          </button>

          <div className="w-10 h-10 rounded-full border border-slate-200 overflow-hidden bg-slate-100 flex items-center justify-center">
            {otherPerson?.avatar_url ? (
              <img
                src={otherPerson.avatar_url}
                className="w-full h-full object-cover"
              />
            ) : (
              <UserIcon size={20} className="text-slate-400" />
            )}
          </div>
          <div>
            <h3 className="font-bold text-slate-800 text-sm leading-tight">
              {otherPerson?.full_name || "Usuário"}
            </h3>
            <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              {chat.problems?.title}
            </p>
          </div>
        </div>

        {/* Ações do Chat */}
        {isAuthor && chat.problems?.status === "in_progress" && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleCancel}
              className="text-xs text-rose-500 hover:bg-rose-50 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
            >
              <XCircle size={14} /> Cancelar Contratação
            </button>
            <button
              onClick={handleComplete}
              className="text-xs bg-emerald-100 text-emerald-800 hover:bg-emerald-200 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
            >
              <CheckCircle size={14} /> Concluir Serviço
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4" ref={scrollRef}>
        {messages.map((msg) => {
          const isMine = msg.user_id === user.id;
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMine ? "items-end" : "items-start"}`}
            >
              <div
                className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-[13px] sm:text-sm font-medium ${isMine ? "bg-[#0F172A] text-white rounded-tr-sm" : "bg-white border border-[#E5E7EB] text-slate-700 rounded-tl-sm shadow-sm"}`}
              >
                {msg.content}
              </div>
              <div className="flex items-center gap-1 mt-1 text-[10px] text-slate-400">
                {new Date(msg.created_at).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
                {isMine && (
                  <CheckCheck
                    size={12}
                    className={msg.read_at ? "text-blue-500" : "text-slate-300"}
                  />
                )}
              </div>
            </div>
          );
        })}
        {messages.length === 0 && (
          <div className="text-center text-slate-400 text-sm font-medium mt-10">
            Nenhuma mensagem enviada ainda. Diga olá!
          </div>
        )}
      </div>

      {/* Input */}
      {chat.problems?.status === "in_progress" ||
      chat.problems?.status === "open" ? (
        <div className="p-4 bg-white border-t border-[#E5E7EB] shrink-0">
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Digite sua mensagem..."
              className="flex-1 bg-slate-50 border border-slate-200 rounded-full px-4 py-2.5 text-sm outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition"
            />
            <button
              type="submit"
              disabled={sending || !newMessage.trim()}
              className="bg-slate-800 text-white w-10 h-10 rounded-full flex items-center justify-center shrink-0 disabled:opacity-50 transition active:scale-95"
            >
              {sending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={16} className="-ml-0.5" />
              )}
            </button>
          </form>
        </div>
      ) : (
        <div className="p-4 bg-slate-100 border-t border-slate-200 shrink-0 text-center text-xs font-bold text-slate-500 uppercase tracking-widest">
          Este serviço foi finalizado. O chat está arquivado.
        </div>
      )}
    </>
  );
}

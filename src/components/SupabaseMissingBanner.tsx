import { AlertCircle } from "lucide-react";

export default function SupabaseMissingBanner() {
  return (
    <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-6 mb-6 text-left max-w-md mx-auto">
      <div className="flex gap-3">
        <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={20} />
        <div>
          <h4 className="text-sm font-bold text-text mb-1">
            Chaves do Supabase Pendentes
          </h4>
          <p className="text-xs text-text-muted leading-relaxed">
            Para fazer a autenticação real funcionar, configure as seguintes variáveis de ambiente no painel do AI Studio:
          </p>
          <ul className="mt-2 space-y-1 text-[11px] font-mono text-text-secondary bg-surface-raised border border-border rounded-lg p-2.5">
            <li>VITE_SUPABASE_URL</li>
            <li>VITE_SUPABASE_ANON_KEY</li>
          </ul>
          <p className="text-xs text-text-faint mt-3">
            Até que sejam configuradas, o sistema exibirá os fluxos, mas as requisições falharão.
          </p>
        </div>
      </div>
    </div>
  );
}

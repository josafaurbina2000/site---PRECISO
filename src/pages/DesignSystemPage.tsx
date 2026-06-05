import { ArrowLeft, ArrowRight } from "lucide-react";
import type { ReactNode } from "react";
import Logo from "../components/Logo";

/**
 * Design System — Updated for dark theme.
 */

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-bg text-text">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-white/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <Logo />
          <a
            href="#"
            className="flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium text-text-secondary hover:text-text hover:border-border-subtle transition-colors"
          >
            <ArrowLeft size={16} />
            Voltar
          </a>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-16">
        {/* Hero */}
        <div className="mb-20">
          <p className="text-accent text-sm font-medium mb-4">Design System</p>
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-text mb-4">
            Componentes do Preciso
          </h1>
          <p className="text-lg text-text-muted max-w-2xl">
            Sistema visual baseado em tipografia, espaçamento e hierarquia.
            Dark-first, minimal, profissional.
          </p>
        </div>

        <div className="space-y-24">
          {/* Colors */}
          <Section title="Cores" description="Paleta light com verde como cor de destaque.">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <ColorSwatch name="Background" color="bg-bg" value="#FFFFFF" />
              <ColorSwatch name="Surface" color="bg-surface-raised" value="#F9FAFB" />
              <ColorSwatch name="Border" color="bg-border" value="#E5E7EB" />
              <ColorSwatch name="Accent" color="bg-accent" value="#10B981" />
              <ColorSwatch name="Text" color="bg-text" value="#111827" />
              <ColorSwatch name="Secondary" color="bg-text-secondary" value="#374151" />
              <ColorSwatch name="Muted" color="bg-text-muted" value="#6B7280" />
              <ColorSwatch name="Faint" color="bg-text-faint" value="#9CA3AF" />
            </div>
          </Section>

          {/* Typography */}
          <Section title="Tipografia" description="Inter como fonte única. Hierarquia clara.">
            <div className="space-y-8 border border-border rounded-2xl p-8">
              <TypeRow label="Display" className="text-5xl font-bold tracking-tight" sample="Publique seu problema" />
              <TypeRow label="H1" className="text-4xl font-bold tracking-tight" sample="Como funciona" />
              <TypeRow label="H2" className="text-2xl font-semibold" sample="Exemplos de uso" />
              <TypeRow label="Body" className="text-base text-text-muted" sample="Texto regular para descrições e parágrafos." />
              <TypeRow label="Small" className="text-sm text-text-faint" sample="Legendas e informações secundárias." />
            </div>
          </Section>

          {/* Buttons */}
          <Section title="Botões" description="CTAs com estados claros.">
            <div className="flex flex-wrap gap-4">
              <button className="flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white hover:bg-accent-hover transition-colors">
                Primary
                <ArrowRight size={16} />
              </button>
              <button className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-text hover:border-border-subtle hover:bg-surface-raised transition-colors">
                Secondary
              </button>
              <button className="rounded-full px-6 py-3 text-sm font-semibold text-text-muted hover:text-text transition-colors">
                Ghost
              </button>
              <button className="rounded-full bg-surface-raised px-6 py-3 text-sm font-semibold text-text-faint cursor-not-allowed" disabled>
                Disabled
              </button>
            </div>
          </Section>

          {/* Cards */}
          <Section title="Cards" description="Superfícies com bordas sutis.">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="rounded-2xl border border-border bg-surface-raised/30 p-8">
                <span className="text-6xl font-bold text-text-faint/20 block mb-4">01</span>
                <h3 className="text-xl font-semibold text-text mb-2">Card padrão</h3>
                <p className="text-text-muted">Descrição do conteúdo do card.</p>
              </div>
              <div className="rounded-2xl border border-accent/30 bg-accent/5 p-8">
                <span className="text-accent text-sm font-medium mb-4 block">Destaque</span>
                <h3 className="text-xl font-semibold text-text mb-2">Card destacado</h3>
                <p className="text-text-muted">Com borda e fundo accent.</p>
              </div>
            </div>
          </Section>

          {/* Inputs */}
          <Section title="Inputs" description="Campos com visual consistente.">
            <div className="max-w-md space-y-4">
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Campo de texto
                </label>
                <input
                  type="text"
                  placeholder="Digite algo..."
                  className="w-full rounded-xl border border-border bg-surface-raised px-4 py-3 text-text placeholder:text-text-faint focus:outline-none focus:border-accent transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-text mb-2">
                  Área de texto
                </label>
                <textarea
                  placeholder="Descreva seu problema..."
                  rows={4}
                  className="w-full rounded-xl border border-border bg-surface-raised px-4 py-3 text-text placeholder:text-text-faint focus:outline-none focus:border-accent transition-colors resize-none"
                />
              </div>
            </div>
          </Section>

          {/* Badges */}
          <Section title="Badges" description="Status e categorias.">
            <div className="flex flex-wrap gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text-secondary">
                <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                Default
              </span>
              <span className="rounded-full bg-accent/10 border border-accent/20 px-3 py-1.5 text-xs font-medium text-accent">
                Success
              </span>
              <span className="rounded-full bg-surface-raised px-3 py-1.5 text-xs font-medium text-text-muted">
                Muted
              </span>
            </div>
          </Section>

          {/* Spacing */}
          <Section title="Espaçamento" description="Sistema de 4px base.">
            <div className="flex items-end gap-4">
              {[4, 8, 16, 24, 32, 48, 64].map((size) => (
                <div key={size} className="flex flex-col items-center gap-2">
                  <div
                    className="bg-accent rounded"
                    style={{ width: size, height: size }}
                  />
                  <span className="text-xs text-text-faint">{size}</span>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </main>
    </div>
  );
}

function Section({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-2xl font-semibold text-text mb-2">{title}</h2>
      <p className="text-text-muted mb-8">{description}</p>
      {children}
    </section>
  );
}

function ColorSwatch({ name, color, value }: { name: string; color: string; value: string }) {
  return (
    <div className="rounded-xl border border-border overflow-hidden">
      <div className={`${color} h-16`} />
      <div className="p-3 bg-surface-raised">
        <p className="text-sm font-medium text-text">{name}</p>
        <p className="text-xs text-text-faint">{value}</p>
      </div>
    </div>
  );
}

function TypeRow({ label, className, sample }: { label: string; className: string; sample: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-8 pb-6 border-b border-border last:border-0 last:pb-0">
      <span className="text-xs uppercase tracking-wider text-accent w-20 shrink-0">{label}</span>
      <p className={className}>{sample}</p>
    </div>
  );
}

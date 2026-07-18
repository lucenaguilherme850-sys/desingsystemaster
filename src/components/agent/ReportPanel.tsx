import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ExternalLink, Copy, Check } from "lucide-react";

export type Report = {
  business?: Record<string, unknown> | null;
  brand?: Record<string, unknown> | null;
  audience?: Record<string, unknown> | null;
  design_system?: Record<string, unknown> | null;
  section_map?: Array<{ section: string; componentSlug?: string; reason: string }> | null;
  implementation_plan?: Array<{ step: number; title: string; details: string }> | null;
  updated_at?: string;
} | null;

const TABS = [
  { id: "brief", label: "Briefing" },
  { id: "ds", label: "Design System" },
  { id: "map", label: "Mapa de Seções" },
  { id: "plan", label: "Implementação" },
] as const;

export function ReportPanel({ report }: { report: Report }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("brief");
  const [copied, setCopied] = useState(false);

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(report, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <aside className="flex h-full flex-col border-l border-border/40 bg-card/20">
      <div className="flex items-center justify-between border-b border-border/40 p-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Documento estruturado
        </span>
        <button
          onClick={copyAll}
          disabled={!report}
          className="inline-flex items-center gap-1 rounded-md border border-border px-2 py-1 text-xs hover:bg-accent disabled:opacity-40"
        >
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? "Copiado" : "Copiar JSON"}
        </button>
      </div>
      <div className="flex gap-1 border-b border-border/40 p-2">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`rounded-md px-2 py-1 text-xs font-medium transition ${
              tab === t.id ? "bg-primary text-primary-foreground" : "hover:bg-accent"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-4 text-sm">
        {!report ? (
          <p className="text-xs text-muted-foreground">
            Ainda não há relatório. Comece a conversa — o agente vai preencher automaticamente ao
            longo das 10 fases.
          </p>
        ) : tab === "brief" ? (
          <div className="space-y-4">
            <Section title="Negócio" data={report.business} />
            <Section title="Marca" data={report.brand} />
            <Section title="Público" data={report.audience} />
          </div>
        ) : tab === "ds" ? (
          <Section title="Design System" data={report.design_system} />
        ) : tab === "map" ? (
          <div className="space-y-3">
            {(report.section_map ?? []).length === 0 && (
              <p className="text-xs text-muted-foreground">Sem seções definidas ainda.</p>
            )}
            {(report.section_map ?? []).map((s, i) => (
              <div key={i} className="rounded-lg border border-border/60 bg-background/40 p-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">{s.section}</h4>
                  {s.componentSlug && (
                    <Link
                      to="/animmaster/$slug"
                      params={{ slug: s.componentSlug }}
                      className="inline-flex items-center gap-1 text-xs text-neon hover:underline"
                    >
                      {s.componentSlug} <ExternalLink className="size-3" />
                    </Link>
                  )}
                </div>
                <p className="mt-1 text-xs text-muted-foreground">{s.reason}</p>
              </div>
            ))}
          </div>
        ) : (
          <ol className="space-y-2">
            {(report.implementation_plan ?? []).length === 0 && (
              <p className="text-xs text-muted-foreground">Sem plano definido ainda.</p>
            )}
            {(report.implementation_plan ?? []).map((p) => (
              <li key={p.step} className="rounded-lg border border-border/60 bg-background/40 p-3">
                <div className="text-xs font-semibold text-neon">Passo {p.step}</div>
                <div className="text-sm font-medium">{p.title}</div>
                <div className="mt-1 text-xs text-muted-foreground whitespace-pre-wrap">
                  {p.details}
                </div>
              </li>
            ))}
          </ol>
        )}
      </div>
    </aside>
  );
}

function Section({ title, data }: { title: string; data: unknown }) {
  if (!data || (typeof data === "object" && Object.keys(data as object).length === 0)) {
    return (
      <div>
        <h4 className="text-xs font-semibold uppercase text-muted-foreground">{title}</h4>
        <p className="mt-1 text-xs text-muted-foreground/70">—</p>
      </div>
    );
  }
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase text-muted-foreground">{title}</h4>
      <pre className="mt-1 whitespace-pre-wrap rounded-md bg-background/60 p-2 text-xs">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}
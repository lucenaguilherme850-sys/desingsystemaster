// ============= Full file contents =============
import { useState, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink, Copy, Check, Loader2, Sparkles, Target, Briefcase, Compass, Layers, Map as MapIcon, Boxes, ListChecks, Zap, Heart, Search } from "lucide-react";
import { getAnimmasterDriveMasterPrompt } from "@/lib/animmaster-drive-code.functions";
import type {
  CreativeDirection,
  PersonalityAxis,
  PipelineState,
  CollectionEntry,
  Emotion,
  ExpertScore,
} from "@/lib/creative-direction";

type SectionMapItem = {
  section: string;
  componentSlug?: string;
  reason: string;
  position?: string;
  componentName?: string;
  category?: string;
  priority?: string;
  adaptation?: string;
};

export type Report = {
  business?: Record<string, unknown> | null;
  brand?: Record<string, unknown> | null;
  audience?: Record<string, unknown> | null;
  design_system?: Record<string, unknown> | null;
  section_map?: SectionMapItem[] | null;
  implementation_plan?: Array<{ step: number; title: string; details: string }> | null;
  updated_at?: string;
} | null;

const TABS = [
  { id: "dashboard", label: "📊 Dashboard" },
  { id: "direction", label: "🎨 Direção" },
  { id: "collection", label: "🧩 Coleção" },
  { id: "brief", label: "📝 Briefing" },
  { id: "competencies", label: "🧠 Competências" },
  { id: "plan", label: "🚀 Plano" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function ReportPanel({
  report,
  activeTab,
  onTabChange,
}: {
  report: Report;
  activeTab?: TabId;
  onTabChange?: (id: TabId) => void;
}) {
  const [internalTab, setInternalTab] = useState<TabId>("dashboard");
  const tab = activeTab ?? internalTab;
  const setTab = (id: TabId) => {
    if (onTabChange) onTabChange(id);
    else setInternalTab(id);
  };
  const [copied, setCopied] = useState(false);
  const biz = (report?.business ?? null) as
    | (Record<string, unknown> & {
        creative_direction?: CreativeDirection;
        pipeline?: PipelineState;
        collection?: CollectionEntry[];
        emotion?: Emotion;
      })
    | null;
  const direction = biz?.creative_direction;
  const pipeline = biz?.pipeline;
  const collection = biz?.collection ?? [];
  const emotion = biz?.emotion ?? pipeline?.emotion;

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
        ) : tab === "dashboard" ? (
          <div className="space-y-6">
            <DashboardView
              report={report}
              pipeline={pipeline}
              direction={direction}
              emotion={emotion}
              collection={collection}
              onTabChange={setTab}
            />
            <div className="pt-4 border-t border-border/40">
              <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-4">Pipeline de Execução</h4>
              <PipelineView pipeline={pipeline} emotion={emotion} />
            </div>
          </div>
        ) : tab === "direction" ? (
          <DirectionView direction={direction} emotion={emotion} />
        ) : tab === "collection" ? (
          <CollectionView collection={collection} business={report.business ?? null} />
        ) : tab === "brief" ? (
          <div className="space-y-6">
            <Section title="Estratégia de Negócio" data={report.business} />
            <Section title="Identidade da Marca" data={report.brand} />
            <Section title="Público-Alvo" data={report.audience} />
            <Section title="Design System" data={report.design_system} />
          </div>
        ) : tab === "competencies" ? (
          <CompetencyView />
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

function CompetencyView() {
  const categories = [
    { title: "1. 🧱 Fundamentos", items: ["Lógica & Algoritmos", "Big O & Estruturas", "POO & Funcional", "Concorrência"] },
    { title: "2. 🌐 Engenharia Web", items: ["HTML Semântico", "CSS Avançado", "React/Next.js", "Performance/Web Vitals"] },
    { title: "3. 🗄️ Bancos de Dados", items: ["SQL Avançado", "Query Optimization", "PostgreSQL/Redis", "Indexes/Locks"] },
    { title: "4. 🔐 Cybersecurity", items: ["OWASP Top 10", "Threat Modeling", "Criptografia", "Secure Coding"] },
    { title: "5. 🎨 UI/UX + Design System", items: ["Design Tokens", "Motion Design", "Hierarquia Visual", "Acessibilidade"] },
    { title: "6. ☁️ DevOps + Cloud", items: ["Linux/Bash", "Docker/Containers", "CI/CD Pipeline", "AWS/Cloud Monitoring"] },
    { title: "7. 🏗️ Arquitetura", items: ["SOLID & Patterns", "Clean Architecture", "Distributed Systems", "Scalability"] },
    { title: "8. 🤖 AI Engineering", items: ["LLMs & RAG", "Agents & Tool Use", "Prompt Engineering", "Fine-tuning"] },
    { title: "9. 🧪 Engenharia de Software", items: ["Unit & E2E Testing", "TDD / Refactoring", "Logging & Observability"] },
    { title: "10. 🔬 Engenharia Reversa", items: ["DevTools Insight", "Source Maps Analysis", "Protocol Inspection"] },
    { title: "11. 🧠 Engenharia de Produto", items: ["Problem Solving", "MVP Architecture", "Product-Market Fit Focus"] },
    { title: "12. 💼 Negócios", items: ["SaaS Metrics (LTV/CAC)", "UX Comercial", "Conversion Copywriting"] },
  ];
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-neon/40 bg-neon/5 p-3">
        <h3 className="text-sm font-semibold text-neon flex items-center gap-2"><Zap className="size-4" /> Motor de Decisão do Agente</h3>
        <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">O Agente opera com a mentalidade de um Engenheiro Full-Stack Sênior. Cada componente é selecionado com base em fundamentos técnicos, não apenas estética.</p>
      </div>
      <div className="grid grid-cols-1 gap-3">
        {categories.map((cat, i) => (
          <div key={i} className="rounded-lg border border-border/60 bg-background/40 p-3">
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-foreground/70">{cat.title}</h4>
            <div className="mt-2 flex flex-wrap gap-1">{cat.items.map((item, j) => <span key={j} className="rounded bg-accent/30 px-1.5 py-0.5 text-[9px] text-muted-foreground">{item}</span>)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SelectedComponentCard({ item, business }: { item: SectionMapItem; business: Record<string, unknown> | null }) {
    // ... [existing function code]
}

// ... [rest of the file remains as is]

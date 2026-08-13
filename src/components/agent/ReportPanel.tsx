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
  { id: "pipeline", label: "🧭 Pipeline" },
  { id: "collection", label: "🧩 Coleção" },
  { id: "direction", label: "🎨 Direção" },
  { id: "brief", label: "Briefing" },
  { id: "ds", label: "Design System" },
  { id: "map", label: "Mapa" },
  { id: "comps", label: "Componentes" },
  { id: "plan", label: "Implementação" },
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
          <DashboardView
            report={report}
            pipeline={pipeline}
            direction={direction}
            emotion={emotion}
            collection={collection}
          />
        ) : tab === "pipeline" ? (
          <PipelineView pipeline={pipeline} emotion={emotion} />
        ) : tab === "collection" ? (
          <CollectionView collection={collection} business={report.business ?? null} />
        ) : tab === "brief" ? (
          <div className="space-y-4">
            <Section title="Negócio" data={report.business} />
            <Section title="Marca" data={report.brand} />
            <Section title="Público" data={report.audience} />
          </div>
        ) : tab === "direction" ? (
          <DirectionView direction={direction} />
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
        ) : tab === "comps" ? (
          <div className="space-y-3">
            {(report.section_map ?? []).length === 0 && (
              <p className="text-xs text-muted-foreground">
                Nenhum componente selecionado ainda. Envie uma mensagem descrevendo seu projeto (ou cole a URL do site) para o agente montar a seleção.
              </p>
            )}
            {(report.section_map ?? []).map((s, i) => (
              <SelectedComponentCard key={i} item={s} business={report.business ?? null} />
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

function SelectedComponentCard({
  item,
  business,
}: {
  item: SectionMapItem;
  business: Record<string, unknown> | null;
}) {
  const fetchPrompt = useServerFn(getAnimmasterDriveMasterPrompt);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error">("idle");

  async function copyAdaptedPrompt() {
    if (!item.componentSlug) return;
    setState("loading");
    try {
      const r = await fetchPrompt({ data: { slug: item.componentSlug } });
      const masterPrompt = r?.prompt ?? "";
      if (!masterPrompt) throw new Error("sem prompt");
      const b = business ?? {};
      const url = (b.url as string) || "";
      const title = (b.title as string) || "";
      const description = (b.description as string) || "";
      const preamble = [
        `# CONTEXTO DO PROJETO ALVO`,
        url && `- URL: ${url}`,
        title && `- Marca / título: ${title}`,
        description && `- Descrição: ${description}`,
        `- Posição na seleção: ${item.position ?? "—"}`,
        `- Seção onde encaixar: **${item.section}**`,
        `# CAMADA DE ADAPTAÇÃO ESPECÍFICA PARA ESTE PROJETO`,
        `(esta camada é aplicada POR CIMA do Prompt Mestre original — o Prompt Mestre continua valendo integralmente)`,
        item.adaptation
          ? item.adaptation
          : "Adapte apenas cores, tipografia, copy e mídia ao design system do projeto. Preserve timings, easings, física, shaders e complexidade técnica 1:1.",
        ``,
        `## Preservar inegociavelmente`,
        `- Arquitetura da animação (hooks, refs, loops de raf, observers).`,
        `- Shaders / WebGL / Canvas — nunca trocar por CSS ou SVG.`,
        `- Easings, timings relativos, staggers, spring configs, física.`,
        `- Comportamento de interação (mouse, scroll, hover, touch, teclado).`,
        ``,
        `## Perguntar ao usuário antes de codar`,
        `1) Em qual página/rota deste projeto o componente entra?`,
        `2) Qual conteúdo real (títulos, textos, mídia) usar no lugar da demo?`,
        `3) Quais tokens de cor/tipografia usar (ou criar tokens dedicados)?`,
        `4) Restrições de mobile / prefers-reduced-motion?`,
        ``,
        `A seguir vem o PROMPT MESTRE original completo, com o código-fonte de referência — obedeça-o na íntegra e aplique a camada de adaptação acima em cima dele.`,
        ``,
        `────────────────────────────────────────`,
        ``,
      ]
        .filter(Boolean)
        .join("\n");
      const finalPrompt = `${preamble}\n${masterPrompt}`;
      try {
        await navigator.clipboard.writeText(finalPrompt);
      } catch {
        try {
          const ta = document.createElement("textarea");
          ta.value = finalPrompt;
          ta.style.position = "fixed";
          ta.style.opacity = "0";
          document.body.appendChild(ta);
          ta.select();
          document.execCommand("copy");
          document.body.removeChild(ta);
        } catch {
          /* ignore */
        }
      }
      setState("done");
      setTimeout(() => setState("idle"), 2000);
    } catch (e) {
      console.error("copyAdaptedPrompt failed", e);
      setState("error");
      setTimeout(() => setState("idle"), 2500);
    }
  }

  return (
    <div className="rounded-lg border border-border/60 bg-background/40 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-widest text-neon">
            {item.position ?? "Componente"} · {item.section}
          </div>
          <h4 className="mt-0.5 truncate text-sm font-semibold">
            {item.componentName || item.componentSlug}
          </h4>
          {item.componentSlug && (
            <Link
              to="/animmaster/$slug"
              params={{ slug: item.componentSlug }}
              className="mt-0.5 inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground hover:text-neon"
            >
              {item.componentSlug} <ExternalLink className="size-3" />
            </Link>
          )}
        </div>
      </div>
      <p className="mt-2 text-xs text-foreground/80">{item.reason}</p>
      {item.adaptation && (
        <p className="mt-2 rounded-md border border-neon/30 bg-neon/5 p-2 text-[11px] leading-relaxed text-foreground/85">
          <span className="font-mono text-[9px] uppercase tracking-widest text-neon">
            onde usar
          </span>
          <br />
          {item.adaptation}
        </p>
      )}
      <button
        onClick={copyAdaptedPrompt}
        disabled={!item.componentSlug || state === "loading"}
        className="mt-3 inline-flex w-full items-center justify-center gap-1.5 rounded-md bg-[#ff00c8] px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-black transition-colors hover:bg-[#ff00c8]/90 disabled:opacity-50"
      >
        {state === "loading" ? (
          <>
            <Loader2 className="size-3 animate-spin" /> gerando prompt…
          </>
        ) : state === "done" ? (
          <>
            <Check className="size-3" /> copiado
          </>
        ) : state === "error" ? (
          <>falha — tente novamente</>
        ) : (
          <>
            <Sparkles className="size-3" /> copiar prompt mestre adaptado
          </>
        )}
      </button>
    </div>
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

function DirectionView({ direction }: { direction: CreativeDirection | undefined }) {
  if (!direction) {
    return (
      <p className="text-xs text-muted-foreground">
        A direção criativa aparece aqui assim que você enviar a primeira mensagem descrevendo o projeto (ou colar a URL).
      </p>
    );
  }
  const axes: Array<[PersonalityAxis, string]> = [
    ["elegance", "Elegância"],
    ["minimalism", "Minimalismo"],
    ["technology", "Tecnologia"],
    ["luxury", "Luxo"],
    ["motion", "Movimento"],
    ["interactivity", "Interatividade"],
    ["creativity", "Criatividade"],
    ["corporate", "Corporate"],
    ["premium", "Premium"],
    ["conversion", "Conversão"],
  ];
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-neon/40 bg-neon/5 p-3">
        <div className="font-mono text-[10px] uppercase tracking-widest text-neon">Perfil escolhido</div>
        <div className="mt-1 text-lg font-semibold">
          {direction.profile.emoji} {direction.profile.name}
        </div>
        <p className="mt-1 text-xs text-foreground/80">{direction.profile.tagline}</p>
        <p className="mt-2 text-[11px] text-muted-foreground">{direction.profile.description}</p>
        <div className="mt-2 text-[11px]">
          <span className="font-semibold">Ideal para:</span>{" "}
          <span className="text-muted-foreground">{direction.profile.idealFor.join(" · ")}</span>
        </div>
      </div>

      <div className="rounded-lg border border-border/60 bg-background/40 p-3">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Matriz de personalidade
        </div>
        <div className="mt-2 space-y-1.5">
          {axes.map(([k, label]) => {
            const v = direction.matrix[k];
            return (
              <div key={k} className="flex items-center gap-2 text-[11px]">
                <div className="w-24 shrink-0 text-foreground/80">{label}</div>
                <div className="flex-1 h-2 rounded bg-border/40 overflow-hidden">
                  <div
                    className="h-full bg-neon"
                    style={{ width: `${v * 10}%` }}
                  />
                </div>
                <div className="w-10 shrink-0 text-right font-mono tabular-nums text-muted-foreground">
                  {v}/10
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="rounded-lg border border-border/60 bg-background/40 p-3">
        <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Regras que todo componente precisa passar
        </div>
        <ul className="mt-2 space-y-1 text-[11px] text-foreground/85">
          {direction.guardrails.map((g, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-neon">✓</span>
              <span>{g}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function PipelineView({
  pipeline,
  emotion,
}: {
  pipeline: PipelineState | undefined;
  emotion: Emotion | undefined;
}) {
  if (!pipeline) {
    return (
      <p className="text-xs text-muted-foreground">
        O pipeline aparece após a primeira mensagem — as 7 fases (Objetivo → Marca → Direção → DS → Seleção → Adaptação → Validação) são recalculadas a cada turno.
      </p>
    );
  }
  const icon = (s: string) => (s === "done" ? "✅" : s === "partial" ? "🟡" : "⚪");
  return (
    <div className="space-y-4">
      {emotion && (
        <div className="rounded-lg border border-neon/40 bg-neon/5 p-3">
          <div className="font-mono text-[10px] uppercase tracking-widest text-neon">Emoção-alvo</div>
          <div className="mt-1 text-lg font-semibold">
            {emotion.emoji} {emotion.label}
          </div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            Toda a coleção é ranqueada para reforçar essa emoção — não para "ficar bonito".
          </p>
        </div>
      )}
      <ol className="space-y-2">
        {pipeline.phases.map((p, i) => (
          <li key={p.id} className="rounded-lg border border-border/60 bg-background/40 p-3">
            <div className="flex items-center gap-2">
              <span className="text-base">{icon(p.status)}</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Fase {i + 1}
              </span>
              <span className="text-sm font-semibold">
                {p.emoji} {p.label}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-foreground/80">{p.summary}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}

function CollectionView({
  collection,
  business,
}: {
  collection: CollectionEntry[];
  business: Record<string, unknown> | null;
}) {
  if (!collection.length) {
    return (
      <p className="text-xs text-muted-foreground">
        A coleção coerente (Navbar → Hero → Feature → Gallery → Social → CTA → Footer) é montada assim que o agente detectar contexto suficiente.
      </p>
    );
  }
  return (
    <div className="space-y-3">
      {collection.map((c) => (
        <CollectionCard key={c.slot} entry={c} business={business} />
      ))}
    </div>
  );
}

function ExpertBadges({ experts }: { experts: ExpertScore[] }) {
  return (
    <div className="mt-2 flex flex-wrap gap-1">
      {experts.map((e) => (
        <span
          key={e.id}
          className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-background/60 px-1.5 py-0.5 font-mono text-[10px] text-foreground/80"
          title={e.label}
        >
          <span>{e.emoji}</span>
          <span className="tabular-nums">{e.score.toFixed(1)}</span>
        </span>
      ))}
    </div>
  );
}

function CollectionCard({
  entry,
  business,
}: {
  entry: CollectionEntry;
  business: Record<string, unknown> | null;
}) {
  const [open, setOpen] = useState(false);
  const item: SectionMapItem = {
    section: entry.slotLabel,
    componentSlug: entry.slug,
    componentName: entry.name,
    category: entry.category,
    position: entry.slotLabel,
    reason: `Fit ${entry.fit.toFixed(1)} — escolhido pela coerência de vetor com a emoção-alvo do projeto.`,
  };
  return (
    <div className="rounded-lg border border-border/60 bg-background/40 p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-widest text-neon">
            {entry.slotLabel}
          </div>
          <Link
            to="/animmaster/$slug"
            params={{ slug: entry.slug }}
            className="mt-0.5 inline-flex items-center gap-1 text-sm font-semibold hover:text-neon"
          >
            {entry.name} <ExternalLink className="size-3" />
          </Link>
          <div className="font-mono text-[10px] text-muted-foreground">{entry.slug}</div>
        </div>
        <div className="shrink-0 rounded-md border border-neon/40 bg-neon/10 px-2 py-1 text-center font-mono text-[10px] text-neon">
          fit
          <div className="text-sm font-semibold">{entry.fit.toFixed(1)}</div>
        </div>
      </div>
      <ExpertBadges experts={entry.experts} />
      {entry.alternatives.length > 0 && (
        <div className="mt-3">
          <button
            onClick={() => setOpen((v) => !v)}
            className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground hover:text-foreground"
          >
            {open ? "▾" : "▸"} {entry.alternatives.length} alternativa{entry.alternatives.length > 1 ? "s" : ""}
          </button>
          {open && (
            <ul className="mt-2 space-y-1">
              {entry.alternatives.map((alt) => (
                <li key={alt.slug} className="flex items-center justify-between text-[11px]">
                  <Link
                    to="/animmaster/$slug"
                    params={{ slug: alt.slug }}
                    className="truncate hover:text-neon"
                  >
                    {alt.name}
                  </Link>
                  <span className="font-mono tabular-nums text-muted-foreground">{alt.fit.toFixed(1)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      <div className="mt-3">
        <SelectedComponentCard item={item} business={business} />
      </div>
    </div>
  );
}

function DashboardView({
  report,
  pipeline,
  direction,
  emotion,
  collection,
}: {
  report: Report;
  pipeline: PipelineState | undefined;
  direction: CreativeDirection | undefined;
  emotion: Emotion | undefined;
  collection: CollectionEntry[];
}) {
  const completionPercentage = useMemo(() => {
    if (!pipeline) return 0;
    const done = pipeline.phases.filter((p) => p.status === "done").length;
    return Math.round((done / pipeline.phases.length) * 100);
  }, [pipeline]);

  return (
    <div className="space-y-6">
      {/* Welcome Card */}
      <div className="rounded-xl border border-neon/20 bg-neon/5 p-4 shadow-[0_0_20px_rgba(34,211,238,0.05)]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-neon/10 p-2 text-neon">
              <Zap className="size-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">Status do Projeto</h3>
              <p className="text-xs text-muted-foreground">Configuração estratégica em tempo real</p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-black text-neon">{completionPercentage}%</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground">completo</div>
          </div>
        </div>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-border/40">
          <div
            className="h-full bg-neon transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Creative Profile Widget */}
        <div className="rounded-xl border border-border/40 bg-card/40 p-3">
          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            <Compass className="size-3 text-neon" /> Direção
          </div>
          {direction ? (
            <div className="mt-2">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">{direction.profile.emoji}</span>
                <span className="truncate text-xs font-bold">{direction.profile.name}</span>
              </div>
              <p className="mt-1 line-clamp-2 text-[10px] text-muted-foreground leading-relaxed">
                {direction.profile.tagline}
              </p>
            </div>
          ) : (
            <div className="mt-2 text-[10px] italic text-muted-foreground/50">Aguardando análise...</div>
          )}
        </div>

        {/* Target Emotion Widget */}
        <div className="rounded-xl border border-border/40 bg-card/40 p-3">
          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            <Heart className="size-3 text-[#ff00c8]" /> Emoção
          </div>
          {emotion ? (
            <div className="mt-2">
              <div className="flex items-center gap-1.5">
                <span className="text-lg">{emotion.emoji}</span>
                <span className="truncate text-xs font-bold">{emotion.label}</span>
              </div>
              <p className="mt-1 text-[10px] text-muted-foreground">Foco sensorial definido</p>
            </div>
          ) : (
            <div className="mt-2 text-[10px] italic text-muted-foreground/50">Aguardando análise...</div>
          )}
        </div>
      </div>

      {/* Collection Quick View */}
      <div className="rounded-xl border border-border/40 bg-card/40 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
            <Boxes className="size-3 text-neon-purple" /> Coleção Proposta
          </div>
          <span className="rounded-md bg-neon-purple/10 px-1.5 py-0.5 font-mono text-[10px] text-neon-purple">
            {collection.length} Itens
          </span>
        </div>
        <div className="mt-4 space-y-2">
          {collection.length > 0 ? (
            collection.slice(0, 4).map((c) => (
              <div key={c.slug} className="flex items-center justify-between rounded-lg bg-background/40 p-2 text-xs">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="size-1.5 shrink-0 rounded-full bg-neon shadow-[0_0_8px_#22d3ee]" />
                  <span className="truncate font-medium">{c.name}</span>
                </div>
                <span className="shrink-0 font-mono text-[9px] text-muted-foreground">{c.slotLabel}</span>
              </div>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <Search className="mb-2 size-5 text-muted-foreground/30" />
              <p className="text-[10px] text-muted-foreground">Mencione o site ou negócio para gerar o kit</p>
            </div>
          )}
          {collection.length > 4 && (
            <div className="text-center text-[10px] text-muted-foreground">
              + {collection.length - 4} outros componentes
            </div>
          )}
        </div>
      </div>

      {/* Project Briefing Health */}
      <div className="rounded-xl border border-border/40 bg-card/40 p-4">
        <div className="flex items-center gap-2 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
          <Briefcase className="size-3" /> Briefing Health
        </div>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <div className={`size-2 rounded-full ${report?.business ? "bg-neon" : "bg-border/40"}`} />
              Negócio
            </div>
            <span className="text-[10px] text-muted-foreground">{report?.business ? "Identificado" : "Pendente"}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <div className={`size-2 rounded-full ${report?.brand ? "bg-neon" : "bg-border/40"}`} />
              Branding
            </div>
            <span className="text-[10px] text-muted-foreground">{report?.brand ? "Definido" : "Pendente"}</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <div className={`size-2 rounded-full ${report?.design_system ? "bg-neon" : "bg-border/40"}`} />
              Design System
            </div>
            <span className="text-[10px] text-muted-foreground">{report?.design_system ? "Conectado" : "Genérico"}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ExternalLink, Copy, Check, Loader2, Sparkles } from "lucide-react";
import { getAnimmasterDriveMasterPrompt } from "@/lib/animmaster-drive-code.functions";
import type { CreativeDirection, PersonalityAxis } from "@/lib/creative-direction";

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
  { id: "direction", label: "🎨 Direção" },
  { id: "brief", label: "Briefing" },
  { id: "ds", label: "Design System" },
  { id: "map", label: "Mapa" },
  { id: "comps", label: "Componentes" },
  { id: "plan", label: "Implementação" },
] as const;

export function ReportPanel({ report }: { report: Report }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("direction");
  const [copied, setCopied] = useState(false);
  const direction = (report?.business as { creative_direction?: CreativeDirection } | null | undefined)
    ?.creative_direction as CreativeDirection | undefined;

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
        ``,
        `# CAMADA DE ADAPTAÇÃO ESPECÍFICA PARA ESTE PROJETO`,
        `(esta camada é aplicada POR CIMA do Prompt Mestre original — o Prompt Mestre continua valendo integralmente)`,
        ``,
        item.adaptation ||
          "Adapte apenas cores, tipografia, copy e mídia ao design system do projeto. Preserve timings, easings, física, shaders e complexidade técnica 1:1.",
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
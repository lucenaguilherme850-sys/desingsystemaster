import { createFileRoute, Link, useRouter, useSearch } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Asset } from "@/lib/asset-types";
import { DemoRenderer } from "@/components/demos";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { ArrowLeft, Pencil, Trash2, Eye, X } from "lucide-react";
import { z } from "zod";

const searchSchema = z.object({
  preview: z.union([z.literal(1), z.literal(0), z.boolean()]).optional(),
});

export const Route = createFileRoute("/assets/$slug")({
  component: AssetDetail,
  validateSearch: searchSchema,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-2xl font-semibold">Could not load this asset</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <Button
          className="mt-4"
          onClick={() => {
            router.invalidate();
            reset();
          }}
        >
          Try again
        </Button>
      </div>
    );
  },
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-6 py-24 text-center">
      <h1 className="text-2xl font-semibold">Asset not found</h1>
      <Button asChild className="mt-4" variant="ghost">
        <Link to="/">Back to library</Link>
      </Button>
    </div>
  ),
});

function AssetDetail() {
  const { slug } = Route.useParams();
  const router = useRouter();
  const { user } = useAuth();
  const search = useSearch({ from: "/assets/$slug" });
  const isPreview = search.preview === 1 || search.preview === true;

  const { data: asset, isLoading } = useQuery({
    queryKey: ["asset", slug],
    queryFn: async (): Promise<Asset | null> => {
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return (data ?? null) as unknown as Asset | null;
    },
  });

  if (isLoading) {
    return <div className="mx-auto max-w-6xl px-6 py-12 text-muted-foreground font-mono">Loading…</div>;
  }

  if (!asset) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <div className="font-mono text-[11px] uppercase tracking-widest text-neon">404</div>
        <h1 className="mt-2 text-2xl font-semibold">Asset not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No asset with slug <code className="font-mono">{slug}</code>.
        </p>
        <Button asChild className="mt-6" variant="outline">
          <Link to="/">← Back to library</Link>
        </Button>
      </div>
    );
  }

  const isOwner = user && asset.created_by === user.id;

  const handleDelete = async () => {
    if (!confirm(`Delete "${asset.name}"?`)) return;
    const { error } = await supabase.from("assets").delete().eq("id", asset.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Asset deleted");
    router.navigate({ to: "/" });
  };

  // Preview-only mode: full-viewport demo, no code, no meta.
  if (isPreview) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-background">
        <header className="flex items-center justify-between border-b border-border px-6 py-3">
          <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest">
            <span className="text-neon">preview</span>
            <span className="text-border">/</span>
            <span className="text-muted-foreground">{asset.slug}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="hidden font-mono text-[11px] text-muted-foreground md:inline">
              {asset.name}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                router.navigate({
                  to: "/assets/$slug",
                  params: { slug: asset.slug },
                  search: {},
                })
              }
            >
              <X className="size-3.5" /> Exit preview
            </Button>
          </div>
        </header>
        <div className="flex-1 overflow-auto bg-card">
          <div className="mx-auto max-w-6xl px-6 py-8">
            <DemoRenderer name={asset.demo_component} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-6xl px-6 pb-24">
      {/* Header */}
      <div className="pt-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 font-mono text-xs text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3" /> library
        </Link>
      </div>

      <header className="mt-6 flex flex-wrap items-end justify-between gap-4 border-b border-border pb-8">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest">
            <span className="text-neon">{asset.category}</span>
            <span className="text-border">/</span>
            <span className="text-muted-foreground">{asset.slug}</span>
          </div>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight">{asset.name}</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">{asset.short_description}</p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link
              to="/assets/$slug"
              params={{ slug: asset.slug }}
              search={{ preview: 1 }}
            >
              <Eye className="size-3.5" /> Preview mode
            </Link>
          </Button>
          {isOwner && (
            <>
              <Button asChild variant="outline" size="sm">
                <Link to="/assets/$slug/edit" params={{ slug: asset.slug }}>
                  <Pencil className="size-3.5" /> Edit
                </Link>
              </Button>
              <Button variant="outline" size="sm" onClick={handleDelete}>
                <Trash2 className="size-3.5" /> Delete
              </Button>
            </>
          )}
        </div>
      </header>

      {/* Demo */}
      <section className="mt-8">
        <SectionLabel index="00" label="live demo" />
        <div className="mt-3 overflow-hidden rounded-xl border border-border bg-card">
          <DemoRenderer name={asset.demo_component} />
        </div>
      </section>

      {/* Meta stats */}
      <section className="mt-12 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="complexity" value={`${asset.complexity}/10`} />
        <Stat label="visual impact" value={`${asset.visual_impact}/10`} />
        <Stat label="ux impact" value={`${asset.ux_impact}/10`} />
        <Stat label="time" value={asset.estimated_time || "—"} />
      </section>

      {/* Objetivo & Descrição */}
      <TwoCol
        left={{ label: "objetivo", body: <p className="text-pretty">{asset.objective}</p> }}
        right={{ label: "descrição", body: <p className="text-pretty">{asset.description}</p> }}
        index="01"
      />

      {/* Funcionamento */}
      <Section index="02" title="funcionamento">
        <p className="max-w-3xl text-pretty">{asset.how_it_works}</p>
        {asset.flow.length > 0 && (
          <ol className="mt-6 space-y-2">
            {asset.flow.map((step, i) => (
              <li key={i} className="flex gap-3 font-mono text-sm">
                <span className="text-neon">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-muted-foreground">↓</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        )}
      </Section>

      {/* Algoritmo */}
      {asset.algorithm && (
        <Section index="03" title="algoritmo">
          <p className="max-w-3xl text-pretty">{asset.algorithm}</p>
        </Section>
      )}

      {/* Estrutura HTML */}
      {asset.html_structure && (
        <Section index="04" title="estrutura html">
          <pre className="overflow-x-auto rounded-lg border border-border bg-card p-4 text-xs">
            <code>{asset.html_structure}</code>
          </pre>
        </Section>
      )}

      {/* CSS / JS notes */}
      <TwoCol
        left={{ label: "css necessário", body: <p className="text-pretty">{asset.css_notes}</p> }}
        right={{ label: "javascript necessário", body: <p className="text-pretty">{asset.js_notes}</p> }}
        index="05"
      />

      {/* Tags: tech / events / math / deps */}
      <Section index="06" title="stack técnica">
        <div className="grid gap-6 md:grid-cols-2">
          <TagList label="tecnologias" items={asset.technologies} />
          <TagList label="eventos" items={asset.events} />
          <TagList label="matemática" items={asset.math} />
          <TagList label="dependências" items={asset.dependencies} />
        </div>
      </Section>

      {/* Performance */}
      {Object.keys(asset.performance ?? {}).length > 0 && (
        <Section index="07" title="performance">
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(asset.performance as Record<string, unknown>).map(([k, v]) => (
              <div key={k} className="rounded-lg border border-border bg-card p-4">
                <div className="font-mono text-[11px] uppercase tracking-widest text-neon">{k}</div>
                <div className="mt-1.5 text-sm">
                  {Array.isArray(v) ? (
                    <ul className="list-disc space-y-1 pl-4 text-muted-foreground">
                      {(v as string[]).map((x, i) => (
                        <li key={i}>{x}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-muted-foreground">{String(v)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Responsividade & Acessibilidade */}
      <TwoCol
        left={{ label: "responsividade", body: <p>{asset.responsiveness}</p> }}
        right={{ label: "acessibilidade", body: <p>{asset.accessibility}</p> }}
        index="08"
      />

      {/* Issues / Improvements / Variations */}
      <Section index="09" title="evolução">
        <div className="grid gap-6 md:grid-cols-3">
          <BulletList label="possíveis problemas" items={asset.issues} />
          <BulletList label="melhorias possíveis" items={asset.improvements} />
          <BulletList label="variações" items={asset.variations} />
        </div>
      </Section>

      {/* Compatibility */}
      <Section index="10" title="compatibilidade">
        <TagList label="" items={asset.compatibility} />
        {asset.reuse && (
          <div className="mt-4">
            <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              onde reutilizar
            </div>
            <p className="mt-1">{asset.reuse}</p>
          </div>
        )}
      </Section>

      {/* Código base */}
      {asset.code_base && (
        <Section index="11" title="código base — arquitetura">
          <p className="max-w-3xl text-pretty">{asset.code_base}</p>
        </Section>
      )}

      {/* Checklist */}
      {asset.checklist.length > 0 && (
        <Section index="12" title="checklist">
          <ul className="grid gap-2 md:grid-cols-2">
            {asset.checklist.map((c, i) => (
              <li
                key={i}
                className="flex items-start gap-3 rounded-md border border-border bg-card px-3 py-2 text-sm"
              >
                <span className="mt-1 size-1.5 rounded-full bg-neon" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </Section>
      )}
    </article>
  );
}

function SectionLabel({ index, label }: { index: string; label: string }) {
  return (
    <div className="flex items-center gap-3 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
      <span className="text-neon">{index}</span>
      <span className="h-px flex-1 bg-border" />
      <span>{label}</span>
    </div>
  );
}

function Section({ index, title, children }: { index: string; title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <SectionLabel index={index} label={title} />
      <div className="mt-4">{children}</div>
    </section>
  );
}

function TwoCol({
  index,
  left,
  right,
}: {
  index: string;
  left: { label: string; body: React.ReactNode };
  right: { label: string; body: React.ReactNode };
}) {
  return (
    <section className="mt-12 grid gap-8 md:grid-cols-2">
      <div>
        <SectionLabel index={index} label={left.label} />
        <div className="mt-3 text-muted-foreground">{left.body}</div>
      </div>
      <div>
        <SectionLabel index={String(Number(index) + 0).padStart(2, "0")} label={right.label} />
        <div className="mt-3 text-muted-foreground">{right.body}</div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="mt-1 font-mono text-lg tabular-nums text-neon">{value}</div>
    </div>
  );
}

function TagList({ label, items }: { label: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      {label && (
        <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          {label}
        </div>
      )}
      <div className={"flex flex-wrap gap-1.5 " + (label ? "mt-2" : "")}>
        {items.map((it, i) => (
          <span
            key={i}
            className="rounded-md border border-border bg-card px-2 py-1 font-mono text-[11px]"
          >
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}

function BulletList({ label, items }: { label: string; items: string[] }) {
  if (!items?.length) return null;
  return (
    <div>
      <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
      </div>
      <ul className="mt-2 space-y-2 text-sm">
        {items.map((it, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-neon">·</span>
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
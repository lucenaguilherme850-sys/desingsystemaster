import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Asset } from "@/lib/asset-types";
import { DemoRenderer } from "@/components/demos";
import { CodeExport } from "@/components/CodeExport";
import { getDemoSource } from "@/lib/demo-source";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

function buildPrompt(asset: Asset): string {
  const src = getDemoSource(asset.demo_component);
  const intro = [
    `Recreate this React + Tailwind effect: "${asset.name}" (${asset.category}).`,
    asset.short_description && `Effect: ${asset.short_description}`,
    asset.objective && `Goal: ${asset.objective}`,
    asset.how_it_works && `How it works: ${asset.how_it_works}`,
  ]
    .filter(Boolean)
    .join("\n");
  if (!src) return intro;
  return `${intro}\n\nReference implementation (React + Tailwind, self-contained):\n\n\`\`\`tsx\n${src}\n\`\`\``;
}

export const Route = createFileRoute("/assets/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Asset Legado Design Master` },
      {
        name: "description",
        content: `Preview do componente clássico ${params.slug}. Documentação e código-fonte original disponível para exportação.`,
      },
      { property: "og:title", content: `${params.slug} — Design Master Classic` },
      { property: "og:type", content: "article" },
    ],
  }),
  component: AssetDetail,
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

  const src = getDemoSource(asset.demo_component);
  const prompt = buildPrompt(asset);
  const [promptCopied, setPromptCopied] = useState(false);
  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setPromptCopied(true);
      toast.success("prompt copiado");
      setTimeout(() => setPromptCopied(false), 1800);
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

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

      <header className="mt-6 border-b border-border pb-8">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest">
          <span className="text-neon">{asset.category}</span>
          <span className="text-border">/</span>
          <span className="text-muted-foreground">{asset.slug}</span>
        </div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight">{asset.name}</h1>
      </header>

      {/* Demo */}
      <section className="mt-8">
        <SectionLabel index="00" label="live demo" />
        <div className="mt-3 overflow-hidden rounded-xl border border-border bg-card">
          <DemoRenderer name={asset.demo_component} />
        </div>
      </section>

      {/* Prompt do efeito */}
      <section className="mt-12">
        <SectionLabel index="01" label="prompt — reproduce this effect" />
        <div className="mt-3 rounded-xl border border-border bg-card/60 p-5">
          <div className="mb-3 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-neon">prompt</span>
            <button
              type="button"
              onClick={copyPrompt}
              className="inline-flex items-center gap-1.5 rounded-full border border-neon/40 bg-background/60 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-neon transition-all hover:bg-neon hover:text-background"
            >
              {promptCopied ? <Check className="size-3" /> : <Copy className="size-3" />}
              {promptCopied ? "copiado" : "copiar prompt"}
            </button>
          </div>
          <pre className="whitespace-pre-wrap font-mono text-sm leading-relaxed text-foreground/90">
            {prompt}
          </pre>
        </div>
      </section>

      {/* Componente React exportável — único conteúdo além do demo */}
      {src && (
        <section className="mt-12">
          <SectionLabel index="02" label="component — copy & paste" />
          <p className="mt-3 mb-3 max-w-3xl text-sm text-muted-foreground">
            Arquivo <code className="font-mono text-neon">.tsx</code> auto-contido
            com tokens de cor inlined. Cole em qualquer projeto React 18 + Tailwind. Também
            disponível em{" "}
            <code className="font-mono text-neon">
              /api/public/registry/{asset.demo_component}.json
            </code>
            .
          </p>
          <CodeExport
            code={src}
            filename={`${asset.demo_component}.tsx`}
            language="js"
          />
        </section>
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
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Asset } from "@/lib/asset-types";
import { ASSET_CATEGORIES } from "@/lib/asset-types";
import { ArrowUpRight, Layers } from "lucide-react";
import { BlurSmearTitle } from "@/components/fx/BlurSmearTitle";
import { getDemoSource } from "@/lib/demo-source";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/")({
  component: LibraryIndex,
});

function LibraryIndex() {
  const [category, setCategory] = useState<string>("All");

  const { data: assets, isLoading } = useQuery({
    queryKey: ["assets"],
    queryFn: async (): Promise<Asset[]> => {
      const { data, error } = await supabase
        .from("assets")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as unknown as Asset[];
    },
  });

  const filtered = useMemo(
    () => (assets ?? []).filter((a) => category === "All" || a.category === category),
    [assets, category],
  );

  const categoriesPresent = useMemo(() => {
    const set = new Set<string>();
    assets?.forEach((a) => set.add(a.category));
    return ["All", ...ASSET_CATEGORIES.filter((c) => set.has(c))];
  }, [assets]);

  return (
    <div>
      {/* Hero */}
      <section id="top" className="relative overflow-hidden border-b border-border/50">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="absolute inset-0 hero-glow" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
        <div className="relative mx-auto max-w-[1400px] px-8 py-32 md:py-40 text-center">
          <BlurSmearTitle
            as="h1"
            className="mx-auto max-w-5xl text-balance text-5xl md:text-7xl lg:text-8xl font-extrabold uppercase tracking-tight leading-[0.95]"
          >
            {"300 PRO COMPONENTS"}
          </BlurSmearTitle>
          <BlurSmearTitle
            as="span"
            accent
            stagger={45}
            className="mt-3 block max-w-5xl mx-auto text-5xl md:text-7xl lg:text-8xl font-extrabold uppercase tracking-tight leading-[0.95] drop-shadow-[0_0_40px_oklch(0.82_0.17_225/45%)]"
          >
            {"FROM AWWWARDS WEBSITES"}
          </BlurSmearTitle>
          <p className="mx-auto mt-8 max-w-xl text-base text-muted-foreground">
            The world's most stunning frontend components rebuilt with clean code from top-tier studios,
            ready to power your next masterpiece project.
          </p>
          <div className="mt-10 flex items-center justify-center gap-3">
            <a
              href="#components"
              className="glow-cyan rounded-full bg-neon px-7 py-3 text-sm font-semibold text-background transition-transform hover:scale-[1.03]"
            >
              View Components
            </a>
          </div>
        </div>
      </section>

      {/* Filters */}
      <section id="components" className="mx-auto max-w-[1400px] px-8 pt-16">
        <div className="mb-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">PRO-Level Components</h2>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 pb-6">
          {categoriesPresent.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={
                "rounded-full border px-4 py-1.5 text-xs font-medium transition-all " +
                (category === c
                  ? "border-neon bg-neon text-background shadow-[0_0_20px_oklch(0.82_0.17_225/45%)]"
                  : "border-border bg-card/40 text-muted-foreground hover:border-neon/50 hover:text-foreground")
              }
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-[1400px] px-8 py-8">
        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 animate-pulse rounded-xl border border-border bg-card/40" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="grid place-items-center rounded-xl border border-dashed border-border py-24 text-center">
            <Layers className="size-6 text-muted-foreground" />
            <p className="mt-3 font-mono text-sm text-muted-foreground">no assets in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((asset, i) => (
              <AssetCard key={asset.id} asset={asset} index={i + 1} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function AssetCard({ asset, index }: { asset: Asset; index: number }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const src = getDemoSource(asset.demo_component);
    if (!src) {
      toast.error("Fonte do componente indisponível");
      return;
    }
    try {
      await navigator.clipboard.writeText(src);
      setCopied(true);
      toast.success(`${asset.demo_component}.tsx copiado`);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  return (
    <Link
      to="/assets/$slug"
      params={{ slug: asset.slug }}
      className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-card/60 p-5 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-neon/60 hover:shadow-[0_0_40px_oklch(0.82_0.17_225/20%)]"
    >
      <div className="pointer-events-none absolute -inset-px opacity-0 transition-opacity group-hover:opacity-100" style={{ background: "radial-gradient(400px circle at 50% 0%, oklch(0.82 0.17 225 / 12%), transparent 60%)" }} />
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copiar ${asset.demo_component}.tsx`}
        className="absolute right-3 top-3 z-10 inline-flex items-center gap-1.5 rounded-full border border-neon/40 bg-background/80 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-neon backdrop-blur transition-all hover:border-neon hover:bg-neon hover:text-background hover:shadow-[0_0_20px_oklch(0.82_0.17_225/45%)]"
      >
        {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
        {copied ? "copiado" : "copiar .tsx"}
      </button>
      {/* Preview strip com barras animadas — sem instanciar o demo real (performance) */}
      <div className="relative -mx-1 -mt-1 mb-1 flex h-32 items-end justify-around gap-1 overflow-hidden rounded-xl border border-border/60 bg-gradient-to-br from-background/80 to-card p-3">
        {Array.from({ length: 18 }).map((_, i) => (
          <span
            key={i}
            className="w-1.5 rounded-full bg-gradient-to-t from-neon/10 to-neon/70 group-hover:from-neon/40 group-hover:to-neon transition-colors"
            style={{
              height: `${20 + ((i * 37 + asset.id.charCodeAt(0)) % 70)}%`,
              transitionDelay: `${i * 20}ms`,
            }}
          />
        ))}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,oklch(0.82_0.17_225/20%),transparent_60%)]" />
      </div>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          <span>{String(index).padStart(2, "0")}</span>
          <span className="text-border">/</span>
          <span className="text-neon">{asset.category}</span>
        </div>
        <ArrowUpRight className="size-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-neon" />
      </div>

      <div>
        <h3 className="text-xl font-semibold tracking-tight">{asset.name}</h3>
      </div>
    </Link>
  );
}
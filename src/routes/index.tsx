import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Asset } from "@/lib/asset-types";
import { ASSET_CATEGORIES } from "@/lib/asset-types";
import { ArrowUpRight, Layers } from "lucide-react";

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
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-background" />
        <div className="relative mx-auto max-w-7xl px-6 py-24">
          <div className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-neon">
            <span className="size-1.5 rounded-full bg-neon" /> motion.library / v1
          </div>
          <h1 className="mt-4 max-w-3xl text-5xl md:text-6xl font-semibold tracking-tight text-balance">
            A catalog of interactive UI assets, with{" "}
            <span className="text-neon">live demos</span> and full technical specs.
          </h1>
          <p className="mt-4 max-w-xl text-muted-foreground">
            Magnetic buttons, hero reveals, cursor trails, pinned galleries — each entry ships with its
            fluxo interno, algorithm, performance notes and reusable checklist.
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="mx-auto max-w-7xl px-6 pt-10">
        <div className="flex flex-wrap items-center gap-2 border-b border-border pb-4">
          <span className="mr-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            filter
          </span>
          {categoriesPresent.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={
                "rounded-full border px-3 py-1 font-mono text-xs transition-colors " +
                (category === c
                  ? "border-neon bg-neon/10 text-neon"
                  : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground")
              }
            >
              {c}
            </button>
          ))}
        </div>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-7xl px-6 py-8">
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
  return (
    <Link
      to="/assets/$slug"
      params={{ slug: asset.slug }}
      className="group relative flex flex-col gap-4 rounded-xl border border-border bg-card p-5 transition-all hover:border-neon/60 hover:bg-card/80"
    >
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
        <p className="mt-1.5 text-sm text-muted-foreground line-clamp-2">{asset.short_description}</p>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border pt-3 font-mono text-[11px] text-muted-foreground">
        <span>
          complexity <span className="text-foreground">{asset.complexity}</span>/10
        </span>
        <span>
          visual <span className="text-foreground">{asset.visual_impact}</span>/10
        </span>
        <span>{asset.estimated_time}</span>
      </div>
    </Link>
  );
}
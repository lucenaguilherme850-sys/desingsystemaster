import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BlurSmearTitle } from "@/components/fx/BlurSmearTitle";
import { isSlugLive, isSlugHandcrafted } from "@/animfx/registry";
import { MirrorCard, type MirrorItem } from "@/components/animmaster/MirrorCard";
import { PreviewQualityPicker } from "@/components/animmaster/PreviewQualityPicker";
import { useVirtualizer } from "@tanstack/react-virtual";
import { useEcoMode } from "@/hooks/use-eco-mode";

const CATEGORIES: { key: string; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "Scroll Animation", label: "Animações de rolagem" },
  { key: "Mouse Effects", label: "Efeitos do mouse" },
  { key: "Page Transitions", label: "Transições de página" },
  { key: "Grid Animations", label: "Animações em grade" },
  { key: "Sliders", label: "Sliders" },
  { key: "Hero Animations", label: "Animações de Heróis" },
  { key: "WebGL & ThreeJS", label: "Shaders WebGL" },
  { key: "Background Animations", label: "Animações de fundo" },
  { key: "Navigation Menus", label: "Menus de navegação" },
  { key: "Hover Effects", label: "Efeitos de passar o mouse" },
  { key: "Text Animations", label: "Animações de texto" },
  { key: "3D Animation", label: "Animações 3D" },
  { key: "Physics Effects", label: "Efeitos da Física" },
  { key: "SVG Animations", label: "Animações SVG" },
];

export const Route = createFileRoute("/")({
  component: LibraryIndex,
  head: () => ({
    meta: [
      { title: "Design Master — Catálogo Premium de Assets UI & Efeitos Web" },
      {
        name: "description",
        content: "Explore o maior catálogo de efeitos de mouse, animações de rolagem e Shaders WebGL premium. Componentes interativos otimizados para React e Tailwind.",
      },
      { property: "og:title", content: "Design Master — Assets UI de Alta Performance" },
      { property: "og:description", content: "Biblioteca curada de componentes interativos e animações inspiradas nos padrões Awwwards." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "Design Master",
          "url": "https://animemaster.lovable.app",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://animemaster.lovable.app/animmaster?search={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        })
      }
    ]
  })
});

function LibraryIndex() {
  useEcoMode();
  const [cat, setCat] = useState<string>("all");
  const [onlyLive, setOnlyLive] = useState(false);

  const { data: items, isLoading } = useQuery({
    queryKey: ["animmaster-items"],
    queryFn: async (): Promise<MirrorItem[]> => {
      const { data, error } = await supabase
        .from("animmaster_items")
        .select("*")
        .order("position", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as MirrorItem[];
    },
  });

  const filtered = useMemo(() => {
    const list = (items ?? []).filter(
      (i) =>
        (cat === "all" || i.category === cat) &&
        (!onlyLive || isSlugLive(i.slug)),
    );
    return [...list].sort((a, b) => {
      const ah = isSlugHandcrafted(a.slug) ? 0 : 1;
      const bh = isSlugHandcrafted(b.slug) ? 0 : 1;
      if (ah !== bh) return ah - bh;
      return a.position - b.position;
    });
  }, [items, cat, onlyLive]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: items?.length ?? 0 };
    items?.forEach((i) => (map[i.category] = (map[i.category] ?? 0) + 1));
    return map;
  }, [items]);

  return (
    <div className="min-h-screen bg-background selection:bg-neon/30 selection:text-neon">
      {/* Premium Hero Section */}
      <section id="top" className="relative overflow-hidden border-b border-border/40 bg-background pt-24 pb-32 md:pt-32 md:pb-48">
        <div className="absolute inset-0 grid-bg opacity-[0.03]" />
        <div className="absolute inset-0 hero-glow opacity-30" />
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-background via-background/80 to-transparent" />
        
        <div className="relative mx-auto max-w-[1400px] px-6 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-neon/20 bg-neon/5 px-3 py-1 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-neon"></span>
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-neon">
              Design Engineering Library
            </span>
          </div>
          
          <BlurSmearTitle as="h1" className="mx-auto max-w-5xl text-balance text-6xl md:text-8xl lg:text-[120px] font-black uppercase tracking-tighter leading-[0.85] mb-2">
            {"DESIGN"}
          </BlurSmearTitle>
          <BlurSmearTitle as="span" accent stagger={45} className="mt-1 block max-w-5xl mx-auto text-6xl md:text-8xl lg:text-[120px] font-black uppercase tracking-tighter leading-[0.85] text-neon drop-shadow-[0_0_50px_oklch(0.86_0.28_140/40%)]">
            {"MASTER"}
          </BlurSmearTitle>
          
          <p className="mx-auto mt-12 max-w-2xl text-lg md:text-xl text-muted-foreground font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            A specialized library of 280+ high-end UI components, interactive shaders, and motion systems for creative developers.
          </p>
          
          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500">
            <a href="#components" className="group relative flex h-14 items-center justify-center overflow-hidden rounded-full bg-neon px-10 text-sm font-bold uppercase tracking-widest text-background transition-all hover:scale-[1.02] active:scale-[0.98]">
              <span className="relative z-10">Explore Catalog</span>
              <div className="absolute inset-0 translate-y-full bg-white transition-transform duration-300 group-hover:translate-y-0" />
            </a>
            <a href="/pricing" className="group flex h-14 items-center justify-center rounded-full border border-border bg-card/50 px-10 text-sm font-bold uppercase tracking-widest text-foreground transition-all hover:bg-card hover:border-neon/30 active:scale-[0.98]">
              Get Full Access
            </a>
          </div>
        </div>
      </section>

      <section id="components" className="mx-auto max-w-[1400px] px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <PreviewQualityPicker className="mb-3" />
            <button
              onClick={() => setOnlyLive((v) => !v)}
              className={"mb-3 flex w-full items-center justify-between rounded-full border px-4 py-2 text-left text-xs font-semibold transition-all " + (onlyLive ? "border-neon bg-neon text-background" : "border-neon/50 bg-neon/10 text-neon hover:bg-neon/20")}
            >
              <span>● só efeitos ao vivo</span>
              <span className="font-mono text-[10px]">{(items ?? []).filter((i) => isSlugLive(i.slug)).length}</span>
            </button>
            <div className="flex flex-col gap-1.5">
              {CATEGORIES.map((c) => {
                const active = cat === c.key;
                const n = counts[c.key] ?? 0;
                return (
                  <button
                    key={c.key}
                    onClick={() => setCat(c.key)}
                    className={"flex items-center justify-between rounded-full border px-4 py-2 text-left text-xs font-medium transition-all " + (active ? "border-neon bg-neon text-background shadow-[0_0_20px_oklch(0.82_0.17_225/45%)]" : "border-border bg-card/40 text-muted-foreground hover:border-neon/50 hover:text-foreground")}
                  >
                    <span>{c.label}</span>
                    <span className={"font-mono text-[10px] " + (active ? "text-background/80" : "text-muted-foreground/70")}>{n}</span>
                  </button>
                );
              })}
            </div>
          </aside>

          <div>
            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="aspect-[4/3] animate-pulse rounded-xl border border-border bg-card/40" />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="grid place-items-center rounded-xl border border-dashed border-border py-24 text-center font-mono text-sm text-muted-foreground">
                nenhum componente nesta categoria
              </div>
            ) : (
              <VirtualizedGrid items={filtered} />
            )}
          </div>
        </div>
      </section>
    </div>
  );
}

function VirtualizedGrid({ items }: { items: MirrorItem[] }) {
  const parentRef = useRef<HTMLDivElement>(null);
  const [cols, setCols] = useState(1);

  useEffect(() => {
    const updateCols = () => {
      const w = window.innerWidth;
      if (w >= 1280) setCols(3);
      else if (w >= 768) setCols(2);
      else setCols(1);
    };
    updateCols();
    window.addEventListener("resize", updateCols);
    return () => window.removeEventListener("resize", updateCols);
  }, []);

  const rowCount = Math.ceil(items.length / cols);
  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 400,
    overscan: 2,
  });

  return (
    <div
      ref={parentRef}
      className="relative w-full h-[80vh] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-neon/20"
    >
      <div
        className="relative w-full"
        style={{
          height: `${virtualizer.getTotalSize()}px`,
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const rowItems = items.slice(
            virtualRow.index * cols,
            (virtualRow.index + 1) * cols
          );

          return (
            <div
              key={virtualRow.key}
              className="absolute left-0 top-0 grid w-full gap-4"
              style={{
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
              }}
            >
              {rowItems.map((item) => (
                <MirrorCard key={item.id} item={item} />
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}

import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { BlurSmearTitle } from "@/components/fx/BlurSmearTitle";
import { isSlugLive, isSlugHandcrafted } from "@/animfx/registry";
import { MirrorCard, type MirrorItem } from "@/components/animmaster/MirrorCard";

type Item = MirrorItem & { position: number };

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
});

function LibraryIndex() {
  const [cat, setCat] = useState<string>("all");
  const [onlyLive, setOnlyLive] = useState(false);

  const { data: items, isLoading } = useQuery({
    queryKey: ["animmaster-items"],
    queryFn: async (): Promise<Item[]> => {
      const { data, error } = await supabase
        .from("animmaster_items")
        .select("*")
        .order("position", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as Item[];
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
      <section id="components" className="mx-auto max-w-[1400px] px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[260px_1fr]">
          <aside className="lg:sticky lg:top-6 lg:self-start">
            <button
              onClick={() => setOnlyLive((v) => !v)}
              className={
                "mb-3 flex w-full items-center justify-between rounded-full border px-4 py-2 text-left text-xs font-semibold transition-all " +
                (onlyLive
                  ? "border-neon bg-neon text-background"
                  : "border-neon/50 bg-neon/10 text-neon hover:bg-neon/20")
              }
            >
              <span>● só efeitos ao vivo</span>
              <span className="font-mono text-[10px]">
                {(items ?? []).filter((i) => isSlugLive(i.slug)).length}
              </span>
            </button>
            <div className="mb-3 rounded-lg border border-border/60 bg-card/40 p-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              <div className="flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-[#ff00c8] shadow-[0_0_8px_#ff00c8]" />{" "}
                handcrafted (
                {(items ?? []).filter((i) => isSlugHandcrafted(i.slug)).length})
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-block h-2 w-2 rounded-full bg-neon" /> template
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              {CATEGORIES.map((c) => {
                const active = cat === c.key;
                const n = counts[c.key] ?? 0;
                return (
                  <button
                    key={c.key}
                    onClick={() => setCat(c.key)}
                    className={
                      "flex items-center justify-between rounded-full border px-4 py-2 text-left text-xs font-medium transition-all " +
                      (active
                        ? "border-neon bg-neon text-background shadow-[0_0_20px_oklch(0.82_0.17_225/45%)]"
                        : "border-border bg-card/40 text-muted-foreground hover:border-neon/50 hover:text-foreground")
                    }
                  >
                    <span>{c.label}</span>
                    <span
                      className={
                        "font-mono text-[10px] " +
                        (active ? "text-background/80" : "text-muted-foreground/70")
                      }
                    >
                      {n}
                    </span>
                  </button>
                );
              })}
            </div>
          </aside>

          <div>
            {isLoading ? (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[4/3] animate-pulse rounded-xl border border-border bg-card/40"
                  />
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="grid place-items-center rounded-xl border border-dashed border-border py-24 text-center font-mono text-sm text-muted-foreground">
                nenhum componente nesta categoria
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((item) => (
                  <MirrorCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}


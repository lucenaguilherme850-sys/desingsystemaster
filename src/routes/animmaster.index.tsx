import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Suspense, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PricingSection } from "@/components/animmaster/PricingSection";
import { FaqSection } from "@/components/animmaster/FaqSection";
import { isSlugLive, isSlugHandcrafted, loadLiveFx } from "@/animfx/registry";

type Item = {
  id: string;
  slug: string;
  category: string;
  name: string;
  type_name: string;
  poster_url: string;
  video_url: string;
  poster_local: string | null;
  video_local: string | null;
  mirrored: boolean;
  position: number;
};

const CATEGORIES: { slug: string; label: string }[] = [
  { slug: "all", label: "Todos" },
  { slug: "scroll", label: "Animações de rolagem" },
  { slug: "mouseeff", label: "Efeitos do mouse" },
  { slug: "pagetr", label: "Transições de página" },
  { slug: "grids", label: "Animações em grade" },
  { slug: "sliders", label: "Sliders" },
  { slug: "hero", label: "Animações de Heróis" },
  { slug: "webgl", label: "Shaders WebGL" },
  { slug: "bg", label: "Animações de fundo" },
  { slug: "navs", label: "Menus de navegação" },
  { slug: "hovers", label: "Efeitos de passar o mouse" },
  { slug: "text", label: "Animações de texto" },
  { slug: "3d", label: "Animações 3D" },
  { slug: "physics", label: "Efeitos da Física" },
  { slug: "svgs", label: "Animações SVG" },
];

export const Route = createFileRoute("/animmaster/")({
  component: AnimmasterMirror,
  head: () => ({
    meta: [
      { title: "Animmaster Mirror — 300 componentes animados" },
      {
        name: "description",
        content:
          "Espelho da biblioteca Animmaster: 280 componentes animados PRO — rolagem, WebGL, sliders, hero, menus e mais.",
      },
    ],
  }),
});

function AnimmasterMirror() {
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

  const filtered = useMemo(
    () => {
      const list = (items ?? []).filter((i) =>
        (cat === "all" || i.category === cat) &&
        (!onlyLive || isSlugLive(i.slug))
      );
      // Handcrafted primeiro, depois demais por position
      return [...list].sort((a, b) => {
        const ah = isSlugHandcrafted(a.slug) ? 0 : 1;
        const bh = isSlugHandcrafted(b.slug) ? 0 : 1;
        if (ah !== bh) return ah - bh;
        return a.position - b.position;
      });
    },
    [items, cat, onlyLive],
  );

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: items?.length ?? 0 };
    items?.forEach((i) => (map[i.category] = (map[i.category] ?? 0) + 1));
    return map;
  }, [items]);

  return (
    <div className="min-h-screen bg-background">
      <section className="border-b border-border/60">
        <div className="mx-auto max-w-[1400px] px-6 py-16 md:py-24">
          <div className="font-mono text-[11px] uppercase tracking-widest text-neon">
            animmaster mirror · 280 components
          </div>
          <h1 className="mt-3 text-4xl md:text-6xl font-extrabold uppercase tracking-tight leading-[0.95]">
            300 PRO-Level Animated Components
          </h1>
          <p className="mt-4 max-w-2xl text-muted-foreground">
            Biblioteca completa espelhada de animmasterlib.dev — passe o cursor
            em qualquer card para ver o efeito em movimento.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[240px_1fr]">
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
              <span className="font-mono text-[10px]">{(items ?? []).filter((i) => isSlugLive(i.slug)).length}</span>
            </button>
            <div className="mb-3 rounded-lg border border-border/60 bg-card/40 p-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
              <div className="flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-[#ff00c8] shadow-[0_0_8px_#ff00c8]" /> handcrafted ({(items ?? []).filter((i) => isSlugHandcrafted(i.slug)).length})</div>
              <div className="mt-1 flex items-center gap-2"><span className="inline-block h-2 w-2 rounded-full bg-neon" /> template</div>
            </div>
            <div className="flex flex-col gap-1.5">
              {CATEGORIES.map((c) => {
                const active = cat === c.slug;
                const n = counts[c.slug] ?? 0;
                return (
                  <button
                    key={c.slug}
                    onClick={() => setCat(c.slug)}
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
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((item) => (
                  <MirrorCard key={item.id} item={item} />
                ))}
              </div>
            )}
            {!isLoading && filtered.length === 0 && (
              <div className="grid place-items-center rounded-xl border border-dashed border-border py-24 text-center font-mono text-sm text-muted-foreground">
                nenhum componente nesta categoria
              </div>
            )}
          </div>
        </div>
      </section>

      <PricingSection />
      <FaqSection />
    </div>
  );
}

function MirrorCard({ item }: { item: Item }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const LiveFx = useMemo(() => loadLiveFx(item.slug), [item.slug]);

  const handleEnter = () => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = 0;
    void v.play().catch(() => undefined);
  };
  const handleLeave = () => {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
  };

  const poster = item.poster_local ?? item.poster_url;
  const video = item.video_local ?? item.video_url;

  return (
    <Link
      to="/animmaster/$slug"
      params={{ slug: item.slug }}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      className="group block overflow-hidden rounded-xl border border-border bg-card/60 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-neon/60 hover:shadow-[0_0_40px_oklch(0.82_0.17_225/20%)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-black">
        {LiveFx ? (
          <div className="pointer-events-none absolute inset-0 overflow-hidden bg-black">
            <div
              className="absolute left-0 top-0 origin-top-left"
              style={{
                width: "1400px",
                height: "1050px",
                transform: "scale(0.32)",
              }}
            >
              <Suspense fallback={<div className="h-full w-full bg-black" />}>
                <LiveFx />
              </Suspense>
            </div>
          </div>
        ) : (
          <>
            <img
              src={poster}
              alt={item.name}
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover transition-opacity duration-300 group-hover:opacity-0"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
              }}
            />
            <video
              ref={videoRef}
              className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              muted
              loop
              playsInline
              preload="none"
              src={video}
            />
          </>
        )}
        {item.mirrored && (
          <span className="absolute left-2 top-2 rounded-full border border-neon/40 bg-background/70 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-neon backdrop-blur">
            local
          </span>
        )}
        {isSlugHandcrafted(item.slug) ? (
          <span className="absolute right-2 top-2 rounded-full border border-[#ff00c8] bg-[#ff00c8] px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-black shadow-[0_0_16px_#ff00c8aa]">
            ● handcrafted
          </span>
        ) : isSlugLive(item.slug) ? (
          <span className="absolute right-2 top-2 rounded-full border border-neon bg-neon px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-background shadow-[0_0_16px_oklch(0.82_0.17_225/60%)]">
            ● live
          </span>
        ) : null}
      </div>
      <div className="flex items-center justify-between gap-3 border-t border-border/60 px-4 py-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold">{item.type_name || item.name}</h3>
          <div className="truncate font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{item.slug}</div>
        </div>
        <span className="shrink-0 rounded-full border border-neon/30 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-neon">
          {item.category}
        </span>
      </div>
    </Link>
  );
}
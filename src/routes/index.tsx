import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Layers } from "lucide-react";
import { BlurSmearTitle } from "@/components/fx/BlurSmearTitle";
import { isSlugLive, isSlugHandcrafted } from "@/animfx/registry";

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
  { slug: "all", label: "All" },
  { slug: "scroll", label: "Scroll" },
  { slug: "mouseeff", label: "Interaction" },
  { slug: "navs", label: "Navigation" },
  { slug: "grids", label: "Layout" },
  { slug: "sliders", label: "Slider" },
  { slug: "hero", label: "Hero" },
  { slug: "webgl", label: "WebGL" },
  { slug: "bg", label: "Background" },
  { slug: "hovers", label: "Hover" },
  { slug: "text", label: "Typography" },
  { slug: "3d", label: "3D" },
  { slug: "physics", label: "Physics" },
  { slug: "svgs", label: "SVG" },
  { slug: "pagetr", label: "Transition" },
];

export const Route = createFileRoute("/")({
  component: LibraryIndex,
});

function LibraryIndex() {
  const [cat, setCat] = useState<string>("all");

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
    const list = (items ?? []).filter((i) => cat === "all" || i.category === cat);
    return [...list].sort((a, b) => {
      const ah = isSlugHandcrafted(a.slug) ? 0 : 1;
      const bh = isSlugHandcrafted(b.slug) ? 0 : 1;
      if (ah !== bh) return ah - bh;
      return a.position - b.position;
    });
  }, [items, cat]);

  const categoriesPresent = useMemo(() => {
    const set = new Set<string>();
    items?.forEach((i) => set.add(i.category));
    return CATEGORIES.filter((c) => c.slug === "all" || set.has(c.slug));
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
      <section id="components" className="mx-auto max-w-[1400px] px-8 pt-16">
        <div className="mb-6 text-center">
          <h2 className="text-2xl md:text-3xl font-bold tracking-tight">PRO-Level Components</h2>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 pb-6">
          {categoriesPresent.map((c) => (
            <button
              key={c.slug}
              onClick={() => setCat(c.slug)}
              className={
                "rounded-full border px-4 py-1.5 text-xs font-medium transition-all " +
                (cat === c.slug
                  ? "border-neon bg-neon text-background shadow-[0_0_20px_oklch(0.82_0.17_225/45%)]"
                  : "border-border bg-card/40 text-muted-foreground hover:border-neon/50 hover:text-foreground")
              }
            >
              {c.label}
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
            <p className="mt-3 font-mono text-sm text-muted-foreground">no components in this category</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((item) => (
              <MirrorCard key={item.id} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function MirrorCard({ item }: { item: Item }) {
  const videoRef = useRef<HTMLVideoElement>(null);

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
        {poster && (
          <img
            src={poster}
            alt={item.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
            }}
          />
        )}
        {video && (
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover"
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
            poster={poster ?? undefined}
            src={video}
          />
        )}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-3">
          <h3 className="truncate text-base font-bold text-white drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)]">
            {item.type_name || item.name}
          </h3>
          <div className="truncate font-mono text-[10px] uppercase tracking-widest text-white/80">
            {item.slug}
          </div>
        </div>
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
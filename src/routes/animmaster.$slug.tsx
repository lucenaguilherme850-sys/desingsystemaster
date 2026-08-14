import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ReactNode, Suspense, useEffect, useMemo, useRef, useState, lazy } from "react";

import { ArrowLeft, ExternalLink, Loader2, Maximize2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { mirrorAnimmasterAsset } from "@/lib/animmaster-mirror.functions";
import { mirrorAnimmasterDrive } from "@/lib/animmaster-drive.functions";
import { hasLiveFx, loadLiveFx } from "@/animfx/registry";
const FxSourceViewer = lazy(() => import("@/components/animmaster/FxSourceViewer"));
const DriveCodeBrowser = lazy(() => import("@/components/animmaster/DriveCodeBrowser"));
const ComponentSpec = lazy(() => import("@/components/animmaster/ComponentSpec"));
const ComponentSpecDrive = lazy(() => import("@/components/animmaster/ComponentSpecDrive"));

import { getFxSourceForSlug } from "@/lib/animfx-source";
import { LockedGate } from "@/components/LockedGate";
import { usePreviewQuality } from "@/hooks/use-preview-quality";
import { GoogleDriveImage } from "@/components/animmaster/GoogleDriveImage";

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
  drive_video_id: string | null;
  drive_zip_id: string | null;
  drive_instruction_id: string | null;
  instruction_text: string | null;
};

export const Route = createFileRoute("/animmaster/$slug")({
  component: AnimmasterDetail,
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} — Documentação e Preview | Design Master` },
      {
        name: "description",
        content: `Preview técnico do componente ${params.slug}. Documentação completa, Prompt Mestre para IA e implementação premium pronta para uso.`,
      },
      { property: "og:title", content: `${params.slug} — Preview Técnico Design Master` },
      { property: "og:description", content: `Veja como implementar o componente ${params.slug} no seu projeto web.` },
      { property: "og:type", content: "product" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
});

function ClientOnlyFallback({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return (
    <div className="grid h-96 place-items-center text-muted-foreground">
      <Loader2 className="size-5 animate-spin text-neon" />
    </div>
  );
  return <>{children}</>;
}

function AnimmasterDetail() {
  const { slug } = Route.useParams();
  const router = useRouter();
  const mirror = useServerFn(mirrorAnimmasterAsset);
  const mirrorDrive = useServerFn(mirrorAnimmasterDrive);
  const { config } = usePreviewQuality();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [mirrorState, setMirrorState] = useState<
    { poster: string; video: string } | null
  >(null);
  const [mirroring, setMirroring] = useState(false);
  const [drive, setDrive] = useState<{ video: string | null; zipUrl: string | null; instruction: string | null } | null>(null);

  const { data: item, isLoading } = useQuery({
    queryKey: ["animmaster-item", slug],
    queryFn: async (): Promise<Item | null> => {
      const { data, error } = await supabase
        .from("animmaster_items")
        .select("*")
        .eq("slug", slug)
        .maybeSingle();
      if (error) throw error;
      return (data as unknown as Item) ?? null;
    },
  });

  const { data: related } = useQuery({
    queryKey: ["animmaster-related", item?.category],
    enabled: !!item,
    queryFn: async (): Promise<Item[]> => {
      const { data, error } = await supabase
        .from("animmaster_items")
        .select("*")
        .eq("category", item!.category)
        .neq("slug", slug)
        .limit(6);
      if (error) throw error;
      return (data ?? []) as unknown as Item[];
    },
  });

  // Trigger mirroring on mount
  useEffect(() => {
    if (!item) return;
    
    // In low quality (Eco Mode), don't trigger mirror automatically on detail page
    // unless it's already mirrored.
    if (config.preload === "none" && !item.mirrored && !item.drive_video_id) {
       return;
    }

    if (item.drive_video_id || item.drive_zip_id) {
      setMirroring(true);
      mirrorDrive({ data: { slug: item.slug } })
        .then((r) => {
          setDrive(r);
          if (r.video) setMirrorState({ poster: item.poster_url, video: r.video });
        })
        .catch((e) => console.error("drive mirror failed", e))
        .finally(() => setMirroring(false));
      return;
    }
    if (item.mirrored && item.poster_local && item.video_local) {
      setMirrorState({ poster: item.poster_local, video: item.video_local });
      return;
    }
    setMirroring(true);
    mirror({ data: { slug: item.slug } })
      .then((r) => setMirrorState(r))
      .catch((e) => console.error("mirror failed", e))
      .finally(() => setMirroring(false));
  }, [item, mirror, mirrorDrive]);

  const posterSrc = mirrorState?.poster ?? item?.poster_url;
  const videoSrc = mirrorState?.video ?? item?.video_url;

  const heading = useMemo(
    () => item?.type_name || item?.name || slug,
    [item, slug],
  );

  const jsonLd = useMemo(() => {
    if (!item) return null;
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "name": heading,
      "description": `Componente premium ${heading} da categoria ${item.category}.`,
      "image": posterSrc,
      "sku": item.slug,
      "brand": {
        "@type": "Brand",
        "name": "Design Master"
      },
      "breadcrumb": {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://animemaster.lovable.app"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Galeria",
            "item": "https://animemaster.lovable.app/animmaster"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": heading,
            "item": `https://animemaster.lovable.app/animmaster/${item.slug}`
          }
        ]
      }
    };
  }, [item, heading, posterSrc]);

  const LiveFx = useMemo(() => (item ? loadLiveFx(item.slug) : null), [item]);

  const goFullscreen = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.requestFullscreen) void v.requestFullscreen();
  };

  if (isLoading) {
    return (
      <div className="grid min-h-[60vh] place-items-center text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-neon" />
      </div>
    );
  }

  if (!item) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="text-2xl font-bold">componente não encontrado</h1>
        <button
          onClick={() => router.navigate({ to: "/animmaster" })}
          className="mt-6 rounded-full border border-neon px-5 py-2 text-sm text-neon"
        >
          voltar para a galeria
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <div className="mx-auto max-w-[1400px] px-6 py-12">
        <Link
          to="/animmaster"
          className="group inline-flex items-center gap-2 rounded-full border border-border bg-card/40 px-4 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground transition-all hover:border-neon/40 hover:text-neon"
        >
          <ArrowLeft className="size-3 transition-transform group-hover:-translate-x-1" /> Back to Catalog
        </Link>

        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_360px]">
          <div>
            {LiveFx ? (
              <div className="relative overflow-hidden rounded-[2rem] border border-neon/40 bg-background shadow-neon animate-in zoom-in-95 duration-700">
                <div className="flex items-center justify-between border-b border-border/40 bg-card/60 px-6 py-4 font-mono text-[10px] uppercase tracking-widest backdrop-blur-xl">
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-neon"></span>
                    </span>
                    <span className="text-neon font-black">Live Production Mode</span>
                  </div>
                  <span className="text-muted-foreground/60">{item.slug}</span>
                </div>
                <div className="min-h-[500px] max-h-[85vh] overflow-auto bg-black/20">
                  <Suspense fallback={<div className="grid h-96 place-items-center text-muted-foreground"><Loader2 className="size-6 animate-spin text-neon" /></div>}>
                    <ClientOnlyFallback>
                      <LiveFx />
                    </ClientOnlyFallback>
                  </Suspense>
                </div>
              </div>
            ) : (
            <div className="relative aspect-video overflow-hidden rounded-[2rem] border border-border bg-black shadow-2xl animate-in zoom-in-95 duration-700">
              <video
                ref={videoRef}
                key={videoSrc}
                src={videoSrc}
                poster={posterSrc}
                autoPlay={config.autoplay}
                muted
                loop={config.autoplay}
                playsInline
                controls
                className="absolute inset-0 h-full w-full object-contain"
              />
              {mirroring && (
                <div className="absolute right-6 top-6 flex items-center gap-2 rounded-full border border-neon/30 bg-background/80 px-4 py-2 font-mono text-[10px] font-black uppercase tracking-widest text-neon backdrop-blur-xl">
                  <Loader2 className="size-3 animate-spin" /> Syncing Local...
                </div>
              )}
              <button
                onClick={goFullscreen}
                className="absolute bottom-6 right-6 inline-flex items-center gap-2 rounded-full border border-neon/40 bg-background/60 px-5 py-2.5 font-mono text-[10px] font-black uppercase tracking-widest text-neon backdrop-blur-xl transition-all hover:bg-neon hover:text-background hover:shadow-neon active:scale-95"
              >
                <Maximize2 className="size-3" /> View Fullscreen
              </button>
            </div>
            )}
          </div>

          <aside className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-700">
            <div>
              <div className="inline-flex items-center rounded-md border border-neon/30 bg-neon/5 px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-[0.2em] text-neon">
                {item.category}
              </div>
              <h1 className="mt-4 text-4xl font-black leading-[0.9] tracking-tighter uppercase">{heading}</h1>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                  REF: {item.slug}
                </span>
                {hasLiveFx(item.slug) && (
                  <span className="rounded-full bg-neon/10 px-2 py-0.5 font-mono text-[9px] font-black uppercase tracking-widest text-neon">
                    ● PRO READY
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-border bg-card/30 p-6 backdrop-blur-xl">
                <div className="font-mono text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                  Sync Status
                </div>
                <div className="mt-3 flex items-center gap-3">
                  <div className={`h-2 w-2 rounded-full ${mirrorState ? 'bg-neon shadow-[0_0_8px_var(--neon)]' : 'bg-muted-foreground/30'}`} />
                  <span className="text-xs font-bold tracking-tight">
                    {mirrorState ? "LOCAL OPTIMIZED" : mirroring ? "SYNCING RESOURCES..." : "REMOTE HOTLINK"}
                  </span>
                </div>
              </div>

              {drive?.zipUrl && (
                <a
                  href={drive.zipUrl}
                  className="group flex w-full items-center justify-between rounded-2xl bg-neon p-5 text-background transition-all hover:scale-[1.02] hover:shadow-neon active:scale-[0.98]"
                >
                  <span className="font-black uppercase tracking-widest text-xs">Download Source</span>
                  <ExternalLink className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </a>
              )}

              {drive?.instruction && (
                <div className="rounded-2xl border border-border bg-card/20 p-6">
                  <div className="mb-4 font-mono text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40">
                    Author Directives
                  </div>
                  <div className="max-h-48 overflow-y-auto pr-2 scrollbar-thin">
                    <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-foreground/80">
                      {drive.instruction?.replace(/Animmaster/g, 'Design Master')}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        {related && related.length > 0 && (
          <section className="mt-16">
            <h2 className="font-mono text-[11px] uppercase tracking-widest text-neon">
              mais em {item.category}
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {related.map((r) => (
                <Link
                  key={r.id}
                  to="/animmaster/$slug"
                  params={{ slug: r.slug }}
                  className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-black"
                >
                  <GoogleDriveImage
                    src={r.poster_local ?? (r.drive_video_id ? `https://drive.google.com/thumbnail?id=${r.drive_video_id}&sz=${config.preload === "none" ? "w200" : "w600"}` : r.poster_url)}
                    alt={r.name}
                    className="h-full w-full transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  <div className="absolute bottom-2 left-2 right-2 truncate font-mono text-[9px] uppercase tracking-tighter text-white opacity-0 transition-opacity group-hover:opacity-100">
                    {r.type_name || r.name}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className="mt-16">
          <h2 className="font-mono text-[11px] uppercase tracking-widest text-neon">
            código + prompt
          </h2>
          <h2 className="mt-1 text-2xl font-bold">Como replicar no seu app</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Copie o arquivo do componente ou o <strong>prompt pronto</strong> para colar
            no Lovable — ele vai perguntar em qual página do seu app você quer
            montar antes de instalar.
          </p>
          <LockedGate requires="pro" label="Código + prompt mestre bloqueados">
            <Suspense fallback={<div className="h-40 animate-pulse rounded-xl bg-card/40" />}>
              {item.drive_zip_id ? (
                <DriveCodeBrowser slug={item.slug} />
              ) : (
                <FxSourceViewer slug={item.slug} name={heading} />
              )}
            </Suspense>

            <Suspense fallback={<div className="mt-8 h-80 animate-pulse rounded-xl bg-card/40" />}>
              {item.drive_zip_id ? (
                <ComponentSpecDrive
                  slug={item.slug}
                  name={heading}
                  category={item.category}
                  summary={item.instruction_text}
                />
              ) : (
                (() => {
                  const info = getFxSourceForSlug(item.slug);
                  if (!info) return null;
                  return (
                    <ComponentSpec
                      slug={item.slug}
                      name={heading}
                      category={item.category}
                      files={info.files.map((f) => ({ path: f.path, content: f.content }))}
                    />
                  );
                })()
              )}
            </Suspense>

          </LockedGate>
        </section>
      </div>
    </div>
  );
}
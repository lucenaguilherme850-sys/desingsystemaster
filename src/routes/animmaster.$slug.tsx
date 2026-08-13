import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ReactNode, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ExternalLink, Loader2, Maximize2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { mirrorAnimmasterAsset } from "@/lib/animmaster-mirror.functions";
import { mirrorAnimmasterDrive } from "@/lib/animmaster-drive.functions";
import { hasLiveFx, loadLiveFx } from "@/animfx/registry";
import FxSourceViewer from "@/components/animmaster/FxSourceViewer";
import DriveCodeBrowser from "@/components/animmaster/DriveCodeBrowser";
import ComponentSpec from "@/components/animmaster/ComponentSpec";
import ComponentSpecDrive from "@/components/animmaster/ComponentSpecDrive";
import { getFxSourceForSlug } from "@/lib/animfx-source";
import { LockedGate } from "@/components/LockedGate";
import { usePreviewQuality } from "@/hooks/use-preview-quality";

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
      { title: `${params.slug} — Design Master Mirror` },
      {
        name: "description",
        content: `Preview em tela cheia do componente animado ${params.slug}.`,
      },
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
      <div className="mx-auto max-w-[1400px] px-6 py-8">
        <Link
          to="/animmaster"
          className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-neon"
        >
          <ArrowLeft className="size-3.5" /> voltar
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            {LiveFx ? (
              <div className="relative overflow-hidden rounded-2xl border border-neon/60 bg-black shadow-[0_0_60px_oklch(0.82_0.17_225/25%)]">
                <div className="flex items-center justify-between border-b border-border/60 bg-background/70 px-4 py-2 font-mono text-[10px] uppercase tracking-widest">
                  <span className="text-neon">● live component</span>
                  <span className="text-muted-foreground">{item.slug}</span>
                </div>
                <div className="max-h-[80vh] overflow-auto">
                  <Suspense fallback={<div className="grid h-96 place-items-center text-muted-foreground"><Loader2 className="size-5 animate-spin text-neon" /></div>}>
                    <ClientOnlyFallback>
                      <LiveFx />
                    </ClientOnlyFallback>
                  </Suspense>
                </div>
              </div>
            ) : (
            <div className="relative aspect-video overflow-hidden rounded-2xl border border-border bg-black">
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
                <div className="absolute right-3 top-3 flex items-center gap-2 rounded-full bg-background/80 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-neon backdrop-blur">
                  <Loader2 className="size-3 animate-spin" /> mirroring…
                </div>
              )}
              <button
                onClick={goFullscreen}
                className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full border border-neon/50 bg-background/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-widest text-neon backdrop-blur transition-colors hover:bg-neon hover:text-background"
              >
                <Maximize2 className="size-3" /> fullscreen
              </button>
            </div>
            )}
          </div>

          <aside className="space-y-5">
            <div>
              <div className="font-mono text-[11px] uppercase tracking-widest text-neon">
                {item.category}
              </div>
              <h1 className="mt-2 text-2xl font-bold leading-tight">{heading}</h1>
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                slug · {item.slug}
              </p>
              {hasLiveFx(item.slug) && (
                <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-neon/40 bg-neon/10 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-neon">
                  ● efeito ao vivo implementado
                </div>
              )}
            </div>

            <div className="rounded-xl border border-border bg-card/60 p-4 text-xs">
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                status do mirror
              </div>
              <div className="mt-2 flex items-center gap-2 text-sm">
                {mirrorState ? (
                  <span className="text-neon">✓ servido localmente</span>
                ) : mirroring ? (
                  <span className="text-muted-foreground">baixando remoto…</span>
                ) : (
                  <span className="text-muted-foreground">remoto (hotlink)</span>
                )}
              </div>
            </div>

            <a
              href={item.video_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 text-xs text-muted-foreground hover:text-neon"
            >
              vídeo original <ExternalLink className="size-3" />
            </a>

            {drive?.zipUrl && (
              <a
                href={drive.zipUrl}
                className="inline-flex items-center gap-2 rounded-full border border-neon/60 bg-neon/10 px-4 py-2 font-mono text-[11px] uppercase tracking-widest text-neon transition-colors hover:bg-neon hover:text-background"
              >
                baixar code.zip <ExternalLink className="size-3" />
              </a>
            )}
            {drive?.instruction && (
              <div className="rounded-xl border border-border bg-card/60 p-4">
                <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  instruções do autor
                </div>
                <pre className="mt-2 whitespace-pre-wrap font-mono text-xs text-foreground">
                  {drive.instruction?.replace(/Animmaster/g, 'Design Master')}
                </pre>
              </div>
            )}
          </aside>
        </div>

        {related && related.length > 0 && (
          <section className="mt-16">
            <div className="font-mono text-[11px] uppercase tracking-widest text-neon">
              mais em {item.category}
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              {related.map((r) => (
                <Link
                  key={r.id}
                  to="/animmaster/$slug"
                  params={{ slug: r.slug }}
                  className="group relative aspect-[4/3] overflow-hidden rounded-lg border border-border bg-black"
                >
                  <img
                    src={r.poster_local ?? (r.drive_video_id ? `https://drive.google.com/thumbnail?id=${r.drive_video_id}&sz=w600` : r.poster_url)}
                    alt={r.name}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
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
          <div className="font-mono text-[11px] uppercase tracking-widest text-neon">
            código + prompt
          </div>
          <h2 className="mt-1 text-2xl font-bold">Como replicar no seu app</h2>
          <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Copie o arquivo do componente ou o <strong>prompt pronto</strong> para colar
            no Lovable — ele vai perguntar em qual página do seu app você quer
            montar antes de instalar.
          </p>
          <LockedGate requires="pro" label="Código + prompt mestre bloqueados">
            {item.drive_zip_id ? (
              <DriveCodeBrowser slug={item.slug} />
            ) : (
              <FxSourceViewer slug={item.slug} name={heading} />
            )}

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
          </LockedGate>
        </section>
      </div>
    </div>
  );
}
import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { mirrorAnimmasterDrive } from "@/lib/animmaster-drive.functions";
import { isSlugLive, isSlugHandcrafted } from "@/animfx/registry";
import { usePreviewQuality } from "@/hooks/use-preview-quality";
import { GoogleDriveImage } from "./GoogleDriveImage";

export type MirrorItem = {
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
  drive_video_id: string | null;
  position: number;
};

// Global concurrency-limited mirror queue so we don't hammer the server
// with 280 parallel requests when the grid mounts.
const MAX_CONCURRENT = 4;
let active = 0;
const queue: Array<() => void> = [];
function runNext() {
  if (active >= MAX_CONCURRENT) return;
  const task = queue.shift();
  if (!task) return;
  active++;
  task();
}
function enqueue(task: () => Promise<unknown>) {
  return new Promise<void>((resolve) => {
    queue.push(() => {
      task()
        .catch(() => undefined)
        .finally(() => {
          active--;
          resolve();
          runNext();
        });
    });
    runNext();
  });
}

export function MirrorCard({ item }: { item: MirrorItem }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const rootRef = useRef<HTMLAnchorElement>(null);
  const mirror = useServerFn(mirrorAnimmasterDrive);
  const { config } = usePreviewQuality();
  const [videoUrl, setVideoUrl] = useState<string | null>(
    item.video_local ?? (item.video_url || null),
  );
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);
  const triedRef = useRef(false);

  const ensureMirrored = () => {
    if (videoUrl || !item.drive_video_id || triedRef.current) return;
    // Low quality: don't fetch the mp4 at all until user hovers.
    if (config.preload === "none" && !hovered) return;
    triedRef.current = true;
    void enqueue(() =>
      mirror({ data: { slug: item.slug } }).then((r) => {
        if (r?.video) setVideoUrl(r.video);
      }),
    );
  };

  // Pre-mirror as soon as card comes near viewport
  useEffect(() => {
    if (!rootRef.current) return;
    if (config.preload === "none") return; // wait for hover
    const el = rootRef.current;
    const preload = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            ensureMirrored();
            preload.disconnect();
            break;
          }
        }
      },
      { rootMargin: "600px" },
    );
    preload.observe(el);
    return () => preload.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.preload]);

  // Play/pause based on actual visibility
  useEffect(() => {
    if (!rootRef.current) return;
    const el = rootRef.current;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) setVisible(e.isIntersecting);
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    
    let isPlaying = false;
    const shouldPlay =
      visible &&
      videoUrl != null &&
      (config.hoverOnly ? hovered : config.autoplay);

    if (shouldPlay) {
      isPlaying = true;
      void v.play().catch(() => {
        isPlaying = false;
      });
    } else {
      v.pause();
      // Optimization: unload video if hidden for a long time to free memory
      if (!visible && config.preload === "none") {
        v.src = "";
        v.load();
      }
    }

    return () => {
      if (v) {
        v.pause();
        v.src = "";
        v.load();
      }
    };
  }, [visible, videoUrl, hovered, config.hoverOnly, config.autoplay, config.preload]);

  // Performance enhancement: Throttled rendering for off-screen components
  // and using will-change for video layers
  const videoStyle = {
    willChange: hovered ? 'opacity, transform' : 'auto',
    opacity: hovered ? 1 : 0
  };


  const thumbSize = config.preload === "none" ? "w400" : "w1000";
  const drivePoster = item.drive_video_id
    ? `https://drive.google.com/thumbnail?id=${item.drive_video_id}&sz=${thumbSize}`
    : null;
  const poster = item.poster_local || item.poster_url || drivePoster;

  return (
    <Link
      ref={rootRef}
      to="/animmaster/$slug"
      params={{ slug: item.slug }}
      onMouseEnter={() => {
        setHovered(true);
        ensureMirrored();
      }}
      onMouseLeave={() => setHovered(false)}
      className="group relative block overflow-hidden rounded-2xl border border-border bg-card/40 backdrop-blur-xl transition-all duration-500 hover:-translate-y-1 hover:border-neon/40 hover:shadow-neon"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {/* Component Shell Background */}
        <div className="absolute inset-0 grid-bg opacity-[0.05] pointer-events-none" />
        
        {poster ? (
          <GoogleDriveImage
            src={poster}
            alt={item.type_name || item.name || item.slug}
            className={`absolute inset-0 h-full w-full object-cover transition-transform duration-700 ${hovered ? 'scale-110 blur-sm opacity-50' : 'scale-100'}`}
            loading={item.position < 6 ? "eager" : "lazy"}
          />
        ) : null}

        {visible && videoUrl && (
          <video
            ref={videoRef}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${hovered ? 'opacity-100' : 'opacity-0'}`}
            muted
            loop
            playsInline
            autoPlay={config.autoplay}
            preload={config.preload}
            poster={poster ?? undefined}
            src={videoUrl}
          />
        )}

        {/* Action Overlay */}
        <div className={`absolute inset-0 flex items-center justify-center gap-3 bg-black/40 transition-opacity duration-300 ${hovered ? 'opacity-100' : 'opacity-0'}`}>
          <div className="rounded-full bg-neon px-4 py-2 text-[10px] font-black uppercase tracking-widest text-background shadow-neon transition-transform duration-300 hover:scale-105">
            View Source
          </div>
        </div>

        {/* Badges */}
        <div className="absolute left-3 top-3 flex flex-wrap gap-2">
          {isSlugHandcrafted(item.slug) && (
            <span className="rounded-md border border-neon-purple/50 bg-neon-purple/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-tighter text-neon-purple backdrop-blur-md">
              Handcrafted
            </span>
          )}
          {isSlugLive(item.slug) && (
            <span className="rounded-md border border-neon/50 bg-neon/10 px-2 py-0.5 text-[8px] font-black uppercase tracking-tighter text-neon backdrop-blur-md">
              Live Effect
            </span>
          )}
        </div>
      </div>

      <div className="relative border-t border-border/40 p-5 transition-colors duration-300 group-hover:bg-card/60">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-sm font-bold tracking-tight text-foreground transition-colors group-hover:text-neon">
              {item.type_name || item.name}
            </h3>
            <p className="mt-1 truncate font-mono text-[9px] font-medium uppercase tracking-[0.15em] text-muted-foreground/60">
              {item.slug}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
             <span className="shrink-0 rounded-md border border-border bg-background/50 px-2 py-0.5 text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
              {item.category.split(' ')[0]}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
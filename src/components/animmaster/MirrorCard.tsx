import { Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { mirrorAnimmasterDrive } from "@/lib/animmaster-drive.functions";
import { isSlugLive, isSlugHandcrafted } from "@/animfx/registry";
import { usePreviewQuality } from "@/hooks/use-preview-quality";

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
    const shouldPlay =
      visible &&
      videoUrl != null &&
      (config.hoverOnly ? hovered : config.autoplay);
    if (shouldPlay) {
      void v.play().catch(() => undefined);
    } else {
      v.pause();
    }
  }, [visible, videoUrl, hovered, config.hoverOnly, config.autoplay]);

  const drivePoster = item.drive_video_id
    ? `https://drive.google.com/thumbnail?id=${item.drive_video_id}&sz=w1000`
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
      className="group block overflow-hidden rounded-xl border border-border bg-card/60 backdrop-blur transition-all hover:-translate-y-0.5 hover:border-neon/60 hover:shadow-[0_0_40px_oklch(0.82_0.17_225/20%)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-black">
        {poster ? (
          <img
            src={poster}
            alt={item.name}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).style.display = "none";
            }}
          />
        ) : null}
        {videoUrl && (
          <video
            ref={videoRef}
            className="absolute inset-0 h-full w-full object-cover will-change-transform"
            muted
            loop
            playsInline
            autoPlay={config.autoplay}
            preload={config.preload}
            poster={poster ?? undefined}
            src={videoUrl}
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
import { useEffect, useRef } from "react";
import { AM } from "./_am-tokens";

// Hero Animation — massive display slams in with blur + scale + per-char stagger.
export function AmHeroSlam() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const chars = ref.current?.querySelectorAll<HTMLSpanElement>("[data-c]");
    chars?.forEach((c, i) => {
      c.animate(
        [
          { opacity: 0, filter: "blur(24px)", transform: "translateY(60%) scale(1.4)" },
          { opacity: 1, filter: "blur(0)", transform: "translateY(0) scale(1)" },
        ],
        { duration: 1000, delay: i * 40, easing: AM.easeOut, fill: "both" },
      );
    });
  }, []);
  const line1 = "PIXEL";
  const line2 = "CULTURE";
  return (
    <div
      ref={ref}
      className="relative overflow-hidden grid place-items-center min-h-[520px] text-center"
      style={{ background: `radial-gradient(ellipse 60% 40% at 50% 100%, ${AM.cyanSoft}, transparent 70%), ${AM.bg}` }}
    >
      <div>
        <div className="mb-3 font-mono text-[10px] uppercase tracking-[0.35em]" style={{ color: AM.inkFaint }}>
          hero · slam
        </div>
        <h1 style={{ color: AM.ink, fontSize: "clamp(72px,12vw,180px)", fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 0.9 }}>
          {[...line1].map((c, i) => <span key={i} data-c className="inline-block will-change-transform">{c}</span>)}
          <br />
          {[...line2].map((c, i) => (
            <span key={i} data-c className="inline-block will-change-transform" style={{ color: AM.cyan, textShadow: AM.cyanGlow }}>
              {c}
            </span>
          ))}
        </h1>
      </div>
    </div>
  );
}
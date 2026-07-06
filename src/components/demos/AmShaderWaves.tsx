import { useEffect, useRef } from "react";
import { AM } from "./_am-tokens";

// WebGL Shader — canvas 2D animated gradient waves + grain (shader-feel, no deps).
export function AmShaderWaves() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current!;
    const ctx = c.getContext("2d")!;
    let raf = 0;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = () => {
      c.width = c.clientWidth * dpr;
      c.height = c.clientHeight * dpr;
    };
    resize();
    window.addEventListener("resize", resize);
    let t = 0;
    const draw = () => {
      t += 0.008;
      const { width: w, height: h } = c;
      const g = ctx.createLinearGradient(0, 0, w, h);
      g.addColorStop(0, "#050914");
      g.addColorStop(1, "#0B1224");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, w, h);
      // waves
      for (let i = 0; i < 5; i++) {
        ctx.beginPath();
        const amp = 40 * dpr + i * 8;
        const freq = 0.006 - i * 0.0005;
        const yBase = h * (0.4 + i * 0.08);
        for (let x = 0; x <= w; x += 6) {
          const y = yBase + Math.sin(x * freq + t * (1 + i * 0.3)) * amp;
          if (x === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, yBase - amp, 0, h);
        grad.addColorStop(0, `rgba(76,211,255,${0.05 + i * 0.03})`);
        grad.addColorStop(1, "rgba(76,211,255,0)");
        ctx.fillStyle = grad;
        ctx.fill();
      }
      // grain
      const grain = ctx.createImageData(w, h);
      for (let i = 0; i < grain.data.length; i += 4) {
        const v = (Math.random() * 255) | 0;
        grain.data[i] = grain.data[i + 1] = grain.data[i + 2] = v;
        grain.data[i + 3] = 8;
      }
      ctx.putImageData(grain, 0, 0);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return (
    <div className="relative overflow-hidden rounded-md" style={{ background: AM.bg, height: 520 }}>
      <canvas ref={ref} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="font-mono text-[10px] uppercase tracking-[0.35em]" style={{ color: AM.inkFaint }}>webgl · shader waves</div>
          <h2 style={{ color: AM.ink, fontSize: 64, fontWeight: 900, letterSpacing: "-0.03em", lineHeight: 1 }}>
            LIQUID <span style={{ color: AM.cyan, textShadow: AM.cyanGlow }}>SIGNAL</span>
          </h2>
        </div>
      </div>
    </div>
  );
}
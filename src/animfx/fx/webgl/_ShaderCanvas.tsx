import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";

const VERT = `attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}`;

type Props = {
  frag: string;
  title?: string;
  subtitle?: string;
  overlay?: React.ReactNode;
  className?: string;
};

export default function ShaderCanvas({ frag, title, subtitle, overlay, className }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;
    const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 2), alpha: false });
    const gl = renderer.gl;
    wrap.appendChild(gl.canvas);
    const program = new Program(gl, {
      vertex: VERT,
      fragment: frag,
      uniforms: {
        uTime: { value: 0 },
        uRes: { value: [1, 1] },
        uMouse: { value: [0, 0] },
      },
    });
    const mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
    const resize = () => {
      renderer.setSize(wrap.clientWidth, wrap.clientHeight);
      program.uniforms.uRes.value = [gl.canvas.width, gl.canvas.height];
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    const onMove = (e: MouseEvent) => {
      const r = wrap.getBoundingClientRect();
      program.uniforms.uMouse.value = [
        (e.clientX - r.left) / r.width - 0.5,
        -((e.clientY - r.top) / r.height - 0.5),
      ];
    };
    wrap.addEventListener("mousemove", onMove);
    let raf = 0;
    const t0 = performance.now();
    const loop = () => {
      program.uniforms.uTime.value = (performance.now() - t0) / 1000;
      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      wrap.removeEventListener("mousemove", onMove);
      gl.canvas.remove();
    };
  }, [frag]);
  return (
    <div className={"relative min-h-[70vh] w-full overflow-hidden bg-black " + (className ?? "")}>
      <div ref={wrapRef} className="absolute inset-0" />
      {(title || subtitle || overlay) && (
        <div className="pointer-events-none relative grid h-full min-h-[70vh] place-items-center px-6 text-center">
          <div>
            {subtitle && (
              <div className="font-mono text-[11px] uppercase tracking-[0.4em] text-white/80">{subtitle}</div>
            )}
            {title && (
              <h2 className="mt-3 text-5xl md:text-7xl font-black uppercase text-white drop-shadow-[0_2px_20px_rgba(0,0,0,.6)]">{title}</h2>
            )}
            {overlay}
          </div>
        </div>
      )}
    </div>
  );
}
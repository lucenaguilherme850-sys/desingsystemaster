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

    let renderer: Renderer | null = null;
    let program: Program | null = null;
    let mesh: Mesh | null = null;
    let raf = 0;
    let observer: IntersectionObserver | null = null;
    let isDisposed = false;


    const init = () => {
      if (renderer || isDisposed) return;
      // Detect performance to adjust DPR
      const mem = (navigator as any).deviceMemory || 8;
      const cores = navigator.hardwareConcurrency || 4;
      const dprFactor = mem < 4 || cores <= 2 ? 1 : 2;
      
      renderer = new Renderer({ 
        dpr: Math.min(window.devicePixelRatio, dprFactor), 
        alpha: false,
        premultipliedAlpha: false,
        preserveDrawingBuffer: false,
        powerPreference: "high-performance"
      });
      const gl = renderer.gl;
      wrap.appendChild(gl.canvas);

      program = new Program(gl, {
        vertex: VERT,
        fragment: frag,
        uniforms: {
          uTime: { value: 0 },
          uRes: { value: [1, 1] },
          uMouse: { value: [0, 0] },
        },
      });
      mesh = new Mesh(gl, { geometry: new Triangle(gl), program });
      resize();
      loop();
    };

    const dispose = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      if (renderer) {
        const gl = renderer.gl;
        // Strict WebGL resource cleanup
        if (mesh) {
          gl.deleteBuffer(mesh.geometry.attributes.position.buffer);
        }
        if (program) {
          gl.deleteProgram(program.program);
        }
        renderer.gl.canvas.remove();
        const extension = gl.getExtension('WEBGL_lose_context');
        if (extension) extension.loseContext();
      }
      renderer = null;
      program = null;
      mesh = null;
    };


    const resize = () => {
      if (!renderer || !program || !wrap) return;
      renderer.setSize(wrap.clientWidth, wrap.clientHeight);
      program.uniforms.uRes.value = [renderer.gl.canvas.width, renderer.gl.canvas.height];
    };

    const t0 = performance.now();
    const loop = () => {
      if (!renderer || !program || !mesh) return;
      program.uniforms.uTime.value = (performance.now() - t0) / 1000;
      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: MouseEvent) => {
      if (!program || !wrap) return;
      const r = wrap.getBoundingClientRect();
      program.uniforms.uMouse.value = [
        (e.clientX - r.left) / r.width - 0.5,
        -((e.clientY - r.top) / r.height - 0.5),
      ];
    };

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    wrap.addEventListener("mousemove", onMove);

    observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) init();
      else dispose();
    }, { threshold: 0.01 });
    observer.observe(wrap);

    return () => {
      isDisposed = true;
      dispose();
      ro.disconnect();
      if (observer) observer.disconnect();
      wrap.removeEventListener("mousemove", onMove);
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
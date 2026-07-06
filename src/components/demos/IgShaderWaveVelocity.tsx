import { useEffect, useRef, useState } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";

const VERT = /* glsl */ `
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = position * 0.5 + 0.5;
  gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAG = /* glsl */ `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uVelocity;
uniform vec2 uMouse;

void main() {
  vec2 uv = vUv;
  float dist = distance(uv, uMouse);
  float wave = sin((dist * 30.0) - uTime * 2.0 + uVelocity * 8.0);
  wave *= smoothstep(0.6, 0.0, dist);

  float grid = step(0.98, fract(uv.x * 20.0 + wave * 0.15))
             + step(0.98, fract(uv.y * 20.0 + wave * 0.15));

  vec3 base = mix(vec3(0.02, 0.04, 0.08), vec3(0.05, 0.55, 0.95), wave * 0.5 + 0.5);
  vec3 col = base + grid * 0.25;
  col += abs(uVelocity) * vec3(0.9, 0.3, 0.8);

  gl_FragColor = vec4(col, 1.0);
}
`;

export function IgShaderWaveVelocity() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 2), alpha: false });
    const gl = renderer.gl;
    wrap.appendChild(gl.canvas);
    gl.canvas.style.width = "100%";
    gl.canvas.style.height = "100%";
    gl.canvas.style.display = "block";

    const geometry = new Triangle(gl);
    const program = new Program(gl, {
      vertex: VERT,
      fragment: FRAG,
      uniforms: {
        uTime: { value: 0 },
        uVelocity: { value: 0 },
        uMouse: { value: [0.5, 0.5] },
      },
    });
    const mesh = new Mesh(gl, { geometry, program });

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      renderer.setSize(rect.width, rect.height);
    };
    resize();
    window.addEventListener("resize", resize);

    let target = { x: 0.5, y: 0.5 };
    let prev = { x: 0.5, y: 0.5 };
    let velocity = 0;

    const onMove = (e: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      target.x = (e.clientX - rect.left) / rect.width;
      target.y = 1 - (e.clientY - rect.top) / rect.height;
    };
    wrap.addEventListener("pointermove", onMove);

    let rafId = 0;
    const start = performance.now();
    const loop = (now: number) => {
      const t = (now - start) / 1000;
      const dx = target.x - prev.x;
      const dy = target.y - prev.y;
      const inst = Math.sqrt(dx * dx + dy * dy);
      velocity = velocity * 0.9 + inst * 0.1;
      prev.x += dx * 0.15;
      prev.y += dy * 0.15;

      program.uniforms.uTime.value = t;
      program.uniforms.uVelocity.value = velocity;
      (program.uniforms.uMouse.value as number[])[0] = prev.x;
      (program.uniforms.uMouse.value as number[])[1] = prev.y;
      renderer.render({ scene: mesh });
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);
    setReady(true);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", resize);
      wrap.removeEventListener("pointermove", onMove);
      gl.canvas.remove();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <div className="relative h-[360px] w-full overflow-hidden rounded-md border border-border bg-background">
      <div ref={wrapRef} className="absolute inset-0" />
      <div className="pointer-events-none absolute left-3 top-3 font-mono text-[10px] uppercase tracking-wider text-white/80 mix-blend-difference">
        ogl · wave × velocity {ready ? "" : "· loading"}
      </div>
      <div className="pointer-events-none absolute bottom-3 right-3 font-mono text-[10px] uppercase tracking-wider text-white/80 mix-blend-difference">
        move pointer
      </div>
    </div>
  );
}
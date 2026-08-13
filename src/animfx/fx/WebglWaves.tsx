import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";

const vert = `attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}`;
const frag = `
precision highp float;
uniform float uTime;
uniform vec2 uRes;
uniform vec2 uMouse;
void main(){
  vec2 uv=(gl_FragCoord.xy - .5*uRes)/uRes.y;
  float t=uTime*.35;
  float d = 0.;
  for(float i=1.;i<6.;i++){
    d += sin(uv.x*i*3. + t + uMouse.x*3.) * .12;
    d += cos(uv.y*i*3. - t*.8 + uMouse.y*3.) * .12;
  }
  float glow = smoothstep(.6,.0, abs(uv.y + d*.4));
  vec3 c = mix(vec3(.02,.05,.11), vec3(.0,.9,1.), glow);
  c += vec3(.8,.2,1.) * smoothstep(.4,0., abs(uv.y - d*.3)) * .5;
  gl_FragColor = vec4(c,1.);
}`;

export default function WebglWaves() {
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    let renderer: Renderer | null = null;
    let program: Program | null = null;
    let mesh: Mesh | null = null;
    let raf = 0;
    let observer: IntersectionObserver | null = null;

    const init = () => {
      if (renderer) return;
      renderer = new Renderer({ dpr: Math.min(window.devicePixelRatio, 2) });
      const gl = renderer.gl;
      wrap.appendChild(gl.canvas);
      program = new Program(gl, {
        vertex: vert,
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
        renderer.gl.canvas.remove();
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

    const start = performance.now();
    const loop = () => {
      if (!renderer || !program || !mesh) return;
      program.uniforms.uTime.value = (performance.now() - start) / 1000;
      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(loop);
    };

    const onMove = (e: MouseEvent) => {
      if (!program || !wrap) return;
      const r = wrap.getBoundingClientRect();
      program.uniforms.uMouse.value = [
        (e.clientX - r.left) / r.width - 0.5,
        (e.clientY - r.top) / r.height - 0.5,
      ];
    };

    window.addEventListener("resize", resize);
    wrap.addEventListener("mousemove", onMove);

    observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) init();
      else dispose();
    }, { threshold: 0.01 });
    observer.observe(wrap);

    return () => {
      dispose();
      window.removeEventListener("resize", resize);
      wrap.removeEventListener("mousemove", onMove);
      if (observer) observer.disconnect();
    };
  }, []);
  return (
    <div className="relative min-h-[70vh] w-full overflow-hidden bg-black">
      <div ref={wrapRef} className="absolute inset-0" />
      <div className="pointer-events-none relative grid h-full min-h-[70vh] place-items-center">
        <div className="text-center">
          <div className="font-mono text-xs uppercase tracking-[0.4em] text-white/80">webgl · ogl</div>
          <h2 className="mt-3 text-5xl md:text-7xl font-black uppercase text-white">Waves</h2>
        </div>
      </div>
    </div>
  );
}
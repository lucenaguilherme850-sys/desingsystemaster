import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";

const FRAG = `precision highp float;
varying vec2 vUv;
uniform float uTime;
void main(){
  vec2 uv=vUv;
  float n=sin(uv.x*8.+uTime)+cos(uv.y*8.-uTime*0.7);
  vec3 c=mix(vec3(0.02,0.03,0.08),vec3(0.1,0.4,0.9),n*0.25+0.5);
  c+=step(0.98,fract(uv.x*24.))*0.15;
  gl_FragColor=vec4(c,1.);
}`;
const VERT = `attribute vec2 position;varying vec2 vUv;void main(){vUv=position*.5+.5;gl_Position=vec4(position,0.,1.);}`;

export function IgWebglGlobal() {
  const wrap = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const r = new Renderer({ dpr: Math.min(devicePixelRatio, 2), alpha: false });
    el.appendChild(r.gl.canvas);
    r.gl.canvas.style.cssText = "width:100%;height:100%;display:block";
    const p = new Program(r.gl, { vertex: VERT, fragment: FRAG, uniforms: { uTime: { value: 0 } } });
    const m = new Mesh(r.gl, { geometry: new Triangle(r.gl), program: p });
    const resize = () => r.setSize(el.clientWidth, el.clientHeight);
    resize();
    window.addEventListener("resize", resize);
    let id = 0;
    const t0 = performance.now();
    const loop = () => {
      p.uniforms.uTime.value = (performance.now() - t0) / 1000;
      r.render({ scene: m });
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("resize", resize);
      r.gl.canvas.remove();
      r.gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);
  return (
    <div className="relative h-[320px] w-full overflow-hidden rounded-md border border-border">
      <div ref={wrap} className="absolute inset-0" />
      <div className="pointer-events-none absolute inset-x-0 top-0 grid grid-cols-3 border-b border-white/10 bg-black/40 p-3 font-mono text-[10px] uppercase text-white/80 backdrop-blur">
        <span>section · 01</span>
        <span className="text-center">shared canvas</span>
        <span className="text-right">persistent gl</span>
      </div>
    </div>
  );
}
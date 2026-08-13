import { useEffect, useRef } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";
import { palette } from "./palette";

const SHADERS = [
  `precision highp float;uniform float uTime;uniform vec2 uRes;uniform vec3 uA;uniform vec3 uB;
   void main(){vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;float t=uTime*.35;float d=0.;
   for(float i=1.;i<6.;i++){d+=sin(uv.x*i*3.+t)*.12;d+=cos(uv.y*i*3.-t*.8)*.12;}
   float g=smoothstep(.6,.0,abs(uv.y+d*.4));vec3 c=mix(vec3(.02,.05,.11),uA,g);
   c+=uB*smoothstep(.4,0.,abs(uv.y-d*.3))*.5;gl_FragColor=vec4(c,1.);}`,
  `precision highp float;uniform float uTime;uniform vec2 uRes;uniform vec3 uA;uniform vec3 uB;
   void main(){vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;float t=uTime*.6;
   float r=length(uv)-.3;float w=sin(r*30.-t*2.)*.5+.5;
   vec3 c=mix(uA,uB,w);c*=smoothstep(.9,.0,r+.5);gl_FragColor=vec4(c,1.);}`,
  `precision highp float;uniform float uTime;uniform vec2 uRes;uniform vec3 uA;uniform vec3 uB;
   void main(){vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;float t=uTime*.4;
   uv+=vec2(sin(uv.y*3.+t),cos(uv.x*3.+t))*.15;
   float g=abs(sin(uv.x*4.+t)+cos(uv.y*4.+t*.7));
   vec3 c=mix(uA,uB,g*.5);gl_FragColor=vec4(c,1.);}`,
];

function hex(h: string): [number, number, number] {
  const s = h.replace("#", "");
  return [parseInt(s.slice(0, 2), 16) / 255, parseInt(s.slice(2, 4), 16) / 255, parseInt(s.slice(4, 6), 16) / 255];
}

export default function WebglVariants({ seed = 1 }: { seed?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [c1, c2] = palette(seed);
  const shader = SHADERS[seed % SHADERS.length];
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
        vertex: `attribute vec2 position;void main(){gl_Position=vec4(position,0.,1.);}`,
        fragment: shader,
        uniforms: { uTime: { value: 0 }, uRes: { value: [1, 1] }, uA: { value: hex(c1) }, uB: { value: hex(c2) } },
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

    const startTime = performance.now();
    const loop = () => {
      if (!renderer || !program || !mesh) return;
      program.uniforms.uTime.value = (performance.now() - startTime) / 1000;
      renderer.render({ scene: mesh });
      raf = requestAnimationFrame(loop);
    };

    window.addEventListener("resize", resize);

    observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) init();
      else dispose();
    }, { threshold: 0.01 });
    observer.observe(wrap);

    return () => {
      dispose();
      window.removeEventListener("resize", resize);
      if (observer) observer.disconnect();
    };
  }, [c1, c2, shader]);
  return <div ref={wrapRef} className="h-[70vh] w-full bg-black" />;
}
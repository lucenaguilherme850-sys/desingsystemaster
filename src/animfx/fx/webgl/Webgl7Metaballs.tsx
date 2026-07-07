import ShaderCanvas from "./_ShaderCanvas";

const FRAG = `precision highp float;uniform float uTime;uniform vec2 uRes;uniform vec2 uMouse;
void main(){vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;float t=uTime;
float d=0.;for(float i=0.;i<6.;i++){vec2 p=vec2(sin(t*.7+i*1.7),cos(t*.9+i*2.1))*.5;
if(i==0.)p=uMouse;d+=.06/length(uv-p);}
float m=smoothstep(.9,1.1,d);
vec3 c=mix(vec3(.02,.02,.08),vec3(1.,.4,.9),m);
c+=vec3(.2,.9,1.)*smoothstep(1.1,1.5,d);gl_FragColor=vec4(c,1.);}`;

export default function Webgl7Metaballs() {
  return <ShaderCanvas frag={FRAG} title="Metaballs" subtitle="webgl · metaballs" />;
}

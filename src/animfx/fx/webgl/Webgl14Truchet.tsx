import ShaderCanvas from "./_ShaderCanvas";

const FRAG = `precision highp float;uniform float uTime;uniform vec2 uRes;
float h(vec2 p){return fract(sin(dot(p,vec2(12.9,78.2)))*43758.);}
void main(){vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y*6.;
vec2 i=floor(uv),f=fract(uv)-.5;
float r=step(.5,h(i+floor(uTime*.5)));if(r>.5)f.x=-f.x;
float d=abs(length(f-vec2(.5,-.5))-.5);
d=min(d,abs(length(f-vec2(-.5,.5))-.5));
float l=smoothstep(.08,.02,d);
vec3 c=mix(vec3(.05,.02,.1),vec3(1.,.5,.9),l);
gl_FragColor=vec4(c,1.);}`;

export default function Webgl14Truchet() {
  return <ShaderCanvas frag={FRAG} title="Truchet" subtitle="webgl · truchet" />;
}

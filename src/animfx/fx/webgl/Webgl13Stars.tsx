import ShaderCanvas from "./_ShaderCanvas";

const FRAG = `precision highp float;uniform float uTime;uniform vec2 uRes;
float h(vec2 p){return fract(sin(dot(p,vec2(41.3,289.1)))*43758.5453);}
void main(){vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;
vec3 c=vec3(.01,.01,.04);
for(float k=0.;k<4.;k++){float z=fract(uTime*.1+k*.25);float s=mix(20.,2.,z);
vec2 p=uv*s;vec2 i=floor(p),f=fract(p)-.5;
float st=h(i);if(st>.98){float d=length(f);
c+=vec3(1.)*smoothstep(.05,0.,d)*(1.-z);}}
gl_FragColor=vec4(c,1.);}`;

export default function Webgl13Stars() {
  return <ShaderCanvas frag={FRAG} title="Starfield" subtitle="webgl · stars" />;
}

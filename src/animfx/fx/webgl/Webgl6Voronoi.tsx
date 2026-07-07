import ShaderCanvas from "./_ShaderCanvas";

const FRAG = `precision highp float;uniform float uTime;uniform vec2 uRes;
vec2 h2(vec2 p){p=vec2(dot(p,vec2(127.1,311.7)),dot(p,vec2(269.5,183.3)));
return fract(sin(p)*43758.5453);}
void main(){vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y*4.;float t=uTime*.6;
vec2 i=floor(uv),f=fract(uv);float md=8.;
for(int y=-1;y<=1;y++)for(int x=-1;x<=1;x++){vec2 g=vec2(float(x),float(y));
vec2 o=h2(i+g);o=.5+.5*sin(t+6.28*o);vec2 r=g+o-f;
md=min(md,dot(r,r));}
float e=sqrt(md);vec3 c=mix(vec3(.9,.1,.5),vec3(.1,.3,.9),e);
c*=1.-smoothstep(.02,.05,e);gl_FragColor=vec4(c,1.);}`;

export default function Webgl6Voronoi() {
  return <ShaderCanvas frag={FRAG} title="Voronoi" subtitle="webgl · voronoi" />;
}

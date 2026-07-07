import ShaderCanvas from "./_ShaderCanvas";

const FRAG = `precision highp float;uniform float uTime;uniform vec2 uRes;
void main(){vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;
float a=atan(uv.y,uv.x);float r=length(uv);
float seg=6.28/8.;a=mod(a,seg);a=abs(a-seg*.5);
vec2 p=vec2(cos(a),sin(a))*r;float t=uTime*.4;
float v=sin(p.x*8.+t)+cos(p.y*8.-t);
vec3 c=.5+.5*cos(6.28*(vec3(0.,.33,.67)+v*.3+t*.1));
gl_FragColor=vec4(c,1.);}`;

export default function Webgl11Kaleido() {
  return <ShaderCanvas frag={FRAG} title="Kaleidoscope" subtitle="webgl · kaleido" />;
}

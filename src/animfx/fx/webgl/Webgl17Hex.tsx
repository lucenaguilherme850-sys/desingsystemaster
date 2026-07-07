import ShaderCanvas from "./_ShaderCanvas";

const FRAG = `precision highp float;uniform float uTime;uniform vec2 uRes;
float hex(vec2 p){p=abs(p);return max(p.x*.866+p.y*.5,p.y);}
void main(){vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y*6.;
vec2 r=vec2(1.,1.732);vec2 h=r*.5;
vec2 a=mod(uv,r)-h;vec2 b=mod(uv-h,r)-h;
vec2 gv=dot(a,a)<dot(b,b)?a:b;
float d=.5-hex(gv);
vec2 id=uv-gv;float pulse=.5+.5*sin(uTime*2.+id.x+id.y);
vec3 c=mix(vec3(.02,.02,.08),vec3(.3,.9,1.)*pulse,smoothstep(.05,.1,d));
gl_FragColor=vec4(c,1.);}`;

export default function Webgl17Hex() {
  return <ShaderCanvas frag={FRAG} title="HexGlow" subtitle="webgl · hex" />;
}

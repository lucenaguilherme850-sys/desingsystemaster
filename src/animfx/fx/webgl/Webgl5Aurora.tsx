import ShaderCanvas from "./_ShaderCanvas";

const FRAG = `precision highp float;uniform float uTime;uniform vec2 uRes;
float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);
return mix(mix(h(i),h(i+vec2(1,0)),f.x),mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x),f.y);}
void main(){vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;float t=uTime*.2;
float d=0.;for(float i=1.;i<5.;i++){d+=n(uv*i*2.+t*i*.3)/i;}
float band=smoothstep(.3,0.,abs(uv.y+d*.6-.1));
vec3 c=mix(vec3(.02,.04,.1),vec3(.2,1.,.6),band);
c+=vec3(.4,.2,.9)*smoothstep(.5,0.,abs(uv.y-d*.3+.2))*.6;
gl_FragColor=vec4(c,1.);}`;

export default function Webgl5Aurora() {
  return <ShaderCanvas frag={FRAG} title="Aurora" subtitle="webgl · aurora" />;
}

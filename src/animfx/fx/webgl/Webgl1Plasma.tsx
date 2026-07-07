import ShaderCanvas from "./_ShaderCanvas";

const FRAG = `precision highp float;uniform float uTime;uniform vec2 uRes;
void main(){vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;float t=uTime*.6;
float v=sin(uv.x*4.+t)+sin(uv.y*4.-t)+sin((uv.x+uv.y)*3.+t*1.3)+sin(length(uv)*6.-t*2.);
v*=.25;vec3 c=.5+.5*cos(6.28*(vec3(0.,.33,.67)+v));gl_FragColor=vec4(c,1.);}`;

export default function Webgl1Plasma() {
  return <ShaderCanvas frag={FRAG} title="Plasma" subtitle="webgl · plasma" />;
}

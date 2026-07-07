import ShaderCanvas from "./_ShaderCanvas";

const FRAG = `precision highp float;uniform float uTime;uniform vec2 uRes;
float h(float x){return fract(sin(x*91.3)*4321.);}
void main(){vec2 uv=(gl_FragCoord.xy)/uRes;float t=floor(uTime*8.);
float y=floor(uv.y*40.);float s=h(y+t);
if(s>.85)uv.x+=(h(y*2.+t)-.5)*.3;
vec2 c=uv-.5;float d=length(c);
vec3 col=.5+.5*cos(6.28*(vec3(0.,.33,.67)+d*4.-uTime*.5));
col.r=col.r*step(.5,h(y*.7+t));
gl_FragColor=vec4(col,1.);}`;

export default function Webgl18Glitch() {
  return <ShaderCanvas frag={FRAG} title="Glitch" subtitle="webgl · glitch" />;
}

import ShaderCanvas from "./_ShaderCanvas";

const FRAG = `precision highp float;uniform float uTime;uniform vec2 uRes;
void main(){vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;float t=uTime*.5;
uv.y+=t;vec2 g=abs(fract(uv*10.)-.5);
float line=smoothstep(.45,.5,max(g.x,g.y));
vec3 c=mix(vec3(.02,0.,.08),vec3(1.,.1,.7),line);
c+=vec3(.1,.9,1.)*smoothstep(.9,0.,length(uv))*.4;
gl_FragColor=vec4(c,1.);}`;

export default function Webgl9Grid() {
  return <ShaderCanvas frag={FRAG} title="NeonGrid" subtitle="webgl · grid" />;
}

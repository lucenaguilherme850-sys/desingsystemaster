import ShaderCanvas from "./_ShaderCanvas";

const FRAG = `precision highp float;uniform float uTime;uniform vec2 uRes;
void main(){vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;float t=uTime*.4;
vec2 p=uv;float v=0.;
for(float i=1.;i<6.;i++){p+=vec2(sin(p.y*i+t),cos(p.x*i-t))*.1;
v+=1./abs(sin(p.x*i)+sin(p.y*i)+.5)*.02;}
vec3 c=mix(vec3(.0,.1,.25),vec3(.4,.9,1.),v);
gl_FragColor=vec4(c,1.);}`;

export default function Webgl15Caustics() {
  return <ShaderCanvas frag={FRAG} title="Caustics" subtitle="webgl · caustics" />;
}

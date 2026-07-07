import ShaderCanvas from "./_ShaderCanvas";

const FRAG = `precision highp float;uniform float uTime;uniform vec2 uRes;
float n(vec2 p){return sin(p.x*1.7+cos(p.y*2.1))*cos(p.y*1.3-sin(p.x*1.9));}
void main(){vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;float t=uTime*.3;
vec2 p=uv;float v=0.;
for(int i=0;i<20;i++){float a=n(p*3.+t)*6.28;
p+=vec2(cos(a),sin(a))*.01;v+=.02;}
vec3 c=mix(vec3(.05,0.,.1),vec3(1.,.3,.6),length(p-uv)*3.);
c+=vec3(0.,.5,1.)*v*.5;gl_FragColor=vec4(c,1.);}`;

export default function Webgl16FlowField() {
  return <ShaderCanvas frag={FRAG} title="FlowField" subtitle="webgl · flow" />;
}

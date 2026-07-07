import ShaderCanvas from "./_ShaderCanvas";

const FRAG = `precision highp float;uniform float uTime;uniform vec2 uRes;
void main(){vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;float t=uTime*.3;
for(float i=1.;i<5.;i++){uv.x+=sin(uv.y*i*2.+t*i)*.15/i;
uv.y+=cos(uv.x*i*2.-t*i)*.15/i;}
float v=length(uv);vec3 c=mix(vec3(.9,.2,.5),vec3(.1,.6,1.),sin(v*4.+t)*.5+.5);
gl_FragColor=vec4(c,1.);}`;

export default function Webgl12Liquid() {
  return <ShaderCanvas frag={FRAG} title="Liquid" subtitle="webgl · liquid" />;
}

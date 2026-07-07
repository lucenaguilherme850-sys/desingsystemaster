import ShaderCanvas from "./_ShaderCanvas";

const FRAG = `precision highp float;uniform float uTime;uniform vec2 uRes;uniform vec2 uMouse;
void main(){vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;float t=uTime*.4;
uv+=uMouse*.5;
float v=0.;for(float i=1.;i<5.;i++){v+=sin(uv.x*i*2.+t*i)+cos(uv.y*i*2.-t*i);}
v*=.15;vec3 c=.5+.5*cos(6.28*(vec3(0.,.4,.8)+v));gl_FragColor=vec4(c,1.);}`;

export default function Scroll55Shader() {
  return <ShaderCanvas frag={FRAG} title="ScrollShader" subtitle="scroll · shader" />;
}

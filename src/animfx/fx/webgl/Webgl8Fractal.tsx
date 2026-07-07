import ShaderCanvas from "./_ShaderCanvas";

const FRAG = `precision highp float;uniform float uTime;uniform vec2 uRes;
void main(){vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y*1.6;
vec2 c=vec2(sin(uTime*.3)*.7,cos(uTime*.25)*.7);
vec2 z=uv;float it=0.;for(int i=0;i<80;i++){z=vec2(z.x*z.x-z.y*z.y,2.*z.x*z.y)+c;
if(dot(z,z)>4.)break;it++;}
float f=it/80.;vec3 col=.5+.5*cos(6.28*(vec3(0.,.4,.8)+f));gl_FragColor=vec4(col*f,1.);}`;

export default function Webgl8Fractal() {
  return <ShaderCanvas frag={FRAG} title="Julia" subtitle="webgl · fractal" />;
}

import ShaderCanvas from "./_ShaderCanvas";

const FRAG = `precision highp float;uniform float uTime;uniform vec2 uRes;
void main(){vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;float a=atan(uv.y,uv.x);float r=length(uv);
float t=uTime*.5;float u=.2/r+t;float v=a/3.14159;
float g=.5+.5*sin(u*10.);float h=.5+.5*sin(v*20.+t*2.);
vec3 c=mix(vec3(.05,.02,.2),vec3(.9,.3,1.),g*h)*smoothstep(0.,.4,r);
gl_FragColor=vec4(c,1.);}`;

export default function Webgl4Tunnel() {
  return <ShaderCanvas frag={FRAG} title="Tunnel" subtitle="webgl · tunnel" />;
}

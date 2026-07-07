import ShaderCanvas from "./_ShaderCanvas";

const FRAG = `precision highp float;uniform float uTime;uniform vec2 uRes;uniform vec2 uMouse;
void main(){vec2 uv=(gl_FragCoord.xy-.5*uRes)/uRes.y;
float d=length(uv-uMouse);
float w=sin(d*40.-uTime*4.)*.5+.5;
w*=smoothstep(1.,0.,d);
vec3 c=mix(vec3(.02,.05,.1),vec3(.3,1.,.9),w);
gl_FragColor=vec4(c,1.);}`;

export default function Webgl10Ripple() {
  return <ShaderCanvas frag={FRAG} title="Ripple" subtitle="webgl · ripple" />;
}

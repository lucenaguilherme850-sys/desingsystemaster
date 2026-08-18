import { Check, MessageCircle } from "lucide-react";
import { FreeSamplesBadge } from "@/components/FreeSamplesBadge";

const WHATSAPP = "https://wa.me/5564076035684";

function waLink(plan: string, price: string) {
  const msg = encodeURIComponent(
    `Olá! Quero assinar o plano ${plan} (${price}) do Design Master.`,
  );
  return `${WHATSAPP}?text=${msg}`;
}

const plans = [
  {
    name: "Free",
    price: "$0",
    cadence: "para sempre",
    highlight: false,
    tagline: "Explore o catálogo",
    delivers: "Você vê as prévias em vídeo de todos os 300+ componentes, navega pelas categorias e conhece cada demo. O código, o prompt mestre e os arquivos ficam bloqueados.",
    features: [
      "300+ prévias em vídeo",
      "Filtros por categoria",
      "Preview em tela cheia",
      "Sem código-fonte",
      "Sem prompt mestre",
    ],
    cta: null as null | { label: string; href: string },
  },
  {
    name: "PRO",
    price: "$36,99",
    cadence: "único · acesso vitalício",
    highlight: true,
    badge: "Mais popular",
    tagline: "💎 Toda a biblioteca desbloqueada",
    delivers:
      "Você recebe o código-fonte completo de cada componente, o Prompt Mestre pronto para colar no Lovable/Cursor/ChatGPT (a IA vai perguntar em qual página do seu app usar), os arquivos do Drive e o download do .zip original.",
    features: [
      "300+ componentes PRO",
      "Código-fonte completo",
      "Prompt Mestre para IA",
      "Download dos arquivos .zip",
      "Instruções do autor",
      "Acesso vitalício",
      "Atualizações futuras",
    ],
    cta: { label: "Pagar via WhatsApp", href: waLink("PRO", "$36,99 único") },
  },
  {
    name: "Agent Plus",
    price: "$69,99",
    cadence: "por mês",
    highlight: false,
    accent: true,
    tagline: "🧠 Creative Director AI",
    delivers:
      "Tudo do PRO + o Agente Creative Director: ele consegue ver sites, analisar referências (aceita fotos e arquivos), define a direção visual completa (paleta, tipografia, motion, layout) e personaliza componentes especificamente para esse site, gerando o Prompt Mestre adaptado.",
    features: [
      "Tudo do PRO incluído",
      "Agente Creative Director",
      "Pipeline de 7 fases",
      "Análise de imagens & arquivos",
      "Direção visual auto-gerada",
      "Coleções coerentes de UI",
      "Prompts adaptados ao projeto",
      "Painel de threads privadas",
    ],
    cta: { label: "Assinar via WhatsApp", href: waLink("Agent Plus", "$69,99/mês") },
  },
];

import { useUserTier } from "@/hooks/use-user-tier";

export function PricingSection() {
  const { isPro, isPlus, loading } = useUserTier();

  return (
    <section id="pricing" className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-[1400px] px-6 py-24">
        <div className="max-w-2xl">
          <div className="font-mono text-[11px] uppercase tracking-widest text-neon">
            pricing
          </div>
          <h2 className="mt-3 text-4xl md:text-5xl font-extrabold uppercase leading-[0.95]">
            O que o <span className="text-neon-purple">Design Master</span> entrega
          </h2>
          <p className="mt-4 text-muted-foreground">
            Uma biblioteca curada de <strong className="text-foreground">300+ componentes</strong> premium (heroes, sliders, shaders WebGL, scroll animations,
            menus, transições, texto animado) — cada um com código, prompt mestre e arquivo baixável.
            O plano <strong className="text-foreground">Agent Plus</strong> adiciona um AI Creative Director que monta a direção
            visual do seu projeto do zero.
          </p>
          <FreeSamplesBadge className="mt-6" />
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((p) => {
            const highlight = p.highlight;
            const accent = "accent" in p && p.accent;
            return (
              <article
                key={p.name}
                className={
                  "relative flex flex-col rounded-2xl border p-6 " +
                  (highlight
                    ? "border-neon bg-card shadow-[0_0_60px_oklch(0.86_0.28_140/25%)]"
                    : accent
                      ? "border-neon-purple bg-card shadow-[0_0_60px_oklch(0.6_0.25_300/25%)]"
                      : "border-border bg-card/60")
                }
              >
                {highlight && (
                  <div className="absolute -top-3 left-6 rounded-full bg-neon px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-background">
                    {"badge" in p ? p.badge : "Mais popular"}
                  </div>
                )}
                {accent && (
                  <div className="absolute -top-3 left-6 rounded-full bg-neon-purple px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-white">
                    AI Creative Director
                  </div>
                )}
                <h3 className="text-xl font-bold uppercase">{p.name}</h3>
                <div className="mt-3 flex items-baseline gap-3">
                  <span className="text-4xl font-extrabold">{p.price}</span>
                </div>
                <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  {p.cadence}
                </div>
                <p className="mt-4 text-sm font-semibold text-foreground">{p.tagline}</p>
                <p className="mt-2 text-sm text-muted-foreground">{p.delivers}</p>

                <ul className="mt-5 space-y-2 text-sm">
                  {p.features.map((f) => (
                    <li key={f} className="flex gap-2 text-foreground/85">
                      <Check className="mt-0.5 size-4 shrink-0 text-neon" />
                      {f}
                    </li>
                  ))}
                </ul>

                <div className="mt-6">
                  {p.name === "Free" ? (
                    <div className="rounded-full border border-border py-3 text-center font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                      já ativo ao criar a conta
                    </div>
                  ) : p.name === "PRO" && isPro ? (
                    <div className="flex items-center justify-center gap-2 rounded-full border border-neon bg-neon/10 py-3 text-sm font-semibold text-neon">
                      <Check className="size-4" /> Plano PRO Ativo
                    </div>
                  ) : p.name === "Agent Plus" && isPlus ? (
                    <div className="flex items-center justify-center gap-2 rounded-full border border-neon-purple bg-neon-purple/10 py-3 text-sm font-semibold text-neon-purple">
                      <Check className="size-4" /> Agent Plus Ativo
                    </div>
                  ) : p.cta ? (
                    <a
                      href={p.cta.href}
                      target="_blank"
                      rel="noreferrer"
                      className={
                        "flex items-center justify-center gap-2 rounded-full py-3 text-sm font-semibold transition-transform hover:scale-[1.02] " +
                        (highlight
                          ? "bg-neon text-background"
                          : accent
                            ? "bg-neon-purple text-white"
                            : "border border-border text-foreground hover:border-neon")
                      }
                    >
                      <MessageCircle className="size-4" /> {p.cta.label}
                    </a>
                  ) : null}
                </div>
              </article>
            );
          })}
        </div>

        <div className="mt-10 rounded-2xl border border-neon/30 bg-card/40 p-6 text-sm text-muted-foreground">
          <div className="font-mono text-[10px] uppercase tracking-widest text-neon">
            como funciona o pagamento
          </div>
          <p className="mt-2">
            Clique em <strong className="text-foreground">Pagar via WhatsApp</strong> — você é enviado direto
            para o número <strong className="text-foreground">+55 64 07603-5684</strong> com uma mensagem já pronta
            identificando o plano escolhido. Após a confirmação, sua conta é liberada
            manualmente pelo administrador (você recebe uma resposta no mesmo chat).
          </p>
        </div>
      </div>
    </section>
  );
}

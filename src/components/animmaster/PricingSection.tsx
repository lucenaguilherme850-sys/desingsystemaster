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
    price: "R$ 0",
    cadence: "para sempre",
    highlight: false,
    tagline: "Conheça antes de desbloquear",
    delivers: "Explore os componentes e as demonstrações disponíveis antes de pagar. O código-fonte premium e os arquivos de implementação não são liberados neste plano.",
    features: [
      "Navegação pelo catálogo e categorias",
      "Pré-visualizações disponíveis",
      "Demonstrações dos componentes",
      "3 amostras grátis para recursos elegíveis",
      "Código-fonte premium não incluído",
      "Downloads premium não incluídos",
    ],
    cta: null as null | { label: string; href: string },
  },
  {
    name: "PRO",
    price: "R$ 36,99",
    cadence: "único · acesso vitalício",
    highlight: true,
    badge: "Mais popular",
    tagline: "Biblioteca premium para seus projetos",
    delivers:
      "Desbloqueia o acesso PRO aos componentes premium disponíveis. Código-fonte, instruções e downloads são fornecidos nos itens em que esses materiais estão disponibilizados. O Prompt Mestre ajuda você a orientar uma ferramenta de IA na adaptação ao seu projeto; o plano não inclui desenvolvimento feito por uma equipe.",
    features: [
      "Acesso aos componentes marcados como PRO",
      "Código-fonte nos itens que o disponibilizam",
      "Prompt Mestre para orientar a IA",
      "Downloads quando disponíveis por componente",
      "Instruções de implementação disponíveis",
      "Pagamento único e acesso vitalício ao PRO",
      "Atualizações futuras conforme forem publicadas",
    ],
    cta: { label: "Pagar via WhatsApp", href: waLink("PRO", "R$ 36,99 pagamento único") },
  },
  {
    name: "Agent Plus",
    price: "R$ 69,99",
    cadence: "por mês",
    highlight: false,
    accent: true,
    tagline: "Assistente de direção visual com IA",
    delivers:
      "Inclui os recursos PRO e acesso ao Agente Creative Director para trabalhar por conversas e projetos. Use-o para estruturar a direção visual, organizar as referências fornecidas e elaborar recomendações e prompts alinhados ao contexto. Ele não publica nem implementa automaticamente o site inteiro.",
    features: [
      "Todos os recursos do plano PRO",
      "Acesso ao Agente Creative Director",
      "Conversas separadas por projeto",
      "Orientação para direção visual e identidade",
      "Ajuda para organizar referências fornecidas",
      "Prompts adaptados ao contexto do projeto",
      "Assinatura recorrente de R$ 69,99 por mês",
      "Acesso ao agente enquanto a assinatura estiver ativa",
    ],
    cta: { label: "Assinar via WhatsApp", href: waLink("Agent Plus", "R$ 69,99/mês") },
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
            Compare o que cada plano libera na prática. O acesso gratuito permite explorar; o PRO desbloqueia os recursos premium disponíveis na biblioteca; e o Agent Plus acrescenta o agente de direção visual com IA. Código, arquivos e downloads dependem do material disponibilizado em cada componente.
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
            Clique em <strong className="text-foreground">Pagar via WhatsApp</strong> para iniciar a solicitação. O pagamento não é processado automaticamente pelo site: o acesso é liberado manualmente após a confirmação do administrador. O Agent Plus é recorrente e requer renovação para manter o acesso ao agente.
          </p>
        </div>
      </div>
    </section>
  );
}

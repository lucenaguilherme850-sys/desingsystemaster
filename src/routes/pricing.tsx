import { createFileRoute } from "@tanstack/react-router";
import { PricingSection } from "@/components/animmaster/PricingSection";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Planos & Preços — Design Master" },
      {
        name: "description",
        content:
          "Planos PRO e Agent Plus da Design Master — 300+ componentes premium e agente Creative Director com pagamento via WhatsApp.",
      },
      { property: "og:title", content: "Planos & Preços — Design Master" },
      {
        property: "og:description",
        content:
          "PRO por $36,99 (300+ componentes premium) e Agent Plus por $69,99/mês (Creative Director AI).",
      },
    ],
  }),
  component: PricingPage,
});

function PricingPage() {
  return (
    <div>
      <section className="border-b border-border/50">
        <div className="mx-auto max-w-[1400px] px-6 py-20 text-center">
          <div className="font-mono text-[11px] uppercase tracking-widest text-neon">
            planos design master
          </div>
          <h1 className="mt-3 text-4xl md:text-6xl font-extrabold uppercase leading-[0.95]">
            Escolha o seu <span className="text-neon-purple">nível</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
            O Design Master entrega uma biblioteca com <strong className="text-foreground">300+ componentes premium</strong> extraídos de sites vencedores do
            Awwwards, com código-fonte, prompt mestre pronto para Lovable/IA e um{" "}
            <strong className="text-foreground">Agente Creative Director</strong> que analisa a sua ideia e monta a direção visual completa.
          </p>
        </div>
      </section>
      <PricingSection />
    </div>
  );
}

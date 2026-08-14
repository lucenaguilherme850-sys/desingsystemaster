import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "É pagamento único ou assinatura?",
    a: "É uma compra única com acesso vitalício ao material.",
  },
  {
    q: "Qual a diferença entre PRO e Premium?",
    a: "PRO inclui todos os componentes e o material para iniciantes. Premium é a versão expandida com updates vitalícios (novos componentes adicionados regularmente). Compradores PRO não recebem updates futuros — apenas Premium recebe.",
  },
  {
    q: "Como recebo os updates futuros do Premium?",
    a: "Você é adicionado a um grupo privado no Telegram onde encontra os novos materiais antes deles entrarem no site.",
  },
  {
    q: "Isso são prompts ou código?",
    a: "Código escrito inteiramente à mão.",
  },
  {
    q: "Para quem são esses componentes?",
    a: "Para quem quer construir um site premium, e também para devs que queiram evoluir suas skills frontend.",
  },
  {
    q: "Como uso se não sou programador?",
    a: "Faça upload do zip em uma IA (ChatGPT, Claude) e peça a integração no seu site, ou copie e cole manualmente no projeto.",
  },
  {
    q: "Em quais linguagens são feitos?",
    a: "60% HTML/CSS/JS, 30% React, 10% Next.js.",
  },
];

export function FaqSection() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" className="border-t border-border/60 bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqs.map(f => ({
              "@type": "Question",
              "name": f.q,
              "acceptedAnswer": {
                "@type": "Answer",
                "text": f.a
              }
            }))
          })
        }}
      />
      <div className="mx-auto max-w-4xl px-6 py-24">
        <div className="font-mono text-[11px] uppercase tracking-widest text-neon">
          faq
        </div>
        <h2 className="mt-3 text-4xl md:text-5xl font-extrabold uppercase leading-[0.95]">
          Perguntas frequentes
        </h2>

        <div className="mt-10 divide-y divide-border/60 border-y border-border/60">
          {faqs.map((item, i) => {
            const isOpen = open === i;
            return (
              <div key={i}>
                <button
                  onClick={() => setOpen(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-6 py-5 text-left"
                >
                  <span className="text-base md:text-lg font-medium">{item.q}</span>
                  <ChevronDown
                    className={
                      "size-5 shrink-0 text-neon transition-transform " +
                      (isOpen ? "rotate-180" : "")
                    }
                  />
                </button>
                {isOpen && (
                  <p className="pb-6 pr-10 text-sm text-muted-foreground">{item.a}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
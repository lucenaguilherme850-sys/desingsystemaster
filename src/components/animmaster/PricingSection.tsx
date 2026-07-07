const plans = [
  {
    name: "Junior",
    price: "$3",
    strike: null as string | null,
    save: null as string | null,
    highlight: false,
    tagline: "Comece a estudar",
    features: [
      "Animmaster Roadmap",
      "63 Figma Website Mockups",
      "Best courses collection",
    ],
    cta: "Get Junior Pack",
  },
  {
    name: "PRO",
    price: "$4.99",
    strike: "$10",
    save: "Save 50%",
    highlight: true,
    tagline: "💎 300 PRO-Level Components",
    features: [
      "63 Scroll Animations",
      "26 Hero Animations",
      "23 Sliders",
      "22 3D Animations",
      "21 Navigation Menus",
      "20 Hover Effects",
      "20 Mouse Effects",
      "18 WebGL Shaders",
      "17 Page Transitions",
      "14 Text Animations",
      "11 SVG Animations",
      "10 Background Animations",
      "10 Grid Animations",
      "10 Physics Effects",
      "Junior Pack incluído",
      "Acesso vitalício",
    ],
    cta: "Unlock PRO",
  },
  {
    name: "Premium",
    price: "$8",
    strike: "$20",
    save: "Save 70%",
    highlight: false,
    tagline: "💎 Animmaster Premium Pack",
    features: [
      "300 PRO Components",
      "New Private Components",
      "Animmaster Vite Template",
      "Awwwards Portfolio Website",
      "Senior-level VScode config",
      "63 PRO Figma Web Mockups",
      "45 best VScode extensions",
      "100+ frontend interview questions",
      "Premium community access",
      "Lifetime access + future updates",
    ],
    cta: "Get Premium",
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="border-t border-border/60 bg-background">
      <div className="mx-auto max-w-[1400px] px-6 py-24">
        <div className="max-w-2xl">
          <div className="font-mono text-[11px] uppercase tracking-widest text-neon">
            pricing
          </div>
          <h2 className="mt-3 text-4xl md:text-5xl font-extrabold uppercase leading-[0.95]">
            Simple pricing — powerful results
          </h2>
          <p className="mt-4 text-muted-foreground">
            Poupe <span className="text-foreground font-semibold">10.000+ horas</span> de
            desenvolvimento com 300 componentes PRO. 2.400+ devs · 4.9★ · 300+ projetos.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {plans.map((p) => (
            <article
              key={p.name}
              className={
                "relative rounded-2xl border p-6 " +
                (p.highlight
                  ? "border-neon bg-card shadow-[0_0_60px_oklch(0.82_0.17_225/20%)]"
                  : "border-border bg-card/60")
              }
            >
              {p.highlight && (
                <div className="absolute -top-3 left-6 rounded-full bg-neon px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-background">
                  Most Popular
                </div>
              )}
              <h3 className="text-xl font-bold">{p.name}</h3>
              <div className="mt-3 flex items-baseline gap-3">
                <span className="text-4xl font-extrabold">{p.price}</span>
                {p.strike && (
                  <span className="text-lg text-muted-foreground line-through">
                    {p.strike}
                  </span>
                )}
                {p.save && (
                  <span className="rounded-full border border-neon/40 px-2 py-0.5 font-mono text-[10px] uppercase tracking-widest text-neon">
                    {p.save}
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{p.tagline}</p>
              <ul className="mt-6 space-y-2 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex gap-2 text-foreground/80">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-neon" />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="https://www.animmasterlib.dev/payment.html"
                target="_blank"
                rel="noreferrer"
                className={
                  "mt-6 block rounded-full py-3 text-center text-sm font-semibold transition-transform hover:scale-[1.02] " +
                  (p.highlight
                    ? "bg-neon text-background"
                    : "border border-border text-foreground hover:border-neon")
                }
              >
                {p.cta}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
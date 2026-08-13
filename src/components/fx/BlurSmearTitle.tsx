import { createElement, useEffect, useRef } from "react";

/**
 * BlurSmearTitle
 * -------------------------------------------------------
 * Assinatura visual do designmaster.com.br: as letras do título
 * entram desfocadas e deslocadas, um "smear" horizontal
 * decrescente por caractere. Ao terminar, ficam sutilmente
 * respirando (blur 0 → 1.5px → 0) para lembrar o efeito ao vivo.
 * Sem dependências: só CSS + WAAPI (Web Animations API).
 */
export function BlurSmearTitle({
  children,
  className = "",
  as = "h1",
  accent = false,
  stagger = 55,
}: {
  children: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "span" | "div";
  accent?: boolean;
  stagger?: number;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const spans = el.querySelectorAll<HTMLSpanElement>("[data-char]");
    spans.forEach((s, i) => {
      s.animate(
        [
          { opacity: 0, filter: "blur(18px)", transform: "translateX(24px) scale(1.15)" },
          { opacity: 1, filter: "blur(0px)", transform: "translateX(0) scale(1)" },
        ],
        {
          duration: 900,
          delay: i * stagger,
          easing: "cubic-bezier(0.22, 1, 0.36, 1)",
          fill: "both",
        },
      );
    });
    // breath after entry - removed for performance on main list to save RAM
    return;
  }, [children, stagger]);

  const chars = Array.from(children);
  return createElement(
    as,
    { ref, className, "aria-label": children },
    chars.map((c, i) =>
      createElement(
        "span",
        {
          key: i,
          "data-char": true,
          "aria-hidden": true,
          className:
            "inline-block will-change-[filter,transform,opacity] " +
            (accent
              ? "bg-gradient-to-b from-neon to-primary bg-clip-text text-transparent"
              : ""),
          style: { whiteSpace: c === " " ? "pre" : "normal" },
        },
        c,
      ),
    ),
  );
}
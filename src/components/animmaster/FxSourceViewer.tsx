import { useMemo, useState } from "react";
import { Check, Copy, FileCode2, Sparkles } from "lucide-react";
import { getFxSourceForSlug } from "@/lib/animfx-source";

function buildLovablePrompt(slug: string, name: string, files: Array<{ path: string; content: string }>) {
  const previewUrl = `https://designmaster.com.br/animmaster/${slug}`;
  const header = `# Recriar efeito Design Master — "${name}" (${slug})

## OBJETIVO
Recrie no MEU projeto o **mesmo efeito visual e de interação** demonstrado nesta prévia:
${previewUrl}

O que importa é o EFEITO (o tipo de animação, a mecânica, o timing, a "sensação"),
não o conteúdo específico da demo. Você vai adaptar cores, tipografia, cópia,
imagens e estrutura ao design system e ao conteúdo do meu projeto atual.

## COMO VOCÊ DEVE AGIR
1. Abra a URL acima e observe o efeito com atenção: tipo (3D, scroll, hover, texto,
   webgl, menu, transição, física, etc.), mecânica (o que dispara, o que se move,
   easing, duração), camadas envolvidas (canvas/DOM/SVG), dependências prováveis
   (framer-motion, three.js, gsap, lenis, etc.).
2. Antes de escrever qualquer código, me faça 2 a 4 **perguntas estratégicas** para
   adaptar o efeito ao meu projeto. Exemplos do que perguntar:
   - Em qual página/rota você quer aplicar? (nova rota ou dentro de uma existente?)
   - Que conteúdo real deve entrar (títulos, textos, imagens, produtos, seções)?
   - Deve usar os tokens de cor / fonte / spacing atuais do meu projeto (recomendado)
     ou uma paleta separada só para essa seção?
   - Preferência de intensidade (sutil / médio / intenso)?
   - Precisa ser responsivo mobile também, ou desktop-only?
   - Alguma restrição de performance / acessibilidade (prefers-reduced-motion, etc.)?
3. Depois que eu responder, implemente o efeito **de forma nativa ao meu projeto**:
   - Use meus tokens semânticos (bg-background, text-foreground, bg-primary…) — nunca
     hard-code cores da demo original.
   - Use minha tipografia e meu conteúdo real, não a cópia da demo (nada de
     "NATURAL GARMENTS…", "Lorem ipsum", ou textos da prévia).
   - Instale as libs necessárias (framer-motion, three, gsap etc.) se ainda não
     estiverem no projeto.
   - Componentize dentro da minha estrutura (src/components/... ou onde fizer sentido).
   - Respeite prefers-reduced-motion e mobile.
4. Entregue o efeito rodando na página que eu indicar, revisando que o
   COMPORTAMENTO bate com o da prévia (${previewUrl}) mesmo que o visual/cores/copy
   sejam diferentes.

## O QUE NÃO FAZER
- ❌ Copiar textos, imagens, cores, classes ou paleta da demo original.
- ❌ Recriar o layout exato da prévia — o que interessa é o efeito, não a página demo.
- ❌ Começar a codar antes de me fazer as perguntas estratégicas.
- ❌ Devolver só uma descrição escrita do efeito. Precisa entregar código funcionando.
- ❌ Ignorar meu design system e injetar cores/fontes novas sem me perguntar.

## REFERÊNCIA TÉCNICA (apenas inspiração, NÃO copie 1:1)
Abaixo vai o código-fonte do componente exatamente como ele existe no projeto
Design Master. Use como **referência de mecânica** (que libs, que hooks, que
matemática de animação, que estrutura de camadas). Reescreva adaptado ao meu
projeto — não cole verbatim, não mantenha a cópia/paleta/imagens da demo.

──────────────── REFERÊNCIA (não copiar literalmente) ────────────────`;
  const body = files
    .map(
      (f) =>
        `\n\n// ----- ref: src/${f.path} -----\n\`\`\`tsx\n${f.content}\n\`\`\``,
    )
    .join("");
  const footer = `\n\n──────────────── FIM DA REFERÊNCIA ────────────────
Lembrete: entregue o MESMO EFEITO da prévia (${previewUrl}) adaptado ao meu design
system e conteúdo. Faça as perguntas estratégicas primeiro, depois implemente.`;
  return header + body + footer;
}

export default function FxSourceViewer({ slug, name }: { slug: string; name: string }) {
  const info = useMemo(() => getFxSourceForSlug(slug), [slug]);
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState<"code" | "prompt" | null>(null);

  if (!info) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-card/40 p-6 text-sm text-muted-foreground">
        Fonte não disponível para este componente.
      </div>
    );
  }

  const prompt = buildLovablePrompt(slug, name, info.files);
  const file = info.files[active];

  const copy = async (text: string, kind: "code" | "prompt") => {
    let ok = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
        ok = true;
      }
    } catch {
      ok = false;
    }
    if (!ok) {
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.top = "0";
        ta.style.left = "0";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        ok = document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        ok = false;
      }
    }
    if (ok) {
      setCopied(kind);
      setTimeout(() => setCopied(null), 1600);
    } else {
      window.prompt("Copie manualmente (Ctrl/Cmd+C):", text);
    }
  };

  return (
    <div className="mt-10 space-y-6">
      <div className="rounded-2xl border border-border/60 bg-card/40 overflow-hidden">
        <div className="flex items-center justify-between border-b border-border/60 bg-background/60 px-4 py-2">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-neon">
            <FileCode2 className="size-3.5" /> código fonte · {info.kind}
          </div>
          <button
            onClick={() => copy(file.content, "code")}
            className="inline-flex items-center gap-1.5 rounded-full border border-neon/40 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-neon hover:bg-neon hover:text-background transition-colors"
          >
            {copied === "code" ? <Check className="size-3" /> : <Copy className="size-3" />}
            {copied === "code" ? "copiado" : "copiar arquivo"}
          </button>
        </div>
        {info.files.length > 1 && (
          <div className="flex flex-wrap gap-1 border-b border-border/60 bg-background/40 px-2 py-2">
            {info.files.map((f, i) => (
              <button
                key={f.path}
                onClick={() => setActive(i)}
                className={
                  "rounded-md px-3 py-1 font-mono text-[10px] " +
                  (active === i
                    ? "bg-neon text-background"
                    : "text-muted-foreground hover:text-foreground")
                }
              >
                {f.path}
              </button>
            ))}
          </div>
        )}
        <pre className="max-h-[560px] overflow-auto bg-black/60 p-4 text-[12px] leading-relaxed text-foreground/90">
          <code>{file.content}</code>
        </pre>
        <div className="border-t border-border/60 bg-background/40 px-4 py-2 font-mono text-[10px] text-muted-foreground">
          {file.path}
        </div>
      </div>

      <div className="rounded-2xl border border-[#ff00c8]/50 bg-gradient-to-br from-[#ff00c8]/10 to-transparent p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#ff00c8]">
            <Sparkles className="size-3.5" /> prompt para o Lovable
          </div>
          <button
            onClick={() => copy(prompt, "prompt")}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#ff00c8] px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-black hover:bg-[#ff00c8]/90 transition-colors"
          >
            {copied === "prompt" ? <Check className="size-3" /> : <Copy className="size-3" />}
            {copied === "prompt" ? "copiado" : "copiar prompt"}
          </button>
        </div>
        <p className="mt-3 text-sm text-foreground/80">
          Cole este prompt em qualquer projeto Lovable. Ele contém todos os
          arquivos do componente e faz o Lovable <strong>perguntar em qual página</strong> você quer usar antes de instalar.
        </p>
        <pre className="mt-3 max-h-72 overflow-auto rounded-lg border border-border/60 bg-black/60 p-3 text-[11px] leading-relaxed text-foreground/80 whitespace-pre-wrap break-words">
          <code>{prompt}</code>
        </pre>
      </div>
    </div>
  );
}
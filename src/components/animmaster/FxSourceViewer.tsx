import { useMemo, useState } from "react";
import { Check, Copy, FileCode2, Sparkles } from "lucide-react";
import { getFxSourceForSlug } from "@/lib/animfx-source";

function buildLovablePrompt(slug: string, name: string, files: Array<{ path: string; content: string }>) {
  const previewUrl = `https://designmaster.com.br/animmaster/${slug}`;
  return `# ⚡ SOLICITAÇÃO DE ADAPTAÇÃO: ${name}
> Componente Premium: \`${slug}\`
> Link de Visualização: ${previewUrl}

## 📝 RESUMO DA TAREFA
Olá Lovable, eu escolhi este componente da biblioteca **Design Master**. Sua tarefa é integrá-lo ao meu projeto atual com precisão técnica absoluta.

## ⚙️ INSTRUÇÕES DE EXECUÇÃO
1. **Analise a Mecânica:** Veja como o componente se comporta no link acima (animação, física, interações).
2. **Respeite o Código:** O código de referência abaixo é a implementação exata. Use-o como base para a lógica, hooks e animações.
3. **Adaptação Necessária:**
   - Use meus tokens de cores (ex: \`bg-background\`, \`text-foreground\`, \`bg-primary\`).
   - Use meus textos e imagens reais em vez da demo.
   - Componentize de forma organizada no meu diretório de componentes.

## 🚦 PERGUNTAS DE ALINHAMENTO
Antes de começar, me faça 3 perguntas rápidas:
1. Em qual página você quer que eu instale este componente?
2. Qual conteúdo (texto/imagens) deve entrar no lugar da demo?
3. Devo seguir o design system atual do projeto ou quer que eu mantenha as cores Neon originais?

---

## 🏗️ CÓDIGO DE REFERÊNCIA (NÃO ALTERAR A LÓGICA)
${files
  .map(
    (f) =>
      `\n\n### Arquivo: \`src/${f.path}\`\n\`\`\`tsx\n${f.content}\n\`\`\``,
  )
  .join("")}

---
*Lembre-se: O objetivo é manter o efeito premium mas adaptado à identidade do meu projeto.*`;
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
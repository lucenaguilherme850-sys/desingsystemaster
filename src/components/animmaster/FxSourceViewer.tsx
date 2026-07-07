import { useMemo, useState } from "react";
import { Check, Copy, FileCode2, Sparkles } from "lucide-react";
import { getFxSourceForSlug } from "@/lib/animfx-source";

function buildLovablePrompt(slug: string, name: string, files: Array<{ path: string; content: string }>) {
  const header = `Quero adicionar o componente animado "${name}" (slug \`${slug}\`) da minha galeria Animmaster ao meu app.

Antes de instalar, me pergunte:
1. Em qual rota / página devo montar este componente? (ex: /, /landing, um bloco dentro de uma página existente)
2. Devo criar uma nova página só para ele ou embutir dentro de uma seção existente?
3. Precisa adaptar cores, textos ou tamanhos ao design atual do meu app?

Depois de eu responder, crie os arquivos EXATAMENTE como abaixo (mesmos caminhos), instale dependências ausentes se necessário e importe/monte o componente no lugar combinado. Não invente variações — copie o código verbatim.

──────────────── ARQUIVOS ────────────────`;
  const body = files
    .map((f) => `\n\n// FILE: src/${f.path}\n\`\`\`tsx\n${f.content}\n\`\`\``)
    .join("");
  return header + body;
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
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      /* ignore */
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
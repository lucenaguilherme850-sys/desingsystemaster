import { useMemo, useState } from "react";
import { Check, Copy, FileCode2, Sparkles } from "lucide-react";
import { getFxSourceForSlug } from "@/lib/animfx-source";

function buildLovablePrompt(slug: string, name: string, files: Array<{ path: string; content: string }>) {
  const fileList = files.map((f) => `- src/${f.path}`).join("\n");
  const header = `TAREFA: Instalar um componente React de animação PRONTO no meu projeto (React 18 + Tailwind + TypeScript).

IMPORTANTE — LEIA ANTES DE FAZER QUALQUER COISA:
- Este prompt NÃO é um pedido de texto, descrição ou explicação.
- Este prompt NÃO pede que você "escreva sobre" um efeito ou "gere um exemplo".
- Abaixo há CÓDIGO-FONTE REAL de um componente animado chamado "${name}" (slug: ${slug}).
- Sua tarefa é CRIAR OS ARQUIVOS listados abaixo com o conteúdo EXATO fornecido (copiar e colar, verbatim, caractere por caractere). Não reescreva, não resuma, não "melhore", não traduza, não substitua por um placeholder.
- Depois de criar os arquivos, instale automaticamente qualquer dependência npm que faltar e importe o componente na página que o usuário indicar.

ANTES DE CRIAR OS ARQUIVOS, PERGUNTE AO USUÁRIO (uma pergunta por vez):
1. Em qual rota/página devo montar o componente "${name}"? (ex: /, /landing, dentro de uma seção existente, ou uma nova página dedicada)
2. Ele deve ocupar a tela toda, ser uma seção dentro de uma página existente, ou substituir algum bloco atual?
3. Precisa adaptar cores/textos/tamanhos ao design system atual, ou usar o visual original do componente?

DEPOIS que o usuário responder, você DEVE:
a) Criar exatamente estes arquivos com o conteúdo verbatim mostrado adiante:
${fileList}
b) Rodar \`npm install\` (ou equivalente) para quaisquer dependências não presentes.
c) Importar o componente default do primeiro arquivo (\`src/${files[0]?.path.replace(/\.(tsx|ts)$/, "")}\`) e montá-lo no local combinado.
d) NÃO gerar variações, NÃO gerar apenas um trecho, NÃO responder apenas com texto explicativo. O resultado esperado é código funcional rodando no preview.

──────────────── ARQUIVOS (conteúdo verbatim) ────────────────`;
  const body = files
    .map(
      (f) =>
        `\n\n// ===== FILE: src/${f.path} =====\n\`\`\`tsx\n${f.content}\n\`\`\``,
    )
    .join("");
  return header + body + `\n\n──────────────── FIM ────────────────\nLembrete final: crie os arquivos acima com o conteúdo EXATO. Não descreva o efeito — instale-o.`;
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
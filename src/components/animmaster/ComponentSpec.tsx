import { useMemo, useState } from "react";
import { Check, Copy, FileText, Sparkles } from "lucide-react";
import {
  buildComponentMasterPrompt,
  buildComponentPromptPreview,
  buildComponentSpecMarkdown,
  buildComponentSpecSummary,
  type SpecFile,
} from "@/lib/component-spec";

type Props = {
  slug: string;
  name: string;
  category?: string | null;
  summary?: string | null;
  previewUrl?: string | null;
  files: SpecFile[];
};

type CopyResult = "copied" | "downloaded" | "failed";
const LARGE_CLIPBOARD_LIMIT = 750_000;

function safeFilename(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/^-+|-+$/g, "") || "component";
}

function downloadText(text: string, filename: string) {
  const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

async function copyText(text: string, filename: string): Promise<CopyResult> {
  if (text.length > LARGE_CLIPBOARD_LIMIT) {
    downloadText(text, filename);
    return "downloaded";
  }

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return "copied";
    }
  } catch {
    /* fall through to download */
  }
  try {
    downloadText(text, filename);
    return "downloaded";
  } catch {
    return "failed";
  }
}

export default function ComponentSpec(props: Props) {
  const specInput = useMemo(
    () => ({
      slug: props.slug,
      name: props.name,
      category: props.category,
      summary: props.summary,
      previewUrl: props.previewUrl,
      files: props.files,
    }),
    [props.slug, props.name, props.category, props.summary, props.previewUrl, props.files],
  );
  const spec = useMemo(() => buildComponentSpecSummary(specInput), [specInput]);
  const promptPreview = useMemo(() => buildComponentPromptPreview(specInput), [specInput]);
  const [copied, setCopied] = useState<"spec" | "prompt" | "downloaded" | null>(null);

  if (!props.files.length) return null;

  const ping = async (kind: "spec" | "prompt") => {
    try {
      const text = kind === "spec" ? buildComponentSpecMarkdown(specInput) : buildComponentMasterPrompt(specInput);
      const filename = `${safeFilename(props.slug)}-${kind === "spec" ? "master-spec" : "prompt-mestre"}.md`;
      const result = await copyText(text, filename);
      if (result !== "failed") {
        setCopied(result === "downloaded" ? "downloaded" : kind);
        setTimeout(() => setCopied(null), 1600);
      }
    } catch (e) {
      console.error("copy failed", e);
    }
  };

  return (
    <div className="mt-10 space-y-6">
      <div className="rounded-2xl border border-neon/40 bg-card/40 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 bg-background/60 px-4 py-3">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-neon">
            <FileText className="size-3.5" /> documentação completa · master spec
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => ping("spec")}
              className="inline-flex items-center gap-1.5 rounded-full border border-neon/50 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-neon transition-colors hover:bg-neon hover:text-background"
            >
              {copied === "spec" ? <Check className="size-3" /> : <Copy className="size-3" />}
              {copied === "spec" ? "copiado" : copied === "downloaded" ? "baixado" : "copiar spec (md)"}
            </button>
            <button
              onClick={() => ping("prompt")}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#ff00c8] px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-black transition-colors hover:bg-[#ff00c8]/90"
            >
              {copied === "prompt" ? <Check className="size-3" /> : <Sparkles className="size-3" />}
              {copied === "prompt" ? "copiado" : copied === "downloaded" ? "baixado" : "copiar prompt mestre"}
            </button>
          </div>
        </div>

        <div className="grid gap-6 p-6 md:grid-cols-2">
          <SpecBlock title="1 · Nome">{props.name}</SpecBlock>
          <SpecBlock title="2 · Resumo">{spec.summary}</SpecBlock>
          <SpecBlock title="3 · Tecnologias">
            {spec.detected.tech.length ? (
              <ul className="flex flex-wrap gap-1.5">
                {spec.detected.tech.map((t) => (
                  <li key={t} className="rounded-full border border-neon/40 bg-neon/5 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-neon">
                    {t}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-muted-foreground">Não foi possível inferir automaticamente.</span>
            )}
          </SpecBlock>
          <SpecBlock title="4 · Arquitetura">
            <ul className="space-y-1.5 text-sm text-foreground/85">
              {spec.architecture.map((n, i) => (
                <li key={i}>• {n}</li>
              ))}
            </ul>
          </SpecBlock>
          <SpecBlock title="5 · Dependências">
            <ul className="flex flex-wrap gap-1.5">
              {spec.deps.map((d) => (
                <li key={d} className="rounded-full border border-border/60 bg-background/60 px-2.5 py-0.5 font-mono text-[11px] text-foreground/80">
                  {d}
                </li>
              ))}
            </ul>
          </SpecBlock>
          <SpecBlock title="6 · Código original">
            <span className="text-muted-foreground">
              {props.files.length} arquivo{props.files.length > 1 ? "s" : ""} preservado{props.files.length > 1 ? "s" : ""} — veja acima ou copie a spec para o markdown completo.
            </span>
          </SpecBlock>
        </div>
      </div>

      <div className="rounded-2xl border border-[#ff00c8]/50 bg-gradient-to-br from-[#ff00c8]/10 to-transparent p-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest text-[#ff00c8]">
            <Sparkles className="size-3.5" /> 7 · prompt mestre (pronto para qualquer IA)
          </div>
          <button
            onClick={() => ping("prompt")}
            className="inline-flex items-center gap-1.5 rounded-full bg-[#ff00c8] px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-black hover:bg-[#ff00c8]/90 transition-colors"
          >
            {copied === "prompt" ? <Check className="size-3" /> : <Copy className="size-3" />}
            {copied === "prompt" ? "copiado" : copied === "downloaded" ? "baixado" : "copiar prompt"}
          </button>
        </div>
        <p className="mt-3 text-sm text-foreground/80">
          O prompt inclui o <strong>código original completo</strong> e regras rígidas
          que impedem qualquer IA de simplificar animações, remover shaders, trocar
          WebGL por CSS ou reduzir a experiência premium do componente.
        </p>
        <pre className="mt-3 max-h-96 overflow-auto rounded-lg border border-border/60 bg-black/60 p-3 text-[11px] leading-relaxed text-foreground/80 whitespace-pre-wrap break-words">
          <code>{promptPreview}</code>
        </pre>
      </div>
    </div>
  );
}

function SpecBlock({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background/40 p-4">
      <div className="font-mono text-[10px] uppercase tracking-widest text-neon">{title}</div>
      <div className="mt-2 text-sm text-foreground/90">{children}</div>
    </div>
  );
}
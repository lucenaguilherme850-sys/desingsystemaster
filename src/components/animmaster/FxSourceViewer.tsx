import { useMemo, useState } from "react";
import { Check, Copy, FileCode2, Sparkles } from "lucide-react";
import { getFxSourceForSlug } from "@/lib/animfx-source";

function buildLovablePrompt(slug: string, name: string, files: Array<{ path: string; content: string }>) {
  const fileList = files.map((f, i) => `${i + 1}. src/${f.path}`).join("\n");
  const mainImport = files[0]?.path.replace(/\.(tsx|ts)$/, "") ?? "";
  const previewUrl = `https://animmaster.lovable.app/animmaster/${slug}`;
  const header = `# Install Animmaster component — "${name}" (${slug})

## ROLE
You are a code-installation assistant. This prompt is an INSTALL JOB, not a writing task.
The block below contains the full, working source of a React + Tailwind animation component
exactly as it renders on the live Animmaster preview: ${previewUrl}
Your only job is to add those files to the user's project verbatim and mount the component
so the result is visually identical to that preview.

## HARD RULES (do not violate)
1. Treat every fenced code block below as a FILE PAYLOAD, not as example text.
2. Write each file to the exact path shown in its \`FILE:\` header, byte-for-byte identical.
   - Do not rename, translate, "clean up", shorten, or re-implement anything.
   - Do not replace code with pseudo-code, comments, or a description of the effect.
3. Preserve ALL demo content exactly: sample copy (e.g. "NATURAL GARMENTS…"), image URLs,
   array items, colors, class names, timings, easings. That content IS the demo —
   it is what makes the installed component match the preview. Do not swap in
   lorem ipsum, placeholder images, your own copy, or "improved" values.
4. If a dependency is missing, install it (npm/pnpm/bun add). Assume React 18 + Tailwind + TypeScript are already set up.
5. Never output prose that describes what the animation looks like. The user already has it — they want it INSTALLED.

## STEP 1 — ASK THE USER FIRST (one message, wait for the answer)
"Where should I mount the '${name}' component?
 a) as a new dedicated page (give me the route),
 b) inside an existing page/section (tell me which),
 c) replacing a current block (tell me which)?
 Also: keep the component's original styling and demo content (recommended — matches ${previewUrl}),
 or adapt colors/copy to your design tokens later?"

## STEP 2 — AFTER THE USER ANSWERS, DO THIS
a) Create these files with the verbatim contents provided further down:
${fileList}
b) Install any missing npm dependency referenced by those files.
c) Import the default export from \`src/${mainImport}\` and render it at the location the user picked.
d) Run the build/preview. The rendered output MUST match ${previewUrl} — same layout,
   same demo text, same images, same motion. If it doesn't, you edited the payload; re-paste it verbatim.

## FAILURE MODES TO AVOID
- ❌ Pasting the prompt text back to the user.
- ❌ Producing a written description like "a parallax hero with a floating diamond…".
- ❌ Generating a simplified stand-in component.
- ❌ Replacing the demo copy/images/arrays with your own content.
- ❌ Rewriting Tailwind classes "to match the user's theme" before install.
- ✅ Correct output: files on disk are byte-identical to the payloads, the component is imported and rendered, and the preview looks the same as ${previewUrl}.

──────────────── FILE PAYLOADS (verbatim) ────────────────`;
  const body = files
    .map(
      (f) =>
        `\n\n// ===== FILE: src/${f.path} =====\n\`\`\`tsx\n${f.content}\n\`\`\``,
    )
    .join("");
  const footer = `\n\n──────────────── END OF PAYLOADS ────────────────
Reminder: this was an install job. Write the files above exactly as shown, then mount the component. Do not summarize, do not describe — install.`;
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
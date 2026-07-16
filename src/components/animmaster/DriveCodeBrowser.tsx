import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Copy, Check, FileCode } from "lucide-react";
import { getAnimmasterDriveCode } from "@/lib/animmaster-drive-code.functions";

type File = { path: string; content: string; size: number; language: string };

export default function DriveCodeBrowser({ slug }: { slug: string }) {
  const fetchCode = useServerFn(getAnimmasterDriveCode);
  const [files, setFiles] = useState<File[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchCode({ data: { slug } })
      .then((r) => {
        if (!alive) return;
        setFiles(r.files);
        setActive(r.files[0]?.path ?? null);
      })
      .catch((e) => alive && setError(String(e?.message ?? e)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [slug, fetchCode]);

  async function copy(text: string, key: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand("copy"); } catch { /* noop */ }
      document.body.removeChild(ta);
    }
    setCopied(key);
    setTimeout(() => setCopied((c) => (c === key ? null : c)), 1500);
  }

  if (loading) {
    return (
      <div className="mt-6 grid h-40 place-items-center rounded-xl border border-border bg-card/40">
        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-neon" /> extraindo código do drive…
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-6 rounded-xl border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
        falha ao carregar código: {error}
      </div>
    );
  }

  if (!files || files.length === 0) {
    return (
      <div className="mt-6 rounded-xl border border-border bg-card/40 p-4 text-sm text-muted-foreground">
        nenhum arquivo de código encontrado no zip.
      </div>
    );
  }

  const current = files.find((f) => f.path === active) ?? files[0];

  return (
    <div className="mt-6 overflow-hidden rounded-2xl border border-neon/40 bg-black/60">
      <div className="flex items-center justify-between border-b border-border/60 bg-background/60 px-4 py-2">
        <div className="font-mono text-[10px] uppercase tracking-widest text-neon">
          ● código original · {files.length} arquivo{files.length > 1 ? "s" : ""}
        </div>
        <button
          onClick={() =>
            copy(
              files.map((f) => `/* ===== ${f.path} ===== */\n${f.content}`).join("\n\n"),
              "__all__",
            )
          }
          className="inline-flex items-center gap-2 rounded-full border border-neon/50 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-neon transition-colors hover:bg-neon hover:text-background"
        >
          {copied === "__all__" ? <Check className="size-3" /> : <Copy className="size-3" />}
          copiar tudo
        </button>
      </div>

      <div className="grid gap-0 md:grid-cols-[220px_1fr]">
        <ul className="max-h-[520px] overflow-auto border-b border-border/60 bg-background/40 md:border-b-0 md:border-r">
          {files.map((f) => (
            <li key={f.path}>
              <button
                onClick={() => setActive(f.path)}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left font-mono text-[11px] transition-colors ${
                  f.path === current.path
                    ? "bg-neon/15 text-neon"
                    : "text-muted-foreground hover:bg-card/40 hover:text-foreground"
                }`}
              >
                <FileCode className="size-3 shrink-0" />
                <span className="truncate">{f.path}</span>
              </button>
            </li>
          ))}
        </ul>

        <div className="relative">
          <div className="flex items-center justify-between border-b border-border/60 bg-background/60 px-3 py-2">
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {current.path} · {(current.size / 1024).toFixed(1)} kb
            </div>
            <button
              onClick={() => copy(current.content, current.path)}
              className="inline-flex items-center gap-2 rounded-full border border-neon/50 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-neon transition-colors hover:bg-neon hover:text-background"
            >
              {copied === current.path ? <Check className="size-3" /> : <Copy className="size-3" />}
              copiar arquivo
            </button>
          </div>
          <pre className="max-h-[520px] overflow-auto p-4 font-mono text-[12px] leading-relaxed text-foreground/90">
            <code>{current.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
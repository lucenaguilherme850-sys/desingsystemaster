import { useMemo, useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useAuth } from "@/hooks/use-auth";
import { useUserTier } from "@/hooks/use-user-tier";
import { Check, Copy, FileCode2, Sparkles } from "lucide-react";
import { getFxSourceForSlug } from "@/lib/animfx-source";
import { supabase } from "@/integrations/supabase/client";

function buildLovablePrompt(slug: string, name: string, files: Array<{ path: string; content: string }>) {
  const previewUrl = `https://designmaster.com.br/animmaster/${slug}`;
  return `# 🚀 PROMPT MESTRE DE IMPLEMENTAÇÃO: ${name}
> ID Referência: \`${slug}\`
> Link Referência: ${previewUrl}

## 🎯 OBJETIVO
Você é um Engenheiro de Software Sênior especializado em UI/UX Premium. Sua missão é **transplantar** este componente para o projeto do usuário, mantendo 100% da fidelidade visual e interativa, adaptando apenas o conteúdo e o design system (cores/fontes).

## 🛡️ Preservar inegociavelmente
- Arquitetura da animação (hooks, refs, loops de raf, observers).
- Shaders / WebGL / Canvas — nunca trocar por CSS ou SVG.
- Easings, timings relativos, staggers, spring configs, física.
- Comportamento de interação (mouse, scroll, hover, touch, teclado).

## ❓ Perguntar ao usuário antes de codar
1) Em qual página/rota deste projeto o componente entra?
2) Qual conteúdo real (títulos, textos, mídia) usar no lugar da demo?
3) Quais tokens de cor/tipografia usar (ou criar tokens dedicados)?
4) Restrições de mobile / prefers-reduced-motion?

## 🛠️ STACK TÉCNICA
As tecnologias originais devem ser preservadas.

## 📋 PROTOCOLO DE IMPLEMENTAÇÃO (PASSO A PASSO)
(Siga as instruções de transplante preservando a Fonte Única da Verdade abaixo)

## 📂 CÓDIGO FONTE ORIGINAL (FONTE DA VERDADE)
${files
  .map(
    (f) =>
      `\n\n### Arquivo: \`src/${f.path}\`\n\`\`\`tsx\n${f.content}\n\`\`\``,
  )
  .join("")}`;
}

export default function FxSourceViewer({ slug, name }: { slug: string; name: string }) {
  const info = useMemo(() => getFxSourceForSlug(slug), [slug]);
  const { user } = useAuth();
  const [active, setActive] = useState(0);
  const [copied, setCopied] = useState<"code" | "prompt" | null>(null);

  const { tier, loading: tierLoading, isAdmin, isPlus, isPro } = useUserTier();
  
  // Ref para rastrear se já tentamos o fallback de auth
  const [authRetry, setAuthRetry] = useState(0);

  const hasAccess = isAdmin || isPlus || isPro;

  // Log de diagnóstico persistente no console
  useEffect(() => {
    if (user && !tierLoading) {
      console.log(`[FxSourceViewer] USER_CHECK:`, {
        email: user.email,
        tier,
        isAdmin,
        isPlus,
        isPro,
        hasAccess
      });
    }
  }, [user, tier, tierLoading, isAdmin, isPlus, isPro, hasAccess]);

  // Se estiver logado mas sem acesso, tenta forçar um refetch da sessão se for o dono
  useEffect(() => {
    if (user && !hasAccess && authRetry < 1) {
      const email = user.email?.toLowerCase();
      if (email === 'lucenaguilherme850@gmail.com' || email === 'lucenaguilherme999@gmail.com') {
        console.warn("[FxSourceViewer] Admin/Pro user detected with no access. Refreshing session...");
        supabase.auth.refreshSession().then(() => {
          setAuthRetry(prev => prev + 1);
        });
      }
    }
  }, [user, hasAccess, authRetry]);

  if (tierLoading) return null;

  if (!hasAccess) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 bg-card/40 p-8 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-neon/10 text-neon">
          <Sparkles className="size-6" />
        </div>
        <h3 className="text-lg font-bold text-foreground">CÓDIGO + PROMPT MESTRE BLOQUEADOS</h3>
        <p className="mx-auto mt-2 max-w-xs text-xs text-muted-foreground">
          Este é um componente premium. Adquira um plano para liberar o acesso total.
        </p>
        <Link
          to="/pricing"
          className="mt-6 inline-flex h-10 items-center justify-center rounded-full bg-neon px-6 text-[10px] font-black uppercase tracking-widest text-background transition-transform hover:scale-105"
        >
          Ver planos
        </Link>
      </div>
    );
  }

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

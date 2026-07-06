import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check, Download } from "lucide-react";
import { toast } from "sonner";

interface CodeExportProps {
  code: string;
  filename: string;
  language?: "html" | "text" | "js" | "css";
}

export function CodeExport({ code, filename, language = "text" }: CodeExportProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      toast.success("Copiado para a área de transferência");
      setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Não foi possível copiar");
    }
  };

  const handleDownload = () => {
    const mime =
      language === "html" ? "text/html" : language === "css" ? "text/css" : language === "js" ? "text/javascript" : "text/plain";
    const blob = new Blob([code], { type: `${mime};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const lines = code.split("\n").length;
  const bytes = new Blob([code]).size;

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-3 py-2">
        <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          <span className="text-neon">{language}</span>
          <span>{filename}</span>
          <span className="text-border">·</span>
          <span>{lines} linhas</span>
          <span className="text-border">·</span>
          <span>{bytes} B</span>
        </div>
        <div className="flex gap-1.5">
          <Button size="sm" variant="ghost" className="h-7 gap-1.5 text-xs" onClick={handleDownload}>
            <Download className="size-3" /> .{language === "text" ? "txt" : language}
          </Button>
          <Button size="sm" variant="outline" className="h-7 gap-1.5 text-xs" onClick={handleCopy}>
            {copied ? <Check className="size-3 text-neon" /> : <Copy className="size-3" />}
            {copied ? "Copiado" : "Copiar"}
          </Button>
        </div>
      </div>
      <pre className="max-h-[420px] overflow-auto p-4 text-xs leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
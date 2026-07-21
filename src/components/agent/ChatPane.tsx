import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, type UIMessage } from "ai";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Send, Loader2, Wrench, Paperclip, X, FileText, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export function ChatPane({
  threadId,
  initialMessages,
  onFinished,
}: {
  threadId: string;
  initialMessages: Array<{ id: string; role: string; parts: unknown }>;
  onFinished: () => void;
}) {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat-director",
        prepareSendMessagesRequest: async ({ messages, body }) => {
          const { data } = await supabase.auth.getSession();
          const token = data.session?.access_token;
          return {
            body: { messages, threadId, ...(body ?? {}) },
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
          };
        },
      }),
    [threadId],
  );

  const { messages, sendMessage, status, error } = useChat({
    id: threadId,
    messages: initialMessages as unknown as UIMessage[],
    transport,
    onFinish: () => onFinished(),
  });

  const didInitialScroll = useRef(false);
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: didInitialScroll.current ? "smooth" : "auto",
    });
    didInitialScroll.current = true;
  }, [messages, status]);
  useEffect(() => {
    didInitialScroll.current = false;
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [threadId]);

  useEffect(() => {
    textareaRef.current?.focus();
  }, [threadId, status]);

  const busy = status === "submitted" || status === "streaming";

  const submit = () => {
    const text = input.trim();
    if ((!text && files.length === 0) || busy) return;
    setInput("");
    const filesToSend = files;
    setFiles([]);
    void sendMessage({
      text: text || "(anexos enviados)",
      files: filesToSend.length ? filesToSend : undefined,
    });
  };

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next: File[] = [];
    for (const f of Array.from(list)) {
      if (f.size > 15 * 1024 * 1024) continue; // 15MB cap
      next.push(f);
    }
    setFiles((prev) => [...prev, ...next].slice(0, 6));
  };

  return (
    <div
      className="flex h-full flex-col"
      onDragOver={(e) => {
        e.preventDefault();
      }}
      onDrop={(e) => {
        e.preventDefault();
        addFiles(e.dataTransfer.files);
      }}
    >
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-6">
        {messages.length === 0 && (
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-semibold">Agente Creative Director</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Descreva o projeto ou cole a URL de um site existente. O agente vai conduzir as 10
              fases (negócio → marca → público → objetivo → DS → hierarquia → UX → animação →
              seleção AnimMaster → plano) antes de recomendar componentes.
            </p>
          </div>
        )}
        <div className="mx-auto max-w-3xl space-y-6">
          {messages.map((m) => (
            <MessageBubble key={m.id} message={m} />
          ))}
          {busy && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-3 animate-spin" /> pensando…
            </div>
          )}
          {error && (
            <p className="text-xs text-destructive">
              Erro: {error.message ?? "falha ao contatar o agente"}
            </p>
          )}
        </div>
      </div>
      <div className="border-t border-border/40 bg-card/30 p-3">
        <div className="mx-auto max-w-3xl">
          {files.length > 0 && (
            <div className="mb-2 flex flex-wrap gap-2">
              {files.map((f, i) => (
                <div
                  key={i}
                  className="inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-background/70 px-2 py-1 text-xs"
                >
                  {f.type.startsWith("image/") ? (
                    <ImageIcon className="size-3" />
                  ) : (
                    <FileText className="size-3" />
                  )}
                  <span className="max-w-[180px] truncate">{f.name}</span>
                  <button
                    type="button"
                    onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                    className="text-muted-foreground hover:text-foreground"
                    aria-label="remover"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
          <div className="flex items-end gap-2">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,application/pdf,.txt,.md,.json,.csv"
            className="hidden"
            onChange={(e) => {
              addFiles(e.target.files);
              if (fileInputRef.current) fileInputRef.current.value = "";
            }}
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-2 py-2 text-muted-foreground hover:text-foreground disabled:opacity-50"
            aria-label="Anexar arquivo"
            title="Anexar imagem ou arquivo"
          >
            <Paperclip className="size-4" />
          </button>
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                submit();
              }
            }}
            rows={2}
            placeholder="Ex: Preciso de um site premium… (ou arraste imagens/PDFs aqui)"
            className="min-h-[60px] flex-1 resize-none rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <button
            onClick={submit}
            disabled={busy || (!input.trim() && files.length === 0)}
            className="inline-flex items-center gap-1 rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-50"
          >
            <Send className="size-3" /> Enviar
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function MessageBubble({ message }: { message: UIMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={isUser ? "flex justify-end" : "flex justify-start"}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
          isUser
            ? "bg-primary/20 text-foreground"
            : "border border-border/60 bg-card/60 text-foreground"
        }`}
      >
        {message.parts?.map((part, i) => {
          if (part.type === "text") {
            return (
              <div key={i} className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{part.text}</ReactMarkdown>
              </div>
            );
          }
          if (typeof part.type === "string" && part.type.startsWith("tool-")) {
            const toolName = part.type.replace(/^tool-/, "");
            const state = (part as { state?: string }).state ?? "";
            return (
              <div
                key={i}
                className="my-1 inline-flex items-center gap-1 rounded-md border border-border/60 bg-background/50 px-2 py-1 text-[11px] text-muted-foreground"
              >
                <Wrench className="size-3" />
                {toolName} · {state}
              </div>
            );
          }
          return null;
        })}
      </div>
    </div>
  );
}
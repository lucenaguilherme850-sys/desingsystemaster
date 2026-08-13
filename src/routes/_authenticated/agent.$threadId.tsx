import { createFileRoute, useNavigate, useParams } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createThread,
  deleteThread,
  getReport,
  getThreadMessages,
  listThreads,
  renameThread,
} from "@/lib/agent.functions";
import { ThreadList } from "@/components/agent/ThreadList";
import { ChatPane } from "@/components/agent/ChatPane";
import { ReportPanel } from "@/components/agent/ReportPanel";
import { useCallback, useEffect, useRef, useState } from "react";
import { PanelRightClose, PanelRightOpen, Compass, Puzzle, Palette, FileText, Layers, Map as MapIcon, Boxes, ListChecks, Zap } from "lucide-react";

export const Route = createFileRoute("/_authenticated/agent/$threadId")({
  component: AgentThread,
});

function AgentThread() {
  const { threadId } = useParams({ from: "/_authenticated/agent/$threadId" });
  const navigate = useNavigate();
  const qc = useQueryClient();
  const list = useServerFn(listThreads);
  const create = useServerFn(createThread);
  const del = useServerFn(deleteThread);
  const rename = useServerFn(renameThread);
  const getMsgs = useServerFn(getThreadMessages);
  const getRep = useServerFn(getReport);

  const threadsQ = useQuery({ queryKey: ["agent-threads"], queryFn: () => list() });
  const msgsQ = useQuery({
    queryKey: ["agent-messages", threadId],
    queryFn: () => getMsgs({ data: { threadId } }),
  });
  const reportQ = useQuery({
    queryKey: ["agent-report", threadId],
    queryFn: () => getRep({ data: { threadId } }),
    refetchInterval: 4000,
  });

  const [reportOpen, setReportOpen] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [leftW, setLeftW] = useState<number>(() => {
    if (typeof window === "undefined") return 240;
    return Number(localStorage.getItem("agent:leftW")) || 240;
  });
  const [rightW, setRightW] = useState<number>(() => {
    if (typeof window === "undefined") return 440;
    return Number(localStorage.getItem("agent:rightW")) || 440;
  });
  useEffect(() => {
    localStorage.setItem("agent:leftW", String(leftW));
  }, [leftW]);
  useEffect(() => {
    localStorage.setItem("agent:rightW", String(rightW));
  }, [rightW]);

  const startDrag = useCallback(
    (side: "left" | "right") => (e: React.PointerEvent) => {
      e.preventDefault();
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      const onMove = (ev: PointerEvent) => {
        if (side === "left") {
          const w = Math.min(420, Math.max(180, ev.clientX - rect.left));
          setLeftW(w);
        } else {
          const w = Math.min(720, Math.max(300, rect.right - ev.clientX));
          setRightW(w);
        }
      };
      const onUp = () => {
        window.removeEventListener("pointermove", onMove);
        window.removeEventListener("pointerup", onUp);
        document.body.style.cursor = "";
        document.body.style.userSelect = "";
      };
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    },
    [],
  );
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "direction" | "collection" | "brief" | "competencies" | "plan"
  >("dashboard");

  const railTabs = [
    { id: "dashboard" as const, icon: Layers, label: "Dashboard" },
    { id: "direction" as const, icon: Palette, label: "Direção" },
    { id: "collection" as const, icon: Puzzle, label: "Coleção" },
    { id: "brief" as const, icon: FileText, label: "Briefing" },
    { id: "competencies" as const, icon: Zap, label: "Competências" },
    { id: "plan" as const, icon: ListChecks, label: "Plano" },
  ];

  const rightCol = reportOpen ? rightW : 48;
  return (
    <div
      ref={containerRef}
      className="grid h-[calc(100vh-64px)] gap-0 border-t border-border/40 bg-background"
      style={{ gridTemplateColumns: `${leftW}px 6px minmax(0,1fr) 6px ${rightCol}px` }}
    >
      <ThreadList
        threads={threadsQ.data ?? []}
        activeId={threadId}
        onNew={async () => {
          const r = await create({ data: {} });
          qc.invalidateQueries({ queryKey: ["agent-threads"] });
          navigate({ to: "/agent/$threadId", params: { threadId: r.id } });
        }}
        onSelect={(id) => navigate({ to: "/agent/$threadId", params: { threadId: id } })}
        onDelete={async (id) => {
          await del({ data: { id } });
          const rest = (threadsQ.data ?? []).filter((t) => t.id !== id);
          qc.invalidateQueries({ queryKey: ["agent-threads"] });
          if (id === threadId) {
            if (rest[0]) navigate({ to: "/agent/$threadId", params: { threadId: rest[0].id } });
            else navigate({ to: "/agent" });
          }
        }}
        onRename={async (id, title) => {
          await rename({ data: { id, title } });
          qc.invalidateQueries({ queryKey: ["agent-threads"] });
        }}
      />
      <div
        onPointerDown={startDrag("left")}
        className="group relative cursor-col-resize bg-border/40 hover:bg-primary/40"
        title="Arrastar"
      >
        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border/60 group-hover:bg-primary/60" />
      </div>
      {msgsQ.isLoading || !msgsQ.data ? (
        <div className="flex items-center justify-center text-sm text-muted-foreground">
          Carregando conversa…
        </div>
      ) : (
        <div className="flex min-h-0 flex-col overflow-hidden">
          {/* Agent Header */}
          <div className="border-b border-border/40 bg-card/10 px-6 py-2.5 backdrop-blur-md">
            <div className="mx-auto flex max-w-[900px] items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-8 items-center justify-center rounded-lg bg-neon/10 text-neon shadow-[0_0_15px_rgba(34,211,238,0.2)]">
                  <Zap className="size-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold tracking-tight text-foreground">Creative Director AI</h2>
                  <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                    <span className="flex size-1.5 items-center justify-center rounded-full bg-neon animate-pulse" />
                    Agente Ativo
                  </div>
                </div>
              </div>
              
              {reportQ.data?.business && typeof reportQ.data.business === 'object' && !Array.isArray(reportQ.data.business) && (reportQ.data.business as any).creative_direction && (
                <div className="flex items-center gap-4 border-l border-border/40 pl-4">
                  <div className="text-right">
                    <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Estratégia</div>
                    <div className="flex items-center justify-end gap-1 text-xs font-semibold text-foreground">
                      <span>{((reportQ.data.business as any).creative_direction as any).profile.emoji}</span>
                      <span>{((reportQ.data.business as any).creative_direction as any).profile.name}</span>
                    </div>
                  </div>
                  {(reportQ.data.business as any).emotion && (
                    <div className="text-right">
                      <div className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">Emoção</div>
                      <div className="flex items-center justify-end gap-1 text-xs font-semibold text-foreground">
                        <span>{((reportQ.data.business as any).emotion as any).emoji}</span>
                        <span>{((reportQ.data.business as any).emotion as any).label}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="mx-auto flex min-h-0 w-full max-w-[900px] flex-1 flex-col">
            <ChatPane
              key={threadId}
              threadId={threadId}
              initialMessages={msgsQ.data}
              onFinished={() => {
                qc.invalidateQueries({ queryKey: ["agent-messages", threadId] });
                qc.invalidateQueries({ queryKey: ["agent-report", threadId] });
                qc.invalidateQueries({ queryKey: ["agent-threads"] });
              }}
            />
          </div>
        </div>
      )}
      <div
        onPointerDown={reportOpen ? startDrag("right") : undefined}
        className={`group relative bg-border/40 ${
          reportOpen ? "cursor-col-resize hover:bg-primary/40" : "opacity-0"
        }`}
        title={reportOpen ? "Arrastar" : undefined}
      >
        <div className="pointer-events-none absolute inset-y-0 left-1/2 w-px -translate-x-1/2 bg-border/60 group-hover:bg-primary/60" />
      </div>
      {reportOpen ? (
        <div className="min-h-0 overflow-hidden border-l border-border/40 bg-card/20">
          <div className="flex h-9 items-center justify-between border-b border-border/40 px-2">
            <span className="pl-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              Documento
            </span>
            <button
              onClick={() => setReportOpen(false)}
              className="rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Recolher painel"
              title="Recolher painel"
            >
              <PanelRightClose className="size-4" />
            </button>
          </div>
          <div className="h-[calc(100%-2.25rem)]">
            <ReportPanel
              report={(reportQ.data ?? null) as never}
              activeTab={activeTab}
              onTabChange={setActiveTab}
            />
          </div>
        </div>
      ) : (
        <div className="flex min-h-0 flex-col items-center gap-1 border-l border-border/40 bg-card/20 py-2">
          <button
            onClick={() => setReportOpen(true)}
            className="mb-1 rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Expandir painel"
            title="Expandir painel"
          >
            <PanelRightOpen className="size-4" />
          </button>
          {railTabs.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setActiveTab(t.id);
                setReportOpen(true);
              }}
              className={`rounded-md p-1.5 transition ${
                activeTab === t.id
                  ? "bg-primary/15 text-primary"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}
              aria-label={t.label}
              title={t.label}
            >
              <t.icon className="size-4" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
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
import { useState } from "react";
import { PanelRightClose, PanelRightOpen, Compass, Puzzle, Palette, FileText, Layers, Map as MapIcon, Boxes, ListChecks } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<
    "pipeline" | "collection" | "direction" | "brief" | "ds" | "map" | "comps" | "plan"
  >("pipeline");

  const railTabs = [
    { id: "pipeline" as const, icon: Compass, label: "Pipeline" },
    { id: "collection" as const, icon: Puzzle, label: "Coleção" },
    { id: "direction" as const, icon: Palette, label: "Direção" },
    { id: "brief" as const, icon: FileText, label: "Briefing" },
    { id: "ds" as const, icon: Layers, label: "Design System" },
    { id: "map" as const, icon: MapIcon, label: "Mapa" },
    { id: "comps" as const, icon: Boxes, label: "Componentes" },
    { id: "plan" as const, icon: ListChecks, label: "Implementação" },
  ];

  return (
    <div
      className={`grid h-[calc(100vh-64px)] gap-0 border-t border-border/40 bg-background transition-[grid-template-columns] duration-300 ${
        reportOpen
          ? "grid-cols-[240px_minmax(0,1fr)_440px]"
          : "grid-cols-[240px_minmax(0,1fr)_48px]"
      }`}
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
      {msgsQ.isLoading || !msgsQ.data ? (
        <div className="flex items-center justify-center text-sm text-muted-foreground">
          Carregando conversa…
        </div>
      ) : (
        <div className="flex min-h-0 flex-col overflow-hidden">
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
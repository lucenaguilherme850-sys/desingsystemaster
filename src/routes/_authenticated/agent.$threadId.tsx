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
import { FileText, X } from "lucide-react";

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

  const [reportOpen, setReportOpen] = useState(false);
  return (
    <div className="relative grid h-[calc(100vh-64px)] grid-cols-[260px_1fr] gap-0 border-t border-border/40 bg-background">
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
        <div className="relative flex min-h-0 flex-col">
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
          <button
            onClick={() => setReportOpen((v) => !v)}
            className="absolute right-4 top-3 z-20 inline-flex items-center gap-1.5 rounded-md border border-border/60 bg-card/70 px-2.5 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur hover:bg-accent hover:text-foreground"
          >
            <FileText className="size-3.5" />
            {reportOpen ? "Fechar documento" : "Ver documento"}
          </button>
        </div>
      )}
      {reportOpen && (
        <div className="absolute inset-y-0 right-0 z-30 w-[420px] max-w-full border-l border-border/40 bg-background shadow-2xl">
          <button
            onClick={() => setReportOpen(false)}
            className="absolute right-2 top-2 z-40 rounded-md p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Fechar"
          >
            <X className="size-4" />
          </button>
          <ReportPanel report={(reportQ.data ?? null) as never} />
        </div>
      )}
    </div>
  );
}
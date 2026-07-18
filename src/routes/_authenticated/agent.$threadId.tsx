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

  return (
    <div className="grid h-[calc(100vh-64px)] grid-cols-[260px_1fr_400px] gap-0 border-t border-border/40 bg-background">
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
      )}
      <ReportPanel report={(reportQ.data ?? null) as never} />
    </div>
  );
}
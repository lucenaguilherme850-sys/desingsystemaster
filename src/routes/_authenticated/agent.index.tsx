import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect } from "react";
import { createThread, listThreads } from "@/lib/agent.functions";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/agent/")({
  component: AgentIndex,
});

function AgentIndex() {
  const navigate = useNavigate();
  const list = useServerFn(listThreads);
  const create = useServerFn(createThread);

  const q = useQuery({ queryKey: ["agent-threads"], queryFn: () => list() });

  useEffect(() => {
    if (!q.data) return;
    if (q.data.length > 0) {
      navigate({ to: "/agent/$threadId", params: { threadId: q.data[0].id } });
    } else {
      create({ data: {} }).then((r) =>
        navigate({ to: "/agent/$threadId", params: { threadId: r.id } }),
      );
    }
  }, [q.data, navigate, create]);

  return (
    <div className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">
      Abrindo agente…
    </div>
  );
}
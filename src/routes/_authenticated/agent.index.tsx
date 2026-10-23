import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { createThread, listThreads } from "@/lib/agent.functions";
import { useQuery } from "@tanstack/react-query";

export const Route = createFileRoute("/_authenticated/agent/")({
  component: AgentIndex,
});

function AgentIndex() {
  const navigate = useNavigate();
  const list = useServerFn(listThreads);
  const create = useServerFn(createThread);
  const creatingRef = useRef(false);
  const [error, setError] = useState(false);

  const q = useQuery({ queryKey: ["agent-threads"], queryFn: () => list(), staleTime: 30_000, retry: 1 });

  useEffect(() => {
    if (!q.data || creatingRef.current) return;
    if (q.data.length > 0) {
      navigate({ to: "/agent/$threadId", params: { threadId: q.data[0].id } });
    } else {
      creatingRef.current = true;
      void create({ data: { title: "Novo projeto" } })
        .then((r) => navigate({ to: "/agent/$threadId", params: { threadId: r.id } }))
        .catch(() => { creatingRef.current = false; setError(true); });
    }
  }, [q.data, navigate, create]);

  return (
    <div className="grid min-h-[60vh] place-items-center text-sm text-muted-foreground">
      {error || q.isError ? "Não foi possível abrir o agente. Atualize a página para tentar novamente." : "Abrindo agente…"}
    </div>
  );
}
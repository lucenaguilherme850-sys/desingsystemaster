import { createFileRoute } from "@tanstack/react-router";
import { listDemoComponents } from "@/lib/demo-source";

// GET /api/public/registry
// Índice estilo shadcn: lista todos os componentes disponíveis.
export const Route = createFileRoute("/api/public/registry")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const base = `${url.protocol}//${url.host}`;
        const items = listDemoComponents().map((name) => ({
          name,
          type: "registry:component",
          url: `${base}/api/public/registry/${name}.json`,
        }));
        return new Response(
          JSON.stringify({ $schema: "lovable-fx.v1", items }, null, 2),
          {
            headers: {
              "content-type": "application/json; charset=utf-8",
              "cache-control": "public, max-age=60",
              "access-control-allow-origin": "*",
            },
          },
        );
      },
    },
  },
});
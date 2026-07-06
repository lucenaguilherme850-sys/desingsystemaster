import { createFileRoute } from "@tanstack/react-router";
import { getDemoSource } from "@/lib/demo-source";

// GET /api/public/registry/:name(.json)
// Formato compatível com shadcn-style registry consumers.
export const Route = createFileRoute("/api/public/registry/$name")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const raw = params.name.replace(/\.json$/, "");
        const source = getDemoSource(raw);
        if (!source) {
          return new Response(
            JSON.stringify({ error: `component "${raw}" not found` }),
            {
              status: 404,
              headers: {
                "content-type": "application/json; charset=utf-8",
                "access-control-allow-origin": "*",
              },
            },
          );
        }
        const payload = {
          $schema: "lovable-fx.v1",
          name: raw,
          type: "registry:component",
          dependencies: ["react"],
          devDependencies: [],
          registryDependencies: [],
          files: [
            {
              path: `components/${raw}.tsx`,
              content: source,
              type: "registry:component",
            },
          ],
        };
        return new Response(JSON.stringify(payload, null, 2), {
          headers: {
            "content-type": "application/json; charset=utf-8",
            "cache-control": "public, max-age=60",
            "access-control-allow-origin": "*",
          },
        });
      },
    },
  },
});
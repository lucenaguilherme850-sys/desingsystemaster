import { createFileRoute } from "@tanstack/react-router";
import { getDemoSource } from "@/lib/demo-source";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { getFxSourceForSlug } from "@/lib/animfx-source";

// GET /api/public/registry/:name(.json)
// Formato compatível com shadcn-style registry consumers.
// Resolve na ordem: (1) demo local, (2) item persistido em animmaster_items.
export const Route = createFileRoute("/api/public/registry/$name")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const raw = params.name.replace(/\.json$/, "");
        const jsonHeaders = {
          "content-type": "application/json; charset=utf-8",
          "cache-control": "public, max-age=60",
          "access-control-allow-origin": "*",
        };

        // 1) Legacy demos (components/demos/*.tsx)
        const demo = getDemoSource(raw);
        if (demo) {
          return new Response(
            JSON.stringify(
              {
                $schema: "lovable-fx.v1",
                name: raw,
                type: "registry:component",
                source: "demo",
                dependencies: ["react"],
                files: [{ path: `components/${raw}.tsx`, content: demo, type: "registry:component" }],
              },
              null,
              2,
            ),
            { headers: jsonHeaders },
          );
        }

        // 2) animmaster_items row by slug
        const supabase = createClient<Database>(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_PUBLISHABLE_KEY!,
          { auth: { persistSession: false, autoRefreshToken: false } },
        );
        const { data: row, error } = await supabase
          .from("animmaster_items")
          .select("slug,name,type_name,category,poster_url,video_url,poster_local,video_local")
          .eq("slug", raw)
          .maybeSingle();
        if (error) {
          return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: jsonHeaders });
        }
        if (!row) {
          return new Response(JSON.stringify({ error: `component "${raw}" not found` }), {
            status: 404,
            headers: jsonHeaders,
          });
        }
        const fx = getFxSourceForSlug(row.slug);
        const payload = {
          $schema: "lovable-fx.v1",
          name: row.slug,
          title: row.type_name || row.name,
          type: "registry:component",
          source: "animmaster",
          category: row.category,
          preview: {
            poster: row.poster_local ?? row.poster_url,
            video: row.video_local ?? row.video_url,
          },
          hasCode: fx !== null,
          kind: fx?.kind ?? null,
          dependencies: fx ? ["react", ...(fx.kind === "handcrafted" && /\bogl\b/.test(fx.files[0].content) ? ["ogl"] : [])] : ["react"],
          files: fx?.files ?? [],
        };
        return new Response(JSON.stringify(payload, null, 2), { headers: jsonHeaders });
      },
    },
  },
});
import { createFileRoute } from "@tanstack/react-router";
import { listDemoComponents } from "@/lib/demo-source";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { hasFxSource } from "@/lib/animfx-source";

// GET /api/public/registry
// Índice estilo shadcn: lista todos os componentes disponíveis
// (demos locais + 280 itens persistidos em public.animmaster_items).
// Query params:
//   ?category=hero|scroll|webgl|...    filtra por categoria
//   ?source=live                       só itens com código exportável
//   ?limit=50                          paginação simples
//   ?offset=0
export const Route = createFileRoute("/api/public/registry")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const base = `${url.protocol}//${url.host}`;
        const category = url.searchParams.get("category");
        const onlyLive = url.searchParams.get("source") === "live";
        const limit = Math.min(1000, Math.max(1, Number(url.searchParams.get("limit") ?? "500")));
        const offset = Math.max(0, Number(url.searchParams.get("offset") ?? "0"));

        const demoItems = listDemoComponents().map((name) => ({
          name,
          type: "registry:component",
          source: "demo" as const,
          url: `${base}/api/public/registry/${name}.json`,
        }));

        const supabase = createClient<Database>(
          process.env.SUPABASE_URL!,
          process.env.SUPABASE_PUBLISHABLE_KEY!,
          { auth: { persistSession: false, autoRefreshToken: false } },
        );
        let q = supabase
          .from("animmaster_items")
          .select("slug,name,type_name,category,poster_url,video_url,poster_local,video_local", { count: "exact" })
          .order("position", { ascending: true })
          .range(offset, offset + limit - 1);
        if (category) q = q.eq("category", category);
        const { data, count, error } = await q;
        if (error) {
          return new Response(JSON.stringify({ error: error.message }), {
            status: 500,
            headers: { "content-type": "application/json; charset=utf-8", "access-control-allow-origin": "*" },
          });
        }
        let libraryItems = (data ?? []).map((row) => ({
          name: row.slug,
          title: row.type_name || row.name,
          type: "registry:component",
          source: "animmaster" as const,
          category: row.category,
          poster: row.poster_local ?? row.poster_url,
          video: row.video_local ?? row.video_url,
          hasCode: hasFxSource(row.slug),
          url: `${base}/api/public/registry/${row.slug}.json`,
        }));
        if (onlyLive) libraryItems = libraryItems.filter((i) => i.hasCode);

        const payload = {
          $schema: "lovable-fx.v1",
          total: (count ?? libraryItems.length) + demoItems.length,
          count: libraryItems.length + demoItems.length,
          offset,
          limit,
          items: [...demoItems, ...libraryItems],
        };
        return new Response(
          JSON.stringify(payload, null, 2),
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
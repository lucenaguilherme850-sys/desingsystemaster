import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type AnimasterIndexItem = {
  slug: string;
  name: string;
  category: string;
};

let cache: { at: number; items: AnimasterIndexItem[] } | null = null;

export async function buildAnimasterIndex(): Promise<AnimasterIndexItem[]> {
  if (cache && Date.now() - cache.at < 60_000 * 10) return cache.items;
  const supabase = createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const { data } = await supabase
    .from("animmaster_items")
    .select("slug,name,type_name,category")
    .order("position", { ascending: true });
  const items: AnimasterIndexItem[] = (data ?? []).map((r) => ({
    slug: r.slug,
    name: r.type_name || r.name,
    category: r.category,
  }));
  cache = { at: Date.now(), items };
  return items;
}

export function formatIndexForPrompt(items: AnimasterIndexItem[]): string {
  const byCat = new Map<string, AnimasterIndexItem[]>();
  for (const it of items) {
    const arr = byCat.get(it.category) ?? [];
    arr.push(it);
    byCat.set(it.category, arr);
  }
  const parts: string[] = [];
  for (const [cat, arr] of byCat) {
    parts.push(`### ${cat} (${arr.length})`);
    parts.push(arr.map((i) => `- ${i.slug} — ${i.name}`).join("\n"));
  }
  return parts.join("\n");
}
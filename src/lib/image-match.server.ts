import { Jimp } from "jimp";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";

export type PosterEntry = {
  slug: string;
  name: string;
  category: string;
  poster_url: string;
  hash: string; // 64-char binary
};

let posterCache: { at: number; entries: PosterEntry[] } | null = null;
const HASH_TTL = 1000 * 60 * 60 * 6; // 6h

function supabaseClient() {
  const key = process.env.SUPABASE_PUBLISHABLE_KEY!;
  return createClient<Database>(process.env.SUPABASE_URL!, key, {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: (input, init) => {
        const headers = new Headers(init?.headers);
        if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) {
          headers.delete("Authorization");
        }
        headers.set("apikey", key);
        return fetch(input, { ...init, headers });
      },
    },
  });
}

async function hashBuffer(buf: Buffer): Promise<string | null> {
  try {
    const img = await Jimp.read(buf);
    img.resize({ w: 8, h: 8 });
    img.greyscale();
    const px = img.bitmap.data;
    const vals: number[] = [];
    let sum = 0;
    for (let i = 0; i < 64; i++) {
      const v = px[i * 4];
      vals.push(v);
      sum += v;
    }
    const avg = sum / 64;
    let out = "";
    for (let i = 0; i < 64; i++) out += vals[i] > avg ? "1" : "0";
    return out;
  } catch {
    return null;
  }
}

async function fetchAndHash(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 6000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    const buf = Buffer.from(await res.arrayBuffer());
    return await hashBuffer(buf);
  } catch {
    return null;
  }
}

export async function loadPosterHashes(): Promise<PosterEntry[]> {
  if (posterCache && Date.now() - posterCache.at < HASH_TTL) return posterCache.entries;
  const supabase = supabaseClient();
  const { data } = await supabase
    .from("animmaster_items")
    .select("slug,name,category,poster_url")
    .limit(400);
  const rows = (data ?? []).filter((r) => r.poster_url);
  // Hash in parallel batches
  const entries: PosterEntry[] = [];
  const BATCH = 12;
  for (let i = 0; i < rows.length; i += BATCH) {
    const chunk = rows.slice(i, i + BATCH);
    const hashes = await Promise.all(chunk.map((r) => fetchAndHash(r.poster_url)));
    chunk.forEach((r, j) => {
      const h = hashes[j];
      if (h) entries.push({ slug: r.slug, name: r.name, category: r.category, poster_url: r.poster_url, hash: h });
    });
  }
  posterCache = { at: Date.now(), entries };
  return entries;
}

export function hammingDistance(a: string, b: string): number {
  if (a.length !== b.length) return 64;
  let d = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
  return d;
}

export async function findVisualMatches(
  imageBuffers: Buffer[],
  topN = 3,
): Promise<Array<{ slug: string; name: string; category: string; poster_url: string; distance: number; confidence: number }>> {
  const posters = await loadPosterHashes();
  if (posters.length === 0) return [];
  const results: Array<{ slug: string; name: string; category: string; poster_url: string; distance: number; confidence: number }> = [];
  for (const buf of imageBuffers) {
    const h = await hashBuffer(buf);
    if (!h) continue;
    const scored = posters
      .map((p) => {
        const d = hammingDistance(h, p.hash);
        return { ...p, distance: d, confidence: Math.round((1 - d / 64) * 100) };
      })
      .sort((a, b) => a.distance - b.distance)
      .slice(0, topN);
    for (const s of scored) results.push(s);
  }
  // Deduplicate by slug, keep best
  const bySlug = new Map<string, typeof results[number]>();
  for (const r of results) {
    const prev = bySlug.get(r.slug);
    if (!prev || r.distance < prev.distance) bySlug.set(r.slug, r);
  }
  return Array.from(bySlug.values()).sort((a, b) => a.distance - b.distance).slice(0, topN);
}

export async function decodeAttachmentToBuffer(url: string): Promise<Buffer | null> {
  try {
    if (url.startsWith("data:")) {
      const m = url.match(/^data:[^;]+;base64,(.+)$/);
      if (!m) return null;
      return Buffer.from(m[1], "base64");
    }
    const controller = new AbortController();
    const t = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(t);
    if (!res.ok) return null;
    return Buffer.from(await res.arrayBuffer());
  } catch {
    return null;
  }
}
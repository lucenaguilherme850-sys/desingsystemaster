import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { unzipSync, strFromU8 } from "fflate";
import { buildComponentSpec } from "@/lib/component-spec";

const inputSchema = z.object({ slug: z.string().min(1).max(200) });
const promptInputSchema = z.object({ slug: z.string().min(1).max(200) });
const GATEWAY = "https://connector-gateway.lovable.dev/google_drive/drive/v3";

const TEXT_EXT = new Set([
  "html","htm","css","scss","sass","less","js","mjs","cjs","jsx","ts","tsx",
  "json","md","txt","svg","xml","yml","yaml","glsl","frag","vert","vue","astro",
  "py","rb","go","rs","java","kt","swift","c","h","cpp","hpp","cs","php","sh",
  "env","gitignore","toml","ini","lock","map"
]);

function extOf(name: string) {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i + 1).toLowerCase();
}

function isTextFile(name: string, bytes: Uint8Array): boolean {
  const e = extOf(name);
  if (TEXT_EXT.has(e)) return true;
  // heuristic: no NUL byte in first 512 bytes
  const n = Math.min(bytes.length, 512);
  for (let i = 0; i < n; i++) if (bytes[i] === 0) return false;
  return true;
}

async function driveDownload(fileId: string): Promise<ArrayBuffer> {
  const lk = process.env.LOVABLE_API_KEY;
  const gk = process.env.GOOGLE_DRIVE_API_KEY;
  if (!lk || !gk) throw new Error("Drive credentials missing");
  const res = await fetch(`${GATEWAY}/files/${fileId}?alt=media&supportsAllDrives=true`, {
    headers: { Authorization: `Bearer ${lk}`, "X-Connection-Api-Key": gk },
  });
  if (!res.ok) throw new Error(`drive ${res.status}`);
  return res.arrayBuffer();
}

async function loadFilesForSlug(slug: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data: row, error } = await supabaseAdmin
    .from("animmaster_items")
    .select("id, slug, name, category, drive_zip_id")
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(error.message);
  if (!row?.drive_zip_id)
    return { row: row ?? null, files: [] as { path: string; content: string; size: number; language: string }[] };

  const bucket = supabaseAdmin.storage.from("animmaster-assets");
    const path = `drive-code/${row.slug}.zip`;

    // Try to load from bucket first
    let zipBytes: Uint8Array | null = null;
    const dl = await bucket.download(path);
    if (dl.data) {
      zipBytes = new Uint8Array(await dl.data.arrayBuffer());
    } else {
      // fallback: fetch from Drive and cache
      const ab = await driveDownload(row.drive_zip_id);
      zipBytes = new Uint8Array(ab);
      await bucket.upload(path, zipBytes, {
        contentType: "application/zip",
        upsert: true,
      });
    }

    const entries = unzipSync(zipBytes, {
      filter: (f) => !f.name.endsWith("/") && f.size < 512 * 1024, // skip dirs and >512KB
    });

    const files: { path: string; content: string; size: number; language: string }[] = [];
    for (const [name, bytes] of Object.entries(entries)) {
      // skip macOS junk
      if (name.includes("__MACOSX/") || name.endsWith(".DS_Store")) continue;
      if (!isTextFile(name, bytes)) continue;
      let content: string;
      try {
        content = strFromU8(bytes);
      } catch {
        continue;
      }
      files.push({
        path: name,
        content,
        size: bytes.length,
        language: extOf(name) || "text",
      });
    }

    files.sort((a, b) => {
      const rank = (p: string) => {
        const n = p.toLowerCase();
        if (n.endsWith("index.html") || n.endsWith(".html")) return 0;
        if (n.endsWith(".css") || n.endsWith(".scss")) return 1;
        if (n.endsWith(".js") || n.endsWith(".ts") || n.endsWith(".jsx") || n.endsWith(".tsx")) return 2;
        return 3;
      };
      const r = rank(a.path) - rank(b.path);
      return r !== 0 ? r : a.path.localeCompare(b.path);
    });

  return { row, files };
}

export const getAnimmasterDriveCode = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const { files } = await loadFilesForSlug(data.slug);
    return { files };
  });

export const getAnimmasterDriveMasterPrompt = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => promptInputSchema.parse(data))
  .handler(async ({ data }) => {
    const { row, files } = await loadFilesForSlug(data.slug);
    if (!row || !files.length) return { prompt: "" };
    const spec = buildComponentSpec({
      slug: row.slug,
      name: row.name ?? row.slug,
      category: row.category,
      files: files.map((f) => ({ path: f.path, content: f.content, language: f.language })),
    });
    return { prompt: spec.prompt };
  });
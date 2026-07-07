import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({ slug: z.string().min(1).max(200) });

const SIGNED_TTL = 60 * 60 * 24 * 365 * 5; // 5 years

export const mirrorAnimmasterAsset = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: row, error } = await supabaseAdmin
      .from("animmaster_items")
      .select("id, slug, poster_url, video_url, poster_local, video_local, mirrored")
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("not found");

    async function ensureUpload(remote: string, ext: string, kind: "poster" | "video") {
      const path = `${kind}/${row!.slug}.${ext}`;
      // list to check existence
      const { data: existing } = await supabaseAdmin.storage
        .from("animmaster-assets")
        .list(kind, { search: `${row!.slug}.${ext}` });
      const hit = existing?.some((f) => f.name === `${row!.slug}.${ext}`);
      if (!hit) {
        const res = await fetch(remote);
        if (!res.ok) throw new Error(`fetch ${kind} ${res.status}`);
        const buf = new Uint8Array(await res.arrayBuffer());
        const contentType =
          kind === "poster" ? "image/webp" : "video/webm";
        const { error: upErr } = await supabaseAdmin.storage
          .from("animmaster-assets")
          .upload(path, buf, { contentType, upsert: true });
        if (upErr) throw new Error(upErr.message);
      }
      const { data: signed, error: sErr } = await supabaseAdmin.storage
        .from("animmaster-assets")
        .createSignedUrl(path, SIGNED_TTL);
      if (sErr) throw new Error(sErr.message);
      return signed.signedUrl;
    }

    let posterLocal = row.poster_local;
    let videoLocal = row.video_local;
    if (!row.mirrored || !posterLocal || !videoLocal) {
      posterLocal = await ensureUpload(row.poster_url, "webp", "poster");
      videoLocal = await ensureUpload(row.video_url, "webm", "video");
      await supabaseAdmin
        .from("animmaster_items")
        .update({ poster_local: posterLocal, video_local: videoLocal, mirrored: true })
        .eq("id", row.id);
    }

    return { poster: posterLocal, video: videoLocal };
  });
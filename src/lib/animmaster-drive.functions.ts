import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const inputSchema = z.object({ slug: z.string().min(1).max(200) });
const SIGNED_TTL = 60 * 60 * 24 * 7; // Preview links are short-lived; never issue multi-year URLs.
const GATEWAY = "https://connector-gateway.lovable.dev/google_drive/drive/v3";

async function driveDownload(fileId: string): Promise<{ body: ArrayBuffer; contentType: string }> {
  const lk = process.env.LOVABLE_API_KEY;
  const gk = process.env.GOOGLE_DRIVE_API_KEY;
  if (!lk || !gk) throw new Error("Drive credentials missing");
  const res = await fetch(`${GATEWAY}/files/${fileId}?alt=media&supportsAllDrives=true`, {
    headers: { Authorization: `Bearer ${lk}`, "X-Connection-Api-Key": gk },
  });
  if (!res.ok) {
    const t = await res.text().catch(() => "");
    throw new Error(`Drive download ${fileId} failed ${res.status}: ${t.slice(0, 200)}`);
  }
  return {
    body: await res.arrayBuffer(),
    contentType: res.headers.get("content-type") ?? "application/octet-stream",
  };
}

export const mirrorAnimmasterDrive = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("animmaster_items")
      .select(
        "id, slug, drive_video_id, drive_zip_id, drive_instruction_id, video_local, poster_local, mirrored, instruction_text",
      )
      .eq("slug", data.slug)
      .maybeSingle();
    if (error) throw new Error(error.message);
    if (!row) throw new Error("not found");
    if (!row.drive_video_id && !row.drive_zip_id) throw new Error("no drive assets");

    const bucket = supabaseAdmin.storage.from("animmaster-assets");

    async function ensureVideo(): Promise<string | null> {
      if (!row!.drive_video_id) return null;
      const path = `drive/${row!.slug}.mp4`;
      const { data: existing } = await bucket.list("drive", { search: `${row!.slug}.mp4` });
      if (!existing?.some((f) => f.name === `${row!.slug}.mp4`)) {
        const { body, contentType } = await driveDownload(row!.drive_video_id);
        const { error: upErr } = await bucket.upload(path, new Uint8Array(body), {
          contentType: contentType.startsWith("video/") ? contentType : "video/mp4",
          upsert: true,
        });
        if (upErr) throw new Error(upErr.message);
      }
      const { data: signed, error: sErr } = await bucket.createSignedUrl(path, SIGNED_TTL);
      if (sErr) throw new Error(sErr.message);
      return signed.signedUrl;
    }


    async function ensureInstruction(): Promise<string | null> {
      if (row!.instruction_text) return row!.instruction_text;
      if (!row!.drive_instruction_id) return null;
      const { body } = await driveDownload(row!.drive_instruction_id);
      const text = new TextDecoder().decode(new Uint8Array(body));
      await supabaseAdmin
        .from("animmaster_items")
        .update({ instruction_text: text })
        .eq("id", row!.id);
      return text;
    }

    const [video, instruction] = await Promise.all([
      ensureVideo(),
      ensureInstruction(),
    ]);

    await supabaseAdmin
      .from("animmaster_items")
      .update({ video_local: video, mirrored: !!video })
      .eq("id", row.id);

    // Source ZIPs are served only by the authenticated, plan-checked code endpoint.
    return { video, zipUrl: null, instruction };
  });
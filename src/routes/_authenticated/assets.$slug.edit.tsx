import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AssetForm } from "@/components/AssetForm";
import type { Asset } from "@/lib/asset-types";

export const Route = createFileRoute("/_authenticated/assets/$slug/edit")({
  component: EditPage,
});

function EditPage() {
  const { slug } = Route.useParams();
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ["asset", slug, "edit"],
    queryFn: async (): Promise<Asset | null> => {
      const { data, error } = await supabase.from("assets").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return (data ?? null) as unknown as Asset | null;
    },
  });

  if (isLoading) return <div className="mx-auto max-w-4xl px-6 py-12 font-mono text-muted-foreground">Loading…</div>;
  if (error) return <div className="mx-auto max-w-4xl px-6 py-12 text-destructive">{error.message}</div>;
  if (!data) {
    router.navigate({ to: "/" });
    return null;
  }
  return <AssetForm mode="edit" initial={data} />;
}
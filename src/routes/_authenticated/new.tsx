import { createFileRoute } from "@tanstack/react-router";
import { AssetForm } from "@/components/AssetForm";

export const Route = createFileRoute("/_authenticated/new")({
  head: () => ({ meta: [{ title: "New asset — Motion Library" }] }),
  component: () => <AssetForm mode="create" />,
});
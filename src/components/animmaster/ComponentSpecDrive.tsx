import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Loader2 } from "lucide-react";
import { getAnimmasterDriveCode } from "@/lib/animmaster-drive-code.functions";
import ComponentSpec from "./ComponentSpec";

type Props = {
  slug: string;
  name: string;
  category?: string | null;
  summary?: string | null;
};

export default function ComponentSpecDrive(props: Props) {
  const fetchCode = useServerFn(getAnimmasterDriveCode);
  const [files, setFiles] = useState<Array<{ path: string; content: string; language?: string }> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchCode({ data: { slug: props.slug } })
      .then((r) => {
        if (!alive) return;
        setFiles(r.files.map((f) => ({ path: f.path, content: f.content, language: f.language })));
      })
      .catch(() => alive && setFiles([]))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [fetchCode, props.slug]);

  if (loading) {
    return (
      <div className="mt-10 grid h-32 place-items-center rounded-xl border border-border bg-card/40">
        <div className="flex items-center gap-2 font-mono text-xs text-muted-foreground">
          <Loader2 className="size-4 animate-spin text-neon" /> gerando documentação…
        </div>
      </div>
    );
  }
  if (!files || files.length === 0) return null;
  return <ComponentSpec {...props} files={files} />;
}
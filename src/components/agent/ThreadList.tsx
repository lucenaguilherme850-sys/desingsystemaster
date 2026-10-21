import { Plus, Trash2, MessageSquare } from "lucide-react";

export type Thread = { id: string; title: string; brief_summary: string; updated_at: string };

export function ThreadList({
  threads,
  activeId,
  onNew,
  onSelect,
  onDelete,
  onRename,
}: {
  threads: Thread[];
  activeId: string;
  onNew: () => void;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
}) {
  return (
    <aside className="flex h-full flex-col border-r border-border/40 bg-card/30">
      <div className="flex items-center justify-between p-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Projetos
        </span>
        <button
          onClick={onNew}
          className="inline-flex items-center gap-1 rounded-md bg-primary/90 px-2 py-1 text-xs font-medium text-primary-foreground hover:bg-primary"
        >
          <Plus className="size-3" /> Novo
        </button>
      </div>
      <div className="flex-1 overflow-y-auto px-2 pb-4">
        {threads.length === 0 && (
          <p className="px-2 text-xs text-muted-foreground">Nenhum projeto ainda. Clique em Novo para começar.</p>
        )}
        {threads.map((t) => (
          <div
            key={t.id}
            className={`group mb-1 flex items-center gap-1 rounded-md px-2 py-2 text-sm transition-colors ${
              t.id === activeId ? "bg-accent text-foreground" : "hover:bg-accent/40"
            }`}
          >
            <button
              onClick={() => onSelect(t.id)}
              className="flex flex-1 items-center gap-2 truncate text-left"
              onDoubleClick={() => {
                const next = window.prompt("Renomear projeto", t.title);
                if (next && next.trim()) onRename(t.id, next.trim());
              }}
              title={t.title}
            >
              <MessageSquare className="size-3.5 shrink-0 opacity-70" />
              <span className="truncate">{t.title}</span>
            </button>
            <button
              onClick={() => {
                if (window.confirm("Excluir este projeto?")) onDelete(t.id);
              }}
              className="opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
              aria-label="Excluir"
            >
              <Trash2 className="size-3.5" />
            </button>
          </div>
        ))}
      </div>
    </aside>
  );
}
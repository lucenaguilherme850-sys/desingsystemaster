import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { ASSET_CATEGORIES, type Asset } from "@/lib/asset-types";
import { DEMO_REGISTRY } from "@/components/demos";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

type Mode = "create" | "edit";

export function AssetForm({ mode, initial }: { mode: Mode; initial?: Asset }) {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [f, setF] = useState({
    slug: initial?.slug ?? "",
    name: initial?.name ?? "",
    category: initial?.category ?? "Component",
    demo_component: initial?.demo_component ?? "",
    short_description: initial?.short_description ?? "",
    objective: initial?.objective ?? "",
    description: initial?.description ?? "",
    how_it_works: initial?.how_it_works ?? "",
    flow: (initial?.flow ?? []).join("\n"),
    technologies: (initial?.technologies ?? []).join(", "),
    html_structure: initial?.html_structure ?? "",
    css_notes: initial?.css_notes ?? "",
    js_notes: initial?.js_notes ?? "",
    math: (initial?.math ?? []).join(", "),
    events: (initial?.events ?? []).join(", "),
    algorithm: initial?.algorithm ?? "",
    responsiveness: initial?.responsiveness ?? "",
    accessibility: initial?.accessibility ?? "",
    dependencies: (initial?.dependencies ?? []).join(", "),
    complexity: initial?.complexity ?? 5,
    estimated_time: initial?.estimated_time ?? "",
    issues: (initial?.issues ?? []).join("\n"),
    improvements: (initial?.improvements ?? []).join("\n"),
    variations: (initial?.variations ?? []).join(", "),
    compatibility: (initial?.compatibility ?? []).join(", "),
    reuse: initial?.reuse ?? "",
    code_base: initial?.code_base ?? "",
    checklist: (initial?.checklist ?? []).join("\n"),
    visual_impact: initial?.visual_impact ?? 5,
    ux_impact: initial?.ux_impact ?? 5,
  });

  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) =>
    setF((p) => ({ ...p, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) throw new Error("Not signed in");

      const payload = {
        slug: f.slug.trim(),
        name: f.name.trim(),
        category: f.category,
        demo_component: f.demo_component.trim() || null,
        short_description: f.short_description,
        objective: f.objective,
        description: f.description,
        how_it_works: f.how_it_works,
        flow: splitLines(f.flow),
        technologies: splitCsv(f.technologies),
        html_structure: f.html_structure,
        css_notes: f.css_notes,
        js_notes: f.js_notes,
        math: splitCsv(f.math),
        events: splitCsv(f.events),
        algorithm: f.algorithm,
        performance: {},
        responsiveness: f.responsiveness,
        accessibility: f.accessibility,
        dependencies: splitCsv(f.dependencies),
        complexity: clamp(Number(f.complexity), 1, 10),
        estimated_time: f.estimated_time,
        issues: splitLines(f.issues),
        improvements: splitLines(f.improvements),
        variations: splitCsv(f.variations),
        compatibility: splitCsv(f.compatibility),
        reuse: f.reuse,
        code_base: f.code_base,
        checklist: splitLines(f.checklist),
        visual_impact: clamp(Number(f.visual_impact), 1, 10),
        ux_impact: clamp(Number(f.ux_impact), 1, 10),
      };

      if (mode === "create") {
        const { error } = await supabase
          .from("assets")
          .insert({ ...payload, created_by: u.user.id });
        if (error) throw error;
        toast.success("Asset created");
      } else {
        const { error } = await supabase.from("assets").update(payload).eq("id", initial!.id);
        if (error) throw error;
        toast.success("Asset updated");
      }
      navigate({ to: "/assets/$slug", params: { slug: payload.slug } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const demoOptions = Object.keys(DEMO_REGISTRY);

  return (
    <form onSubmit={submit} className="mx-auto max-w-4xl space-y-8 px-6 py-10">
      <header>
        <div className="font-mono text-[11px] uppercase tracking-widest text-neon">
          // {mode === "create" ? "new asset" : "edit asset"}
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          {mode === "create" ? "New asset" : `Editing ${initial?.name}`}
        </h1>
      </header>

      <FieldGroup title="identity">
        <Row>
          <Field label="name" required>
            <Input value={f.name} onChange={(e) => set("name", e.target.value)} required />
          </Field>
          <Field label="slug" required hint="url segment, no spaces">
            <Input
              value={f.slug}
              onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
              required
              className="font-mono"
            />
          </Field>
        </Row>
        <Row>
          <Field label="category" required>
            <select
              value={f.category}
              onChange={(e) => set("category", e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm"
            >
              {ASSET_CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-background">
                  {c}
                </option>
              ))}
            </select>
          </Field>
          <Field label="demo component" hint="name of a registered demo, optional">
            <select
              value={f.demo_component}
              onChange={(e) => set("demo_component", e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-transparent px-3 font-mono text-sm"
            >
              <option value="" className="bg-background">
                — none —
              </option>
              {demoOptions.map((d) => (
                <option key={d} value={d} className="bg-background">
                  {d}
                </option>
              ))}
            </select>
          </Field>
        </Row>
        <Field label="short description">
          <Input
            value={f.short_description}
            onChange={(e) => set("short_description", e.target.value)}
          />
        </Field>
      </FieldGroup>

      <FieldGroup title="ficha técnica">
        <Field label="objetivo" hint="why exists, when to use, when NOT">
          <Textarea rows={4} value={f.objective} onChange={(e) => set("objective", e.target.value)} />
        </Field>
        <Field label="descrição">
          <Textarea rows={3} value={f.description} onChange={(e) => set("description", e.target.value)} />
        </Field>
        <Field label="funcionamento (how it works)">
          <Textarea
            rows={4}
            value={f.how_it_works}
            onChange={(e) => set("how_it_works", e.target.value)}
          />
        </Field>
        <Field label="fluxo interno" hint="one step per line">
          <Textarea rows={5} value={f.flow} onChange={(e) => set("flow", e.target.value)} />
        </Field>
        <Row>
          <Field label="tecnologias" hint="comma separated">
            <Input value={f.technologies} onChange={(e) => set("technologies", e.target.value)} />
          </Field>
          <Field label="eventos" hint="comma separated">
            <Input value={f.events} onChange={(e) => set("events", e.target.value)} />
          </Field>
        </Row>
        <Row>
          <Field label="matemática" hint="comma separated">
            <Input value={f.math} onChange={(e) => set("math", e.target.value)} />
          </Field>
          <Field label="dependências" hint="comma separated">
            <Input value={f.dependencies} onChange={(e) => set("dependencies", e.target.value)} />
          </Field>
        </Row>
        <Field label="algoritmo">
          <Textarea rows={4} value={f.algorithm} onChange={(e) => set("algorithm", e.target.value)} />
        </Field>
        <Field label="estrutura html">
          <Textarea
            rows={3}
            className="font-mono"
            value={f.html_structure}
            onChange={(e) => set("html_structure", e.target.value)}
          />
        </Field>
        <Row>
          <Field label="css necessário">
            <Textarea rows={4} value={f.css_notes} onChange={(e) => set("css_notes", e.target.value)} />
          </Field>
          <Field label="javascript necessário">
            <Textarea rows={4} value={f.js_notes} onChange={(e) => set("js_notes", e.target.value)} />
          </Field>
        </Row>
        <Row>
          <Field label="responsividade">
            <Textarea rows={3} value={f.responsiveness} onChange={(e) => set("responsiveness", e.target.value)} />
          </Field>
          <Field label="acessibilidade">
            <Textarea rows={3} value={f.accessibility} onChange={(e) => set("accessibility", e.target.value)} />
          </Field>
        </Row>
        <Field label="issues (um por linha)">
          <Textarea rows={3} value={f.issues} onChange={(e) => set("issues", e.target.value)} />
        </Field>
        <Field label="melhorias (um por linha)">
          <Textarea rows={3} value={f.improvements} onChange={(e) => set("improvements", e.target.value)} />
        </Field>
        <Field label="variações" hint="comma separated">
          <Input value={f.variations} onChange={(e) => set("variations", e.target.value)} />
        </Field>
        <Field label="compatibilidade" hint="comma separated (HTML, React, Next…)">
          <Input value={f.compatibility} onChange={(e) => set("compatibility", e.target.value)} />
        </Field>
        <Field label="reutilização">
          <Textarea rows={2} value={f.reuse} onChange={(e) => set("reuse", e.target.value)} />
        </Field>
        <Field label="código base (arquitetura)">
          <Textarea rows={4} value={f.code_base} onChange={(e) => set("code_base", e.target.value)} />
        </Field>
        <Field label="checklist (um por linha)">
          <Textarea rows={5} value={f.checklist} onChange={(e) => set("checklist", e.target.value)} />
        </Field>
      </FieldGroup>

      <FieldGroup title="scores">
        <Row>
          <Field label="complexity (1-10)">
            <Input
              type="number"
              min={1}
              max={10}
              value={f.complexity}
              onChange={(e) => set("complexity", Number(e.target.value))}
            />
          </Field>
          <Field label="visual impact (1-10)">
            <Input
              type="number"
              min={1}
              max={10}
              value={f.visual_impact}
              onChange={(e) => set("visual_impact", Number(e.target.value))}
            />
          </Field>
          <Field label="ux impact (1-10)">
            <Input
              type="number"
              min={1}
              max={10}
              value={f.ux_impact}
              onChange={(e) => set("ux_impact", Number(e.target.value))}
            />
          </Field>
        </Row>
        <Field label="estimated time" hint="e.g. 30-60 min, 1-2 hours">
          <Input value={f.estimated_time} onChange={(e) => set("estimated_time", e.target.value)} />
        </Field>
      </FieldGroup>

      <div className="flex justify-end gap-2 border-t border-border pt-6">
        <Button type="button" variant="ghost" onClick={() => navigate({ to: "/" })}>
          Cancel
        </Button>
        <Button type="submit" disabled={busy}>
          {busy ? "Saving…" : mode === "create" ? "Create asset" : "Save changes"}
        </Button>
      </div>
    </form>
  );
}

function FieldGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4 rounded-xl border border-border bg-card p-6">
      <legend className="mb-2 px-2 font-mono text-[11px] uppercase tracking-widest text-neon">
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function Row({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        {label}
        {required && <span className="text-neon">*</span>}
        {hint && <span className="normal-case text-muted-foreground/70">— {hint}</span>}
      </Label>
      {children}
    </div>
  );
}

function splitCsv(s: string): string[] {
  return s
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);
}
function splitLines(s: string): string[] {
  return s
    .split("\n")
    .map((x) => x.trim())
    .filter(Boolean);
}
function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, isNaN(n) ? lo : n));
}
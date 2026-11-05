import { For, Show, createSignal, type Component } from "solid-js";
import { resolveLabel } from "../../core/collections/define";
import type { TaxonomyTerm } from "../../core/types/taxonomies";
import { useDashboard } from "../context";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { RLLink } from "@rimelight/ui/components/link/RLLink.tsx";
import { RLInput } from "@rimelight/ui/components/input/RLInput.tsx";
import { RLTextarea } from "@rimelight/ui/components/textarea/RLTextarea.tsx";
import { RLSelect } from "@rimelight/ui/components/select/RLSelect.tsx";
import { RLCheckbox } from "@rimelight/ui/components/checkbox/RLCheckbox.tsx";

import { Button, Empty, Field, Loading, Modal, PageHeader, useLoader } from "../ui";
import { cmsT } from "../../locale";

export const Taxonomies: Component<{ taxonomy?: string }> = (props) => {
  const { api, href, navigate, toast } = useDashboard();
  const taxonomies = useLoader(() => api.taxonomies.list());
  const presets = useLoader(() => api.taxonomies.presets());
  const [creating, setCreating] = createSignal(false);
  const [draft, setDraft] = createSignal({ label: "", slug: "", hierarchical: false });
  const active = () => props.taxonomy ?? taxonomies.data()?.taxonomies[0]?.slug;
  const available = () =>
    (presets.data()?.presets ?? []).filter(
      (p) => !taxonomies.data()?.taxonomies.some((t) => t.slug === p.definition.slug),
    );

  const created = async (slug: string) => {
    await taxonomies.reload();
    navigate(`/taxonomies/${slug}`);
  };
  const fromPreset = async (id: string) => {
    try {
      const { taxonomy } = await api.taxonomies.createFromPreset(id);
      toast("Taxonomy created", "success");
      await created(taxonomy.slug);
    } catch (err) {
      toast((err as Error).message, "error");
    }
  };
  const create = async () => {
    try {
      const { taxonomy } = await api.taxonomies.create({
        label: draft().label,
        ...(draft().slug ? { slug: draft().slug } : {}),
        hierarchical: draft().hierarchical,
      });
      setCreating(false);
      toast("Taxonomy created", "success");
      await created(taxonomy.slug);
    } catch (err) {
      toast((err as Error).message, "error");
    }
  };

  return (
    <div>
      <PageHeader
        icon="i-lucide-tags"
        title={cmsT("text.taxonomies")}
        description="Vocabularies for organising entries, such as categories or tags. Start from a preset or create your own."
        actions={
          <Button variant="primary" icon="i-lucide-plus" onClick={() => setCreating(true)}>
            New taxonomy
          </Button>
        }
      />
      <div class="flex gap-6 p-6">
        <nav class="flex w-44 shrink-0 flex-col gap-0.5">
          <For each={taxonomies.data()?.taxonomies ?? []}>
            {(t) => (
              <RLLink
                href={href(`/taxonomies/${t.slug}`)}
                class={`justify-start ${active() === t.slug ? "bg-primary-500/10 font-medium text-primary-500" : "text-toned hover:bg-elevated"}`}
                label={resolveLabel(t.label)}
              />
            )}
          </For>
          <Show when={available().length > 0}>
            <div class="mt-4 text-[11px] font-semibold uppercase tracking-wide text-muted">
              Presets
            </div>
            <For each={available()}>
              {(p) => (
                <RLButton
                  variant="ghost"
                  color="neutral"
                  class="justify-start"
                  title={p.summary}
                  onClick={() => void fromPreset(p.id)}
                >
                  + {resolveLabel(p.definition.label)}
                </RLButton>
              )}
            </For>
          </Show>
        </nav>
        <div class="min-w-0 flex-1">
          <Show
            when={active()}
            fallback={
              <Empty
                icon="i-lucide-tags"
                title={cmsT("text.no-taxonomies-yet")}
                description="Add one from a preset on the left, or create your own."
              />
            }
            keyed
          >
            {(slug) => (
              <Terms
                taxonomy={slug}
                hierarchical={
                  !!taxonomies.data()?.taxonomies.find((t) => t.slug === slug)?.hierarchical
                }
                onDeleted={() => void taxonomies.reload().then(() => navigate("/taxonomies"))}
              />
            )}
          </Show>
        </div>
      </div>
      <Modal
        open={creating()}
        title={cmsT("text.new-taxonomy")}
        onClose={() => setCreating(false)}
        footer={
          <Button variant="primary" onClick={() => void create()}>
            Create
          </Button>
        }
      >
        <div class="flex flex-col gap-3">
          <Field label="Name">
            <RLInput
              value={draft().label}
              onInput={(e) => setDraft({ ...draft(), label: e.currentTarget.value })}
            />
          </Field>
          <Field label="Slug" hint="Leave blank to generate from the name.">
            <RLInput
              class="font-mono"
              value={draft().slug}
              onInput={(e) => setDraft({ ...draft(), slug: e.currentTarget.value })}
            />
          </Field>
          <RLCheckbox
            label="Allow nested terms (parent and child)"
            checked={draft().hierarchical}
            onCheckedChange={(checked) => setDraft({ ...draft(), hierarchical: checked })}
          />
        </div>
      </Modal>
    </div>
  );
};

const Terms: Component<{ taxonomy: string; hierarchical: boolean; onDeleted: () => void }> = (
  props,
) => {
  const { api, toast } = useDashboard();
  const terms = useLoader(() => api.taxonomies.terms(props.taxonomy));
  const [editing, setEditing] = createSignal<Partial<TaxonomyTerm> | null>(null);

  const tree = () => {
    const list = terms.data()?.terms ?? [];
    const out: { term: TaxonomyTerm; depth: number }[] = [];
    const walk = (parent: string | null, depth: number) => {
      for (const t of list.filter((x) => (x.parentId ?? null) === parent)) {
        out.push({ term: t, depth });
        walk(t.id, depth + 1);
      }
    };
    walk(null, 0);
    // Orphans (parent deleted) still show.
    for (const t of list) if (!out.some((o) => o.term.id === t.id)) out.push({ term: t, depth: 0 });
    return out;
  };

  const save = async () => {
    const t = editing()!;
    try {
      const body = {
        label: t.name ?? t.label,
        slug: t.slug,
        description: t.description ?? null,
        parentId: t.parentId ?? null,
      };
      if (t.id) await api.taxonomies.updateTerm(props.taxonomy, t.id, body);
      else await api.taxonomies.createTerm(props.taxonomy, body);
      setEditing(null);
      void terms.reload();
    } catch (err) {
      toast((err as Error).message, "error");
    }
  };

  return (
    <div class="flex flex-col gap-3">
      <div class="flex justify-end gap-2">
        <Button
          variant="ghost"
          class="text-error-500"
          onClick={async () => {
            if (!confirm("Delete this taxonomy? It must have no terms.")) return;
            try {
              await api.taxonomies.remove(props.taxonomy);
              props.onDeleted();
            } catch (err) {
              toast((err as Error).message, "error");
            }
          }}
        >
          Delete taxonomy
        </Button>
        <Button variant="primary" icon="i-lucide-plus" onClick={() => setEditing({ name: "" })}>
          New term
        </Button>
      </div>
      <Loading when={terms.loading() && !terms.data()}>
        <Show
          when={tree().length}
          fallback={<Empty icon="i-lucide-tag" title={cmsT("text.no-terms-yet-8ee9")} />}
        >
          <div class="divide-y divide-default rounded-xl border border-default">
            <For each={tree()}>
              {({ term, depth }) => (
                <div
                  class="flex items-center gap-3 px-4 py-2 text-sm"
                  style={{ "padding-left": `${16 + depth * 20}px` }}
                >
                  <span class="flex-1 text-highlighted">{term.name}</span>
                  <span class="font-mono text-xs text-muted">{term.slug}</span>
                  <span class="w-10 text-right text-xs text-muted">{term.count}</span>
                  <RLButton
                    variant="ghost"
                    color="neutral"
                    size="xs"
                    icon="i-lucide-pencil"
                    aria-label={cmsT("text.edit-term")}
                    onClick={() => setEditing({ ...term })}
                  />
                  <RLButton
                    variant="ghost"
                    color="error"
                    size="xs"
                    icon="i-lucide-trash-2"
                    aria-label={cmsT("text.delete-term")}
                    onClick={async () => {
                      if (!confirm(`Delete "${term.name}"? Child terms are deleted too.`)) return;
                      await api.taxonomies.deleteTerm(props.taxonomy, term.id);
                      void terms.reload();
                    }}
                  />
                </div>
              )}
            </For>
          </div>
        </Show>
      </Loading>
      <Modal
        open={!!editing()}
        title={editing()?.id ? "Edit term" : "New term"}
        onClose={() => setEditing(null)}
        footer={
          <Button variant="primary" onClick={() => void save()}>
            Save
          </Button>
        }
      >
        <Show when={editing()}>
          <div class="flex flex-col gap-3">
            <Field label="Name">
              <RLInput
                value={editing()!.name ?? ""}
                onInput={(e) => setEditing({ ...editing()!, name: e.currentTarget.value })}
              />
            </Field>
            <Field label="Slug">
              <RLInput
                class="font-mono"
                placeholder={cmsT("text.auto")}
                value={editing()!.slug ?? ""}
                onInput={(e) => setEditing({ ...editing()!, slug: e.currentTarget.value })}
              />
            </Field>
            <Field label="Description">
              <RLTextarea
                value={String(resolveLabel(editing()!.description as any) ?? "")}
                onInput={(e) => setEditing({ ...editing()!, description: e.currentTarget.value })}
              />
            </Field>
            <Show when={props.hierarchical}>
              <Field label="Parent">
                <RLSelect
                  value={editing()!.parentId ?? ""}
                  items={[
                    { label: "None", value: "" },
                    ...(terms.data()?.terms ?? [])
                      .filter((t) => t.id !== editing()!.id)
                      .map((t) => ({ label: t.name ?? t.slug, value: t.id })),
                  ]}
                  onChange={(e) =>
                    setEditing({ ...editing()!, parentId: e.currentTarget.value || null })
                  }
                />
              </Field>
            </Show>
          </div>
        </Show>
      </Modal>
    </div>
  );
};

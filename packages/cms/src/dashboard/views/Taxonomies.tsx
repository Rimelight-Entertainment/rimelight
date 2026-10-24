import { For, Show, createSignal, type Component } from "solid-js";
import { resolveLabel } from "../../core/collections/define";
import type { TaxonomyTerm } from "../../core/types/taxonomies";
import { useDashboard } from "../context";
import { inputClass } from "../fields/FieldInput";
import { Button, Empty, Field, Loading, Modal, PageHeader, useLoader } from "../ui";

export const Taxonomies: Component<{ taxonomy?: string }> = (props) => {
  const { api, href } = useDashboard();
  const taxonomies = useLoader(() => api.taxonomies.list());
  const active = () => props.taxonomy ?? taxonomies.data()?.taxonomies[0]?.slug;

  return (
    <div>
      <PageHeader
        icon="i-lucide-tags"
        title="Taxonomies"
        description="Categories, tags and custom vocabularies. Add new taxonomies in cms.config.ts."
      />
      <div class="flex gap-6 p-6">
        <nav class="flex w-44 shrink-0 flex-col gap-0.5">
          <For each={taxonomies.data()?.taxonomies ?? []}>
            {(t) => (
              <a
                href={href(`/taxonomies/${t.slug}`)}
                class={`rounded-md px-2.5 py-1.5 text-sm ${active() === t.slug ? "bg-elevated font-medium text-highlighted" : "text-toned hover:bg-elevated"}`}
              >
                {resolveLabel(t.label)}
              </a>
            )}
          </For>
        </nav>
        <div class="min-w-0 flex-1">
          <Show when={active()} keyed>
            {(slug) => (
              <Terms
                taxonomy={slug}
                hierarchical={
                  !!taxonomies.data()?.taxonomies.find((t) => t.slug === slug)?.hierarchical
                }
              />
            )}
          </Show>
        </div>
      </div>
    </div>
  );
};

const Terms: Component<{ taxonomy: string; hierarchical: boolean }> = (props) => {
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
      <div class="flex justify-end">
        <Button variant="primary" icon="i-lucide-plus" onClick={() => setEditing({ name: "" })}>
          New term
        </Button>
      </div>
      <Loading when={terms.loading() && !terms.data()}>
        <Show when={tree().length} fallback={<Empty icon="i-lucide-tag" title="No terms yet" />}>
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
                  <button
                    type="button"
                    class="i-lucide-pencil size-3.5 text-muted hover:text-highlighted"
                    onClick={() => setEditing({ ...term })}
                  />
                  <button
                    type="button"
                    class="i-lucide-trash-2 size-3.5 text-muted hover:text-error-500"
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
              <input
                class={inputClass}
                value={editing()!.name ?? ""}
                onInput={(e) => setEditing({ ...editing()!, name: e.currentTarget.value })}
              />
            </Field>
            <Field label="Slug">
              <input
                class={`${inputClass} font-mono`}
                placeholder="auto"
                value={editing()!.slug ?? ""}
                onInput={(e) => setEditing({ ...editing()!, slug: e.currentTarget.value })}
              />
            </Field>
            <Field label="Description">
              <textarea
                class={inputClass}
                value={String(resolveLabel(editing()!.description as any) ?? "")}
                onInput={(e) => setEditing({ ...editing()!, description: e.currentTarget.value })}
              />
            </Field>
            <Show when={props.hierarchical}>
              <Field label="Parent">
                <select
                  class={inputClass}
                  value={editing()!.parentId ?? ""}
                  onChange={(e) =>
                    setEditing({ ...editing()!, parentId: e.currentTarget.value || null })
                  }
                >
                  <option value="">None</option>
                  <For each={(terms.data()?.terms ?? []).filter((t) => t.id !== editing()!.id)}>
                    {(t) => <option value={t.id}>{t.name}</option>}
                  </For>
                </select>
              </Field>
            </Show>
          </div>
        </Show>
      </Modal>
    </div>
  );
};

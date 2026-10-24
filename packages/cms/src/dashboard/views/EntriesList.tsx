import { For, Show, createEffect, createMemo, createSignal, type Component } from "solid-js";
import { resolveLabel } from "../../core/collections/define";
import type { EntrySummary } from "../../services/entries";
import { useDashboard } from "../context";
import { inputClass } from "../fields/FieldInput";
import { Button, Empty, Field, Loading, Modal, PageHeader, StatusBadge, relativeTime, useLoader } from "../ui";

const STATUSES = ["all", "draft", "scheduled", "published"] as const;
const PAGE = 50;

export const EntriesList: Component<{ collection: string; create?: boolean }> = (props) => {
  const { api, collection: getCollection, href, navigate, toast } = useDashboard();
  const collection = () => getCollection(props.collection);
  const [status, setStatus] = createSignal<(typeof STATUSES)[number]>("all");
  const [q, setQ] = createSignal("");
  const [trash, setTrash] = createSignal(false);
  const [offset, setOffset] = createSignal(0);
  const [creating, setCreating] = createSignal(!!props.create);

  const hierarchical = () => !!collection()?.features.hierarchical;
  const list = useLoader(() =>
    api.entries.list({
      collection: props.collection,
      ...(status() !== "all" ? { status: status() } : {}),
      ...(q() ? { q: q() } : {}),
      ...(trash() ? { deleted: true, status: "archived" } : {}),
      orderBy: hierarchical() ? "slug" : "updated",
      content: collection()?.kind === "data",
      limit: PAGE,
      offset: offset(),
    }),
  );

  let searchTimer: ReturnType<typeof setTimeout>;
  createEffect(
    () => [status(), trash(), offset(), props.collection] as const,
    () => void list.reload(),
  );

  // Show a couple of the collection's own fields as columns (useful for product/data collections).
  const fieldColumns = createMemo(() =>
    Object.entries(collection()?.fields ?? {})
      .filter(([, f]) => ["text", "number", "currency", "select", "boolean", "date"].includes(f.type))
      .slice(0, collection()?.kind === "data" ? 4 : 0),
  );

  const depth = (e: EntrySummary) => (hierarchical() ? e.slug.split("/").length - 1 : 0);

  return (
    <div>
      <PageHeader
        icon={collection()?.icon}
        title={resolveLabel(collection()?.labelPlural ?? collection()?.label) || props.collection}
        description={resolveLabel(collection()?.description)}
        actions={
          <>
            <Button variant="ghost" icon="i-lucide-trash" onClick={() => { setTrash(!trash()); setOffset(0); }}>
              {trash() ? "Back" : "Trash"}
            </Button>
            <Button variant="primary" icon="i-lucide-plus" onClick={() => setCreating(true)}>
              New {resolveLabel(collection()?.label) || "entry"}
            </Button>
          </>
        }
      />
      <div class="flex flex-col gap-4 p-6">
        <div class="flex flex-wrap items-center gap-3">
          <Show when={!trash()}>
            <div class="flex rounded-md border border-default p-0.5">
              <For each={STATUSES}>
                {(s) => (
                  <button
                    type="button"
                    class={`rounded px-2.5 py-1 text-xs capitalize ${status() === s ? "bg-elevated font-medium text-highlighted" : "text-muted"}`}
                    onClick={() => { setStatus(s); setOffset(0); }}
                  >
                    {s}
                  </button>
                )}
              </For>
            </div>
          </Show>
          <input
            class={`${inputClass} max-w-xs`}
            placeholder="Search title or slug…"
            value={q()}
            onInput={(e) => {
              setQ(e.currentTarget.value);
              clearTimeout(searchTimer);
              searchTimer = setTimeout(() => { setOffset(0); void list.reload(); }, 250);
            }}
          />
          <span class="ml-auto text-xs text-muted">{list.data()?.total ?? 0} entries</span>
        </div>

        <Loading when={list.loading() && !list.data()}>
          <Show
            when={list.data()?.entries.length}
            fallback={
              <Empty
                icon={collection()?.icon}
                title={trash() ? "Trash is empty" : "Nothing here yet"}
                description={trash() ? undefined : "Create the first entry to get started."}
                action={trash() ? undefined : <Button variant="primary" icon="i-lucide-plus" onClick={() => setCreating(true)}>Create entry</Button>}
              />
            }
          >
            <div class="overflow-x-auto rounded-xl border border-default">
              <table class="w-full text-sm">
                <thead class="bg-elevated/60 text-left text-[11px] uppercase tracking-wide text-muted">
                  <tr>
                    <th class="px-4 py-2 font-medium">Title</th>
                    <For each={fieldColumns()}>{([, f]) => <th class="px-4 py-2 font-medium">{resolveLabel(f.label)}</th>}</For>
                    <th class="px-4 py-2 font-medium">Status</th>
                    <th class="px-4 py-2 text-right font-medium">Updated</th>
                    <Show when={trash()}><th /></Show>
                  </tr>
                </thead>
                <tbody class="divide-y divide-default">
                  <For each={list.data()!.entries}>
                    {(e) => (
                      <tr class="hover:bg-elevated/50">
                        <td class="px-4 py-2">
                          <a href={href(`/e/${e.id}`)} class="flex flex-col" style={{ "padding-left": `${depth(e) * 16}px` }}>
                            <span class="font-medium text-highlighted">{e.excerptTitle}</span>
                            <span class="font-mono text-[11px] text-muted">/{e.slug}</span>
                          </a>
                        </td>
                        <For each={fieldColumns()}>
                          {([key, f]) => <td class="px-4 py-2 text-toned">{formatValue((e as any).published?.properties?.[key], f.type)}</td>}
                        </For>
                        <td class="px-4 py-2"><StatusBadge status={e.status} changed={e.hasUnpublishedChanges} /></td>
                        <td class="px-4 py-2 text-right text-xs text-muted">{relativeTime(e.updatedAt ?? e.createdAt)}</td>
                        <Show when={trash()}>
                          <td class="px-4 py-2 text-right">
                            <Button
                              variant="ghost"
                              icon="i-lucide-undo-2"
                              onClick={async () => {
                                try {
                                  await api.entries.restore(e.id);
                                  toast("Restored", "success");
                                  void list.reload();
                                } catch (err) {
                                  toast((err as Error).message, "error");
                                }
                              }}
                            >
                              Restore
                            </Button>
                          </td>
                        </Show>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>
            <div class="flex justify-end gap-2">
              <Button disabled={offset() === 0} onClick={() => setOffset(Math.max(0, offset() - PAGE))}>Previous</Button>
              <Button disabled={offset() + PAGE >= (list.data()?.total ?? 0)} onClick={() => setOffset(offset() + PAGE)}>Next</Button>
            </div>
          </Show>
        </Loading>
      </div>

      <CreateEntryModal
        open={creating()}
        collection={props.collection}
        onClose={() => {
          setCreating(false);
          if (props.create) navigate(`/c/${props.collection}`);
        }}
        onCreated={(id) => navigate(`/e/${id}`)}
      />
    </div>
  );
};

function formatValue(v: unknown, type: string): string {
  if (v == null || v === "") return "—";
  if (type === "currency" && typeof v === "object") {
    const c = v as { amount: number; currency: string };
    return new Intl.NumberFormat(undefined, { style: "currency", currency: c.currency || "USD" }).format(c.amount / 100);
  }
  if (type === "boolean") return v ? "Yes" : "No";
  if (typeof v === "object") return resolveLabel(v as any) || JSON.stringify(v);
  return String(v);
}

export const CreateEntryModal: Component<{ open: boolean; collection: string; onClose: () => void; onCreated: (id: string) => void }> = (props) => {
  const { api, collection, toast } = useDashboard();
  const [title, setTitle] = createSignal("");
  const [slug, setSlug] = createSignal("");
  const [templateId, setTemplateId] = createSignal("");
  const [busy, setBusy] = createSignal(false);
  const templates = useLoader(() => api.templates.list(props.collection));

  const submit = async () => {
    if (!title().trim()) return;
    setBusy(true);
    try {
      const { entry } = await api.entries.create({
        collection: props.collection,
        title: title(),
        ...(slug() ? { slug: slug() } : {}),
        ...(templateId() ? { templateId: templateId() } : {}),
      });
      props.onCreated(entry.id);
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={props.open}
      title={`New ${resolveLabel(collection(props.collection)?.label) || "entry"}`}
      onClose={props.onClose}
      footer={
        <>
          <Button variant="ghost" onClick={props.onClose}>Cancel</Button>
          <Button variant="primary" loading={busy()} disabled={!title().trim()} onClick={() => void submit()}>Create</Button>
        </>
      }
    >
      <form class="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
        <Field label="Title">
          <input class={inputClass} value={title()} autofocus onInput={(e) => setTitle(e.currentTarget.value)} />
        </Field>
        <Field
          label="Slug"
          hint={collection(props.collection)?.features.hierarchical ? "Use slashes to nest, e.g. guides/getting-started" : "Leave empty to derive from the title"}
        >
          <input class={`${inputClass} font-mono`} value={slug()} placeholder="auto" onInput={(e) => setSlug(e.currentTarget.value)} />
        </Field>
        <Show when={templates.data()?.templates.length}>
          <Field label="Start from">
            <div class="grid grid-cols-2 gap-2">
              <TemplateOption selected={!templateId()} title="Blank" onClick={() => setTemplateId("")} />
              <For each={templates.data()!.templates}>
                {(t) => (
                  <TemplateOption
                    selected={templateId() === t.id}
                    title={resolveLabel(t.title)}
                    description={resolveLabel(t.description)}
                    onClick={() => setTemplateId(t.id)}
                  />
                )}
              </For>
            </div>
          </Field>
        </Show>
      </form>
    </Modal>
  );
};

const TemplateOption: Component<{ selected: boolean; title: string; description?: string; onClick: () => void }> = (props) => (
  <button
    type="button"
    class={`rounded-lg border p-3 text-left ${props.selected ? "border-primary-500 bg-primary-500/5" : "border-default hover:bg-elevated"}`}
    onClick={props.onClick}
  >
    <div class="text-sm font-medium text-highlighted">{props.title}</div>
    <Show when={props.description}>
      <div class="mt-0.5 line-clamp-2 text-[11px] text-muted">{props.description}</div>
    </Show>
  </button>
);

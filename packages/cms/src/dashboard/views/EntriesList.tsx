import { For, Show, createEffect, createMemo, createSignal, type Component } from "solid-js";
import { resolveLabel } from "../../core/collections/define";
import type { EntrySummary } from "../../services/entries";
import { useDashboard } from "../context";
import { inputClass } from "../fields/FieldInput";
import {
  Button,
  Empty,
  Field,
  Loading,
  Modal,
  PageHeader,
  StatusBadge,
  relativeTime,
  useLoader,
} from "../ui";

const STATUSES = ["all", "draft", "scheduled", "published"] as const;
const SORTS = [
  ["updated", "Last updated"],
  ["created", "Newest"],
  ["title", "Title A–Z"],
  ["type", "Type"],
] as const;
const PAGE = 50;

/**
 * All content in one place. With no `collection` it lists every entry and the collections act
 * as filters (with counts); with one, it's that collection's list (its own columns, ordering
 * and "New …" button). Collections stay deep-linkable at /c/<slug>.
 */
export const EntriesList: Component<{ collection?: string; create?: boolean }> = (props) => {
  const { api, collection: getCollection, collections, href, navigate, toast } = useDashboard();
  const collection = () => (props.collection ? getCollection(props.collection) : undefined);
  const stats = useLoader(() => api.stats());
  const count = (slug?: string) => {
    const by = stats.data()?.byCollection ?? {};
    const sum = (o: Record<string, number> | undefined) =>
      Object.values(o ?? {}).reduce((a, b) => a + b, 0);
    return slug ? sum(by[slug]) : Object.values(by).reduce((a, o) => a + sum(o), 0);
  };
  const [creating, setCreating] = createSignal(!!props.create);

  /**
   * List query. Kept in a plain object as well as a signal: reload() must see the new values
   * immediately, and signal writes are only visible after the current batch flushes.
   */
  type Sort = (typeof SORTS)[number][0];
  type Query = {
    status: (typeof STATUSES)[number];
    q: string;
    trash: boolean;
    offset: number;
    sort: Sort | null;
  };
  let current: Query = { status: "all", q: "", trash: false, offset: 0, sort: null };
  const [query, setQuery] = createSignal<Query>(current);
  const status = () => query().status;
  const q = () => query().q;
  const trash = () => query().trash;
  const offset = () => query().offset;
  const defaultSort = (): Sort | "slug" => (hierarchical() ? "slug" : "updated");

  const hierarchical = () => !!collection()?.features.hierarchical;
  const list = useLoader(() =>
    api.entries.list({
      ...(props.collection ? { collection: props.collection } : {}),
      ...(current.status !== "all" ? { status: current.status } : {}),
      ...(current.q ? { q: current.q } : {}),
      ...(current.trash ? { deleted: true, status: "archived" } : {}),
      orderBy: current.sort ?? defaultSort(),
      content: collection()?.kind === "data",
      limit: PAGE,
      offset: current.offset,
    }),
  );

  const update = (patch: Partial<Query>) => {
    current = { ...current, ...patch };
    setQuery(current);
    void list.reload();
  };
  const setStatus = (s: Query["status"]) => update({ status: s, offset: 0 });
  const setTrash = (t: boolean) => update({ trash: t, offset: 0 });
  const setOffset = (o: number) => update({ offset: o });

  let searchTimer: ReturnType<typeof setTimeout>;
  // Switching collections reuses this component: reset the query.
  createEffect(
    () => props.collection,
    (_, prev) => {
      if (prev !== undefined)
        update({ status: "all", q: "", trash: false, offset: 0, sort: current.sort });
    },
  );

  // Show a couple of the collection's own fields as columns (useful for product/data collections).
  const fieldColumns = createMemo(() =>
    Object.entries(collection()?.fields ?? {})
      .filter(([, f]) =>
        ["text", "number", "currency", "select", "boolean", "date"].includes(f.type),
      )
      .slice(0, collection()?.kind === "data" ? 4 : 0),
  );

  const depth = (e: EntrySummary) => (hierarchical() ? e.slug.split("/").length - 1 : 0);

  return (
    <div>
      <PageHeader
        icon={collection()?.icon ?? "i-lucide-files"}
        title={
          props.collection
            ? resolveLabel(collection()?.labelPlural ?? collection()?.label) || props.collection
            : "Content"
        }
        description={
          props.collection
            ? resolveLabel(collection()?.description)
            : "Every entry, across all collections."
        }
        actions={
          <>
            <Button variant="ghost" icon="i-lucide-trash" onClick={() => setTrash(!trash())}>
              {trash() ? "Back" : "Trash"}
            </Button>
            <Button variant="primary" icon="i-lucide-plus" onClick={() => setCreating(true)}>
              New {props.collection ? resolveLabel(collection()?.label) || "entry" : "entry"}
            </Button>
          </>
        }
      />
      <div class="flex flex-col gap-4 p-6">
        {/* Collection filter: one chip per type, coloured like its mentions. */}
        <div class="-mx-1 flex flex-wrap gap-1.5">
          <a
            href={href("/c")}
            class={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors ${!props.collection ? "border-primary-500 bg-primary-500/10 font-medium text-primary-500" : "border-default text-toned hover:bg-elevated"}`}
          >
            All
            <span class="text-[10px] text-muted">{count()}</span>
          </a>
          <For each={collections()}>
            {(c) => (
              <a
                href={href(`/c/${c.slug}`)}
                class={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs transition-colors ${props.collection === c.slug ? "font-medium text-highlighted" : "border-default text-toned hover:bg-elevated"}`}
                style={
                  props.collection === c.slug
                    ? {
                        "border-color": c.color,
                        background: `color-mix(in srgb, ${c.color} 12%, transparent)`,
                      }
                    : {}
                }
              >
                <span class={`${c.icon ?? "i-lucide-box"} size-3.5`} style={{ color: c.color }} />
                {resolveLabel(c.labelPlural ?? c.label)}
                <span class="text-[10px] text-muted">{count(c.slug)}</span>
              </a>
            )}
          </For>
        </div>
        <div class="flex flex-wrap items-center gap-3">
          <Show when={!trash()}>
            <div class="flex rounded-md border border-default p-0.5">
              <For each={STATUSES}>
                {(s) => (
                  <button
                    type="button"
                    class={`rounded px-2.5 py-1 text-xs capitalize ${status() === s ? "bg-elevated font-medium text-highlighted" : "text-muted"}`}
                    onClick={() => setStatus(s)}
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
              const value = e.currentTarget.value;
              current = { ...current, q: value };
              clearTimeout(searchTimer);
              searchTimer = setTimeout(() => update({ q: value, offset: 0 }), 250);
            }}
          />
          <select
            class={`${inputClass} w-auto`}
            aria-label="Sort"
            value={query().sort ?? defaultSort()}
            onChange={(e) => update({ sort: e.currentTarget.value as Sort, offset: 0 })}
          >
            <Show when={hierarchical()}>
              <option value="slug">Tree order</option>
            </Show>
            <For each={SORTS.filter(([k]) => k !== "type" || !props.collection)}>
              {([value, label]) => <option value={value}>{label}</option>}
            </For>
          </select>
          <span class="ml-auto text-xs text-muted">{list.data()?.total ?? 0} entries</span>
        </div>

        <Loading when={list.loading() && !list.data()}>
          <Show
            when={list.data()?.entries.length}
            fallback={
              <Empty
                {...(collection()?.icon ? { icon: collection()!.icon } : {})}
                title={trash() ? "Trash is empty" : "Nothing here yet"}
                {...(!trash() ? { description: "Create the first entry to get started." } : {})}
                {...(!trash()
                  ? {
                      action: (
                        <Button
                          variant="primary"
                          icon="i-lucide-plus"
                          onClick={() => setCreating(true)}
                        >
                          Create entry
                        </Button>
                      ),
                    }
                  : {})}
              />
            }
          >
            <div class="overflow-x-auto rounded-xl border border-default">
              <table class="w-full text-sm">
                <thead class="bg-elevated/60 text-left text-[11px] uppercase tracking-wide text-muted">
                  <tr>
                    <th class="px-4 py-2 font-medium">Title</th>
                    <Show when={!props.collection}>
                      <th class="px-4 py-2 font-medium">Type</th>
                    </Show>
                    <For each={fieldColumns()}>
                      {([, f]) => <th class="px-4 py-2 font-medium">{resolveLabel(f.label)}</th>}
                    </For>
                    <th class="px-4 py-2 font-medium">Status</th>
                    <th class="px-4 py-2 text-right font-medium">Updated</th>
                    <Show when={trash()}>
                      <th />
                    </Show>
                  </tr>
                </thead>
                <tbody class="divide-y divide-default">
                  <For each={list.data()!.entries}>
                    {(e) => (
                      <tr class="hover:bg-elevated/50">
                        <td class="px-4 py-2">
                          <a
                            href={href(`/e/${e.id}`)}
                            class="flex flex-col"
                            style={{ "padding-left": `${depth(e) * 16}px` }}
                          >
                            <span class="font-medium text-highlighted">{e.excerptTitle}</span>
                            <span class="font-mono text-[11px] text-muted">/{e.slug}</span>
                          </a>
                        </td>
                        <Show when={!props.collection}>
                          <td class="px-4 py-2">
                            <TypeLabel slug={e.collection} />
                          </td>
                        </Show>
                        <For each={fieldColumns()}>
                          {([key, f]) => (
                            <td class="px-4 py-2 text-toned">
                              {formatValue((e as any).published?.properties?.[key], f.type)}
                            </td>
                          )}
                        </For>
                        <td class="px-4 py-2">
                          <StatusBadge status={e.status} changed={e.hasUnpublishedChanges} />
                        </td>
                        <td class="px-4 py-2 text-right text-xs text-muted">
                          {relativeTime(e.updatedAt ?? e.createdAt)}
                        </td>
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
              <Button
                disabled={offset() === 0}
                onClick={() => setOffset(Math.max(0, offset() - PAGE))}
              >
                Previous
              </Button>
              <Button
                disabled={offset() + PAGE >= (list.data()?.total ?? 0)}
                onClick={() => setOffset(offset() + PAGE)}
              >
                Next
              </Button>
            </div>
          </Show>
        </Loading>
      </div>

      <CreateEntryModal
        open={creating()}
        {...(props.collection ? { collection: props.collection } : {})}
        onClose={() => {
          setCreating(false);
          if (props.create) navigate(`/c/${props.collection}`);
        }}
        onCreated={(id) => navigate(`/e/${id}`)}
      />
    </div>
  );
};

const TypeLabel: Component<{ slug: string }> = (props) => {
  const { collection } = useDashboard();
  const c = () => collection(props.slug);
  return (
    <span class="inline-flex items-center gap-1.5 text-xs" style={{ color: c()?.color }}>
      <span class={`${c()?.icon ?? "i-lucide-box"} size-3.5`} />
      {resolveLabel(c()?.label) || props.slug}
    </span>
  );
};

function formatValue(v: unknown, type: string): string {
  if (v == null || v === "") return "—";
  if (type === "currency" && typeof v === "object") {
    const c = v as { amount: number; currency: string };
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: c.currency || "USD",
    }).format(c.amount / 100);
  }
  if (type === "boolean") return v ? "Yes" : "No";
  if (typeof v === "object") return resolveLabel(v as any) || JSON.stringify(v);
  if (typeof v === "number" || typeof v === "boolean" || typeof v === "bigint") return v.toString();
  return typeof v === "string" ? v : JSON.stringify(v);
}

export const CreateEntryModal: Component<{
  open: boolean;
  /** Omit to let the user pick the collection. */
  collection?: string;
  onClose: () => void;
  onCreated: (id: string) => void;
}> = (props) => {
  const { api, collection, collections, toast } = useDashboard();
  const [picked, setPicked] = createSignal("");
  const target = () => props.collection ?? (picked() || collections()[0]?.slug || "");
  const [title, setTitle] = createSignal("");
  const [slug, setSlug] = createSignal("");
  const [templateId, setTemplateId] = createSignal("");
  const [busy, setBusy] = createSignal(false);
  const templates = useLoader(() => api.templates.list(target()));
  createEffect(
    () => target(),
    (_, prev) => {
      if (prev !== undefined) void templates.reload();
    },
  );

  const submit = async () => {
    if (!title().trim()) return;
    setBusy(true);
    try {
      const { entry } = await api.entries.create({
        collection: target(),
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
      title={`New ${resolveLabel(collection(target())?.label) || "entry"}`}
      onClose={props.onClose}
      footer={
        <>
          <Button variant="ghost" onClick={props.onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            loading={busy()}
            disabled={!title().trim()}
            onClick={() => void submit()}
          >
            Create
          </Button>
        </>
      }
    >
      <form
        class="flex flex-col gap-4"
        onSubmit={(e) => {
          e.preventDefault();
          void submit();
        }}
      >
        <Show when={!props.collection}>
          <Field label="Type">
            <select
              class={inputClass}
              value={target()}
              onChange={(e) => {
                setPicked(e.currentTarget.value);
                setTemplateId("");
              }}
            >
              <For each={collections()}>
                {(c) => <option value={c.slug}>{resolveLabel(c.label)}</option>}
              </For>
            </select>
          </Field>
        </Show>
        <Field label="Title">
          <input
            class={inputClass}
            value={title()}
            autofocus
            onInput={(e) => setTitle(e.currentTarget.value)}
          />
        </Field>
        <Field
          label="Slug"
          hint={
            collection(target())?.features.hierarchical
              ? "Use slashes to nest, e.g. guides/getting-started"
              : "Leave empty to derive from the title"
          }
        >
          <input
            class={`${inputClass} font-mono`}
            value={slug()}
            placeholder="auto"
            onInput={(e) => setSlug(e.currentTarget.value)}
          />
        </Field>
        <Show when={templates.data()?.templates.length}>
          <Field label="Start from">
            <div class="grid grid-cols-2 gap-2">
              <TemplateOption
                selected={!templateId()}
                title="Blank"
                onClick={() => setTemplateId("")}
              />
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

const TemplateOption: Component<{
  selected: boolean;
  title: string;
  description?: string;
  onClick: () => void;
}> = (props) => (
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

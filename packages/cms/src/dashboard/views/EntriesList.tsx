import {
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
  untrack,
  type Component,
} from "solid-js";
import { resolveLabel } from "../../core/collections/define";
import type { EntrySummary } from "../../services/entries";
import { useDashboard } from "../context";
import { RLInput } from "@rimelight/ui/components/input/RLInput.tsx";
import { RLTable, type TableColumn } from "@rimelight/ui/components/table/RLTable.tsx";
import { RLSelect } from "@rimelight/ui/components/select/RLSelect.tsx";
import { RLTabs } from "@rimelight/ui/components/tabs/RLTabs.tsx";
import { cmsT } from "../../locale";
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
        untrack(() =>
          update({ status: "all", q: "", trash: false, offset: 0, sort: current.sort }),
        );
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

  const tableColumns = (): TableColumn<EntrySummary>[] => [
    {
      id: "title",
      header: "Title",
      cell: ({ row }) => (
        <a
          href={href(`/e/${row.original.id}`)}
          class="flex flex-col"
          style={{ "padding-left": `${depth(row.original) * 16}px` }}
        >
          <span class="font-medium text-highlighted">{row.original.excerptTitle}</span>
          <span class="font-mono text-[11px] text-muted">/{row.original.slug}</span>
        </a>
      ),
    },
    ...(!props.collection
      ? [
          {
            id: "type",
            header: "Type",
            cell: ({ row }: { row: { original: EntrySummary } }) => (
              <TypeLabel slug={row.original.collection} />
            ),
          },
        ]
      : []),
    ...fieldColumns().map(([key, f]) => ({
      id: `field:${key}`,
      header: resolveLabel(f.label),
      meta: { class: { td: "text-toned" } },
      cell: ({ row }: { row: { original: EntrySummary } }) =>
        formatValue((row.original as any).published?.properties?.[key], f.type),
    })),
    {
      id: "status",
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge status={row.original.status} changed={row.original.hasUnpublishedChanges} />
      ),
    },
    {
      id: "updated",
      header: "Updated",
      meta: { class: { th: "text-right", td: "text-right text-xs text-muted" } },
      cell: ({ row }) => relativeTime(row.original.updatedAt ?? row.original.createdAt),
    },
    ...(trash()
      ? [
          {
            id: "restore",
            header: "",
            meta: { class: { td: "text-right" } },
            cell: ({ row }: { row: { original: EntrySummary } }) => (
              <Button
                variant="ghost"
                icon="i-lucide-undo-2"
                onClick={async () => {
                  try {
                    await api.entries.restore(row.original.id);
                    toast("Restored", "success");
                    void list.reload();
                  } catch (err) {
                    toast((err as Error).message, "error");
                  }
                }}
              >
                Restore
              </Button>
            ),
          },
        ]
      : []),
  ];

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
            <RLTabs
              items={STATUSES.map((s) => ({ label: s[0]!.toUpperCase() + s.slice(1), value: s }))}
              value={status()}
              onValueChange={(value: string) => setStatus(value as (typeof STATUSES)[number])}
              content={false}
              size="sm"
              variant="solid"
            />
          </Show>
          <RLInput
            class="max-w-xs"
            placeholder={cmsT("text.search-title-or-slug")}
            value={q()}
            onInput={(e) => {
              const value = e.currentTarget.value;
              current = { ...current, q: value };
              clearTimeout(searchTimer);
              searchTimer = setTimeout(() => update({ q: value, offset: 0 }), 250);
            }}
          />
          <RLSelect
            aria-label={cmsT("text.sort")}
            value={query().sort ?? defaultSort()}
            items={[
              ...(hierarchical() ? [{ label: "Tree order", value: "slug" }] : []),
              ...SORTS.filter(([k]) => k !== "type" || !props.collection).map(([value, label]) => ({
                label,
                value,
              })),
            ]}
            onChange={(e) => update({ sort: e.currentTarget.value as Sort, offset: 0 })}
          />
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
            <RLTable data={list.data()!.entries} columns={tableColumns()} />
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
      // One-time read of the new target; the loader itself is not meant to track it here.
      if (prev !== undefined) untrack(() => void templates.reload());
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
            <RLSelect
              value={target()}
              items={collections().map((c) => ({ label: resolveLabel(c.label), value: c.slug }))}
              onChange={(e) => {
                setPicked(e.currentTarget.value);
                setTemplateId("");
              }}
            />
          </Field>
        </Show>
        <Field label="Title">
          <RLInput value={title()} autofocus onInput={(e) => setTitle(e.currentTarget.value)} />
        </Field>
        <Field
          label="Slug"
          hint={
            collection(target())?.features.hierarchical
              ? "Use slashes to nest, e.g. guides/getting-started"
              : "Leave empty to derive from the title"
          }
        >
          <RLInput
            class="font-mono"
            value={slug()}
            placeholder={cmsT("text.auto")}
            onInput={(e) => setSlug(e.currentTarget.value)}
          />
        </Field>
        <Show when={templates.data()?.templates.length}>
          <Field label="Start from">
            <div class="grid grid-cols-2 gap-2">
              <TemplateOption
                selected={!templateId()}
                title={cmsT("text.blank")}
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

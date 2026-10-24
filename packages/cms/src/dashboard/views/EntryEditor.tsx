import { For, Show, createSignal, onCleanup, onSettled, type Component } from "solid-js";
import { resolveLabel } from "../../core/collections/define";
import type { BylineCredit, BylineRole } from "../../core/types/bylines";
import type { Entry, LockState } from "../../services/entries";
import { isAdmin } from "../../auth/roles";
import { createBlockEditor, type BlockEditorState } from "../../editor/store";
import { BlockEditor } from "../../editor/BlockEditor";
import { BlockInspector } from "../../editor/BlockInspector";
import { useDashboard } from "../context";
import { FieldGroups, inputClass } from "../fields/FieldInput";
import {
  Button,
  Field,
  Loading,
  Modal,
  StatusBadge,
  formatDate,
  relativeTime,
  useLoader,
} from "../ui";

/**
 * The entry editor: block canvas in the middle, entry settings / block inspector / history on
 * the right. The working copy autosaves as a draft; readers only see it after Publish.
 */
export const EntryEditor: Component<{ id: string }> = (props) => {
  const { api, toast } = useDashboard();
  const [entry, setEntry] = createSignal<Entry | null>(null);
  const [lock, setLock] = createSignal<LockState | null>(null);
  const [loadError, setLoadError] = createSignal<string | null>(null);

  const load = async () => {
    try {
      const { entry } = await api.entries.get(props.id);
      // Take the edit lock; if someone else holds it we open read-only.
      const { lock } = await api.entries.lock(props.id).catch(() => ({ lock: null as any }));
      setLock(lock);
      setEntry(entry);
    } catch (err) {
      setLoadError((err as Error).message);
    }
  };

  onSettled(() => {
    void load();
    const heartbeat = setInterval(() => {
      if (lock()?.ownedByActor)
        void api.entries
          .lock(props.id)
          .then((r) => setLock(r.lock))
          .catch(() => {});
    }, 60_000);
    return () => {
      clearInterval(heartbeat);
      if (lock()?.ownedByActor) void api.entries.unlock(props.id).catch(() => {});
    };
  });

  return (
    <Show
      when={!loadError()}
      fallback={<div class="p-10 text-center text-sm text-error-500">{loadError()}</div>}
    >
      <Loading when={!entry()}>
        <EditorWorkspace
          entry={entry()!}
          lock={lock()}
          onEntry={setEntry}
          onTakeOver={async () => {
            const { lock } = await api.entries.lock(props.id, true);
            setLock(lock);
            toast("You are now editing this entry", "info");
            await load();
          }}
        />
      </Loading>
    </Show>
  );
};

const EditorWorkspace: Component<{
  entry: Entry;
  lock: LockState | null;
  onEntry: (e: Entry) => void;
  onTakeOver: () => Promise<void>;
}> = (props) => {
  const { api, collection: getCollection, href, navigate, toast, user } = useDashboard();
  const collection = () => getCollection(props.entry.collection);
  const readOnly = () => !!props.lock?.locked && !props.lock.ownedByActor;
  const [tab, setTab] = createSignal<"entry" | "block" | "history">("entry");
  const [busy, setBusy] = createSignal<string | null>(null);
  const [scheduling, setScheduling] = createSignal(false);
  /** The settings/block/history panel is always shown on wide screens and toggled below that. */
  const [panelOpen, setPanelOpen] = createSignal(false);

  const editor: BlockEditorState = createBlockEditor({
    initial: { blocks: props.entry.draft.blocks, properties: props.entry.draft.properties },
    registry: useDashboard().registry,
    ...(collection()?.allowedBlocks ? { allowedRootBlocks: collection()!.allowedBlocks! } : {}),
    readOnly: readOnly(),
    onSelect: (id) => {
      if (id) setTab("block");
    },
    save: async (content) => {
      const { entry } = await api.entries.saveDraft(props.entry.id, content);
      props.onEntry(entry);
    },
  });

  onSettled(() => {
    const beforeUnload = (e: BeforeUnloadEvent) => {
      if (editor.status() === "dirty" || editor.status() === "saving") e.preventDefault();
    };
    window.addEventListener("beforeunload", beforeUnload);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      void editor.flush();
    };
  });
  onCleanup(() => void editor.flush());

  const run = async (label: string, fn: () => Promise<unknown>, done?: string) => {
    setBusy(label);
    try {
      await editor.flush();
      const result = (await fn()) as { entry?: Entry };
      if (result?.entry) {
        props.onEntry(result.entry);
        editor.reset({
          blocks: result.entry.draft.blocks,
          properties: result.entry.draft.properties,
        });
      }
      if (done) toast(done, "success");
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(null);
    }
  };

  const needsReview = () =>
    (collection()?.workflow.minApprovals ?? 0) > 0 && !(user() && isAdmin(user()!));

  const saveMeta = async (patch: Record<string, unknown>) => {
    try {
      const { entry } = await api.entries.updateMeta(props.entry.id, patch);
      props.onEntry(entry);
    } catch (err) {
      toast((err as Error).message, "error");
    }
  };

  const statusLabel = () =>
    ({
      saved: "Saved",
      dirty: "Unsaved changes",
      saving: "Saving…",
      error: `Save failed: ${editor.error()}`,
    })[editor.status()];

  return (
    <div class="flex h-full flex-col">
      {/* Top bar */}
      <div class="flex flex-wrap items-center gap-2 border-b border-default px-4 py-2">
        <a
          href={href(`/c/${props.entry.collection}`)}
          class="flex items-center gap-1 text-xs text-muted hover:text-highlighted"
        >
          <span class="i-lucide-arrow-left size-3.5" />
          {resolveLabel(collection()?.labelPlural ?? collection()?.label) || props.entry.collection}
        </a>
        <span class="text-muted">/</span>
        <span class="max-w-60 truncate text-sm font-medium text-highlighted">
          {resolveLabel(props.entry.title) || props.entry.slug}
        </span>
        <StatusBadge status={props.entry.status} changed={props.entry.hasUnpublishedChanges} />
        <Show when={props.entry.scheduledAt}>
          <span class="text-xs text-info-600">→ {formatDate(props.entry.scheduledAt, true)}</span>
        </Show>
        <span
          class={`ml-2 text-xs ${editor.status() === "error" ? "text-error-500" : "text-muted"}`}
        >
          {statusLabel()}
        </span>

        <div class="ml-auto flex items-center gap-1.5">
          <Button
            variant="ghost"
            icon="i-lucide-panel-right"
            title="Settings panel"
            class="xl:hidden"
            onClick={() => setPanelOpen(!panelOpen())}
          />
          <Button
            variant="ghost"
            icon="i-lucide-undo-2"
            title="Undo (Ctrl+Z)"
            disabled={readOnly()}
            onClick={() => editor.undo()}
          />
          <Button
            variant="ghost"
            icon="i-lucide-redo-2"
            title="Redo (Ctrl+Shift+Z)"
            disabled={readOnly()}
            onClick={() => editor.redo()}
          />
          <Button
            variant="ghost"
            icon="i-lucide-eye"
            onClick={() =>
              void run("preview", async () => {
                const { token } = await api.entries.previewToken(props.entry.id);
                // Site routes forward `?preview=` to the content API, which then serves the draft.
                const pattern = collection()?.features.routable;
                const path =
                  typeof pattern === "string"
                    ? pattern
                        .replace("{slug}", props.entry.slug)
                        .replace("{collection}", props.entry.collection)
                    : `/api/content/collections/${props.entry.collection}/${props.entry.slug}`;
                const url = `${path}?preview=${encodeURIComponent(token)}`;
                window.open(url, "_blank", "noopener");
              })
            }
          >
            Preview
          </Button>
          <Show when={props.entry.status === "published"}>
            <Button
              variant="ghost"
              loading={busy() === "unpublish"}
              disabled={readOnly()}
              onClick={() =>
                void run("unpublish", () => api.entries.unpublish(props.entry.id), "Unpublished")
              }
            >
              Unpublish
            </Button>
          </Show>
          <Show when={props.entry.hasUnpublishedChanges && props.entry.publishedVersionId}>
            <Button
              variant="ghost"
              disabled={readOnly()}
              onClick={() =>
                confirm("Discard all unpublished changes?") &&
                void run(
                  "discard",
                  () => api.entries.discardDraft(props.entry.id),
                  "Changes discarded",
                )
              }
            >
              Discard
            </Button>
          </Show>
          <Show when={collection()?.features.scheduled}>
            <Button
              variant="secondary"
              icon="i-lucide-calendar-clock"
              disabled={readOnly() || needsReview()}
              onClick={() => setScheduling(true)}
            >
              Schedule
            </Button>
          </Show>
          <Show
            when={!needsReview()}
            fallback={
              <Button
                variant="primary"
                icon="i-lucide-send"
                loading={busy() === "review"}
                disabled={readOnly()}
                onClick={() => {
                  const summary = prompt("Summarise the changes for reviewers") ?? undefined;
                  void run(
                    "review",
                    () => api.entries.requestReview(props.entry.id, summary),
                    "Sent for review",
                  );
                }}
              >
                Request review
              </Button>
            }
          >
            <Button
              variant="primary"
              icon="i-lucide-upload"
              loading={busy() === "publish"}
              disabled={
                readOnly() ||
                (props.entry.status === "published" &&
                  !props.entry.hasUnpublishedChanges &&
                  editor.status() === "saved")
              }
              onClick={() =>
                void run("publish", () => api.entries.publish(props.entry.id), "Published")
              }
            >
              Publish
            </Button>
          </Show>
        </div>
      </div>

      <Show when={readOnly()}>
        <div class="flex items-center gap-3 border-b border-warning-500/30 bg-warning-500/10 px-4 py-2 text-sm text-warning-700">
          <span class="i-lucide-lock size-4" />
          {props.lock?.userName ?? "Someone"} is editing this entry. You're viewing it read-only.
          <Show when={user() && isAdmin(user()!)}>
            <Button variant="secondary" class="ml-auto" onClick={() => void props.onTakeOver()}>
              Take over
            </Button>
          </Show>
        </div>
      </Show>

      <div class="flex min-h-0 flex-1">
        {/* Canvas */}
        <div class="min-w-0 flex-1 overflow-y-auto">
          <div class="mx-auto max-w-6xl px-6 py-10">
            <TitleInput
              entry={props.entry}
              readOnly={readOnly()}
              onSave={(title) => void saveMeta({ title })}
            />
            <Show
              when={collection()?.features.blocks !== false}
              fallback={
                <div class="mt-6 max-w-3xl">
                  <FieldGroups
                    fields={collection()?.fields ?? {}}
                    {...(collection()?.groups ? { groups: collection()!.groups } : {})}
                    values={editor.doc.properties}
                    readOnly={readOnly()}
                    onChange={(k, v) => editor.setProperty(k, v)}
                  />
                </div>
              }
            >
              {/* Wikipedia-style: article on the left, infobox with the entry's properties on the right. */}
              <div class="mt-6 flex flex-col-reverse gap-8 lg:flex-row lg:items-start">
                <div class="min-w-0 flex-1">
                  <BlockEditor editor={editor} />
                </div>
                <Show when={Object.keys(collection()?.fields ?? {}).length}>
                  <Infobox entry={props.entry} editor={editor} readOnly={readOnly()} />
                </Show>
              </div>
            </Show>
          </div>
        </div>

        {/* Sidebar */}
        <aside
          class={`${panelOpen() ? "flex" : "hidden"} w-80 shrink-0 flex-col border-l border-default xl:flex`}
        >
          <div class="flex border-b border-default">
            <For
              each={
                [
                  ["entry", "Entry"],
                  ["block", "Block"],
                  ["history", "History"],
                ] as const
              }
            >
              {([key, label]) => (
                <button
                  type="button"
                  class={`flex-1 py-2 text-xs font-medium ${tab() === key ? "border-b-2 border-primary-500 text-highlighted" : "text-muted"}`}
                  onClick={() => setTab(key)}
                >
                  {label}
                </button>
              )}
            </For>
          </div>
          <div class="min-h-0 flex-1 overflow-y-auto p-4">
            <Show when={tab() === "entry"}>
              <EntrySettings
                entry={props.entry}
                editor={editor}
                readOnly={readOnly()}
                saveMeta={saveMeta}
                onDeleted={() => navigate(`/c/${props.entry.collection}`)}
              />
            </Show>
            <Show when={tab() === "block"}>
              <BlockInspector editor={editor} />
            </Show>
            <Show when={tab() === "history"}>
              <History
                entry={props.entry}
                onRestored={(e) => {
                  props.onEntry(e);
                  editor.reset({ blocks: e.draft.blocks, properties: e.draft.properties });
                }}
              />
            </Show>
          </div>
        </aside>
      </div>

      <ScheduleModal
        open={scheduling()}
        current={props.entry.scheduledAt}
        onClose={() => setScheduling(false)}
        onSubmit={(at) => {
          setScheduling(false);
          void run(
            "schedule",
            () => api.entries.schedule(props.entry.id, at),
            at ? "Scheduled" : "Schedule cleared",
          );
        }}
      />
    </div>
  );
};

/** The entry's properties as an infobox beside the article, like a wiki page. */
const Infobox: Component<{ entry: Entry; editor: BlockEditorState; readOnly: boolean }> = (
  props,
) => {
  const { collection: getCollection } = useDashboard();
  const collection = () => getCollection(props.entry.collection);
  const image = () => {
    const v = props.editor.doc.properties["image"];
    return typeof v === "string" ? v : ((v as any)?.src ?? (v as any)?.url ?? "");
  };
  return (
    <aside class="w-full shrink-0 overflow-hidden rounded-lg border border-default bg-elevated/40 lg:sticky lg:top-4 lg:w-80">
      <div class="border-b border-default bg-elevated px-4 py-2.5 text-center text-sm font-semibold text-highlighted">
        {resolveLabel(props.entry.title) || props.entry.slug}
      </div>
      <Show when={image()}>
        <img src={image()} alt="" class="max-h-80 w-full border-b border-default object-cover" />
      </Show>
      <div class="p-4">
        <FieldGroups
          fields={collection()!.fields}
          groups={collection()!.groups}
          values={props.editor.doc.properties}
          readOnly={props.readOnly}
          onChange={(k, v) => props.editor.setProperty(k, v)}
        />
      </div>
    </aside>
  );
};

const TitleInput: Component<{
  entry: Entry;
  readOnly: boolean;
  onSave: (t: Record<string, string>) => void;
}> = (props) => {
  const { locales } = useDashboard();
  const locale = locales[0] ?? "en";
  return (
    <input
      class="w-full bg-transparent text-4xl font-bold text-highlighted outline-none placeholder:text-muted/50"
      placeholder="Untitled"
      value={props.entry.title[locale] ?? resolveLabel(props.entry.title)}
      disabled={props.readOnly}
      onChange={(e) => props.onSave({ ...props.entry.title, [locale]: e.currentTarget.value })}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          e.preventDefault();
          (document.querySelector("[data-inline-text]") as HTMLElement | null)?.focus();
        }
      }}
    />
  );
};

// ─── Entry settings tab ──────────────────────────────────────────────────────

const EntrySettings: Component<{
  entry: Entry;
  editor: BlockEditorState;
  readOnly: boolean;
  saveMeta: (patch: Record<string, unknown>) => Promise<void>;
  onDeleted: () => void;
}> = (props) => {
  const { api, collection: getCollection, collections, toast, navigate, locales } = useDashboard();
  const collection = () => getCollection(props.entry.collection);
  const locale = locales[0] ?? "en";

  return (
    <div class="flex flex-col gap-5">
      <Field label="Slug">
        <input
          class={`${inputClass} font-mono text-xs`}
          value={props.entry.slug}
          disabled={props.readOnly}
          onChange={(e) => void props.saveMeta({ slug: e.currentTarget.value })}
        />
      </Field>
      <Field label="Description">
        <textarea
          class={`${inputClass} min-h-16`}
          value={props.entry.description?.[locale] ?? ""}
          disabled={props.readOnly}
          onChange={(e) =>
            void props.saveMeta({
              description: { ...props.entry.description, [locale]: e.currentTarget.value },
            })
          }
        />
      </Field>

      <For each={collection()?.features.taxonomies ?? []}>
        {(taxonomy) => (
          <TermPicker entryId={props.entry.id} taxonomy={taxonomy} readOnly={props.readOnly} />
        )}
      </For>

      <Show when={collection()?.features.bylines}>
        <BylinePicker
          value={props.entry.bylines}
          readOnly={props.readOnly}
          onChange={(bylines) => void props.saveMeta({ bylines })}
        />
      </Show>

      <section class="flex flex-col gap-2 border-t border-default pt-4 text-xs text-muted">
        <div>Created {formatDate(props.entry.createdAt, true)}</div>
        <Show when={props.entry.postedAt}>
          <div>First published {formatDate(props.entry.postedAt, true)}</div>
        </Show>
        <Show when={props.entry.draftUpdatedAt}>
          <div>Draft saved {relativeTime(props.entry.draftUpdatedAt)}</div>
        </Show>
        <Field label="Collection">
          <select
            class={inputClass}
            value={props.entry.collection}
            disabled={props.readOnly}
            onChange={(e) =>
              confirm("Move this entry to another collection?") &&
              void props.saveMeta({ collection: e.currentTarget.value })
            }
          >
            <For each={collections()}>
              {(c) => <option value={c.slug}>{resolveLabel(c.label)}</option>}
            </For>
          </select>
        </Field>
      </section>

      <section class="flex flex-wrap gap-2 border-t border-default pt-4">
        <Button
          icon="i-lucide-copy"
          onClick={async () => {
            const { entry } = await api.entries.duplicate(props.entry.id);
            navigate(`/e/${entry.id}`);
          }}
        >
          Duplicate
        </Button>
        <Button
          variant="ghost"
          icon="i-lucide-trash-2"
          class="text-error-500"
          disabled={props.readOnly}
          onClick={async () => {
            if (!confirm("Move this entry to the trash?")) return;
            try {
              await api.entries.remove(props.entry.id);
              toast("Moved to trash", "success");
              props.onDeleted();
            } catch (err) {
              toast((err as Error).message, "error");
            }
          }}
        >
          Delete
        </Button>
      </section>
    </div>
  );
};

const TermPicker: Component<{ entryId: string; taxonomy: string; readOnly: boolean }> = (props) => {
  const { api, toast } = useDashboard();
  const all = useLoader(() => api.taxonomies.terms(props.taxonomy));
  const assigned = useLoader(() => api.entries.terms(props.entryId));
  const ids = () =>
    new Set(
      (assigned.data()?.terms ?? []).filter((t) => t.taxonomy === props.taxonomy).map((t) => t.id),
    );
  const toggle = async (id: string) => {
    const next = new Set(ids());
    if (next.has(id)) next.delete(id);
    else next.add(id);
    try {
      await api.entries.setTerms(props.entryId, props.taxonomy, [...next]);
      void assigned.reload();
    } catch (err) {
      toast((err as Error).message, "error");
    }
  };
  return (
    <section class="flex flex-col gap-2 border-t border-default pt-4">
      <h3 class="text-[11px] font-semibold uppercase tracking-wide text-muted">{props.taxonomy}</h3>
      <div class="flex flex-wrap gap-1.5">
        <For
          each={all.data()?.terms ?? []}
          fallback={<span class="text-xs text-muted">No terms yet.</span>}
        >
          {(t) => (
            <button
              type="button"
              disabled={props.readOnly}
              class={`rounded-full border px-2.5 py-0.5 text-xs ${ids().has(t.id) ? "border-primary-500 bg-primary-500/10 text-primary-500" : "border-default text-toned hover:bg-elevated"}`}
              onClick={() => void toggle(t.id)}
            >
              {t.name}
            </button>
          )}
        </For>
      </div>
    </section>
  );
};

const ROLES: BylineRole[] = [
  "written_by",
  "edited_by",
  "reviewed_by",
  "illustrated_by",
  "translated_by",
  "curated_by",
];

const BylinePicker: Component<{
  value: BylineCredit[];
  readOnly: boolean;
  onChange: (v: BylineCredit[]) => void;
}> = (props) => {
  const { api } = useDashboard();
  const bylines = useLoader(() => api.bylines.list());
  const name = (id: string) =>
    bylines.data()?.bylines.find((b) => b.id === id)?.name ?? id.slice(0, 8);
  const available = () =>
    (bylines.data()?.bylines ?? []).filter((b) => !props.value.some((v) => v.userId === b.id));
  return (
    <section class="flex flex-col gap-2 border-t border-default pt-4">
      <h3 class="text-[11px] font-semibold uppercase tracking-wide text-muted">Bylines</h3>
      <For each={props.value}>
        {(credit, i) => (
          <div class="flex items-center gap-2 text-xs">
            <span class="flex-1 truncate text-highlighted">{name(credit.userId)}</span>
            <select
              class="rounded border border-default bg-default px-1 py-0.5"
              value={credit.role}
              disabled={props.readOnly}
              onChange={(e) =>
                props.onChange(
                  props.value.map((c, j) =>
                    j === i() ? { ...c, role: e.currentTarget.value as BylineRole } : c,
                  ),
                )
              }
            >
              <For each={ROLES}>{(r) => <option value={r}>{r.replace("_", " ")}</option>}</For>
            </select>
            <button
              type="button"
              class="i-lucide-x size-3 text-muted"
              disabled={props.readOnly}
              onClick={() => props.onChange(props.value.filter((_, j) => j !== i()))}
            />
          </div>
        )}
      </For>
      <Show when={!props.readOnly && available().length}>
        <select
          class={inputClass}
          value=""
          onChange={(e) => {
            if (e.currentTarget.value)
              props.onChange([
                ...props.value,
                {
                  userId: e.currentTarget.value,
                  role: "written_by",
                  displayOrder: props.value.length,
                },
              ]);
            e.currentTarget.value = "";
          }}
        >
          <option value="">Add byline…</option>
          <For each={available()}>{(b) => <option value={b.id}>{b.name}</option>}</For>
        </select>
      </Show>
    </section>
  );
};

// ─── History tab ─────────────────────────────────────────────────────────────

const History: Component<{ entry: Entry; onRestored: (e: Entry) => void }> = (props) => {
  const { api, toast } = useDashboard();
  const versions = useLoader(() => api.entries.versions(props.entry.id));
  const [diff, setDiff] = createSignal<any>(null);

  return (
    <div class="flex flex-col gap-2">
      <Button
        icon="i-lucide-git-compare"
        onClick={async () => setDiff((await api.entries.diff(props.entry.id)).diff)}
      >
        Compare draft with live
      </Button>
      <For
        each={versions.data()?.versions ?? []}
        fallback={<p class="text-xs text-muted">No versions yet. Publishing creates one.</p>}
      >
        {(v) => (
          <div class="flex flex-col gap-1 rounded-lg border border-default p-2.5 text-xs">
            <div class="flex items-center justify-between">
              <span class="font-medium text-highlighted">v{v.versionNumber}</span>
              <StatusBadge status={v.status} />
            </div>
            <Show when={v.changeSummary}>
              <p class="text-toned">{v.changeSummary}</p>
            </Show>
            <div class="text-muted">
              {formatDate(v.createdAt, true)} · {v.createdBy}
            </div>
            <div class="mt-1 flex gap-1">
              <Button
                variant="ghost"
                onClick={async () =>
                  setDiff((await api.entries.diff(props.entry.id, String(v.versionNumber))).diff)
                }
              >
                Diff
              </Button>
              <Button
                variant="ghost"
                onClick={async () => {
                  if (!confirm(`Restore v${v.versionNumber} into the draft?`)) return;
                  try {
                    const { entry } = await api.versions.rollback(v.id);
                    props.onRestored(entry);
                    toast(`Restored v${v.versionNumber} to draft`, "success");
                  } catch (err) {
                    toast((err as Error).message, "error");
                  }
                }}
              >
                Restore
              </Button>
            </div>
          </div>
        )}
      </For>
      <Modal open={!!diff()} title="Changes" onClose={() => setDiff(null)} wide>
        <Show when={diff()}>
          <div class="flex flex-col gap-2 text-xs">
            <div class="text-muted">
              +{diff().summary.addedCount} added · −{diff().summary.removedCount} removed · ~
              {diff().summary.modifiedCount} modified
            </div>
            <For each={diff().metaChanges}>
              {(m: any) => (
                <div>
                  <b>{m.field}</b>: {JSON.stringify(m.oldValue)} → {JSON.stringify(m.newValue)}
                </div>
              )}
            </For>
            <For each={diff().blocks.filter((b: any) => b.status !== "unchanged")}>
              {(b: any) => (
                <div
                  class={`rounded border-l-2 px-2 py-1 ${b.status === "added" ? "border-success-500" : b.status === "removed" ? "border-error-500" : "border-warning-500"}`}
                >
                  <b class="capitalize">{b.status}</b> {b.type}
                  <For each={b.fieldChanges ?? []}>
                    {(f: any) => <div class="text-muted">{f.field} changed</div>}
                  </For>
                </div>
              )}
            </For>
          </div>
        </Show>
      </Modal>
    </div>
  );
};

const ScheduleModal: Component<{
  open: boolean;
  current: Date | null;
  onClose: () => void;
  onSubmit: (at: string | null) => void;
}> = (props) => {
  const [value, setValue] = createSignal(
    props.current ? new Date(props.current).toISOString().slice(0, 16) : "",
  );
  return (
    <Modal
      open={props.open}
      title="Schedule publishing"
      onClose={props.onClose}
      footer={
        <>
          <Show when={props.current}>
            <Button variant="ghost" onClick={() => props.onSubmit(null)}>
              Clear schedule
            </Button>
          </Show>
          <Button
            variant="primary"
            disabled={!value()}
            onClick={() => props.onSubmit(new Date(value()).toISOString())}
          >
            Schedule
          </Button>
        </>
      }
    >
      <Field
        label="Publish at (your local time)"
        hint="The current draft is published automatically at this time."
      >
        <input
          type="datetime-local"
          class={inputClass}
          value={value()}
          onInput={(e) => setValue(e.currentTarget.value)}
        />
      </Field>
    </Modal>
  );
};

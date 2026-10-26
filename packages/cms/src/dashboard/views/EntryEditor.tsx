import {
  For,
  Show,
  createEffect,
  createSignal,
  onSettled,
  untrack,
  type Component,
} from "solid-js";
import type { JSX } from "@solidjs/web";
import { resolveLabel } from "../../core/collections/define";
import type { BylineCredit, BylineRole } from "../../core/types/bylines";
import type { Entry, LockState } from "../../services/entries";
import { isAdmin } from "../../auth/roles";
import { createBlockEditor, type BlockEditorState } from "../../editor/store";
import { ADD_BLOCK_SHORTCUT, BlockEditor } from "../../editor/BlockEditor";
import { defineShortcuts, formatShortcutKeys } from "@rimelight/ui/shortcuts";
import { BlockInspector } from "../../editor/BlockInspector";
import { PagePreview, SplitPane } from "../../editor/SplitPreview";
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
  const { api, collection: getCollection, href, navigate, toast, user, locales } = useDashboard();
  const collection = () => getCollection(props.entry.collection);
  // The lock is per user, so the same user in a second tab passes it. Tabs coordinate here instead:
  // a tab opened while another one is editing starts read-only.
  const [inOtherTab, setInOtherTab] = createSignal(false);
  let takeOverHere: () => void = () => {};
  const lockReadOnly = () => !!props.lock?.locked && !props.lock.ownedByActor;
  const readOnly = () => lockReadOnly() || inOtherTab();
  onSettled(() => {
    if (typeof BroadcastChannel === "undefined") return;
    const tabId = crypto.randomUUID();
    const channel = new BroadcastChannel(`rimelight-cms:editor:${props.entry.id}`);
    channel.onmessage = (e: MessageEvent) => {
      const m = e.data;
      if (!m || m.tabId === tabId) return;
      if (m.type === "hello") channel.postMessage({ type: "here", tabId });
      if (m.type === "here" || m.type === "takeover") setInOtherTab(true);
    };
    takeOverHere = () => {
      setInOtherTab(false);
      channel.postMessage({ type: "takeover", tabId });
    };
    channel.postMessage({ type: "hello", tabId });
    return () => channel.close();
  });
  const [tab, setTab] = createSignal<"entry" | "block">("entry");
  /** Language being edited. Titles, descriptions and rich text all follow it. */
  const [locale, setLocale] = createSignal(locales[0] ?? "en");
  const [previewOpen, setPreviewOpen] = createSignal(readPreviewPref());
  const [historyOpen, setHistoryOpen] = createSignal(false);
  const [busy, setBusy] = createSignal<string | null>(null);
  const [scheduling, setScheduling] = createSignal(false);
  /** The settings/block/history panel is always shown on wide screens and toggled below that. */
  const [panelOpen, setPanelOpen] = createSignal(false);

  // Collection rules are fixed for the life of this editor (a collection change remounts it).
  const rootBlocks = untrack(() => collection()?.allowedBlocks ?? undefined);
  const editor: BlockEditorState = createBlockEditor({
    initial: untrack(() => ({
      blocks: props.entry.draft.blocks,
      properties: props.entry.draft.properties,
    })),
    registry: useDashboard().registry,
    ...(rootBlocks ? { allowedRootBlocks: rootBlocks } : {}),
    readOnly,
    defaultLocale: locales[0] ?? "en",
    onSelect: (id) => {
      if (id) setTab("block");
    },
    save: async (content) => {
      // Send the revision we loaded: a newer draft (another tab) makes the server refuse the save.
      const base = props.entry.draftUpdatedAt;
      const { entry } = await api.entries.saveDraft(props.entry.id, {
        ...content,
        baseUpdatedAt: base ? String(base) : null,
      });
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

  const liveUrl = () =>
    props.entry.status === "published" ? entryPath(collection(), props.entry, true) : null;

  const openDraftPreview = () =>
    run("preview", async () => {
      const { token } = await api.entries.previewToken(props.entry.id);
      // Site routes forward `?preview=` to the content API, which then serves the draft.
      const path = entryPath(collection(), props.entry, false)!;
      window.open(`${path}?preview=${encodeURIComponent(token)}`, "_blank", "noopener");
    });

  const togglePreview = () => {
    const next = !previewOpen();
    setPreviewOpen(next);
    try {
      localStorage.setItem(PREVIEW_PREF_KEY, next ? "1" : "0");
    } catch {
      /* ignore */
    }
  };

  onSettled(() =>
    defineShortcuts({
      meta_alt_p: {
        handler: () => togglePreview(),
        usingInput: true,
        label: "Toggle preview",
        description: "Show the page side by side with the editor",
        category: "editor",
        order: 40,
      },
    }),
  );

  return (
    <div class="flex h-full flex-col">
      {/* Toolbar */}
      <div class="flex flex-wrap items-center gap-2 border-b border-default px-3 py-1.5">
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
        <SaveIndicator editor={editor} readOnly={readOnly()} />

        <div class="ml-auto flex flex-wrap items-center gap-1">
          <Show when={collection()?.features.blocks !== false && !readOnly()}>
            <ToolbarGroup>
              <button
                type="button"
                title={`Add block (${formatShortcutKeys(ADD_BLOCK_SHORTCUT).join("+")})`}
                class="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-toned hover:bg-elevated hover:text-highlighted"
                onClick={() => editor.openInserter()}
              >
                <span class="i-lucide-plus size-4" />
                Add block
              </button>
            </ToolbarGroup>
          </Show>
          <ToolbarGroup>
            <IconButton
              icon="i-lucide-undo-2"
              label="Undo (Ctrl+Z)"
              disabled={!editor.canUndo()}
              onClick={() => editor.undo()}
            />
            <IconButton
              icon="i-lucide-redo-2"
              label="Redo (Ctrl+Shift+Z)"
              disabled={!editor.canRedo()}
              onClick={() => editor.redo()}
            />
          </ToolbarGroup>

          <ToolbarGroup>
            <IconButton
              icon="i-lucide-history"
              label="Versions & history"
              onClick={() => setHistoryOpen(true)}
            />
            <Show when={collection()?.features.blocks !== false}>
              <IconButton
                icon="i-lucide-columns-2"
                label={`${previewOpen() ? "Hide" : "Show"} side-by-side preview (Ctrl+Alt+P)`}
                active={previewOpen()}
                onClick={() => togglePreview()}
              />
            </Show>
            <IconButton
              icon="i-lucide-external-link"
              label="Open draft preview in a new tab"
              loading={busy() === "preview"}
              onClick={() => void openDraftPreview()}
            />
            <Show when={liveUrl()}>
              <a
                href={liveUrl()!}
                target="_blank"
                rel="noopener"
                title="View live page"
                class="flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-success-600 hover:bg-elevated"
              >
                <span class="size-1.5 rounded-full bg-success-500" />
                Live
                <span class="i-lucide-arrow-up-right size-3" />
              </a>
              <IconButton
                icon="i-lucide-link"
                label="Copy live link"
                onClick={() => {
                  void navigator.clipboard
                    ?.writeText(new URL(liveUrl()!, location.origin).href)
                    .then(() => toast("Link copied", "success"));
                }}
              />
            </Show>
            <IconButton
              icon="i-lucide-panel-right"
              label="Settings panel"
              class="xl:hidden"
              active={panelOpen()}
              onClick={() => setPanelOpen(!panelOpen())}
            />
          </ToolbarGroup>

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

      <Show when={inOtherTab() && !lockReadOnly()}>
        <div class="flex items-center gap-3 border-b border-warning-500/30 bg-warning-500/10 px-4 py-2 text-sm text-warning-700">
          <span class="i-lucide-layers size-4" />
          This entry is open in another tab. It's read-only here so the two tabs don't overwrite
          each other.
          <Button variant="secondary" class="ml-auto" onClick={() => takeOverHere()}>
            Edit here instead
          </Button>
        </div>
      </Show>

      <Show when={lockReadOnly()}>
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
        {/* Canvas (+ optional side-by-side preview) */}
        <SplitPane
          open={previewOpen() && collection()?.features.blocks !== false}
          right={
            <PagePreview
              title={resolveLabel(props.entry.title) || props.entry.slug}
              blocks={editor.doc.blocks}
              locale={locale()}
              badge="Draft"
              onClose={() => togglePreview()}
            />
          }
          left={
            <div class="mx-auto max-w-6xl px-6 py-10">
              <Show when={locales.length > 1}>
                <label class="mb-2 flex w-fit items-center gap-2 text-xs text-muted">
                  Language
                  <select
                    class="rounded border border-default bg-default px-2 py-1 text-xs font-medium uppercase text-highlighted"
                    value={locale()}
                    onChange={(e) => {
                      setLocale(e.currentTarget.value);
                    }}
                  >
                    <For each={locales}>
                      {(code) => <option value={code}>{code.toUpperCase()}</option>}
                    </For>
                  </select>
                </label>
              </Show>
              <TitleInput
                entry={props.entry}
                locale={locale()}
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
                    <BlockEditor editor={editor} locale={locale()} />
                  </div>
                  <Show when={Object.keys(collection()?.fields ?? {}).length}>
                    <Infobox entry={props.entry} editor={editor} readOnly={readOnly()} />
                  </Show>
                </div>
              </Show>
            </div>
          }
        />

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
                locale={locale()}
                onDeleted={() => navigate(`/c/${props.entry.collection}`)}
              />
            </Show>
            <Show when={tab() === "block"}>
              <BlockInspector editor={editor} />
            </Show>
          </div>
        </aside>
      </div>

      <VersionsModal
        open={historyOpen()}
        entry={props.entry}
        readOnly={readOnly()}
        onClose={() => setHistoryOpen(false)}
        onRestored={(e) => {
          props.onEntry(e);
          editor.reset({ blocks: e.draft.blocks, properties: e.draft.properties });
          setHistoryOpen(false);
        }}
      />

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
  locale: string;
  readOnly: boolean;
  onSave: (t: Record<string, string>) => void;
}> = (props) => {
  return (
    <input
      class="w-full bg-transparent text-4xl font-bold text-highlighted outline-none placeholder:text-muted/50"
      placeholder="Untitled"
      value={props.entry.title[props.locale] ?? resolveLabel(props.entry.title)}
      disabled={props.readOnly}
      onChange={(e) =>
        props.onSave({ ...props.entry.title, [props.locale]: e.currentTarget.value })
      }
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
  locale: string;
}> = (props) => {
  const { api, collection: getCollection, collections, toast, navigate } = useDashboard();
  const collection = () => getCollection(props.entry.collection);

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
          value={props.entry.description?.[props.locale] ?? ""}
          disabled={props.readOnly}
          onChange={(e) =>
            void props.saveMeta({
              description: { ...props.entry.description, [props.locale]: e.currentTarget.value },
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

// ─── Toolbar pieces ──────────────────────────────────────────────────────────

const PREVIEW_PREF_KEY = "rimelight-cms:preview-open";
const readPreviewPref = () => {
  try {
    return localStorage.getItem(PREVIEW_PREF_KEY) === "1";
  } catch {
    return false;
  }
};

/**
 * Public path of an entry, from the collection's `features.routable` pattern. Falls back to the
 * content API for draft previews; returns null for the live link when the collection has no route.
 */
function entryPath(
  collection: { features: { routable?: unknown } } | undefined,
  entry: Entry,
  live: boolean,
): string | null {
  const pattern = collection?.features.routable;
  if (typeof pattern === "string")
    return pattern.replace("{slug}", entry.slug).replace("{collection}", entry.collection);
  return live ? null : `/api/content/collections/${entry.collection}/${entry.slug}`;
}

const ToolbarGroup: Component<{ children: JSX.Element }> = (props) => (
  <div class="flex items-center gap-0.5 border-r border-default pr-1 last:border-r-0">
    {props.children}
  </div>
);

const IconButton: Component<{
  icon: string;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  loading?: boolean;
  class?: string;
}> = (props) => (
  <button
    type="button"
    title={props.label}
    aria-label={props.label}
    aria-pressed={props.active === undefined ? undefined : props.active ? "true" : "false"}
    disabled={props.disabled || props.loading}
    class={`rounded-md p-1.5 transition-colors disabled:pointer-events-none disabled:opacity-35 ${props.active ? "bg-primary-500/10 text-primary-500" : "text-toned hover:bg-elevated hover:text-highlighted"} ${props.class ?? ""}`}
    onClick={() => props.onClick()}
  >
    <span
      class={`${props.loading ? "i-lucide-loader-circle animate-spin" : props.icon} block size-4`}
    />
  </button>
);

/** Autosave state. Click to save now (or retry after a failure). */
const SaveIndicator: Component<{ editor: BlockEditorState; readOnly: boolean }> = (props) => {
  // Re-render the relative time every 30s.
  const [now, setNow] = createSignal(Date.now());
  onSettled(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  });

  const view = () => {
    if (props.readOnly) return { icon: "i-lucide-lock", text: "Read-only", cls: "text-muted" };
    switch (props.editor.status()) {
      case "saving":
        return { icon: "i-lucide-loader-circle animate-spin", text: "Saving…", cls: "text-muted" };
      case "dirty":
        return { icon: "i-lucide-circle-dot", text: "Unsaved changes", cls: "text-warning-600" };
      case "error":
        // Show the reason (e.g. "changed in another tab"), not just a retry prompt.
        return {
          icon: "i-lucide-cloud-alert",
          text: `Save failed — ${props.editor.error() ?? "retry"}`,
          cls: "text-error-500",
        };
      default: {
        now();
        const at = props.editor.lastSavedAt();
        return {
          icon: "i-lucide-cloud-check",
          text: at ? `Saved ${relativeTime(at)}` : "All changes saved",
          cls: "text-muted",
        };
      }
    }
  };

  return (
    <button
      type="button"
      class={`ml-1 flex max-w-md items-center gap-1 truncate rounded px-1.5 py-0.5 text-xs hover:bg-elevated ${view().cls}`}
      title={
        props.editor.status() === "error"
          ? (props.editor.error() ?? "Save failed")
          : "Changes autosave as a draft · Ctrl+S to save now"
      }
      disabled={props.readOnly}
      onClick={() => void props.editor.flush()}
    >
      <span class={`${view().icon} size-3.5`} />
      {view().text}
    </button>
  );
};

// ─── Versions & history ──────────────────────────────────────────────────────

/** Browse published/pending versions, preview each one rendered, diff it, and restore it. */
const VersionsModal: Component<{
  open: boolean;
  entry: Entry;
  readOnly: boolean;
  onClose: () => void;
  onRestored: (e: Entry) => void;
}> = (props) => (
  <Modal open={props.open} title="Versions & history" onClose={props.onClose} wide>
    <VersionsBrowser {...props} />
  </Modal>
);

const VersionsBrowser: Component<{
  entry: Entry;
  readOnly: boolean;
  onRestored: (e: Entry) => void;
}> = (props) => {
  const { api, toast, locales } = useDashboard();
  const versions = useLoader(() => api.entries.versions(props.entry.id));
  const [selected, setSelected] = createSignal<any>(null);
  const [loadingId, setLoadingId] = createSignal<string | null>(null);
  const [diff, setDiff] = createSignal<any>(null);

  const open = async (v: any) => {
    setDiff(null);
    setLoadingId(v.id);
    try {
      setSelected((await api.versions.get(v.id)).version);
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setLoadingId(null);
    }
  };

  const showDiff = async (versionNumber?: number) => {
    try {
      setSelected(null);
      setDiff(
        (await api.entries.diff(props.entry.id, versionNumber ? String(versionNumber) : undefined))
          .diff,
      );
    } catch (err) {
      toast((err as Error).message, "error");
    }
  };

  const restore = async (v: any) => {
    if (!confirm(`Restore v${v.versionNumber} into the draft? Your current draft is replaced.`))
      return;
    try {
      const { entry } = await api.versions.rollback(v.id);
      props.onRestored(entry);
      toast(`Restored v${v.versionNumber} to draft`, "success");
    } catch (err) {
      toast((err as Error).message, "error");
    }
  };

  return (
    <div class="-mx-5 -my-4 flex h-[70vh] min-h-0">
      <div class="flex w-64 shrink-0 flex-col gap-1.5 overflow-y-auto border-r border-default p-3">
        <Button icon="i-lucide-git-compare" onClick={() => void showDiff()}>
          Compare draft with live
        </Button>
        <Show when={props.entry.draftUpdatedAt}>
          <div class="rounded-lg border border-dashed border-default p-2.5 text-xs">
            <div class="font-medium text-highlighted">Current draft</div>
            <div class="text-muted">Saved {relativeTime(props.entry.draftUpdatedAt)}</div>
          </div>
        </Show>
        <Loading when={versions.loading()}>
          <For
            each={versions.data()?.versions ?? []}
            fallback={<p class="text-xs text-muted">No versions yet. Publishing creates one.</p>}
          >
            {(v) => (
              <button
                type="button"
                class={`flex flex-col gap-1 rounded-lg border p-2.5 text-left text-xs transition-colors ${selected()?.id === v.id ? "border-primary-500 bg-primary-500/5" : "border-default hover:bg-elevated"}`}
                onClick={() => void open(v)}
              >
                <div class="flex items-center justify-between">
                  <span class="font-medium text-highlighted">
                    v{v.versionNumber}
                    <Show when={v.id === props.entry.publishedVersionId}>
                      <span class="ml-1.5 text-[10px] font-semibold uppercase text-success-600">
                        live
                      </span>
                    </Show>
                  </span>
                  <Show when={loadingId() === v.id} fallback={<StatusBadge status={v.status} />}>
                    <span class="i-lucide-loader-circle size-3.5 animate-spin text-muted" />
                  </Show>
                </div>
                <Show when={v.changeSummary}>
                  <p class="line-clamp-2 text-toned">{v.changeSummary}</p>
                </Show>
                <div class="text-muted" title={formatDate(v.createdAt, true)}>
                  {relativeTime(v.createdAt)} · {v.createdBy}
                </div>
              </button>
            )}
          </For>
        </Loading>
      </div>

      <div class="min-w-0 flex-1 overflow-y-auto">
        <Show
          when={selected() || diff()}
          fallback={
            <div class="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted">
              <span class="i-lucide-history size-8 opacity-40" />
              Select a version to preview it.
            </div>
          }
        >
          <Show when={selected()}>
            {(v) => (
              <PagePreview
                title={resolveLabel(v().title) || props.entry.slug}
                blocks={v().content?.blocks ?? []}
                locale={locales[0] ?? "en"}
                badge={`v${v().versionNumber} · ${formatDate(v().createdAt, true)}`}
                actions={
                  <>
                    <Button variant="ghost" onClick={() => void showDiff(v().versionNumber)}>
                      Diff vs draft
                    </Button>
                    <Button
                      variant="primary"
                      icon="i-lucide-rotate-ccw"
                      disabled={props.readOnly}
                      onClick={() => void restore(v())}
                    >
                      Restore
                    </Button>
                  </>
                }
              />
            )}
          </Show>
          <Show when={diff()}>
            <DiffView diff={diff()} />
          </Show>
        </Show>
      </div>
    </div>
  );
};

const DiffView: Component<{ diff: any }> = (props) => (
  <div class="flex flex-col gap-2 p-4 text-xs">
    <div class="text-muted">
      +{props.diff.summary.addedCount} added · −{props.diff.summary.removedCount} removed · ~
      {props.diff.summary.modifiedCount} modified
    </div>
    <For each={props.diff.metaChanges}>
      {(m: any) => (
        <div>
          <b>{m.field}</b>: {JSON.stringify(m.oldValue)} → {JSON.stringify(m.newValue)}
        </div>
      )}
    </For>
    <For
      each={props.diff.blocks.filter((b: any) => b.status !== "unchanged")}
      fallback={<p class="text-muted">No block changes.</p>}
    >
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
);

const ScheduleModal: Component<{
  open: boolean;
  current: Date | null;
  onClose: () => void;
  onSubmit: (at: string | null) => void;
}> = (props) => {
  // datetime-local is wall-clock time: format in local time, the same way the submit parses it.
  const toInput = (d: Date | null) => {
    if (!d) return "";
    const x = new Date(d);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${x.getFullYear()}-${pad(x.getMonth() + 1)}-${pad(x.getDate())}T${pad(x.getHours())}:${pad(x.getMinutes())}`;
  };
  const [value, setValue] = createSignal(untrack(() => toInput(props.current)));
  // Re-seed from the current schedule each time the modal opens, so a stale value never survives a
  // save or a clear. Only the open flag and the schedule are tracked; the apply step just writes.
  createEffect(
    () => (props.open ? toInput(props.current) : null),
    (seeded) => {
      if (seeded !== null) setValue(seeded);
    },
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

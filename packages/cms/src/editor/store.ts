import { createSignal, createStore, reconcile, onCleanup } from "solid-js";
import type { BaseBlock } from "../core/types/blocks";
import type { BlockRegistry } from "../core/blocks/registry";
import {
  cloneBlock,
  findBlock,
  getChildren,
  insertBlock,
  moveBlock,
  removeBlock,
  updateBlock,
} from "../core/blocks/tree";
import { toInlineNodes } from "./inline";

/**
 * Editor state for one entry. All tree changes go through pure functions in `core/blocks/tree`,
 * then `reconcile(next, "id")` writes them into the store, so unchanged blocks keep their
 * identity and their DOM (no remounts, no lost caret while typing).
 */

export type SaveStatus = "saved" | "dirty" | "saving" | "error";

export interface EditorContent {
  blocks: BaseBlock[];
  properties: Record<string, any>;
}

export interface CreateEditorOptions {
  initial: EditorContent;
  registry: BlockRegistry;
  /** Root block types allowed by the collection (undefined = all). */
  allowedRootBlocks?: string[];
  /** Persists the draft. Throwing marks the status as "error" and keeps the changes dirty. */
  save: (content: EditorContent) => Promise<void>;
  /** Debounce before autosave, in ms. */
  autosaveDelay?: number;
  readOnly?: boolean;
  /** Called when the user selects a block (e.g. to show the inspector). */
  onSelect?: (id: string | null) => void;
}

interface Snapshot {
  content: EditorContent;
  /** Text edits to the same block within this window merge into one undo step. */
  coalesceKey?: string;
  at: number;
}

const COALESCE_MS = 800;
const HISTORY_LIMIT = 200;

export function createBlockEditor(options: CreateEditorOptions) {
  const [doc, setDoc] = createStore<EditorContent>(structuredClone(options.initial));
  const [status, setStatus] = createSignal<SaveStatus>("saved");
  const [error, setError] = createSignal<string | null>(null);
  const [selectedId, setSelectedId] = createSignal<string | null>(null);
  const [focusRequest, setFocusRequest] = createSignal<{ id: string; at: "start" | "end" } | null>(
    null,
  );

  // Plain (non-reactive) mirror of the document: the source of truth for computing next states.
  // Reading back from the store right after writing is unreliable because writes are batched.
  let current: EditorContent = structuredClone(options.initial);
  const undoStack: Snapshot[] = [{ content: structuredClone(current), at: 0 }];
  let redoStack: Snapshot[] = [];
  let saveTimer: ReturnType<typeof setTimeout> | undefined;
  let saving: Promise<void> | null = null;
  let pendingAfterSave = false;

  const write = (next: EditorContent) => {
    current = next;
    setDoc(reconcile(structuredClone(next), "id"));
  };

  const record = (coalesceKey?: string) => {
    const now = Date.now();
    const top = undoStack[undoStack.length - 1]!;
    const snapshot = {
      content: structuredClone(current),
      at: now,
      ...(coalesceKey ? { coalesceKey } : {}),
    };
    if (coalesceKey && top.coalesceKey === coalesceKey && now - top.at < COALESCE_MS) {
      undoStack[undoStack.length - 1] = snapshot;
    } else {
      undoStack.push(snapshot);
      if (undoStack.length > HISTORY_LIMIT) undoStack.shift();
    }
    redoStack = [];
  };

  const runSave = async () => {
    if (options.readOnly) return;
    if (saving) {
      pendingAfterSave = true;
      return;
    }
    setStatus("saving");
    const snapshot = structuredClone(current);
    saving = options
      .save(snapshot)
      .then(() => {
        setError(null);
        setStatus(pendingAfterSave ? "dirty" : "saved");
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : String(err));
        setStatus("error");
      })
      .finally(() => {
        saving = null;
        if (pendingAfterSave) {
          pendingAfterSave = false;
          void runSave();
        }
      });
    await saving;
  };

  const scheduleSave = () => {
    setStatus("dirty");
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => void runSave(), options.autosaveDelay ?? 1000);
  };

  const commit = (next: EditorContent, coalesceKey?: string) => {
    if (options.readOnly) return;
    write(next);
    record(coalesceKey);
    scheduleSave();
  };

  const commitBlocks = (blocks: BaseBlock[], coalesceKey?: string) =>
    commit({ ...current, blocks }, coalesceKey);

  /** Where a new block can go relative to `id`: same parent, next index. */
  const siblingSlot = (id: string) => {
    const found = findBlock(current.blocks, id);
    return found
      ? { parentId: found.parent?.id ?? null, index: found.index + 1 }
      : { parentId: null, index: current.blocks.length };
  };

  const canPlace = (type: string, parentId: string | null) => {
    const parentType = parentId ? (findBlock(current.blocks, parentId)?.block.type ?? null) : null;
    return options.registry
      .allowedChildren(parentType, parentId ? undefined : options.allowedRootBlocks)
      .some((d) => d.type === type);
  };

  const api = {
    doc,
    status,
    error,
    selectedId,
    select: (id: string | null) => {
      setSelectedId(id);
      options.onSelect?.(id);
    },
    focusRequest,
    readOnly: !!options.readOnly,
    registry: options.registry,
    allowedRootBlocks: options.allowedRootBlocks,

    get: (id: string) => findBlock(current.blocks, id),

    /** Insert a new block; returns its id (or null if not allowed there). */
    insert(type: string, parentId: string | null, index: number, props?: Record<string, any>) {
      if (!canPlace(type, parentId)) return null;
      const block = options.registry.create(type, props);
      commitBlocks(insertBlock(current.blocks, block, parentId, index));
      setSelectedId(block.id);
      setFocusRequest({ id: block.id, at: "start" });
      return block.id;
    },

    insertAfter(id: string, type = "ParagraphBlock", props?: Record<string, any>) {
      const slot = siblingSlot(id);
      // Fall back to a type the parent accepts (e.g. Enter in a list item adds a list item).
      const parentType = slot.parentId
        ? findBlock(current.blocks, slot.parentId)?.block.type
        : null;
      const fallback = options.registry.allowedChildren(
        parentType ?? null,
        slot.parentId ? undefined : options.allowedRootBlocks,
      )[0]?.type;
      const chosen = canPlace(type, slot.parentId) ? type : fallback;
      return chosen ? api.insert(chosen, slot.parentId, slot.index, props) : null;
    },

    updateProps(id: string, patch: Record<string, any>, { coalesce = false } = {}) {
      const found = findBlock(current.blocks, id);
      if (!found || isPropLocked(found.block, Object.keys(patch))) return;
      commitBlocks(
        updateBlock(current.blocks, id, (b) => ({ ...b, props: { ...b.props, ...patch } })),
        coalesce ? `props:${id}` : undefined,
      );
    },

    remove(id: string) {
      const found = findBlock(current.blocks, id);
      if (!found || found.block.isTemplated) return;
      // Move focus to the previous sibling (or parent) like a text editor would.
      const siblings = found.parent ? getChildren(found.parent) : current.blocks;
      const prev = siblings[found.index - 1] ?? found.parent;
      commitBlocks(removeBlock(current.blocks, id));
      if (prev) {
        setSelectedId(prev.id);
        setFocusRequest({ id: prev.id, at: "end" });
      }
    },

    duplicate(id: string) {
      const found = findBlock(current.blocks, id);
      if (!found) return;
      const copy = cloneBlock(found.block);
      delete copy.isTemplated;
      commitBlocks(insertBlock(current.blocks, copy, found.parent?.id ?? null, found.index + 1));
      setSelectedId(copy.id);
    },

    move(id: string, parentId: string | null, index: number) {
      const found = findBlock(current.blocks, id);
      if (!found || found.block.isTemplated || !canPlace(found.block.type, parentId)) return;
      commitBlocks(moveBlock(current.blocks, id, parentId, index));
    },

    moveBy(id: string, delta: -1 | 1) {
      const found = findBlock(current.blocks, id);
      if (!found) return;
      const target = found.index + delta + (delta > 0 ? 1 : 0);
      if (target < 0) return;
      api.move(id, found.parent?.id ?? null, target);
    },

    /** Turn a block into another type, keeping the text where both types have inline text. */
    transform(id: string, type: string) {
      const found = findBlock(current.blocks, id);
      if (!found || found.block.isTemplated) return;
      const from = options.registry.get(found.block.type);
      const to = options.registry.get(type);
      if (!to || !canPlace(type, found.parent?.id ?? null)) return;
      const fresh = options.registry.create(type);
      if (from?.inlineText && to.inlineText) {
        const text = found.block.props[from.inlineText];
        fresh.props[to.inlineText] = to.richText
          ? Array.isArray(text)
            ? text
            : toInlineNodes(plain(text))
          : plain(text);
      }
      commitBlocks(
        updateBlock(current.blocks, id, () => {
          const ch = getChildren(found.block).length ? getChildren(found.block) : fresh.children;
          return {
            ...fresh,
            id,
            ...(ch !== undefined ? { children: ch } : {}),
          };
        }),
      );
      setFocusRequest({ id, at: "end" });
    },

    /** Admin-only block metadata (access roles, template locks). */
    setBlockMeta(
      id: string,
      meta: Pick<BaseBlock, "allowedRoles" | "isTemplated" | "templatedProps">,
    ) {
      commitBlocks(
        updateBlock(current.blocks, id, (b) => {
          const next: BaseBlock = { ...b };
          for (const [k, v] of Object.entries(meta)) {
            if (v === undefined) delete (next as any)[k];
            else (next as any)[k] = v;
          }
          return next;
        }),
      );
    },

    setProperty(key: string, value: unknown) {
      commit(
        { ...current, properties: { ...current.properties, [key]: value } },
        `property:${key}`,
      );
    },

    undo() {
      if (undoStack.length <= 1) return;
      redoStack.push(undoStack.pop()!);
      write(structuredClone(undoStack[undoStack.length - 1]!.content));
      scheduleSave();
    },
    redo() {
      const next = redoStack.pop();
      if (!next) return;
      undoStack.push(next);
      write(structuredClone(next.content));
      scheduleSave();
    },
    canUndo: () => undoStack.length > 1,
    canRedo: () => redoStack.length > 0,

    /** Save immediately (Ctrl+S, before publish, before leaving). */
    async flush() {
      clearTimeout(saveTimer);
      if (status() === "dirty" || status() === "error") await runSave();
      else if (saving) await saving;
    },

    /** Replace the document (e.g. after rollback). Resets history. */
    reset(content: EditorContent) {
      current = structuredClone(content);
      write(current);
      undoStack.splice(0, undoStack.length, { content: structuredClone(current), at: 0 });
      redoStack = [];
      setStatus("saved");
    },

    snapshot: (): EditorContent => structuredClone(current),
    clearFocusRequest: () => setFocusRequest(null),
  };

  onCleanup(() => clearTimeout(saveTimer));
  return api;
}

export type BlockEditorState = ReturnType<typeof createBlockEditor>;

function isPropLocked(block: BaseBlock, keys: string[]) {
  if (block.templatedProps === true) return true;
  if (Array.isArray(block.templatedProps))
    return keys.some((k) => (block.templatedProps as string[]).includes(k));
  return false;
}

function plain(value: unknown): string {
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map((n: any) => n?.text ?? "").join("");
  if (value && typeof value === "object") return String(Object.values(value)[0] ?? "");
  return "";
}

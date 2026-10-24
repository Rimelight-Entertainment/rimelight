import {
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
  onSettled,
  type Component,
} from "solid-js";
import { Dynamic, Portal } from "@solidjs/web";
import type { BaseBlock } from "../core/types/blocks";
import type { BlockDefinition } from "../core/blocks/registry";
import { getChildren } from "../core/blocks/tree";
import { BlockRenderer } from "../solid/BlockRenderer";
import { InlineText, placeCaret } from "./InlineText";
import { builtinEditors } from "./editors";
import type { BlockEditorState } from "./store";

/**
 * Notion-style block canvas. Text blocks are edited inline; Enter splits, Backspace merges,
 * "/" opens the block menu, markdown shortcuts convert blocks, the ⋮⋮ handle drags and opens
 * block actions. Non-text blocks render their real preview and are configured in the inspector.
 */
export interface BlockEditorProps {
  editor: BlockEditorState;
}

interface SlashState {
  parentId: string | null;
  index: number;
  /** Replace this (empty) block instead of inserting. */
  replaceId?: string;
  rect: DOMRect;
}

interface DragState {
  id: string;
  over?: { id: string; position: "before" | "after" | "inside" };
}

export const BlockEditor: Component<BlockEditorProps> = (props) => {
  const ed = props.editor;
  const [slash, setSlash] = createSignal<SlashState | null>(null);
  const [drag, setDrag] = createSignal<DragState | null>(null);

  // Focus requests from the store (new block, delete → previous block, transform).
  createEffect(
    () => ed.focusRequest(),
    (req) => {
      if (!req) return;
      queueMicrotask(() => {
        const el = document.querySelector<HTMLElement>(`[data-inline-text="${req.id}"]`);
        if (el) placeCaret(el, req.at);
        else document.querySelector<HTMLElement>(`[data-block-id="${req.id}"]`)?.focus();
        ed.clearFocusRequest();
      });
    },
  );

  onSettled(() => {
    const onKey = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      if (mod && e.key.toLowerCase() === "z") {
        e.preventDefault();
        if (e.shiftKey) ed.redo();
        else ed.undo();
      } else if (mod && e.key.toLowerCase() === "y") {
        e.preventDefault();
        ed.redo();
      } else if (mod && e.key.toLowerCase() === "s") {
        e.preventDefault();
        void ed.flush();
      } else if (e.key === "Escape") {
        setSlash(null);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const openSlash = (state: SlashState) => setSlash(state);

  const canvas = (blocks: BaseBlock[], parent: BaseBlock | null, depth: number) => (
    <div class="flex flex-col" data-canvas={parent?.id ?? "root"}>
      <For each={blocks}>
        {(block, index) => (
          <BlockView
            block={block}
            parent={parent}
            index={index()}
            depth={depth}
            editor={ed}
            drag={drag()}
            setDrag={setDrag}
            openSlash={openSlash}
            renderChildren={(b, d) => canvas(getChildren(b), b, d)}
          />
        )}
      </For>
      <Show when={!ed.readOnly && (parent === null || blocks.length === 0)}>
        <button
          type="button"
          class="mt-1 flex items-center gap-1.5 self-start rounded px-1.5 py-1 text-xs text-muted opacity-60 hover:bg-elevated hover:opacity-100"
          onClick={(e) =>
            openSlash({
              parentId: parent?.id ?? null,
              index: blocks.length,
              rect: e.currentTarget.getBoundingClientRect(),
            })
          }
        >
          <span class="i-lucide-plus size-3.5" />
          {parent ? `Add to ${ed.registry.get(parent.type)?.label ?? parent.type}` : "Add block"}
        </button>
      </Show>
    </div>
  );

  return (
    <div class="cms-block-editor relative pl-10" onClick={() => setSlash(null)}>
      {canvas(ed.doc.blocks, null, 0)}
      <Show when={slash()}>
        {(s) => <SlashMenu state={s()} editor={ed} onClose={() => setSlash(null)} />}
      </Show>
    </div>
  );
};

// ─── One block ───────────────────────────────────────────────────────────────

const BlockView: Component<{
  block: BaseBlock;
  parent: BaseBlock | null;
  index: number;
  depth: number;
  editor: BlockEditorState;
  drag: DragState | null;
  setDrag: (d: DragState | null) => void;
  openSlash: (s: SlashState) => void;
  renderChildren: (b: BaseBlock, depth: number) => any;
}> = (props) => {
  const ed = props.editor;
  const def = () => ed.registry.get(props.block.type);
  const selected = () => ed.selectedId() === props.block.id;
  const locked = () => !!props.block.isTemplated;
  const [menu, setMenu] = createSignal(false);
  const childDepth = () => (props.block.type === "SectionBlock" ? props.depth + 1 : props.depth);
  const dropHint = () =>
    props.drag?.over?.id === props.block.id ? props.drag.over.position : null;
  const parentId = () => props.parent?.id ?? null;

  const textProp = () => def()?.inlineText;
  const isPlain = () => !def()?.richText;
  const customEditor = () => def()?.editor ?? builtinEditors[props.block.type];
  /** Container without its own canvas editor: children are edited in a nested canvas. */
  const isContainer = () => !!def()?.children && !customEditor();
  /** Short description of a container's settings shown next to its label (e.g. "warning"). */
  const summary = () => {
    const p = props.block.props ?? {};
    const v = p["variant"] ?? p["columns"] ?? p["title"] ?? p["label"];
    return typeof v === "string" || typeof v === "number" ? String(v) : "";
  };

  const onDragOver = (e: DragEvent) => {
    if (!props.drag || props.drag.id === props.block.id) return;
    e.preventDefault();
    e.stopPropagation();
    const box = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const ratio = (e.clientY - box.top) / box.height;
    const acceptsChildren = !!def()?.children && getChildren(props.block).length === 0;
    const position =
      acceptsChildren && ratio > 0.33 && ratio < 0.66 ? "inside" : ratio < 0.5 ? "before" : "after";
    props.setDrag({ ...props.drag, over: { id: props.block.id, position } });
  };
  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const d = props.drag;
    if (!d?.over) return props.setDrag(null);
    if (d.over.position === "inside") ed.move(d.id, props.block.id, 0);
    else ed.move(d.id, parentId(), props.index + (d.over.position === "after" ? 1 : 0));
    props.setDrag(null);
  };

  const shortcut = (s: string): boolean => {
    const map: Record<string, string> = {
      "#": "SectionBlock",
      "##": "SectionBlock",
      "###": "SectionBlock",
      "-": "UnorderedListBlock",
      "*": "UnorderedListBlock",
      "1.": "OrderedListBlock",
      ">": "CalloutBlock",
      "```": "CodeBlock",
    };
    const type = map[s];
    if (!type || props.block.type !== "ParagraphBlock") return false;
    ed.transform(props.block.id, type);
    return true;
  };

  const body = () => {
    const custom = customEditor();
    if (custom) {
      return (
        <Dynamic
          component={custom}
          block={props.block}
          readOnly={ed.readOnly || props.block.templatedProps === true}
          sectionDepth={props.depth}
          update={(patch: Record<string, any>) =>
            ed.updateProps(props.block.id, patch, { coalesce: true })
          }
          renderChildren={() => props.renderChildren(props.block, childDepth())}
        />
      );
    }
    const key = textProp();
    if (key) {
      return (
        <InlineText
          blockId={props.block.id}
          value={props.block.props[key]}
          mode={isPlain() ? "plain" : "rich"}
          readOnly={ed.readOnly || props.block.templatedProps === true}
          class={textClass(props.block.type, props.depth)}
          {...((props.block.type === "ParagraphBlock" ? "Type '/' for blocks" : def()?.label)
            ? {
                placeholder:
                  props.block.type === "ParagraphBlock" ? "Type '/' for blocks" : def()?.label,
              }
            : {})}
          onFocus={() => ed.select(props.block.id)}
          onChange={(v) => ed.updateProps(props.block.id, { [key]: v }, { coalesce: true })}
          onEnter={(after) => {
            const next = ed.insertAfter(
              props.block.id,
              props.block.type === "ListItemBlock" ? "ListItemBlock" : "ParagraphBlock",
            );
            if (next && (Array.isArray(after) ? after.length : after)) {
              const nextDef = ed.registry.get(ed.get(next)?.block.type ?? "");
              if (nextDef?.inlineText) ed.updateProps(next, { [nextDef.inlineText]: after });
            }
          }}
          onBackspaceAtStart={(empty) => {
            if (empty && !locked()) ed.remove(props.block.id);
          }}
          onSlash={(rect) =>
            props.openSlash({
              parentId: parentId(),
              index: props.index,
              replaceId: props.block.id,
              rect,
            })
          }
          onShortcut={shortcut}
        />
      );
    }
    if (isContainer()) return null;
    // Leaf block: live preview (renders without children); configure in the inspector.
    return (
      <div class="pointer-events-none select-none">
        <BlockRenderer block={{ ...props.block, children: [] }} sectionDepth={props.depth} />
      </div>
    );
  };

  return (
    <div
      data-block-id={props.block.id}
      tabindex={-1}
      class={`group/block relative rounded-md py-0.5 outline-none ${selected() ? "bg-primary-500/[0.04] ring-1 ring-primary-500/30" : ""}`}
      onClick={(e: MouseEvent) => {
        e.stopPropagation();
        ed.select(props.block.id);
      }}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <Show when={dropHint() === "before"}>
        <div class="absolute -top-px left-0 right-0 h-0.5 rounded bg-primary-500" />
      </Show>
      <Show when={dropHint() === "after"}>
        <div class="absolute -bottom-px left-0 right-0 h-0.5 rounded bg-primary-500" />
      </Show>

      <Show when={!ed.readOnly}>
        <div class="absolute -left-10 top-1 flex items-center opacity-0 transition-opacity group-hover/block:opacity-100">
          <button
            type="button"
            title="Add block below"
            class="i-lucide-plus size-4 text-muted hover:text-highlighted"
            onClick={(e) => {
              e.stopPropagation();
              props.openSlash({
                parentId: parentId(),
                index: props.index + 1,
                rect: e.currentTarget.getBoundingClientRect(),
              });
            }}
          />
          <button
            type="button"
            title={locked() ? "Templated block (locked)" : "Drag to move · click for actions"}
            draggable={!locked() ? "true" : "false"}
            class={`${locked() ? "i-lucide-lock" : "i-lucide-grip-vertical"} size-4 cursor-grab text-muted hover:text-highlighted`}
            onDragStart={(e) => {
              e.dataTransfer?.setData("text/plain", props.block.id);
              props.setDrag({ id: props.block.id });
            }}
            onDragEnd={() => props.setDrag(null)}
            onClick={(e) => {
              e.stopPropagation();
              setMenu(!menu());
            }}
          />
        </div>
      </Show>

      <Show when={menu()}>
        <BlockMenu
          block={props.block}
          editor={ed}
          onClose={() => setMenu(false)}
          parentType={props.parent?.type ?? null}
        />
      </Show>

      <Show when={(isContainer() && !textProp() && !isList(props.block.type)) || !def()}>
        <div class="mb-1 flex items-center gap-1.5 text-[11px] font-medium text-muted">
          <span class={`${def()?.icon ?? "i-lucide-square"} size-3`} />
          {def()?.label ?? props.block.type}
          <Show when={summary()}>
            <span class="font-normal text-muted/80">· {summary()}</span>
          </Show>
          <Show when={!def()}>
            <span class="text-warning-500">(unregistered block — kept as-is)</span>
          </Show>
        </div>
      </Show>

      {body()}

      <Show when={isContainer()}>
        <div class={containerClass(props.block.type, props.block.props)}>
          {props.renderChildren(props.block, childDepth())}
        </div>
      </Show>
    </div>
  );
};

function textClass(type: string, depth: number) {
  if (type === "SectionBlock") {
    return (
      [
        "text-2xl font-bold",
        "text-xl font-semibold",
        "text-lg font-semibold",
        "text-base font-semibold",
        "text-sm font-semibold",
      ][Math.min(depth, 4)] + " text-highlighted mt-4"
    );
  }
  if (type === "TabItemBlock" || type === "StepItemBlock") return "font-medium text-highlighted";
  return "text-[15px] leading-relaxed text-default min-h-[1.6em]";
}

const isList = (type: string) => type === "UnorderedListBlock" || type === "OrderedListBlock";

const CALLOUT_TONES: Record<string, string> = {
  info: "border-info-500 bg-info-500/5",
  source: "border-info-500 bg-info-500/5",
  success: "border-success-500 bg-success-500/5",
  warning: "border-warning-500 bg-warning-500/5",
  ideation: "border-warning-500 bg-warning-500/5",
  error: "border-error-500 bg-error-500/5",
  commentary: "border-primary-500 bg-primary-500/5",
};

function containerClass(type: string, props: Record<string, any> = {}) {
  switch (type) {
    case "SectionBlock":
      return "mt-1";
    case "CalloutBlock":
      return `rounded-md border-l-2 px-3 py-2 ${CALLOUT_TONES[props["variant"]] ?? CALLOUT_TONES["info"]}`;
    case "UnorderedListBlock":
    case "OrderedListBlock":
      return `pl-6 ${type === "OrderedListBlock" ? "list-decimal" : "list-disc"} [&>[data-canvas]>[data-block-id]]:list-item`;
    case "TabItemBlock":
    case "StepItemBlock":
      return "mt-1 border-l border-default pl-3";
    default:
      return "rounded-md border border-default bg-elevated/30 p-2";
  }
}

// ─── Block actions menu ──────────────────────────────────────────────────────

const BlockMenu: Component<{
  block: BaseBlock;
  editor: BlockEditorState;
  parentType: string | null;
  onClose: () => void;
}> = (props) => {
  const ed = props.editor;
  const turnInto = () =>
    ed.registry
      .allowedChildren(props.parentType, props.parentType ? undefined : ed.allowedRootBlocks)
      .filter((d) => d.inlineText && d.type !== props.block.type);
  const act = (fn: () => void) => () => {
    fn();
    props.onClose();
  };
  const item = (label: string, icon: string, fn: () => void, danger = false) => (
    <button
      type="button"
      class={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs hover:bg-elevated ${danger ? "text-error-500" : "text-highlighted"}`}
      onClick={act(fn)}
    >
      <span class={`${icon} size-3.5`} />
      {label}
    </button>
  );
  return (
    <div
      class="absolute -left-10 top-7 z-30 w-52 rounded-lg border border-default bg-default py-1 shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <Show
        when={!props.block.isTemplated}
        fallback={<div class="px-3 py-2 text-xs text-muted">Locked by template</div>}
      >
        {item("Move up", "i-lucide-arrow-up", () => ed.moveBy(props.block.id, -1))}
        {item("Move down", "i-lucide-arrow-down", () => ed.moveBy(props.block.id, 1))}
        {item("Duplicate", "i-lucide-copy", () => ed.duplicate(props.block.id))}
        <Show when={turnInto().length}>
          <div class="mt-1 border-t border-default px-3 pb-1 pt-2 text-[10px] uppercase tracking-wide text-muted">
            Turn into
          </div>
          <For each={turnInto()}>
            {(d) =>
              item(d.label, d.icon ?? "i-lucide-square", () => ed.transform(props.block.id, d.type))
            }
          </For>
        </Show>
        <div class="my-1 border-t border-default" />
        {item("Delete", "i-lucide-trash-2", () => ed.remove(props.block.id), true)}
      </Show>
    </div>
  );
};

// ─── Slash menu ──────────────────────────────────────────────────────────────

const SlashMenu: Component<{ state: SlashState; editor: BlockEditorState; onClose: () => void }> = (
  props,
) => {
  const ed = props.editor;
  const [query, setQuery] = createSignal("");
  const [active, setActive] = createSignal(0);
  let input = undefined as unknown as HTMLInputElement;

  const parentType = () =>
    props.state.parentId ? (ed.get(props.state.parentId)?.block.type ?? null) : null;
  const options = createMemo(() => {
    const q = query().toLowerCase();
    return ed.registry
      .allowedChildren(parentType(), props.state.parentId ? undefined : ed.allowedRootBlocks)
      .filter(
        (d) =>
          !q || [d.label, d.type, ...(d.keywords ?? [])].some((s) => s.toLowerCase().includes(q)),
      );
  });

  const choose = (d: BlockDefinition) => {
    const { replaceId, parentId, index } = props.state;
    if (replaceId) ed.transform(replaceId, d.type);
    else ed.insert(d.type, parentId, index);
    props.onClose();
  };

  onSettled(() => {
    input.focus();
  });

  const top = () => Math.min(props.state.rect.bottom + 4, window.innerHeight - 340);

  return (
    <Portal>
      <div
        class="fixed z-50 flex max-h-80 w-72 flex-col overflow-hidden rounded-lg border border-default bg-default shadow-2xl"
        style={{ top: `${top()}px`, left: `${props.state.rect.left}px` }}
        onClick={(e) => e.stopPropagation()}
      >
        <input
          ref={input}
          class="border-b border-default bg-transparent px-3 py-2 text-sm outline-none"
          placeholder="Search blocks…"
          value={query()}
          onInput={(e) => {
            setQuery(e.currentTarget.value);
            setActive(0);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActive((i) => Math.min(i + 1, options().length - 1));
            } else if (e.key === "ArrowUp") {
              e.preventDefault();
              setActive((i) => Math.max(i - 1, 0));
            } else if (e.key === "Enter") {
              e.preventDefault();
              const d = options()[active()];
              if (d) choose(d);
            } else if (e.key === "Escape") {
              props.onClose();
            }
          }}
        />
        <div class="overflow-y-auto py-1">
          <For
            each={options()}
            fallback={<div class="px-3 py-2 text-xs text-muted">No blocks match.</div>}
          >
            {(d, i) => (
              <button
                type="button"
                class={`flex w-full items-start gap-2.5 px-3 py-1.5 text-left ${i() === active() ? "bg-elevated" : ""}`}
                onMouseEnter={() => setActive(i())}
                onClick={() => choose(d)}
              >
                <span class={`${d.icon ?? "i-lucide-square"} mt-0.5 size-4 shrink-0 text-muted`} />
                <span class="flex flex-col">
                  <span class="text-sm text-highlighted">{d.label}</span>
                  <Show when={d.description}>
                    <span class="text-[11px] text-muted">{d.description}</span>
                  </Show>
                </span>
              </button>
            )}
          </For>
        </div>
      </div>
    </Portal>
  );
};

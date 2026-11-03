import {
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onSettled,
  type Component,
} from "solid-js";
import { Dynamic, Portal } from "@solidjs/web";
import { RLEmpty } from "@rimelight/ui/components/empty/RLEmpty.tsx";
import { defineShortcuts } from "@rimelight/ui/shortcuts";
import { resolveLabel } from "../core/collections/define";
import { cmsT } from "../locale";
import type { BaseBlock } from "../core/types/blocks";
import type { BlockDefinition } from "../core/blocks/registry";
import { getChildren } from "../core/blocks/tree";
import { calculateHeadingLevel } from "../core/types/blocks";
import { resolveRichText, updateRichText } from "../core/richtext";
import { BlockRenderer } from "../solid/BlockRenderer";
import { InlineText, placeCaret } from "./InlineText";
import { builtinEditors } from "./editors";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { RLInput } from "@rimelight/ui/components/input/RLInput.tsx";
import type { BlockEditorState, InsertTarget } from "./store";

/**
 * Notion-style block canvas. Text blocks are edited inline; Enter splits, Backspace merges,
 * markdown shortcuts convert blocks. Every block has a ⋮⋮ handle on the left: click it for block
 * actions, drag it to reorder or nest. Blocks are added through one shared picker modal, opened
 * from the "Add block" button, the handle menu, "/" in an empty text block, the toolbar, or
 * the keyboard shortcut.
 */
export interface BlockEditorProps {
  editor: BlockEditorState;
  /** Locale being edited. Rich text stored per locale (`{ en: [...], pt: [...] }`) edits this one. */
  locale?: string | undefined;
}

type DropPosition = "before" | "after" | "inside";

interface DragState {
  id: string;
  over?: { id: string; position: DropPosition };
}

/** Keyboard shortcut that opens the block picker (registered with RLShortcuts). */
export const ADD_BLOCK_SHORTCUT = "meta_alt_b";

export const BlockEditor: Component<BlockEditorProps> = (props) => {
  const ed = props.editor;
  const [drag, setDrag] = createSignal<DragState | null>(null);
  /** Innermost hovered block, so only its handle shows (not every ancestor's). */
  const [hoverId, setHoverId] = createSignal<string | null>(null);

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

  // With several blocks selected, Delete removes them and Escape clears the selection. Typing in
  // a text field or a block's text is left alone.
  const onMultiKey = (e: KeyboardEvent) => {
    if (ed.selectedIds().length < 2 || ed.readOnly) return;
    if ((e.target as HTMLElement).closest('input, textarea, [contenteditable="true"]')) return;
    if (e.key === "Delete" || e.key === "Backspace") {
      e.preventDefault();
      ed.removeSelected();
    } else if (e.key === "Escape") {
      ed.clearSelection();
    }
  };
  document.addEventListener("keydown", onMultiKey);
  onCleanup(() => document.removeEventListener("keydown", onMultiKey));

  onSettled(() =>
    defineShortcuts({
      meta_z: {
        handler: () => ed.undo(),
        usingInput: true,
        label: "Undo",
        category: "editor",
        order: 50,
      },
      meta_shift_z: {
        handler: () => ed.redo(),
        usingInput: true,
        label: "Redo",
        category: "editor",
        order: 49,
      },
      meta_y: { handler: () => ed.redo(), usingInput: true },
      meta_s: {
        handler: () => void ed.flush(),
        usingInput: true,
        label: "Save now",
        description: "Changes also autosave",
        category: "editor",
        order: 48,
      },
      [ADD_BLOCK_SHORTCUT]: {
        handler: () => ed.openInserter(),
        usingInput: true,
        label: "Add block",
        description: "Open the block picker below the selected block",
        category: "editor",
        order: 47,
      },
    }),
  );

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
            hovered={hoverId() === block.id}
            locale={props.locale ?? "en"}
            setHover={setHoverId}
            renderChildren={(b, d) => canvas(getChildren(b), b, d)}
          />
        )}
      </For>
      <Show when={parent && blocks.length === 0}>
        <EmptyDropzone parent={parent!} editor={ed} drag={drag()} setDrag={setDrag} />
      </Show>
    </div>
  );

  return (
    <div
      class="cms-block-editor relative pl-8"
      onMouseLeave={() => setHoverId(null)}
      onDragLeave={(e) => {
        // Pointer left the editor entirely: clear the indicator.
        if (!e.currentTarget.contains(e.relatedTarget as Node | null) && drag())
          setDrag({ id: drag()!.id });
      }}
    >
      <Show
        when={ed.doc.blocks.length > 0}
        fallback={
          <RLEmpty
            icon="i-lucide-layout-template"
            title={cmsT("text.this-page-is-empty")}
            description="Start by adding your first block."
            class="border border-dashed border-default"
            actions={
              ed.readOnly
                ? []
                : [
                    {
                      label: "Add block",
                      icon: "i-lucide-plus",
                      onClick: () => ed.openInserter({ parentId: null, index: 0 }),
                    },
                  ]
            }
          />
        }
      >
        {canvas(ed.doc.blocks, null, 0)}
        <Show when={!ed.readOnly}>
          <div class="mt-6 flex justify-center">
            <RLButton
              size="sm"
              variant="outline"
              color="neutral"
              leadingIcon="i-lucide-plus"
              label="Add block"
              onClick={() => ed.openInserter({ parentId: null, index: ed.doc.blocks.length })}
            />
          </div>
        </Show>
      </Show>

      <Show when={ed.selectedIds().length > 1}>
        <div
          role="toolbar"
          aria-label={cmsT("text.selected-blocks")}
          class="sticky bottom-4 z-20 mx-auto mt-4 flex w-fit items-center gap-1 rounded-full border border-default bg-elevated px-3 py-1.5 text-sm shadow-lg"
        >
          <span class="px-1 font-medium text-highlighted">
            {ed.selectedIds().length} blocks selected
          </span>
          <Show when={!ed.readOnly}>
            <RLButton
              size="xs"
              variant="ghost"
              color="neutral"
              label="Duplicate"
              onClick={() => ed.duplicateSelected()}
            />
            <RLButton
              size="xs"
              variant="ghost"
              color="error"
              label="Delete"
              onClick={() => ed.removeSelected()}
            />
          </Show>
          <RLButton
            size="xs"
            variant="ghost"
            color="neutral"
            label="Clear"
            onClick={() => ed.clearSelection()}
          />
        </div>
      </Show>

      <Show when={ed.inserter()}>
        {(target) => (
          <BlockPicker target={target()} editor={ed} onClose={() => ed.closeInserter()} />
        )}
      </Show>
    </div>
  );
};

// ─── Empty container dropzone ────────────────────────────────────────────────

const EmptyDropzone: Component<{
  parent: BaseBlock;
  editor: BlockEditorState;
  drag: DragState | null;
  setDrag: (d: DragState | null) => void;
}> = (props) => {
  const ed = props.editor;
  const label = () => resolveLabel(ed.registry.get(props.parent.type)?.label) || props.parent.type;
  const accepts = () => !!props.drag && ed.canMoveTo(props.drag.id, props.parent.id);
  const active = () =>
    props.drag?.over?.id === props.parent.id && props.drag.over.position === "inside";
  return (
    <div
      onDragOver={(e) => {
        if (!accepts()) return;
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
        if (!active())
          props.setDrag({ id: props.drag!.id, over: { id: props.parent.id, position: "inside" } });
      }}
      onDrop={(e) => {
        if (!accepts()) return;
        e.preventDefault();
        e.stopPropagation();
        ed.move(props.drag!.id, props.parent.id, 0);
        props.setDrag(null);
      }}
    >
      <RLEmpty
        size="xs"
        icon={active() ? "i-lucide-arrow-down-to-line" : "i-lucide-box-select"}
        title={active() ? `Drop into ${label()}` : `Empty ${label()}`}
        description={ed.readOnly ? "" : "Drag a block here or add one."}
        class={`my-1 border border-dashed transition-colors ${active() ? "border-primary-500 bg-primary-500/10" : accepts() ? "border-primary-500/50" : "border-default"}`}
        actions={
          ed.readOnly
            ? []
            : [
                {
                  label: "Add block",
                  icon: "i-lucide-plus",
                  variant: "soft",
                  onClick: (e: MouseEvent) => {
                    e.stopPropagation();
                    ed.openInserter({ parentId: props.parent.id, index: 0 });
                  },
                },
              ]
        }
      />
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
  hovered: boolean;
  setHover: (id: string | null) => void;
  locale: string;
  renderChildren: (b: BaseBlock, depth: number) => any;
}> = (props) => {
  const ed = props.editor;
  let el!: HTMLDivElement;
  const def = () => ed.registry.get(props.block.type);
  const selected = () => ed.selectedIds().includes(props.block.id);
  const locked = () => !!props.block.isTemplated;
  const [menu, setMenu] = createSignal(false);
  const childDepth = () => (props.block.type === "SectionBlock" ? props.depth + 1 : props.depth);
  const dropHint = () =>
    props.drag?.over?.id === props.block.id ? props.drag.over.position : null;
  const isDragging = () => props.drag?.id === props.block.id;
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

  // Drop before/after this block, in its parent. Nested blocks and empty-container dropzones
  // handle their own events first; if this parent can't take the dragged block, the event
  // bubbles up so an ancestor level can offer a valid spot instead.
  const onDragOver = (e: DragEvent) => {
    const d = props.drag;
    if (!d || d.id === props.block.id || !ed.canMoveTo(d.id, parentId())) return;
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    const box = el.getBoundingClientRect();
    const position: DropPosition = e.clientY - box.top < box.height / 2 ? "before" : "after";
    if (d.over?.id !== props.block.id || d.over.position !== position)
      props.setDrag({ id: d.id, over: { id: props.block.id, position } });
  };
  const onDrop = (e: DragEvent) => {
    const d = props.drag;
    if (!d?.over || d.over.id !== props.block.id || d.over.position === "inside") return;
    e.preventDefault();
    e.stopPropagation();
    ed.move(d.id, parentId(), props.index + (d.over.position === "after" ? 1 : 0));
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
          value={
            isPlain()
              ? props.block.props[key]
              : resolveRichText(props.block.props[key], props.locale)
          }
          mode={isPlain() ? "plain" : "rich"}
          readOnly={ed.readOnly || props.block.templatedProps === true}
          class={textClass(props.block.type, props.depth)}
          {...((
            props.block.type === "ParagraphBlock"
              ? cmsT("text.type-slash-for-blocks")
              : resolveLabel(def()?.label)
          )
            ? {
                placeholder:
                  props.block.type === "ParagraphBlock"
                    ? cmsT("text.type-slash-for-blocks")
                    : resolveLabel(def()?.label),
              }
            : {})}
          onFocus={() => ed.select(props.block.id)}
          onChange={(v) =>
            ed.updateProps(
              props.block.id,
              {
                [key]: isPlain()
                  ? v
                  : updateRichText(props.block.props[key], props.locale, v as any, {
                      defaultLocale: ed.defaultLocale,
                    }),
              },
              { coalesce: true },
            )
          }
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
            if (locked()) return;
            // Empty block: delete it. Otherwise join its text onto the block above (Notion-style).
            if (empty) ed.remove(props.block.id);
            else ed.joinWithPrevious(props.block.id);
          }}
          onSlash={() =>
            ed.openInserter({
              parentId: parentId(),
              index: props.index,
              replaceId: props.block.id,
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
        <BlockRenderer
          block={{ ...props.block, children: [] }}
          sectionDepth={props.depth}
          locale={props.locale}
        />
      </div>
    );
  };

  return (
    <div
      ref={(node) => (el = node)}
      data-block-id={props.block.id}
      tabindex={-1}
      class={`relative -ml-8 rounded-md py-0.5 pl-8 outline-none transition-opacity ${selected() ? "bg-primary-500/[0.04] ring-1 ring-primary-500/30" : ""} ${isDragging() ? "opacity-40" : ""}`}
      onClick={(e: MouseEvent) => {
        e.stopPropagation();
        // Modifier clicks on text keep their normal meaning (extend the text selection).
        const inText = (e.target as HTMLElement).closest('[contenteditable="true"]');
        if (inText) return ed.select(props.block.id);
        if (e.shiftKey) ed.extendSelect(props.block.id);
        else if (e.metaKey || e.ctrlKey) ed.toggleSelect(props.block.id);
        else ed.select(props.block.id);
      }}
      onMouseOver={(e: MouseEvent) => {
        e.stopPropagation();
        if (!props.hovered) props.setHover(props.block.id);
      }}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <Show when={props.block.type === "SectionBlock"}>
        <span
          class="pointer-events-none absolute right-1 top-1.5 rounded bg-elevated px-1 font-mono text-[10px] font-semibold text-muted"
          title={cmsT("text.heading-level-follows-nesting")}
        >
          H{calculateHeadingLevel(props.depth)}
        </span>
      </Show>

      <Show when={dropHint() === "before" || dropHint() === "after"}>
        <DropLine position={dropHint() as "before" | "after"} />
      </Show>

      <Show when={!ed.readOnly}>
        <div
          class={`absolute left-1 top-1 z-10 transition-opacity ${menu() || props.hovered || selected() ? "opacity-100" : "opacity-0"}`}
        >
          <button
            type="button"
            aria-label={`${resolveLabel(def()?.label) || "Block"} actions`}
            aria-haspopup="menu"
            aria-expanded={menu() ? "true" : "false"}
            title={
              locked()
                ? "Templated block (locked) · click for actions"
                : "Drag to move · click for actions"
            }
            draggable={!locked() ? "true" : "false"}
            class={`flex size-6 items-center justify-center rounded text-muted hover:bg-elevated hover:text-highlighted ${locked() ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"} ${menu() ? "bg-elevated text-highlighted" : ""}`}
            onDragStart={(e) => {
              setMenu(false);
              if (e.dataTransfer) {
                e.dataTransfer.effectAllowed = "move";
                e.dataTransfer.setData("text/plain", props.block.id);
                e.dataTransfer.setDragImage(el, 16, 12);
              }
              props.setDrag({ id: props.block.id });
            }}
            onDragEnd={() => props.setDrag(null)}
            onClick={(e) => {
              e.stopPropagation();
              ed.select(props.block.id);
              setMenu(!menu());
            }}
          >
            <span class={`${locked() ? "i-lucide-lock" : "i-lucide-grip-vertical"} size-4`} />
          </button>
          <Show when={menu()}>
            <BlockMenu
              block={props.block}
              parentId={parentId()}
              parentType={props.parent?.type ?? null}
              index={props.index}
              editor={ed}
              onClose={() => setMenu(false)}
            />
          </Show>
        </div>
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

/** Insertion indicator: a line with a dot, aligned to the block's content edge. */
const DropLine: Component<{ position: "before" | "after" }> = (props) => (
  <div
    class={`pointer-events-none absolute left-7 right-0 z-20 flex items-center ${props.position === "before" ? "-top-[3px]" : "-bottom-[3px]"}`}
  >
    <span class="size-2 shrink-0 rounded-full border-2 border-primary-500 bg-default" />
    <span class="h-0.5 flex-1 rounded bg-primary-500" />
  </div>
);

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

// ─── Block actions menu (opened from the handle) ─────────────────────────────

const BlockMenu: Component<{
  block: BaseBlock;
  parentId: string | null;
  parentType: string | null;
  index: number;
  editor: BlockEditorState;
  onClose: () => void;
}> = (props) => {
  const ed = props.editor;
  let ref!: HTMLDivElement;
  const locked = () => !!props.block.isTemplated;
  const siblings = () => {
    const parent = props.parentId ? ed.get(props.parentId)?.block : null;
    return parent ? getChildren(parent).length : ed.doc.blocks.length;
  };
  const turnInto = () =>
    ed.registry
      .allowedChildren(props.parentType, props.parentType ? undefined : ed.allowedRootBlocks)
      .filter(
        (d) => d.inlineText && d.type !== props.block.type && ed.canPlace(d.type, props.parentId),
      );

  onSettled(() => {
    const away = (e: PointerEvent) => {
      if (!ref.parentElement?.contains(e.target as Node)) props.onClose();
    };
    const esc = (e: KeyboardEvent) => e.key === "Escape" && props.onClose();
    document.addEventListener("pointerdown", away, true);
    document.addEventListener("keydown", esc);
    return () => {
      document.removeEventListener("pointerdown", away, true);
      document.removeEventListener("keydown", esc);
    };
  });

  const item = (
    label: string,
    icon: string,
    fn: () => void,
    opts: { disabled?: boolean; danger?: boolean; hint?: string } = {},
  ) => (
    <RLButton
      variant="ghost"
      color={opts.danger ? "error" : "neutral"}
      class="w-full justify-start"
      role="menuitem"
      disabled={opts.disabled}
      leadingIcon={icon}
      label={label}
      trailingSlot={opts.hint ? <span class="text-[11px] text-muted">{opts.hint}</span> : undefined}
      onClick={(e: MouseEvent) => {
        e.stopPropagation();
        fn();
        props.onClose();
      }}
    />
  );
  const divider = () => <div class="my-1 border-t border-default" />;

  return (
    <div
      ref={(node) => (ref = node)}
      role="menu"
      class="absolute left-0 top-7 z-40 w-56 overflow-hidden rounded-lg border border-default bg-default py-1 shadow-xl"
      onClick={(e) => e.stopPropagation()}
    >
      <div class="flex items-center gap-2 px-3 pb-1.5 pt-1 text-[11px] font-medium text-muted">
        <span class={`${ed.registry.get(props.block.type)?.icon ?? "i-lucide-square"} size-3.5`} />
        {ed.registry.get(props.block.type)?.label ?? props.block.type}
        <Show when={locked()}>
          <span class="ml-auto flex items-center gap-1 text-warning-600">
            <span class="i-lucide-lock size-3" /> Locked
          </span>
        </Show>
      </div>
      {divider()}
      {item("Insert block above", "i-lucide-arrow-up-to-line", () =>
        ed.openInserter({ parentId: props.parentId, index: props.index }),
      )}
      {item("Insert block below", "i-lucide-arrow-down-to-line", () =>
        ed.openInserter({ parentId: props.parentId, index: props.index + 1 }),
      )}
      {divider()}
      {item("Move block up", "i-lucide-arrow-up", () => ed.moveBy(props.block.id, -1), {
        disabled: locked() || props.index === 0,
      })}
      {item("Move block down", "i-lucide-arrow-down", () => ed.moveBy(props.block.id, 1), {
        disabled: locked() || props.index >= siblings() - 1,
      })}
      {item("Duplicate block", "i-lucide-copy", () => ed.duplicate(props.block.id))}
      <Show when={!locked() && turnInto().length}>
        {divider()}
        <div class="px-3 pb-1 pt-1 text-[10px] font-semibold uppercase tracking-wide text-muted">
          Turn into
        </div>
        <div class="max-h-40 overflow-y-auto">
          <For each={turnInto()}>
            {(d) =>
              item(resolveLabel(d.label), d.icon ?? "i-lucide-square", () =>
                ed.transform(props.block.id, d.type),
              )
            }
          </For>
        </div>
      </Show>
      {divider()}
      {item("Delete block", "i-lucide-trash-2", () => ed.remove(props.block.id), {
        danger: true,
        disabled: locked(),
      })}
    </div>
  );
};

// ─── Block picker modal (shared by every "add block" entry point) ────────────

const CATEGORY_LABELS: Record<string, string> = {
  text: "Text",
  structure: "Layout",
  media: "Media",
  data: "Data",
  embed: "Embeds",
};
const CATEGORY_ORDER = Object.keys(CATEGORY_LABELS);
const categoryLabel = (c: string) =>
  CATEGORY_LABELS[c] ?? c.charAt(0).toUpperCase() + c.slice(1).replace(/[-_]/g, " ");

const BlockPicker: Component<{
  target: InsertTarget;
  editor: BlockEditorState;
  onClose: () => void;
}> = (props) => {
  const ed = props.editor;
  const [query, setQuery] = createSignal("");
  const [active, setActive] = createSignal(0);
  let input!: HTMLInputElement;
  let list!: HTMLDivElement;

  const parentType = () =>
    props.target.parentId ? (ed.get(props.target.parentId)?.block.type ?? null) : null;
  const title = () => {
    if (props.target.replaceId) return "Turn into";
    const p = parentType();
    return p ? `Add to ${resolveLabel(ed.registry.get(p)?.label) || p}` : "Add block";
  };

  const matches = createMemo(() => {
    const q = query().trim().toLowerCase();
    return (
      ed.registry
        .allowedChildren(parentType(), props.target.parentId ? undefined : ed.allowedRootBlocks)
        // Also enforces nesting limits (e.g. no seventh-level section).
        .filter((d) => ed.canPlace(d.type, props.target.parentId))
        .filter(
          (d) =>
            !q ||
            [
              resolveLabel(d.label),
              d.type,
              resolveLabel(d.description),
              d.category ?? "",
              ...(d.keywords ?? []),
            ].some((s) => s.toLowerCase().includes(q)),
        )
    );
  });

  /** Matches grouped by category (known categories first), plus a flat order for arrow keys. */
  const groups = createMemo(() => {
    const byCat = new Map<string, BlockDefinition[]>();
    for (const d of matches()) {
      const c = d.category ?? "other";
      byCat.set(c, [...(byCat.get(c) ?? []), d]);
    }
    const rank = (c: string) => {
      const i = CATEGORY_ORDER.indexOf(c);
      return i === -1 ? CATEGORY_ORDER.length + (c === "other" ? 1 : 0) : i;
    };
    return [...byCat.entries()]
      .sort(([a], [b]) => rank(a) - rank(b) || a.localeCompare(b))
      .map(([key, items]) => ({ key, label: categoryLabel(key), items }));
  });
  const flat = createMemo(() => groups().flatMap((g) => g.items));
  const indexOf = (d: BlockDefinition) => flat().indexOf(d);

  const choose = (d: BlockDefinition) => {
    const { replaceId, parentId, index } = props.target;
    props.onClose();
    if (replaceId) ed.transform(replaceId, d.type);
    else ed.insert(d.type, parentId, index);
  };

  const scrollActive = () =>
    queueMicrotask(() =>
      list
        ?.querySelector<HTMLElement>(`[data-index="${active()}"]`)
        ?.scrollIntoView({ block: "nearest" }),
    );

  onSettled(() => {
    // Return focus to whatever opened the picker (Add block, a slash, a handle) when it closes.
    const opener = document.activeElement as HTMLElement | null;
    input.focus();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
      if (opener?.isConnected) opener.focus();
    };
  });

  return (
    <Portal>
      <div
        class="fixed inset-0 z-50 flex items-start justify-center bg-black/50 p-4 pt-[10vh] backdrop-blur-[2px]"
        onClick={props.onClose}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title()}
          class="flex max-h-[75vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-default bg-default shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div class="flex items-center gap-3 border-b border-default px-4 py-3">
            <span class="i-lucide-search size-4 shrink-0 text-muted" />
            <RLInput
              ref={(node: HTMLInputElement) => (input = node)}
              variant="ghost"
              size="sm"
              class="min-w-0 flex-1"
              placeholder={`${title()} — search blocks…`}
              value={query()}
              onInput={(e) => {
                setQuery(e.currentTarget.value);
                setActive(0);
              }}
              onKeyDown={(e) => {
                const cols = window.innerWidth >= 640 ? 2 : 1;
                const move = (delta: number) => {
                  e.preventDefault();
                  setActive((i) => Math.max(0, Math.min(flat().length - 1, i + delta)));
                  scrollActive();
                };
                if (e.key === "ArrowDown") move(cols);
                else if (e.key === "ArrowUp") move(-cols);
                else if (e.key === "ArrowRight" && query() === "") move(1);
                else if (e.key === "ArrowLeft" && query() === "") move(-1);
                else if (e.key === "Enter") {
                  e.preventDefault();
                  const d = flat()[active()];
                  if (d) choose(d);
                } else if (e.key === "Escape") {
                  e.preventDefault();
                  props.onClose();
                }
              }}
            />
            <kbd class="rounded border border-default px-1.5 py-0.5 text-[10px] text-muted">
              Esc
            </kbd>
          </div>

          <div ref={(node) => (list = node)} class="min-h-0 flex-1 overflow-y-auto p-2">
            <For
              each={groups()}
              fallback={
                <RLEmpty
                  size="sm"
                  icon="i-lucide-search-x"
                  title={cmsT("text.no-blocks-match")}
                  description={
                    query() ? `Nothing found for “${query()}”.` : "No blocks can be added here."
                  }
                />
              }
            >
              {(group) => (
                <section class="mb-2">
                  <h3 class="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                    {group.label}
                  </h3>
                  <div class="grid grid-cols-1 gap-1 sm:grid-cols-2">
                    <For each={group.items}>
                      {(d) => (
                        <button
                          type="button"
                          data-index={indexOf(d)}
                          class={`flex items-start gap-3 rounded-lg border p-2.5 text-left transition-colors ${indexOf(d) === active() ? "border-primary-500/50 bg-primary-500/5" : "border-transparent hover:bg-elevated"}`}
                          onMouseMove={() => active() !== indexOf(d) && setActive(indexOf(d))}
                          onClick={() => choose(d)}
                        >
                          <span class="flex size-9 shrink-0 items-center justify-center rounded-md border border-default bg-elevated">
                            <span class={`${d.icon ?? "i-lucide-square"} size-4 text-toned`} />
                          </span>
                          <span class="flex min-w-0 flex-col gap-0.5">
                            <span class="text-sm font-medium text-highlighted">{d.label}</span>
                            <span class="line-clamp-2 text-xs text-muted">
                              {d.description ?? d.type}
                            </span>
                          </span>
                        </button>
                      )}
                    </For>
                  </div>
                </section>
              )}
            </For>
          </div>

          <div class="flex items-center gap-3 border-t border-default px-4 py-2 text-[11px] text-muted">
            <span>{cmsT("text.to-navigate")}</span>
            <span>{cmsT("text.to-insert")}</span>
            <span class="ml-auto">{flat().length} blocks</span>
          </div>
        </div>
      </div>
    </Portal>
  );
};

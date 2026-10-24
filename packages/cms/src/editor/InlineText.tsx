import { createEffect, onSettled, type Component } from "solid-js";
import type { InlineNode } from "../core/types/inline";
import { htmlToInline, inlineToHtml, toInlineNodes, toPlainText } from "./inline";

/**
 * A contenteditable text region.
 *
 * The DOM is the source of truth while the user types: we only write `innerHTML` on mount and
 * when the value changes from *outside* (undo, rollback, transform). That is what keeps the caret
 * stable — the old editor rebuilt the HTML on every keystroke.
 */
export interface InlineTextProps {
  blockId: string;
  value: unknown;
  /** "rich" stores InlineNode[]; "plain" stores a string (headings, labels). */
  mode: "rich" | "plain";
  placeholder?: string;
  class?: string;
  readOnly?: boolean;
  onChange: (value: InlineNode[] | string) => void;
  /** Enter without Shift. Receives the content after the caret (already removed from this block). */
  onEnter?: (after: InlineNode[] | string) => void;
  /** Backspace at the very start. `empty` tells whether the block has no text. */
  onBackspaceAtStart?: (empty: boolean) => void;
  /** "/" typed in an empty block. */
  onSlash?: (anchor: DOMRect) => void;
  /** Markdown-style shortcut typed at the start ("# ", "- ", "1. ", "> ", "```"). */
  onShortcut?: (shortcut: string) => boolean;
  onFocus?: () => void;
  ref?: (el: HTMLElement) => void;
}

const serialize = (el: HTMLElement, mode: "rich" | "plain") =>
  mode === "plain" ? (el.textContent ?? "").replace(/\n/g, " ") : htmlToInline(el);

const render = (value: unknown, mode: "rich" | "plain") =>
  mode === "plain"
    ? inlineToHtml([{ type: "text", text: toPlainText(value) }])
    : inlineToHtml(toInlineNodes(value));

function caretAtStart(el: HTMLElement): boolean {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return false;
  const range = document.createRange();
  range.selectNodeContents(el);
  range.setEnd(sel.getRangeAt(0).startContainer, sel.getRangeAt(0).startOffset);
  return range.toString().length === 0;
}

/** Removes everything after the caret from `el` and returns it as a detached fragment holder. */
function extractAfterCaret(el: HTMLElement): HTMLElement {
  const holder = document.createElement("div");
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return holder;
  const range = sel.getRangeAt(0).cloneRange();
  range.deleteContents();
  range.setEndAfter(el.lastChild ?? el);
  holder.appendChild(range.extractContents());
  return holder;
}

export function placeCaret(el: HTMLElement, at: "start" | "end") {
  el.focus();
  const range = document.createRange();
  range.selectNodeContents(el);
  range.collapse(at === "start");
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
}

function wrapSelection(tag: string) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return false;
  const range = sel.getRangeAt(0);
  const el = document.createElement(tag);
  el.appendChild(range.extractContents());
  range.insertNode(el);
  sel.removeAllRanges();
  const after = document.createRange();
  after.selectNodeContents(el);
  sel.addRange(after);
  return true;
}

const SHORTCUTS = ["# ", "## ", "### ", "- ", "* ", "1. ", "> ", "```", "---"];

export const InlineText: Component<InlineTextProps> = (props) => {
  let el!: HTMLDivElement;
  let lastEmitted = "";

  const emit = () => {
    const value = serialize(el, props.mode);
    lastEmitted = JSON.stringify(value);
    props.onChange(value);
    el.dataset["empty"] = String(!el.textContent);
  };

  onSettled(() => {
    el.innerHTML = render(props.value, props.mode);
    lastEmitted = JSON.stringify(props.mode === "plain" ? serialize(el, "plain") : htmlToInline(el));
    el.dataset["empty"] = String(!el.textContent);
    props.ref?.(el);
  });

  // External changes (undo/redo, rollback) re-render; our own echoes are ignored.
  createEffect(
    () => JSON.stringify(props.mode === "plain" ? toPlainText(props.value) : toInlineNodes(props.value)),
    (incoming) => {
      if (!el || incoming === lastEmitted) return;
      el.innerHTML = render(props.value, props.mode);
      lastEmitted = incoming;
      el.dataset["empty"] = String(!el.textContent);
    },
  );

  const onKeyDown = (e: KeyboardEvent) => {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && props.mode === "rich") {
      const tag = { b: "strong", i: "em", u: "u", e: "code" }[e.key.toLowerCase()];
      if (tag) {
        e.preventDefault();
        if (wrapSelection(tag)) emit();
        return;
      }
      if (e.key.toLowerCase() === "k") {
        e.preventDefault();
        const url = window.prompt("Link URL");
        if (url && wrapSelection("a")) {
          el.querySelector("a:not([href])")?.setAttribute("href", url);
          emit();
        }
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey && props.onEnter) {
      e.preventDefault();
      const holder = extractAfterCaret(el);
      emit();
      props.onEnter(serialize(holder, props.mode));
      return;
    }
    if (e.key === "Enter" && props.mode === "plain") {
      e.preventDefault();
      return;
    }
    if (e.key === "Backspace" && props.onBackspaceAtStart && caretAtStart(el)) {
      e.preventDefault();
      props.onBackspaceAtStart(!el.textContent);
      return;
    }
    if (e.key === "/" && !el.textContent && props.onSlash) {
      e.preventDefault();
      props.onSlash(el.getBoundingClientRect());
      return;
    }
    if ((e.key === "ArrowUp" || e.key === "ArrowDown") && !e.shiftKey) {
      focusSibling(el, e.key === "ArrowUp" ? -1 : 1, e);
    }
  };

  const onInput = () => {
    const text = el.textContent ?? "";
    if (props.onShortcut && SHORTCUTS.includes(text.replace(/ /g, " "))) {
      if (props.onShortcut(text.replace(/ /g, " ").trim())) {
        el.textContent = "";
        return;
      }
    }
    emit();
  };

  const onPaste = (e: ClipboardEvent) => {
    // Paste as plain text; rich HTML from other apps is not a valid inline AST.
    e.preventDefault();
    const text = e.clipboardData?.getData("text/plain") ?? "";
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return;
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const node = document.createTextNode(props.mode === "plain" ? text.replace(/\s*\n\s*/g, " ") : text);
    range.insertNode(node);
    range.setStartAfter(node);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
    emit();
  };

  return (
    <div
      ref={el}
      data-inline-text={props.blockId}
      data-placeholder={props.placeholder ?? ""}
      contenteditable={props.readOnly ? "false" : "true"}
      spellcheck
      class={`cms-inline-text outline-none whitespace-pre-wrap break-words ${props.class ?? ""}`}
      onInput={onInput}
      onKeyDown={onKeyDown}
      onPaste={onPaste}
      onFocus={() => props.onFocus?.()}
    />
  );
};

/** Moves focus to the previous/next inline text region when the caret is on the first/last line. */
function focusSibling(el: HTMLElement, dir: -1 | 1, e: KeyboardEvent) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const caret = sel.getRangeAt(0).getBoundingClientRect();
  const box = el.getBoundingClientRect();
  const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 20;
  const onEdge = caret.height === 0 || (dir < 0 ? caret.top - box.top < lineHeight : box.bottom - caret.bottom < lineHeight);
  if (!onEdge) return;
  const all = Array.from(document.querySelectorAll<HTMLElement>("[data-inline-text][contenteditable=true]"));
  const next = all[all.indexOf(el) + dir];
  if (next) {
    e.preventDefault();
    placeCaret(next, dir < 0 ? "end" : "start");
  }
}

import {
  For,
  Show,
  createEffect,
  createSignal,
  onCleanup,
  onSettled,
  type Component,
} from "solid-js";
import { Portal } from "@solidjs/web";
import type { InlineNode } from "../core/types/inline";
import { htmlToInline, inlineToHtml, mentionHtml, toInlineNodes, toPlainText } from "./inline";
import { useRichEditing, type MentionCandidate } from "./rich-context";

/**
 * A contenteditable text region.
 *
 * The DOM is the source of truth while the user types: we only write `innerHTML` on mount and
 * when the value changes from *outside* (undo, rollback, transform). That keeps the caret
 * stable.
 *
 * In "rich" mode it edits the inline AST: marks (Ctrl+B/I/U/E or the selection toolbar),
 * links (Ctrl+K or the toolbar; click a link to edit / open / remove it, Notion-style), and
 * entry mentions ("@" opens a search; mentions are shown in the entry collection's colour).
 */
export interface InlineTextProps {
  blockId: string;
  value: unknown;
  /** "rich" stores InlineNode[]; "plain" stores a string (labels). */
  mode: "rich" | "plain";
  placeholder?: string | undefined;
  class?: string | undefined;
  readOnly?: boolean | undefined;
  /** Allow line breaks (Shift+Enter or Enter when no `onEnter`) — e.g. multi-line fields. */
  multiline?: boolean | undefined;
  onChange: (value: InlineNode[] | string) => void;
  /** Enter without Shift. Receives the content after the caret (already removed from this block). */
  onEnter?: ((after: InlineNode[] | string) => void) | undefined;
  /** Backspace at the very start. `empty` tells whether the block has no text. */
  onBackspaceAtStart?: ((empty: boolean) => void) | undefined;
  /** "/" typed in an empty block. */
  onSlash?: ((anchor: DOMRect) => void) | undefined;
  /** Markdown-style shortcut typed at the start ("# ", "- ", "1. ", "> ", "```"). */
  onShortcut?: ((shortcut: string) => boolean) | undefined;
  onFocus?: (() => void) | undefined;
  ref?: ((el: HTMLElement) => void) | undefined;
}

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

function caretAfter(node: Node) {
  const range = document.createRange();
  range.setStartAfter(node);
  range.collapse(true);
  const sel = window.getSelection();
  sel?.removeAllRanges();
  sel?.addRange(range);
}

function wrapSelection(tag: string): HTMLElement | null {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0 || sel.isCollapsed) return null;
  const range = sel.getRangeAt(0);
  const el = document.createElement(tag);
  el.appendChild(range.extractContents());
  range.insertNode(el);
  sel.removeAllRanges();
  const after = document.createRange();
  after.selectNodeContents(el);
  sel.addRange(after);
  return el;
}

function unwrap(el: HTMLElement) {
  const parent = el.parentNode;
  if (!parent) return;
  while (el.firstChild) parent.insertBefore(el.firstChild, el);
  parent.removeChild(el);
}

/** "example.com" → "https://example.com"; keeps relative, anchor, mailto and tel links. */
export function normalizeUrl(input: string): string {
  const url = input.trim();
  if (!url) return "";
  if (/^([a-z][a-z0-9+.-]*:|\/|#|\?)/i.test(url)) return url;
  return `https://${url}`;
}

const SHORTCUTS = ["# ", "## ", "### ", "- ", "* ", "1. ", "> ", "```", "---"];

const MARK_COMMANDS: Record<string, string> = {
  b: "bold",
  i: "italic",
  u: "underline",
};

export const InlineText: Component<InlineTextProps> = (props) => {
  const rich = useRichEditing();
  const htmlOpts = { mentionColor: rich.mentionColor };
  let el = undefined as unknown as HTMLDivElement;
  let lastEmitted = "";

  // Floating UI state (rich mode only).
  const [toolbar, setToolbar] = createSignal<DOMRect | null>(null);
  const [link, setLink] = createSignal<{ anchor: HTMLAnchorElement; editing: boolean } | null>(
    null,
  );
  const [mention, setMention] = createSignal<{ range: Range; rect: DOMRect } | null>(null);
  let popoverActive = false;

  const serialize = (node: HTMLElement) =>
    props.mode === "rich"
      ? htmlToInline(node)
      : props.multiline
        ? (node.textContent ?? "")
        : (node.textContent ?? "").replace(/\n/g, " ");

  const render = (value: unknown) =>
    props.mode === "plain"
      ? inlineToHtml([{ type: "text", text: toPlainText(value) }])
      : inlineToHtml(toInlineNodes(value), htmlOpts);

  const emit = () => {
    const value = serialize(el);
    lastEmitted = JSON.stringify(value);
    props.onChange(value);
    el.dataset["empty"] = String(!el.textContent);
  };

  onSettled(() => {
    el.innerHTML = render(props.value);
    lastEmitted = JSON.stringify(serialize(el));
    el.dataset["empty"] = String(!el.textContent);
    props.ref?.(el);
  });

  // External changes (undo/redo, rollback) re-render; our own echoes are ignored.
  createEffect(
    () =>
      JSON.stringify(
        props.mode === "plain" ? toPlainText(props.value) : toInlineNodes(props.value),
      ),
    (incoming) => {
      if (!el || incoming === lastEmitted) return;
      el.innerHTML = render(props.value);
      lastEmitted = incoming;
      el.dataset["empty"] = String(!el.textContent);
    },
  );

  // Track the selection to show the format toolbar or the link popover.
  onSettled(() => {
    if (props.mode !== "rich") return;
    const onSelection = () => {
      if (popoverActive || mention()) return;
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || !el.contains(sel.anchorNode)) {
        setToolbar(null);
        if (!link()?.editing) setLink(null);
        return;
      }
      const range = sel.getRangeAt(0);
      if (!sel.isCollapsed && !props.readOnly) {
        setToolbar(range.getBoundingClientRect());
        setLink(null);
        return;
      }
      setToolbar(null);
      const anchor = (
        sel.anchorNode instanceof Element ? sel.anchorNode : sel.anchorNode?.parentElement
      )?.closest("a");
      if (anchor && el.contains(anchor)) setLink({ anchor, editing: false });
      else if (!link()?.editing) setLink(null);
    };
    document.addEventListener("selectionchange", onSelection);
    onCleanup(() => document.removeEventListener("selectionchange", onSelection));
  });

  const toggleMark = (mark: string) => {
    if (mark === "code") {
      const sel = window.getSelection();
      const inCode = (
        sel?.anchorNode instanceof Element ? sel.anchorNode : sel?.anchorNode?.parentElement
      )?.closest("code");
      if (inCode && el.contains(inCode)) unwrap(inCode);
      else wrapSelection("code");
    } else document.execCommand(mark);
    emit();
  };

  /** Ctrl+K / toolbar: link the selection, or edit the link under the caret. */
  const startLink = () => {
    const current = link()?.anchor;
    if (current) return setLink({ anchor: current, editing: true });
    const a = wrapSelection("a") as HTMLAnchorElement | null;
    if (!a) return;
    setToolbar(null);
    setLink({ anchor: a, editing: true });
  };

  const applyLink = (anchor: HTMLAnchorElement, url: string, newTab: boolean) => {
    const href = normalizeUrl(url);
    if (!href) unwrap(anchor);
    else {
      anchor.setAttribute("href", href);
      if (newTab) anchor.dataset["newTab"] = "true";
      else delete anchor.dataset["newTab"];
    }
    emit();
    setLink(null);
    popoverActive = false;
    el.focus();
    if (href && anchor.isConnected) caretAfter(anchor);
  };

  const removeLink = (anchor: HTMLAnchorElement) => {
    unwrap(anchor);
    emit();
    setLink(null);
    popoverActive = false;
    el.focus();
  };

  const openMention = () => {
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0) return false;
    const range = sel.getRangeAt(0).cloneRange();
    range.deleteContents();
    const rect = range.getBoundingClientRect();
    setMention({ range, rect: rect.height ? rect : el.getBoundingClientRect() });
    return true;
  };

  const finishMention = (choice: MentionCandidate | null, typed: string) => {
    const state = mention();
    setMention(null);
    if (!state) return;
    el.focus();
    const sel = window.getSelection();
    sel?.removeAllRanges();
    sel?.addRange(state.range);
    if (choice) {
      const holder = document.createElement("span");
      holder.innerHTML = mentionHtml(choice, htmlOpts);
      const chip = holder.firstChild!;
      const space = document.createTextNode(" ");
      state.range.insertNode(space);
      state.range.insertNode(chip);
      caretAfter(space);
    } else {
      const text = document.createTextNode(`@${typed}`);
      state.range.insertNode(text);
      caretAfter(text);
    }
    emit();
  };

  const onKeyDown = (e: KeyboardEvent) => {
    const mod = e.ctrlKey || e.metaKey;
    if (mod && props.mode === "rich" && !e.altKey) {
      const key = e.key.toLowerCase();
      const command = MARK_COMMANDS[key];
      if (command && !e.shiftKey) {
        e.preventDefault();
        toggleMark(command);
        return;
      }
      if (key === "e") {
        e.preventDefault();
        toggleMark("code");
        return;
      }
      if (key === "k") {
        e.preventDefault();
        startLink();
        return;
      }
    }
    if (e.key === "@" && props.mode === "rich" && rich.searchMentions && !props.readOnly) {
      if (openMention()) {
        e.preventDefault();
        return;
      }
    }
    if (e.key === "Enter" && !e.shiftKey && props.onEnter) {
      e.preventDefault();
      const holder = extractAfterCaret(el);
      emit();
      props.onEnter(serialize(holder));
      return;
    }
    if (e.key === "Enter" && props.mode === "plain" && !props.multiline) {
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
    if (props.onShortcut && SHORTCUTS.includes(text.replace(/ /g, " "))) {
      if (props.onShortcut(text.replace(/ /g, " ").trim())) {
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
    // Pasting a URL over selected text links it (like Notion).
    if (props.mode === "rich" && !sel.isCollapsed && /^https?:\/\/\S+$/i.test(text.trim())) {
      const a = wrapSelection("a");
      if (a) {
        a.setAttribute("href", text.trim());
        caretAfter(a);
        emit();
        return;
      }
    }
    const range = sel.getRangeAt(0);
    range.deleteContents();
    const node = document.createTextNode(
      props.mode === "plain" && !props.multiline ? text.replace(/\s*\n\s*/g, " ") : text,
    );
    range.insertNode(node);
    caretAfter(node);
    emit();
  };

  return (
    <>
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
        onBlur={() => {
          // Let clicks inside popovers land first.
          setTimeout(() => {
            if (!popoverActive && !mention() && !link()?.editing) {
              setToolbar(null);
              setLink(null);
            }
          }, 120);
        }}
      />

      <Show when={toolbar()}>
        {(rect) => (
          <FormatToolbar
            rect={rect()}
            onMark={toggleMark}
            onLink={startLink}
            onPointer={(active) => (popoverActive = active)}
          />
        )}
      </Show>

      <Show when={link()}>
        {(state) => (
          <LinkPopover
            anchor={state().anchor}
            editing={state().editing}
            readOnly={!!props.readOnly}
            onEdit={() => setLink({ anchor: state().anchor, editing: true })}
            onApply={(url, newTab) => applyLink(state().anchor, url, newTab)}
            onRemove={() => removeLink(state().anchor)}
            onCancel={() => {
              const a = state().anchor;
              if (!a.getAttribute("href")) removeLink(a);
              else setLink({ anchor: a, editing: false });
              popoverActive = false;
            }}
            onPointer={(active) => (popoverActive = active)}
          />
        )}
      </Show>

      <Show when={mention()}>
        {(state) => <MentionPicker rect={state().rect} onDone={finishMention} />}
      </Show>
    </>
  );
};

// ─── Floating pieces ─────────────────────────────────────────────────────────

const floatStyle = (rect: DOMRect, place: "above" | "below", width = 0) => {
  const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));
  return place === "above"
    ? { left: `${left}px`, top: `${Math.max(8, rect.top - 44)}px` }
    : { left: `${left}px`, top: `${rect.bottom + 6}px` };
};

const FormatToolbar: Component<{
  rect: DOMRect;
  onMark: (mark: string) => void;
  onLink: () => void;
  onPointer: (active: boolean) => void;
}> = (props) => {
  const btn = (icon: string, label: string, fn: () => void) => (
    <button
      type="button"
      title={label}
      aria-label={label}
      class="flex size-7 items-center justify-center rounded text-toned hover:bg-elevated hover:text-highlighted"
      onMouseDown={(e) => {
        // Keep the text selection.
        e.preventDefault();
        fn();
      }}
    >
      <span class={`${icon} size-4`} />
    </button>
  );
  return (
    <Portal>
      <div
        class="fixed z-[60] flex items-center gap-0.5 rounded-lg border border-default bg-default p-1 shadow-xl"
        style={floatStyle(props.rect, "above", 240)}
        onPointerEnter={() => props.onPointer(true)}
        onPointerLeave={() => props.onPointer(false)}
      >
        {btn("i-lucide-bold", "Bold (Ctrl+B)", () => props.onMark("bold"))}
        {btn("i-lucide-italic", "Italic (Ctrl+I)", () => props.onMark("italic"))}
        {btn("i-lucide-underline", "Underline (Ctrl+U)", () => props.onMark("underline"))}
        {btn("i-lucide-strikethrough", "Strikethrough", () => props.onMark("strikeThrough"))}
        {btn("i-lucide-code", "Code (Ctrl+E)", () => props.onMark("code"))}
        <span class="mx-0.5 h-5 w-px bg-default" />
        {btn("i-lucide-link", "Link (Ctrl+K)", props.onLink)}
      </div>
    </Portal>
  );
};

/** Notion-style link popover: shows the URL with open / edit / remove; or an editor. */
const LinkPopover: Component<{
  anchor: HTMLAnchorElement;
  editing: boolean;
  readOnly: boolean;
  onEdit: () => void;
  onApply: (url: string, newTab: boolean) => void;
  onRemove: () => void;
  onCancel: () => void;
  onPointer: (active: boolean) => void;
}> = (props) => {
  const href = () => props.anchor.getAttribute("href") ?? "";
  const [url, setUrl] = createSignal(href());
  const [newTab, setNewTab] = createSignal(props.anchor.dataset["newTab"] === "true");
  let input: HTMLInputElement | undefined;
  createEffect(
    () => props.editing,
    (editing) => {
      if (editing) {
        setUrl(href());
        queueMicrotask(() => input?.focus());
      }
    },
  );
  const rect = () => props.anchor.getBoundingClientRect();
  return (
    <Portal>
      <div
        class="fixed z-[60] flex items-center gap-1 rounded-lg border border-default bg-default p-1 text-xs shadow-xl"
        style={floatStyle(rect(), "below", 320)}
        onPointerEnter={() => props.onPointer(true)}
        onPointerLeave={() => props.onPointer(false)}
        onMouseDown={(e) => {
          if (!(e.target instanceof HTMLInputElement)) e.preventDefault();
        }}
      >
        <Show
          when={props.editing}
          fallback={
            <>
              <span class="i-lucide-globe ml-1.5 size-3.5 shrink-0 text-muted" />
              <a
                href={href()}
                target="_blank"
                rel="noopener noreferrer"
                class="max-w-56 truncate px-1 text-primary-500 hover:underline"
                title={href()}
              >
                {href()}
              </a>
              <Show when={!props.readOnly}>
                <span class="mx-0.5 h-4 w-px bg-default" />
                <button
                  type="button"
                  class="rounded px-2 py-1 text-toned hover:bg-elevated"
                  onClick={props.onEdit}
                >
                  Edit
                </button>
                <button
                  type="button"
                  title="Remove link"
                  aria-label="Remove link"
                  class="flex size-6 items-center justify-center rounded text-muted hover:bg-elevated hover:text-error-500"
                  onClick={props.onRemove}
                >
                  <span class="i-lucide-unlink size-3.5" />
                </button>
              </Show>
            </>
          }
        >
          <span class="i-lucide-link ml-1.5 size-3.5 shrink-0 text-muted" />
          <input
            ref={input}
            class="w-60 bg-transparent px-1 py-1 text-xs text-highlighted outline-none placeholder:text-muted"
            placeholder="Paste or type a link…"
            value={url()}
            onInput={(e) => setUrl(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                props.onApply(url(), newTab());
              } else if (e.key === "Escape") {
                e.preventDefault();
                props.onCancel();
              }
            }}
          />
          <button
            type="button"
            title="Open in a new tab"
            aria-pressed={newTab()}
            class={`flex size-6 items-center justify-center rounded ${newTab() ? "bg-primary-500/10 text-primary-500" : "text-muted hover:bg-elevated"}`}
            onClick={() => setNewTab(!newTab())}
          >
            <span class="i-lucide-external-link size-3.5" />
          </button>
          <button
            type="button"
            class="rounded bg-primary-500 px-2 py-1 font-medium text-white hover:bg-primary-600"
            onClick={() => props.onApply(url(), newTab())}
          >
            Save
          </button>
        </Show>
      </div>
    </Portal>
  );
};

/** "@" search over entries. Results show each entry's collection colour. */
const MentionPicker: Component<{
  rect: DOMRect;
  onDone: (choice: MentionCandidate | null, typed: string) => void;
}> = (props) => {
  const rich = useRichEditing();
  const [query, setQuery] = createSignal("");
  const [results, setResults] = createSignal<MentionCandidate[]>([]);
  const [loading, setLoading] = createSignal(false);
  const [active, setActive] = createSignal(0);
  let input!: HTMLInputElement;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let seq = 0;

  const search = (q: string) => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      const mine = ++seq;
      setLoading(true);
      try {
        const found = (await rich.searchMentions?.(q)) ?? [];
        if (mine === seq) {
          setResults(found);
          setActive(0);
        }
      } finally {
        if (mine === seq) setLoading(false);
      }
    }, 120);
  };

  onSettled(() => {
    input.focus();
    search("");
    const away = (e: PointerEvent) => {
      if (!(e.target as Element)?.closest?.("[data-mention-picker]")) props.onDone(null, query());
    };
    document.addEventListener("pointerdown", away, true);
    onCleanup(() => {
      clearTimeout(timer);
      document.removeEventListener("pointerdown", away, true);
    });
  });

  return (
    <Portal>
      <div
        data-mention-picker
        class="fixed z-[60] flex w-80 flex-col overflow-hidden rounded-lg border border-default bg-default shadow-2xl"
        style={floatStyle(props.rect, "below", 320)}
      >
        <div class="flex items-center gap-2 border-b border-default px-3 py-2">
          <span class="text-sm font-semibold text-muted">@</span>
          <input
            ref={input}
            class="min-w-0 flex-1 bg-transparent text-sm text-highlighted outline-none placeholder:text-muted"
            placeholder="Mention a page…"
            value={query()}
            onInput={(e) => {
              setQuery(e.currentTarget.value);
              search(e.currentTarget.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setActive((i) => Math.min(i + 1, results().length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setActive((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                const r = results()[active()];
                props.onDone(r ?? null, query());
              } else if (e.key === "Escape" || (e.key === "Backspace" && !query())) {
                e.preventDefault();
                props.onDone(null, query());
              } else if (e.key === " " && !results().length) {
                e.preventDefault();
                props.onDone(null, `${query()} `);
              }
            }}
          />
          <Show when={loading()}>
            <span class="i-lucide-loader-circle size-3.5 animate-spin text-muted" />
          </Show>
        </div>
        <div class="max-h-64 overflow-y-auto py-1">
          <For
            each={results()}
            fallback={
              <div class="px-3 py-3 text-xs text-muted">
                {loading() ? "Searching…" : "No pages found."}
              </div>
            }
          >
            {(r, i) => (
              <button
                type="button"
                class={`flex w-full items-center gap-2.5 px-3 py-1.5 text-left ${i() === active() ? "bg-elevated" : ""}`}
                onMouseMove={() => setActive(i())}
                onClick={() => props.onDone(r, query())}
              >
                <span
                  class="flex size-6 shrink-0 items-center justify-center rounded"
                  style={{
                    color: rich.mentionColor(r.collection),
                    background: `color-mix(in srgb, ${rich.mentionColor(r.collection)} 15%, transparent)`,
                  }}
                >
                  <span
                    class={`${rich.mentionIcon(r.collection) ?? "i-lucide-file-text"} size-3.5`}
                  />
                </span>
                <span class="flex min-w-0 flex-col">
                  <span class="truncate text-sm text-highlighted">{r.title || r.slug}</span>
                  <span class="truncate text-[11px] text-muted">
                    {rich.collectionLabel(r.collection)} · /{r.slug}
                  </span>
                </span>
              </button>
            )}
          </For>
        </div>
      </div>
    </Portal>
  );
};

/** Moves focus to the previous/next inline text region when the caret is on the first/last line. */
function focusSibling(el: HTMLElement, dir: -1 | 1, e: KeyboardEvent) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return;
  const caret = sel.getRangeAt(0).getBoundingClientRect();
  const box = el.getBoundingClientRect();
  const lineHeight = parseFloat(getComputedStyle(el).lineHeight) || 20;
  const onEdge =
    caret.height === 0 ||
    (dir < 0 ? caret.top - box.top < lineHeight : box.bottom - caret.bottom < lineHeight);
  if (!onEdge) return;
  const all = Array.from(
    document.querySelectorAll<HTMLElement>("[data-inline-text][contenteditable=true]"),
  );
  const next = all[all.indexOf(el) + dir];
  if (next) {
    e.preventDefault();
    placeCaret(next, dir < 0 ? "end" : "start");
  }
}

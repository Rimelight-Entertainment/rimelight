import { createMemo, createSignal, For, onSettled, Show, omit, type Component } from "solid-js";
import type { JSX } from "@solidjs/web";
import { Portal } from "@solidjs/web";
import type { SearchProps } from "./search";
import { searchTheme } from "./search.theme";
import { RLIcon } from "../icon/RLIcon";
import { RLInput } from "../input/RLInput";
import { RLKbd } from "../kbd/RLKbd";
import { RLButton } from "../button/RLButton";
import { defineShortcuts } from "../../shortcuts";

export interface SearchResultItem {
  title?: string;
  url?: string;
  sourceType?: string;
  snippet?: string;
  [key: string]: any;
}

export interface RLSearchProps extends SearchProps {
  children?: JSX.Element;
  triggerSlot?: JSX.Element;
}

const modalId = `rl-search-${Math.random().toString(36).substring(2, 9)}`;

const RLSearch: Component<RLSearchProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
    "endpoint",
    "placeholder",
    "messages",
    "ui",
    "class",
    "children",
    "triggerSlot",
  );

  const endpoint = () => props.endpoint ?? "/api/search";
  const searchPlaceholder = () =>
    props.messages?.searchPlaceholder || props.placeholder || "Search...";
  const noResultsLabel = () => props.messages?.noResultsLabel || "No results found";
  const footerBackendHint = () => props.messages?.footerBackendHint || "Site Search";

  const [isOpen, setIsOpen] = createSignal(false);
  const [query, setQuery] = createSignal("");
  const [results, setResults] = createSignal<SearchResultItem[]>([]);
  const [hasSearched, setHasSearched] = createSignal(false);
  const [loading, setLoading] = createSignal(false);

  let inputRef: HTMLInputElement | null = null;
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;

  const openModal = () => {
    setIsOpen(true);
    if (typeof document !== "undefined") {
      document.body.style.overflow = "hidden";
    }
    setTimeout(() => {
      inputRef?.focus();
      inputRef?.select();
    }, 50);
  };

  const closeModal = () => {
    setIsOpen(false);
    if (typeof document !== "undefined") {
      document.body.style.overflow = "";
    }
    setQuery("");
    setResults([]);
    setHasSearched(false);
    if (debounceTimer) clearTimeout(debounceTimer);
  };

  const toggleModal = () => {
    if (isOpen()) {
      closeModal();
    } else {
      openModal();
    }
  };

  onSettled(() => {
    const handleOpen = () => openModal();
    const handleToggle = () => toggleModal();

    document.addEventListener("rl-search:open", handleOpen);
    document.addEventListener("rla-search:open", handleOpen);
    document.addEventListener("search:open", handleOpen);
    document.addEventListener("rl-search:toggle", handleToggle);

    const searchShortcutCleanup = defineShortcuts({
      meta_k: {
        handler: () => toggleModal(),
        label: "Search",
        description: "Open site search",
        category: "navigation",
        order: 0,
      },
      "/": {
        handler: () => {
          if (!isOpen()) openModal();
        },
        label: "Quick Search",
        description: "Focus site search",
        category: "navigation",
        order: 1,
      },
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen()) {
        closeModal();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("rl-search:open", handleOpen);
      document.removeEventListener("rla-search:open", handleOpen);
      document.removeEventListener("search:open", handleOpen);
      document.removeEventListener("rl-search:toggle", handleToggle);
      window.removeEventListener("keydown", onKeyDown);
      if (typeof document !== "undefined") {
        document.body.style.overflow = "";
      }
      if (debounceTimer) clearTimeout(debounceTimer);
      searchShortcutCleanup();
    };
  });

  const handleInput = (val: string) => {
    setQuery(val);
    if (debounceTimer) clearTimeout(debounceTimer);

    const trimmed = val.trim();
    if (!trimmed) {
      setResults([]);
      setHasSearched(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceTimer = setTimeout(async () => {
      try {
        const res = await fetch(`${endpoint()}?q=${encodeURIComponent(trimmed)}`);
        if (!res.ok) throw new Error(`HTTP status ${res.status}`);
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
        setHasSearched(true);
      } catch (err) {
        console.error("[RLSearch] Search query failed:", err);
        setResults([]);
        setHasSearched(true);
      } finally {
        setLoading(false);
      }
    }, 200);
  };

  const resolvedClasses = createMemo(() =>
    searchTheme({
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <div class={`${resolvedClasses().root} rl-search-wrapper`} data-slot="root" {...rest}>
      {props.triggerSlot ? (
        <div class="cursor-pointer" onClick={toggleModal}>
          {props.triggerSlot}
        </div>
      ) : props.children ? (
        <div class="cursor-pointer" onClick={toggleModal}>
          {props.children}
        </div>
      ) : (
        <RLButton
          variant="ghost"
          color="neutral"
          square
          leadingIcon="search"
          aria-label="Search"
          onClick={toggleModal}
        />
      )}

      <Show when={isOpen()}>
        <Portal>
          <div
            class={resolvedClasses().modal}
            data-slot="modal"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeModal();
            }}
          >
            <div
              id={modalId}
              class={resolvedClasses().dialog}
              data-slot="dialog"
              role="dialog"
              aria-modal="true"
              aria-label="Search"
            >
              <div class={resolvedClasses().header} data-slot="header">
                <RLInput
                  ref={(el) => (inputRef = el)}
                  variant="ghost"
                  type="text"
                  value={query()}
                  placeholder={searchPlaceholder()}
                  autocomplete="off"
                  onInput={(e) => handleInput(e.currentTarget.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") {
                      e.stopPropagation();
                      closeModal();
                    }
                  }}
                  leading={<RLIcon name="search" class={resolvedClasses().headerIcon} />}
                  trailing={
                    <div class="flex items-center gap-2">
                      <Show when={loading()}>
                        <RLIcon name="loaderCircle" class="size-4 animate-spin text-muted" />
                      </Show>
                      <RLKbd size="sm">Esc</RLKbd>
                      <button
                        type="button"
                        class={resolvedClasses().close}
                        aria-label="Close search"
                        onClick={closeModal}
                        data-slot="close"
                      >
                        <RLIcon name="close" class={resolvedClasses().closeIcon} />
                      </button>
                    </div>
                  }
                  ui={{
                    root: "relative flex items-center w-full !bg-transparent !border-none !shadow-none !p-0 !ring-0",
                    input:
                      "w-full bg-transparent px-3 py-1 text-sm outline-none text-highlighted placeholder:text-muted",
                    leading: "flex items-center justify-center text-muted",
                    trailing: "flex items-center gap-2",
                  }}
                />
              </div>

              <div class={resolvedClasses().results} data-slot="results">
                <For each={results()}>
                  {(item) => (
                    <a
                      href={item.url || "#"}
                      class={resolvedClasses().resultItem}
                      onClick={closeModal}
                    >
                      <div class={resolvedClasses().resultHeader}>
                        <span class={resolvedClasses().resultTitle}>
                          {item.title || "Untitled"}
                        </span>
                        {item.sourceType && (
                          <span class={resolvedClasses().resultBadge}>{item.sourceType}</span>
                        )}
                      </div>
                      {item.snippet && (
                        <p class={resolvedClasses().resultSnippet}>{item.snippet}</p>
                      )}
                    </a>
                  )}
                </For>
              </div>

              <Show when={hasSearched() && results().length === 0 && !loading()}>
                <div class={resolvedClasses().empty} data-slot="empty">
                  {noResultsLabel()}
                </div>
              </Show>

              <div class={resolvedClasses().footer} data-slot="footer">
                <span class="flex items-center gap-1">
                  Press <RLKbd size="sm">Esc</RLKbd> to close
                </span>
                <span>{footerBackendHint()}</span>
              </div>
            </div>
          </div>
        </Portal>
      </Show>
    </div>
  );
};

export { RLSearch };

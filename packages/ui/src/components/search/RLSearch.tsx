import type { RLSearchProps, SearchResultItem } from "./search.types";
import { RLSearchTheme } from "./search.theme";
import { createSignal, For, onSettled, Show, type Component } from "solid-js";
import { Portal } from "@solidjs/web";
import { RLIcon } from "../icon/RLIcon";
import { RLInput } from "../input/RLInput";
import { RLKbd } from "../kbd/RLKbd";
import { RLButton } from "../button/RLButton";
import { defineShortcuts } from "../../shortcuts";
import { uiNodes, uiT } from "../../locale";

const OMIT_KEYS = ["endpoint", "placeholder", "messages", "triggerSlot"] as const;

export const RLSearch: Component<RLSearchProps> = (props) => {
  const {
    Tag,
    classes,
    rest,
    id: modalId,
  } = RLSearchTheme.setup(props, {
    omit: OMIT_KEYS,
    idPrefix: "rl-search",
  });

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
    document.body.style.overflow = "hidden";
    setTimeout(() => {
      inputRef?.focus();
      inputRef?.select();
    }, 50);
  };

  const closeModal = () => {
    setIsOpen(false);
    document.body.style.overflow = "";
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
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
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

  return (
    <Tag class={`${classes().root} rl-search-wrapper`} data-slot="root" {...rest}>
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
          aria-label={uiT("search.label")}
          onClick={toggleModal}
        />
      )}

      <Show when={isOpen()}>
        <Portal>
          <div
            class={classes().modal}
            data-slot="modal"
            onClick={(e) => {
              if (e.target === e.currentTarget) closeModal();
            }}
          >
            <div
              id={modalId()}
              class={classes().dialog}
              data-slot="dialog"
              role="dialog"
              aria-modal="true"
              aria-label={uiT("search.label")}
            >
              <div class={classes().header} data-slot="header">
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
                  leading={<RLIcon name="search" class={classes().headerIcon} />}
                  trailing={
                    <div class="flex items-center gap-2">
                      <Show when={loading()}>
                        <RLIcon name="loader-circle" class="size-4 animate-spin text-muted" />
                      </Show>
                      <RLKbd size="sm">Esc</RLKbd>
                      <button
                        type="button"
                        class={classes().close}
                        aria-label={uiT("search.close")}
                        onClick={closeModal}
                        data-slot="close"
                      >
                        <RLIcon name="x" class={classes().closeIcon} />
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

              <div class={classes().results} data-slot="results">
                <For each={results()}>
                  {(item) => (
                    <a href={item.url || "#"} class={classes().resultItem} onClick={closeModal}>
                      <div class={classes().resultHeader}>
                        <span class={classes().resultTitle}>{item.title || "Untitled"}</span>
                        {item.sourceType && (
                          <span class={classes().resultBadge}>{item.sourceType}</span>
                        )}
                      </div>
                      {item.snippet && <p class={classes().resultSnippet}>{item.snippet}</p>}
                    </a>
                  )}
                </For>
              </div>

              <Show when={hasSearched() && results().length === 0 && !loading()}>
                <div class={classes().empty} data-slot="empty">
                  {noResultsLabel()}
                </div>
              </Show>

              <div class={classes().footer} data-slot="footer">
                <span class="flex items-center gap-1">
                  {uiNodes("search.press-to-close", { escape: <RLKbd size="sm">Esc</RLKbd> })}
                </span>
                <span>{footerBackendHint()}</span>
              </div>
            </div>
          </div>
        </Portal>
      </Show>
    </Tag>
  );
};

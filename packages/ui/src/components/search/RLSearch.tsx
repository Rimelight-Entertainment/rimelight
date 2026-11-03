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
import { createControllable } from "../../controllable";

export const RLSearch: Component<RLSearchProps> = (props) => {
  const [open, setOpen] = createControllable<boolean>(
    () => props.open,
    props.defaultOpen ?? false,
    (next) => props.onOpenChange?.(next),
  );

  const {
    Tag,
    classes,
    rest,
    children,
    id: modalId,
    slots,
    theme,
  } = RLSearchTheme.setup(props, {
    omit: [
      "id",
      "endpoint",
      "placeholder",
      "messages",
      "open",
      "defaultOpen",
      "onOpenChange",
    ] as const,
    slots: ["triggerSlot"] as const,
    idPrefix: "rl-search",
  });

  const endpoint = () => props.endpoint ?? "/api/search";
  const searchPlaceholder = () =>
    props.messages?.searchPlaceholder || props.placeholder || uiT("search.placeholder");
  const noResultsLabel = () => props.messages?.noResultsLabel || uiT("search.no-results");
  const footerBackendHint = () => props.messages?.footerBackendHint || uiT("search.site-search");

  const [query, setQuery] = createSignal("");
  const [results, setResults] = createSignal<SearchResultItem[]>([]);
  const [hasSearched, setHasSearched] = createSignal(false);
  const [loading, setLoading] = createSignal(false);

  let inputRef: HTMLInputElement | null = null;
  let debounceTimer: ReturnType<typeof setTimeout> | undefined;

  const openModal = () => {
    setOpen(true);
    document.body.style.overflow = "hidden";
    setTimeout(() => {
      inputRef?.focus();
      inputRef?.select();
    }, 50);
  };

  const closeModal = () => {
    setOpen(false);
    document.body.style.overflow = "";
    setQuery("");
    setResults([]);
    setHasSearched(false);
    clearTimeout(debounceTimer);
  };

  const toggleModal = () => {
    if (open()) {
      closeModal();
    } else {
      openModal();
    }
  };

  onSettled(() => {
    const searchShortcutCleanup = defineShortcuts({
      meta_k: {
        handler: () => toggleModal(),
        label: uiT("search.label"),
        description: uiT("search.shortcut-open"),
        category: "navigation",
        order: 0,
      },
      "/": {
        handler: () => {
          if (!open()) openModal();
        },
        label: uiT("search.shortcut-quick"),
        description: uiT("search.shortcut-quick-description"),
        category: "navigation",
        order: 1,
      },
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open()) {
        closeModal();
      }
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
      clearTimeout(debounceTimer);
      searchShortcutCleanup();
    };
  });

  const handleInput = (val: string) => {
    setQuery(val);
    clearTimeout(debounceTimer);

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
    <Tag
      data-slot="root"
      data-theme={theme()}
      class={`${classes().root} rl-search-wrapper`}
      {...rest}
    >
      {slots.triggerSlot() ? (
        <div class="cursor-pointer" onClick={toggleModal}>
          {slots.triggerSlot()}
        </div>
      ) : children() ? (
        <div class="cursor-pointer" onClick={toggleModal}>
          {children()}
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

      <Show when={open()}>
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
                  ref={(el) => {
                    inputRef = el;
                  }}
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
                  leadingSlot={<RLIcon name="search" class={classes().headerIcon} />}
                  trailingSlot={
                    <div class="flex items-center gap-2">
                      <Show when={loading()}>
                        <RLIcon name="loader-circle" class="size-4 animate-spin text-muted" />
                      </Show>
                      <RLKbd size="sm">{uiT("search.esc")}</RLKbd>
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
                        <span class={classes().resultTitle}>
                          {item.title || uiT("search.untitled")}
                        </span>
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
                  {uiNodes("search.press-to-close", {
                    escape: <RLKbd size="sm">{uiT("search.esc")}</RLKbd>,
                  })}
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

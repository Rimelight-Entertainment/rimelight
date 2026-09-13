import {
  createMemo,
  createSignal,
  For,
  onCleanup,
  onMount,
  Show,
  splitProps,
  type Component,
  type JSX
} from "solid-js"
import type { SearchProps } from "./search"
import { searchTheme } from "./search.theme"
import RLSIcon from "../icon/RLSIcon"
import RLSInput from "../input/RLSInput"
import RLSKbd from "../kbd/RLSKbd"
import RLSButton from "../button/RLSButton"
import { defineShortcuts } from "../../shortcuts"

export interface SearchResultItem {
  title?: string
  url?: string
  sourceType?: string
  snippet?: string
  [key: string]: any
}

export interface RLSSearchProps extends SearchProps {
  children?: JSX.Element
  triggerSlot?: JSX.Element
}

const RLSSearch: Component<RLSSearchProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "endpoint",
    "placeholder",
    "messages",
    "ui",
    "class",
    "children",
    "triggerSlot"
  ])

  const endpoint = () => props.endpoint ?? "/api/search"
  const searchPlaceholder = () =>
    props.messages?.searchPlaceholder || props.placeholder || "Search..."
  const noResultsLabel = () => props.messages?.noResultsLabel || "No results found"
  const footerCloseHint = () => props.messages?.footerCloseHint || "Escape to close"
  const footerBackendHint = () => props.messages?.footerBackendHint || "Postgres Full-Text Search"

  const [isOpen, setIsOpen] = createSignal(false)
  const [query, setQuery] = createSignal("")
  const [results, setResults] = createSignal<SearchResultItem[]>([])
  const [hasSearched, setHasSearched] = createSignal(false)
  const [loading, setLoading] = createSignal(false)

  let inputRef: HTMLInputElement | null = null
  let debounceTimer: ReturnType<typeof setTimeout> | undefined

  const openModal = () => {
    setIsOpen(true)
    setTimeout(() => inputRef?.focus(), 50)
  }

  const closeModal = () => {
    setIsOpen(false)
    setQuery("")
    setResults([])
    setHasSearched(false)
    if (debounceTimer) clearTimeout(debounceTimer)
  }

  onMount(() => {
    const metaKCleanup = defineShortcuts({
      meta_k: {
        handler: () => openModal(),
        label: "Open Search",
        description: "Open the global site search modal",
        category: "navigation"
      }
    })

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen()) {
        closeModal()
      }
    }

    window.addEventListener("keydown", onKeyDown)

    onCleanup(() => {
      metaKCleanup()
      window.removeEventListener("keydown", onKeyDown)
      if (debounceTimer) clearTimeout(debounceTimer)
    })
  })

  const handleInput = (val: string) => {
    setQuery(val)
    if (debounceTimer) clearTimeout(debounceTimer)

    const trimmed = val.trim()
    if (!trimmed) {
      setResults([])
      setHasSearched(false)
      setLoading(false)
      return
    }

    setLoading(true)
    debounceTimer = setTimeout(async () => {
      try {
        const res = await fetch(`${endpoint()}?q=${encodeURIComponent(trimmed)}`)
        if (!res.ok) throw new Error(`HTTP status ${res.status}`)
        const data = await res.json()
        setResults(Array.isArray(data) ? data : [])
        setHasSearched(true)
      } catch (err) {
        console.error("[RLSSearch] Search query failed:", err)
        setResults([])
        setHasSearched(true)
      } finally {
        setLoading(false)
      }
    }, 200)
  }

  const resolvedClasses = createMemo(() =>
    searchTheme({
      ui: props.ui,
      class: props.class
    })
  )

  return (
    <div class={`${resolvedClasses().root} rla-search-wrapper`} data-slot="root" {...rest}>
      {props.triggerSlot ? (
        <div class="cursor-pointer" onClick={openModal}>
          {props.triggerSlot}
        </div>
      ) : props.children ? (
        <div class="cursor-pointer" onClick={openModal}>
          {props.children}
        </div>
      ) : (
        <RLSButton
          variant="ghost"
          color="neutral"
          square
          aria-label="Open Search"
          onClick={openModal}
        >
          <RLSIcon name="i-rl-search" class="w-5 h-5" />
        </RLSButton>
      )}

      <Show when={isOpen()}>
        <div
          class={resolvedClasses().modal}
          style={{ display: "flex" }}
          data-slot="modal"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal()
          }}
        >
          <div class={resolvedClasses().dialog} data-slot="dialog">
            <div class={resolvedClasses().header} data-slot="header">
              <RLSInput
                ref={(el) => (inputRef = el)}
                variant="ghost"
                type="text"
                value={query()}
                placeholder={searchPlaceholder()}
                autocomplete="off"
                onInput={(e) => handleInput(e.currentTarget.value)}
                leading={<RLSIcon name="i-rl-search" class={resolvedClasses().headerIcon} />}
                trailing={
                  <div class="flex items-center gap-2">
                    <RLSKbd size="sm">Esc</RLSKbd>
                    <button
                      type="button"
                      class={resolvedClasses().close}
                      aria-label="Close search"
                      onClick={closeModal}
                    >
                      <RLSIcon name="i-rl-close" class={resolvedClasses().closeIcon} />
                    </button>
                  </div>
                }
                ui={{
                  root: "relative flex items-center w-full",
                  input:
                    "pl-8 pr-20 py-1.5 text-base outline-none text-white placeholder-neutral-500",
                  leading: "absolute left-0 text-neutral-400 flex items-center",
                  trailing: "absolute right-0 flex items-center gap-2"
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
                      <span class={resolvedClasses().resultTitle}>{item.title || "Untitled"}</span>
                      {item.sourceType && (
                        <span class={resolvedClasses().resultBadge}>{item.sourceType}</span>
                      )}
                    </div>
                    {item.snippet && <p class={resolvedClasses().resultSnippet}>{item.snippet}</p>}
                  </a>
                )}
              </For>
            </div>

            <Show when={hasSearched() && results().length === 0 && !loading()}>
              <div class={resolvedClasses().empty} style={{ display: "block" }} data-slot="empty">
                {noResultsLabel()}
              </div>
            </Show>

            <div class={resolvedClasses().footer} data-slot="footer">
              <span>{footerCloseHint()}</span>
              <span>{footerBackendHint()}</span>
            </div>
          </div>
        </div>
      </Show>
    </div>
  )
}

export default RLSSearch

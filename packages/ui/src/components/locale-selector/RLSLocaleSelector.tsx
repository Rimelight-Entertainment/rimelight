import {
  createMemo,
  createSignal,
  splitProps,
  onMount,
  onCleanup,
  For,
  Show,
  type Component,
  type JSX
} from "solid-js"
import type { LocaleSelectorProps, LocaleItem } from "./locale-selector"
import { localeSelectorTheme } from "./locale-selector.theme"
import RLSIcon from "../icon/RLSIcon"

export interface RLSLocaleSelectorProps extends LocaleSelectorProps {
  children?: JSX.Element
  labelSlot?: JSX.Element
  onSelect?: (item: LocaleItem) => void
}

const getLocaleDisplayName = (localeCode: string): string => {
  try {
    const formatter = new Intl.DisplayNames([localeCode], { type: "language" })
    const nativeName = formatter.of(localeCode)
    return nativeName
      ? nativeName.charAt(0).toUpperCase() + nativeName.slice(1)
      : localeCode.toUpperCase()
  } catch {
    return localeCode.toUpperCase()
  }
}

const RLSLocaleSelector: Component<RLSLocaleSelectorProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "locales",
    "currentLocale",
    "variant",
    "size",
    "theme",
    "ui",
    "class",
    "children",
    "labelSlot",
    "onSelect"
  ])

  const [isOpen, setIsOpen] = createSignal(false)
  let containerRef: HTMLDivElement | undefined

  onMount(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (isOpen() && containerRef && !containerRef.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("click", handleOutsideClick)
    onCleanup(() => document.removeEventListener("click", handleOutsideClick))
  })

  const currentCode = (): string => props.currentLocale ?? "en"

  const processedLocales = createMemo<LocaleItem[]>(() =>
    (props.locales ?? []).map((item) =>
      typeof item === "string"
        ? { code: item, label: getLocaleDisplayName(item) }
        : { ...item, label: item.label || getLocaleDisplayName(item.code) }
    )
  )

  const items = createMemo(() =>
    typeof window === "undefined"
      ? []
      : processedLocales().map((item) => {
          let targetUrl: string
          if (item.href !== undefined && item.href !== null) {
            targetUrl = item.href + (item.href.includes("?") ? "" : window.location.search)
          } else {
            const knownCodes = new Set(processedLocales().map((l) => l.code))
            const pathname = window.location.pathname
            const segments = pathname.split("/").filter(Boolean)
            const firstIsLocale = segments.length > 0 && knownCodes.has(segments[0]!)

            if (firstIsLocale) {
              segments[0] = item.code
              targetUrl = `/${segments.join("/")}${pathname.endsWith("/") ? "/" : ""}${window.location.search}`
            } else if (segments.length > 0) {
              targetUrl = `/${item.code}/${segments.join("/")}${pathname.endsWith("/") ? "/" : ""}${window.location.search}`
            } else {
              targetUrl = `/${item.code}/${window.location.search}`
            }
          }
          return { label: item.label, value: targetUrl, code: item.code }
        })
  )

  const currentItem = createMemo(() => items().find((item) => item.code === currentCode()))

  const resolvedClasses = createMemo(() =>
    localeSelectorTheme({
      variant: props.variant ?? "default",
      size: props.size ?? "md",
      theme: props.theme,
      ui: props.ui,
      class: props.class
    })
  )

  const selectLocale = (item: { label: string; value: string; code: string }) => {
    setIsOpen(false)
    props.onSelect?.({ label: item.label, code: item.code, href: item.value })
    if (item.value) {
      window.location.href = item.value
    }
  }

  return (
    <div
      ref={(el) => (containerRef = el)}
      class={resolvedClasses().root}
      data-slot="root"
      data-theme={props.theme}
      {...rest}
    >
      <Show when={props.labelSlot}>
        <label class={resolvedClasses().label} data-slot="label">
          {props.labelSlot}
        </label>
      </Show>

      <div class={resolvedClasses().wrapper} data-slot="wrapper">
        <button
          type="button"
          class={`${resolvedClasses().select}  flex items-center justify-between gap-2 text-left`}
          data-slot="trigger"
          aria-haspopup="listbox"
          aria-expanded={isOpen() ? "true" : "false"}
          onClick={() => setIsOpen(!isOpen())}
        >
          <span class="truncate">{currentItem()?.label || currentCode()}</span>
          <span class={resolvedClasses().iconWrapper}>
            <RLSIcon name="chevronDown" size="sm" aria-hidden="true" />
          </span>
        </button>

        <Show when={isOpen()}>
          <div
            class="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-default bg-default py-1 shadow-xl"
            data-slot="options"
            role="listbox"
          >
            <For each={items()}>
              {(item) => {
                const selected = item.code === currentCode()
                return (
                  <button
                    type="button"
                    class={`${resolvedClasses().option}  flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-sm transition-colors hover:bg-accented/50 ${selected ? "font-medium" : ""}`}
                    data-slot="option"
                    role="option"
                    aria-selected={selected ? "true" : "false"}
                    onClick={() => selectLocale(item)}
                  >
                    <span class="truncate">{item.label}</span>
                    <Show when={selected}>
                      <RLSIcon name="check" size="xs" class="shrink-0" aria-hidden="true" />
                    </Show>
                  </button>
                )
              }}
            </For>
          </div>
        </Show>
      </div>
    </div>
  )
}

export default RLSLocaleSelector

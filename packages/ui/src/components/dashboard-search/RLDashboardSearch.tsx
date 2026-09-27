import {
  createEffect,
  createMemo,
  createSignal,
  onSettled,
  Show,
  omit,
  type Component
} from "solid-js"
import type { JSX } from "@solidjs/web"
import type { DashboardSearchProps } from "./dashboard-search"
import { dashboardSearchTheme } from "./dashboard-search.theme"
import { RLIcon } from "../icon/RLIcon"

export interface RLDashboardSearchProps extends DashboardSearchProps {
  children?: JSX.Element
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

const RLDashboardSearch: Component<RLDashboardSearchProps> = (allProps) => {
  const props = allProps
  const rest = omit(allProps, "ui", "class", "children", "open", "onOpenChange")

  const [isOpen, setIsOpen] = createSignal(props.open ?? false)
  let inputRef: HTMLInputElement | null = null

  createEffect(
    () => props.open,
    (open) => {
      if (open !== undefined) {
        setIsOpen(open)
      }
    }
  )

  const setOpenState = (open: boolean) => {
    if (props.open === undefined) {
      setIsOpen(open)
    }
    props.onOpenChange?.(open)
    if (open) {
      setTimeout(() => inputRef?.focus(), 50)
    }
  }

  onSettled(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        setOpenState(!isOpen())
      } else if (e.key === "Escape" && isOpen()) {
        setOpenState(false)
      }
    }

    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null
      const btn = target?.closest("[data-dashboard-search-button]")
      if (btn) {
        setOpenState(!isOpen())
      }
    }

    document.addEventListener("keydown", onKeyDown)
    document.addEventListener("click", onClick)

    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.removeEventListener("click", onClick)
    }
  })

  const resolvedClasses = createMemo(() =>
    dashboardSearchTheme({
      ui: props.ui,
      class: props.class,
      fullscreen: false,
      size: "md"
    })
  )

  return (
    <div data-dashboard-search-target data-slot="root" {...rest}>
      {props.children}

      <Show when={isOpen()}>
        <div
          data-dashboard-search
          data-slot="modal"
          class={`${resolvedClasses().modal} fixed inset-0 z-50 flex items-start justify-center sm:pt-16`}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpenState(false)
          }}
        >
          <div
            class="fixed inset-0 bg-default/80 backdrop-blur-sm"
            onClick={() => setOpenState(false)}
          />
          <div
            class={`relative w-full bg-default border border-default sm:rounded-xl shadow-2xl overflow-hidden ${resolvedClasses().modal}`}
          >
            <div class="flex items-center gap-2 border-b border-default px-4">
              <RLIcon name="search" class="size-5 shrink-0 text-muted" />
              <input
                ref={(el) => (inputRef = el)}
                type="text"
                data-dashboard-search-input
                placeholder="Search..."
                class="flex-1 h-12 bg-transparent border-0 outline-none text-default placeholder:text-muted"
              />
              <button
                type="button"
                class="shrink-0 size-8 flex items-center justify-center rounded-md hover:bg-muted text-muted"
                onClick={() => setOpenState(false)}
              >
                <RLIcon name="close" class="size-4" />
              </button>
            </div>
            <div class="p-4 text-sm text-muted text-center">Type to search...</div>
          </div>
        </div>
      </Show>
    </div>
  )
}

export { RLDashboardSearch }

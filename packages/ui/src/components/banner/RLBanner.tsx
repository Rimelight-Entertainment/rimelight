import { createMemo, createSignal, splitProps, For, Show, type Component, type JSX } from "solid-js"
import type { BannerAction, BannerProps } from "./banner"
import { bannerTheme } from "./banner.theme"
import RLButton from "../button/RLButton"
import { useHeaderStack } from "../header/useHeaderStack"

export interface RLBannerProps extends BannerProps {
  children?: JSX.Element
  left?: JSX.Element
  center?: JSX.Element
  right?: JSX.Element
  actions?: BannerAction[]
}

const RLBanner: Component<RLBannerProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "contain",
    "sticky",
    "fixed",
    "stackIndex",
    "hideOnScroll",
    "dismissable",
    "dismissId",
    "actions",
    "ui",
    "class",
    "style",
    "children",
    "left",
    "center",
    "right"
  ])

  const fixed = () => props.fixed ?? true
  const sticky = () => (fixed() ? false : (props.sticky ?? false))
  const hideOnScroll = () => props.hideOnScroll ?? true
  const stackIndex = () => props.stackIndex ?? 0

  const classes = createMemo(() =>
    bannerTheme({
      contain: props.contain ?? true,
      sticky: sticky(),
      fixed: fixed(),
      ui: props.ui,
      class: props.class
    })
  )

  const bannerId = (rest["id"] as string) || `rl-banner-${Math.random().toString(36).slice(2, 8)}`
  const storageKey = props.dismissId || bannerId
  const dismissKey = `rl-banner-dismiss-${storageKey}`
  const actions = props.actions ?? []

  const readDismissed = () => {
    if (typeof window === "undefined") return false
    try {
      return window.localStorage.getItem(dismissKey) !== null
    } catch {
      return false
    }
  }

  const [dismissed, setDismissed] = createSignal<boolean>(readDismissed())

  const handleDismiss = () => {
    try {
      window.localStorage.setItem(dismissKey, "1")
    } catch {}
    setDismissed(true)
  }

  const { registerHeader } = useHeaderStack()
  const { ref, topOffset, isCollapsed } = registerHeader({
    id: bannerId,
    order: stackIndex(),
    type: "banner",
    sticky: sticky(),
    fixed: fixed(),
    hideOnScroll: hideOnScroll(),
    visible: () => !dismissed()
  })

  const dynamicStyles = () => {
    if (!fixed() && !sticky()) return typeof props.style === "object" ? props.style : undefined

    const base: Record<string, any> = {
      top: `${topOffset()}px`,
      transform: isCollapsed() ? "translateY(-100%)" : "translateY(0)",
      transition:
        "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), top 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
    }

    if (typeof props.style === "object" && props.style !== null) {
      return { ...props.style, ...base }
    }
    return base
  }

  return (
    <Show when={!dismissed()}>
      <div
        ref={ref}
        id={bannerId}
        data-slot="root"
        class={classes()["root"]}
        data-contain={(props.contain ?? true) ? "true" : "false"}
        data-rl-banner="true"
        data-stack-index={stackIndex()}
        data-hide-on-scroll={String(hideOnScroll())}
        data-header-layer-id={bannerId}
        data-layer-type="banner"
        data-dismiss-key={dismissKey}
        style={dynamicStyles() as JSX.CSSProperties}
        {...rest}
      >
        <div class={classes()["content"]} data-header-content>
          <div class={classes()["container"]} data-slot="container">
            <Show when={actions.length > 0}>
              <input type="checkbox" id={`${bannerId}-act`} class="peer sr-only shrink-0" />
            </Show>

            <div class={`${classes()["left"]} peer-checked:hidden`} data-slot="left">
              {props.left}
            </div>
            <div class={`${classes()["center"]} peer-checked:hidden`} data-slot="center">
              {props.center !== undefined
                ? props.center
                : props.children !== undefined
                  ? props.children
                  : null}
            </div>

            <div class="flex-1"></div>

            <div class={classes()["side"]}>{props.right}</div>

            <Show when={actions.length > 0}>
              <label
                for={`${bannerId}-act`}
                class="flex-none flex items-center justify-center size-7 rounded-md hover:bg-black/10 dark:hover:bg-white/10 cursor-pointer md:hidden text-sm leading-none peer-checked:order-first"
                aria-label="Show actions"
              >
                ···
              </label>

              <div
                class={`${classes()["actions"]} hidden peer-checked:flex md:flex flex-row items-center justify-center gap-2 peer-checked:order-first`}
              >
                <For each={actions}>
                  {(action) => (
                    <a
                      href={action.href || "#"}
                      class={`inline-flex items-center justify-center gap-1 px-3 py-1 rounded-md text-xs font-semibold transition-colors no-underline cursor-pointer shrink-0 ${
                        action.variant === "solid" || !action.variant
                          ? "bg-neutral-950 text-neutral-50 hover:opacity-90"
                          : "bg-white/20 text-white hover:bg-white/30"
                      } ${action.class ?? ""}`}
                      data-banner-action
                    >
                      {action.label}
                    </a>
                  )}
                </For>
              </div>
            </Show>

            <Show when={props.dismissable}>
              <RLButton
                type="button"
                variant="ghost"
                color="neutral"
                square
                leadingIcon="close"
                ariaLabel="Close banner"
                class={classes()["dismiss"]}
                data-banner-close
                onClick={handleDismiss}
              />
            </Show>
          </div>
        </div>
      </div>
    </Show>
  )
}

export { RLBanner }
export default RLBanner

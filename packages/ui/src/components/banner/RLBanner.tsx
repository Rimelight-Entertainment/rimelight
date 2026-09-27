import { createMemo, createSignal, omit, For, Show, type Component } from "solid-js"
import { dynamic, type JSX } from "@solidjs/web"
import type { BannerProps } from "./banner"
import { bannerTheme } from "./banner.theme"
import { RLButton } from "../button/RLButton"
import { RLIcon } from "../icon/RLIcon"
import { useHeaderStack } from "../header/useHeaderStack"
import { resolveLinkAttrs } from "../link/helpers"
import type { ButtonProps } from "../button/button"

export interface RLBannerProps extends BannerProps {
  children?: JSX.Element
  leading?: JSX.Element
  titleSlot?: JSX.Element
  actionsSlot?: JSX.Element
  closeSlot?: JSX.Element
  left?: JSX.Element
  center?: JSX.Element
  right?: JSX.Element
}

const RLBanner: Component<RLBannerProps> = (allProps) => {
  const props = allProps
  const rest = omit(
    allProps,
    "as",
    "id",
    "icon",
    "title",
    "actions",
    "color",
    "close",
    "closeIcon",
    "onClose",
    "contain",
    "sticky",
    "fixed",
    "stackIndex",
    "hideOnScroll",
    "dismissable",
    "dismissId",
    "ui",
    "class",
    "style",
    "children",
    "leading",
    "titleSlot",
    "actionsSlot",
    "closeSlot",
    "left",
    "center",
    "right",
    "href",
    "to",
    "target",
    "rel",
    "external",
    "externalIcon",
    "noExternalIcon",
    "prefetch",
    "active",
    "disabled",
    "raw",
    "ariaLabel",
    "ariaCurrentValue",
    "theme"
  )

  const isLink = () => Boolean(props.href || props.to)
  const asTag = () => props.as || (isLink() ? "a" : "div")

  const fixed = () => props.fixed ?? false
  const sticky = () => (fixed() ? false : (props.sticky ?? false))
  const hideOnScroll = () => props.hideOnScroll ?? false
  const stackIndex = () => props.stackIndex ?? 0
  const color = () => props.color ?? "primary"

  const bannerId = (allProps.id as string) || (props.dismissId as string) || ""
  const hasPersistence = () => Boolean(props.id || props.dismissId)
  const storageKey = `banner-${bannerId}`

  const isClosable = () => Boolean(props.close !== undefined ? props.close : props.dismissable)

  const readDismissed = () => {
    if (!hasPersistence() || typeof window === "undefined") return false
    try {
      return window.localStorage.getItem(storageKey) !== null
    } catch {
      return false
    }
  }

  const [dismissed, setDismissed] = createSignal<boolean>(readDismissed())

  const handleClose = (e?: MouseEvent) => {
    e?.stopPropagation()
    if (hasPersistence() && typeof window !== "undefined") {
      try {
        window.localStorage.setItem(storageKey, "1")
      } catch {}
    }
    setDismissed(true)
    props.onClose?.()
  }

  const classes = createMemo(() =>
    bannerTheme({
      color: color(),
      contain: props.contain ?? true,
      sticky: sticky(),
      fixed: fixed(),
      to: isLink(),
      ui: props.ui,
      class: props.class
    })
  )

  const { registerHeader } = useHeaderStack()
  const { ref, topOffset, isCollapsed } = registerHeader({
    id: bannerId || `rl-banner-${stackIndex()}`,
    order: stackIndex(),
    type: "banner",
    sticky: sticky(),
    fixed: fixed(),
    hideOnScroll: hideOnScroll(),
    visible: () => !dismissed()
  })

  const dynamicStyles = () => {
    if (!fixed() && !sticky())
      return typeof props["style"] === "object" ? props["style"] : undefined

    const base: Record<string, any> = {
      top: `${topOffset()}px`,
      transform: isCollapsed() ? "translateY(-100%)" : "translateY(0)",
      transition:
        "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), top 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
    }

    if (typeof props["style"] === "object" && props["style"] !== null) {
      return { ...props["style"], ...base }
    }
    return base
  }

  const linkAttrs = createMemo(() => {
    if (!isLink()) return {}
    return resolveLinkAttrs({
      ...props,
      href: props.href || (props.to as string | undefined)
    })
  })

  const closeButtonProps = createMemo((): ButtonProps => {
    const base: ButtonProps = {
      size: "xs",
      color: "neutral",
      variant: "ghost",
      square: true,
      leadingIcon: props.closeIcon || "close",
      ariaLabel: "Close banner"
    }

    if (typeof props.close === "object" && props.close !== null) {
      return { ...base, ...props.close }
    }
    return base
  })

  const Root = dynamic(() => asTag())

  return (
    <Show when={!dismissed()}>
      <Root
        ref={ref}
        id={bannerId || undefined}
        data-slot="root"
        role={isLink() ? "link" : "region"}
        aria-label={props.ariaLabel || (typeof props.title === "string" ? props.title : undefined)}
        class={classes()["root"]}
        data-contain={(props.contain ?? true) ? "true" : "false"}
        data-rl-banner="true"
        data-stack-index={stackIndex()}
        data-hide-on-scroll={String(hideOnScroll())}
        data-header-layer-id={bannerId || undefined}
        data-layer-type="banner"
        data-dismiss-key={hasPersistence() ? storageKey : undefined}
        style={dynamicStyles() as JSX.CSSProperties}
        {...linkAttrs()}
        {...rest}
      >
        <div class={classes()["content"]} data-slot="content" data-header-content>
          <div class={classes()["container"]} data-slot="container">
            {/* Left Slot */}
            <div class={classes()["left"]} data-slot="left">
              {props.left}
            </div>

            {/* Center Slot (Leading icon, title, children) */}
            <div class={classes()["center"]} data-slot="center">
              {/* Leading Icon / Slot */}
              <Show when={props.leading || props.icon}>
                {props.leading ? (
                  props.leading
                ) : (
                  <span class={classes()["icon"]} data-slot="icon">
                    <RLIcon name={props.icon!} size="sm" aria-hidden="true" />
                  </span>
                )}
              </Show>

              {/* Title / Title Slot / Children */}
              <Show
                when={props.titleSlot || props.title !== undefined || props.children !== undefined}
              >
                {props.titleSlot ? (
                  props.titleSlot
                ) : props.title !== undefined ? (
                  <span class={classes()["title"]} data-slot="title">
                    {props.title}
                  </span>
                ) : props.children !== undefined ? (
                  <span class={classes()["title"]} data-slot="title">
                    {props.children}
                  </span>
                ) : null}
              </Show>
            </div>

            {/* Right Slot (Actions & Close) */}
            <div class={classes()["right"]} data-slot="right">
              {props.right}

              {/* Actions */}
              <Show when={props.actionsSlot || (props.actions && props.actions.length > 0)}>
                <div class={classes()["actions"]} data-slot="actions">
                  <Show when={props.actionsSlot}>{props.actionsSlot}</Show>
                  <Show when={props.actions && props.actions.length > 0}>
                    <For each={props.actions}>
                      {(action) => (
                        <RLButton
                          color={action.color ?? "neutral"}
                          size={action.size ?? "xs"}
                          variant={action.variant ?? "solid"}
                          {...action}
                        />
                      )}
                    </For>
                  </Show>
                </div>
              </Show>

              {/* Close Button */}
              <Show when={props.closeSlot || isClosable()}>
                {props.closeSlot ? (
                  props.closeSlot
                ) : (
                  <RLButton
                    type="button"
                    class={classes()["close"]}
                    data-slot="close"
                    data-banner-close
                    onClick={handleClose}
                    {...closeButtonProps()}
                  />
                )}
              </Show>
            </div>
          </div>
        </div>
      </Root>
    </Show>
  )
}

export { RLBanner }

import type { Component } from "solid-js";
import { createEffect, createMemo, createSignal, For, onSettled, Show } from "solid-js";
import type { RLBannerProps } from "./banner.types";
import { RLBannerTheme } from "./banner.theme";
import { RLButton } from "../button/RLButton";
import { RLIcon } from "../icon/RLIcon";
import { useHeaderStack } from "../header/useHeaderStack";
import { resolveLinkAttrs } from "../link/helpers";
import type { RLButtonProps } from "../button/button.types";

/** Value written to localStorage to persist dismissal across visits. */
const DISMISSED_VALUE = "true";

const OMIT_KEYS = [
  "icon",
  "title",
  "actions",
  "close",
  "closeIcon",
  "onClose",
  "contain",
  "sticky",
  "fixed",
  "stackIndex",
  "hideOnScroll",
  "href",
  "target",
  "rel",
  "external",
  "externalIcon",
  "noExternalIcon",
  "trailingIcon",
  "active",
  "disabled",
  "raw",
  "ariaLabel",
  "ariaCurrentValue",
] as const;

export const RLBanner: Component<RLBannerProps> = (props) => {
  const fixed = () => props.fixed ?? false;
  const sticky = () => (fixed() ? false : (props.sticky ?? false));
  const isStacked = () => fixed() || sticky();
  const hideOnScroll = () => props.hideOnScroll ?? false;
  const stackIndex = () => props.stackIndex ?? 0;
  const href = () => props.href;
  const isLink = () => Boolean(href());

  const { Tag, classes, rest, id, slots } = RLBannerTheme.setup(props, {
    as: "div",
    omit: OMIT_KEYS,
    slots: [
      "leadingSlot",
      "titleSlot",
      "actionsSlot",
      "closeSlot",
      "leftSlot",
      "centerSlot",
      "rightSlot",
    ] as const,
    variants: () => ({
      contain: props.contain ?? true,
      sticky: sticky(),
      fixed: fixed(),
      to: isLink(),
    }),
  });

  // Explicit id enables persistence. Otherwise a createUniqueId() fallback
  // keeps the DOM id unique and SSR/hydration stable.
  const layerId = id;
  const titleId = () => `${layerId()}-title`;
  const storageKey = () => (props.id ? `banner-${props.id}` : undefined);

  const isClosable = () => Boolean(props.close);

  // Always start visible so SSR and the first client render match, then hide
  // after settling if a persisted dismissal key is present.
  const [dismissed, setDismissed] = createSignal(false);

  onSettled(() => {
    const key = storageKey();
    if (!key) return;
    try {
      if (window.localStorage.getItem(key) !== null) setDismissed(true);
    } catch {}
  });

  const handleClose = (e?: MouseEvent) => {
    e?.stopPropagation();
    const key = storageKey();
    if (key) {
      try {
        window.localStorage.setItem(key, DISMISSED_VALUE);
      } catch {}
    }
    setDismissed(true);
    props.onClose?.();
  };

  const hasTitle = () =>
    Boolean(
      slots.titleSlot() !== undefined || props.title !== undefined || props.children !== undefined,
    );
  const hasActions = () =>
    Boolean(slots.actionsSlot() !== undefined || (props.actions && props.actions.length > 0));

  const { registerHeader } = useHeaderStack();
  const layer = registerHeader({
    id: layerId,
    order: stackIndex,
    type: "banner",
    sticky: sticky,
    fixed: fixed,
    hideOnScroll: hideOnScroll,
    visible: () => !dismissed() && isStacked(),
  });

  // Positioning is applied through the CSSOM only when stacked (sticky or fixed).
  let rootEl: HTMLElement | undefined;
  createEffect(
    () => (isStacked() ? layer.topOffset() : undefined),
    (top) => {
      if (!rootEl) return;
      if (top === undefined) rootEl.style.removeProperty("top");
      else rootEl.style.setProperty("top", `${top}px`);
    },
  );

  const linkAttrs = createMemo(() =>
    isLink()
      ? resolveLinkAttrs({
          href: href() as string | undefined,
          label: props.label,
          leadingIcon: props.leadingIcon,
          trailingIcon: props.trailingIcon,
          external: props.external,
          externalIcon: props.externalIcon,
          noExternalIcon: props.noExternalIcon,
          target: props.target,
          rel: props.rel,
          active: props.active,
          disabled: props.disabled,
          raw: props.raw,
          ariaLabel: props.ariaLabel,
          ariaCurrentValue: props.ariaCurrentValue,
        })
      : undefined,
  );

  const closeButtonProps = createMemo((): RLButtonProps => {
    const base: RLButtonProps = {
      size: "md",
      color: "neutral",
      variant: "ghost",
      square: true,
      leadingIcon: props.closeIcon || "x",
      ariaLabel: "Close banner",
    };
    return typeof props.close === "object" && props.close !== null
      ? { ...base, ...props.close }
      : base;
  });

  return (
    <Show when={!dismissed()}>
      <Tag
        ref={(el: HTMLElement) => {
          rootEl = el;
          layer.ref(el);
        }}
        id={layerId()}
        data-slot="root"
        role={hasTitle() || props.ariaLabel ? "region" : undefined}
        aria-labelledby={hasTitle() ? titleId() : undefined}
        aria-label={!hasTitle() ? props.ariaLabel : undefined}
        class={classes().root}
        data-color={props.color ?? "primary"}
        data-contain={(props.contain ?? true) ? "true" : "false"}
        data-collapsed={isStacked() && layer.isCollapsed() ? "true" : "false"}
        data-rl-banner={isStacked() ? "true" : undefined}
        data-stack-index={stackIndex()}
        data-hide-on-scroll={String(hideOnScroll())}
        data-header-layer-id={layerId()}
        data-layer-type="banner"
        data-dismiss-key={storageKey()}
        {...rest}
      >
        {/* Full-surface overlay link (never wraps interactive children). */}
        <Show when={linkAttrs()}>
          {(attrs) => (
            <a
              class={classes().link}
              data-slot="link"
              href={attrs().href}
              target={attrs().target}
              rel={attrs().rel}
              aria-current={attrs().ariaCurrent}
              aria-disabled={attrs().ariaDisabled}
              aria-labelledby={!props.ariaLabel && hasTitle() ? titleId() : undefined}
              aria-label={props.ariaLabel}
            />
          )}
        </Show>

        <div class={classes().content} data-slot="content" data-header-content>
          <div class={classes().container} data-slot="container">
            <div class={classes().left} data-slot="left">
              {slots.leftSlot()}
            </div>

            <div class={classes().center} data-slot="center">
              <Show when={!slots.centerSlot()} fallback={slots.centerSlot()}>
                <Show
                  when={slots.leadingSlot()}
                  fallback={
                    <Show when={props.icon}>
                      {(icon) => (
                        <span class={classes().icon} data-slot="icon" aria-hidden="true">
                          <RLIcon name={icon()} size="sm" aria-hidden="true" />
                        </span>
                      )}
                    </Show>
                  }
                >
                  {slots.leadingSlot()}
                </Show>

                <Show when={hasTitle()}>
                  <div id={titleId()} class={classes().title} data-slot="title">
                    {slots.titleSlot() ?? props.title ?? props.children}
                  </div>
                </Show>
              </Show>
            </div>

            <div class={classes().right} data-slot="right">
              {slots.rightSlot()}

              {/* Actions off to the rightmost next to the close button */}
              <Show when={hasActions()}>
                <div class={classes().actions} data-slot="actions">
                  <Show
                    when={slots.actionsSlot()}
                    fallback={
                      <For each={props.actions}>
                        {(action) => <RLButton color="neutral" size="xs" {...action} />}
                      </For>
                    }
                  >
                    {slots.actionsSlot()}
                  </Show>
                </div>
              </Show>

              {/* Close Button */}
              <Show
                when={slots.closeSlot()}
                fallback={
                  <Show when={isClosable()}>
                    <RLButton
                      type="button"
                      class={classes().close}
                      data-slot="close"
                      data-banner-close
                      onClick={handleClose}
                      {...closeButtonProps()}
                    />
                  </Show>
                }
              >
                {slots.closeSlot()}
              </Show>
            </div>
          </div>
        </div>
      </Tag>
    </Show>
  );
};

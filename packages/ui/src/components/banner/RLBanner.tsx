import type { Component } from "solid-js";
import { createEffect, createMemo, createSignal, For, onSettled, Show } from "solid-js";
import type { RLBannerProps } from "./banner.types";
import { RLBannerTheme } from "./banner.theme";
import { RLButton } from "../button/RLButton";
import { RLIcon } from "../icon/RLIcon";
import { useHeaderStack } from "../header/useHeaderStack";
import { resolveLinkAttrs } from "../link/helpers";
import { uiT } from "../../locale";

/** Value written to localStorage to persist dismissal across visits. */
const DISMISSED_VALUE = "true";

const OMIT_KEYS = [
  "icon",
  "title",
  "actions",
  "dismissible",
  "closeIcon",
  "onDismiss",
  "stackIndex",
  "hideOnScroll",
  "label",
  "leadingIcon",
  "trailingIcon",
  "href",
  "target",
  "rel",
  "external",
  "externalIcon",
  "noExternalIcon",
  "active",
  "disabled",
  "aria-label",
  "aria-current",
] as const;

export const RLBanner: Component<RLBannerProps> = (props) => {
  const isLink = () => Boolean(props.href);

  const { Tag, classes, rest, id, slots, children, theme } = RLBannerTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: [
      "iconSlot",
      "leadingSlot",
      "titleSlot",
      "centerSlot",
      "trailingSlot",
      "actionsSlot",
      "closeSlot",
    ] as const,
    variants: () => ({
      contain: props.contain ?? true,
      sticky: (props.sticky ?? false) && !(props.fixed ?? false),
      fixed: props.fixed ?? false,
      to: isLink(),
    }),
  });

  const fixed = () => props.fixed ?? false;
  const sticky = () => (fixed() ? false : (props.sticky ?? false));
  const isStacked = () => fixed() || sticky();
  const hideOnScroll = () => props.hideOnScroll ?? false;
  const stackIndex = () => props.stackIndex ?? 0;

  const titleId = () => `${id()}-title`;
  const storageKey = () => (props.id ? `banner-${props.id}` : undefined);

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

  const handleDismiss = (e?: MouseEvent) => {
    e?.stopPropagation();
    const key = storageKey();
    if (key) {
      try {
        window.localStorage.setItem(key, DISMISSED_VALUE);
      } catch {}
    }
    setDismissed(true);
    props.onDismiss?.();
  };

  const hasTitle = () =>
    Boolean(
      slots.titleSlot() !== undefined || props.title !== undefined || children() !== undefined,
    );
  const hasActions = () =>
    Boolean(slots.actionsSlot() !== undefined || (props.actions && props.actions.length > 0));

  const { registerHeader } = useHeaderStack();
  const layer = registerHeader({
    id,
    order: stackIndex,
    type: "banner",
    sticky,
    fixed,
    hideOnScroll,
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
          href: props.href,
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
          current:
            typeof props["aria-current"] === "boolean"
              ? props["aria-current"]
                ? "true"
                : "false"
              : props["aria-current"],
        })
      : undefined,
  );

  return (
    <Show when={!dismissed()}>
      <Tag
        ref={(el: HTMLElement) => {
          rootEl = el;
          layer.ref(el);
        }}
        id={id()}
        data-slot="root"
        data-theme={theme()}
        role={hasTitle() || props["aria-label"] ? "region" : undefined}
        aria-labelledby={hasTitle() ? titleId() : undefined}
        aria-label={!hasTitle() ? props["aria-label"] : undefined}
        class={classes().root}
        data-color={props.color}
        data-contain={(props.contain ?? true) ? "true" : "false"}
        data-collapsed={isStacked() && layer.isCollapsed() ? "true" : "false"}
        data-rl-banner={isStacked() ? "true" : undefined}
        data-stack-index={stackIndex()}
        data-hide-on-scroll={String(hideOnScroll())}
        data-header-layer-id={id()}
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
              aria-labelledby={!props["aria-label"] && hasTitle() ? titleId() : undefined}
              aria-label={props["aria-label"]}
            />
          )}
        </Show>

        <div class={classes().content} data-slot="content" data-header-content>
          <div class={classes().container} data-slot="container">
            <div class={classes().left} data-slot="left">
              {slots.leadingSlot()}
            </div>

            <div class={classes().center} data-slot="center">
              <Show when={!slots.centerSlot()} fallback={slots.centerSlot()}>
                <Show
                  when={slots.iconSlot()}
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
                  <span class={classes().icon} data-slot="icon" aria-hidden="true">
                    {slots.iconSlot()}
                  </span>
                </Show>

                <Show when={hasTitle()}>
                  <div id={titleId()} class={classes().title} data-slot="title">
                    {slots.titleSlot() ?? props.title ?? children()}
                  </div>
                </Show>
              </Show>
            </div>

            <div class={classes().right} data-slot="right">
              {slots.trailingSlot()}

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

              <Show
                when={slots.closeSlot()}
                fallback={
                  <Show when={props.dismissible}>
                    <RLButton
                      type="button"
                      size="md"
                      color="neutral"
                      variant="ghost"
                      square
                      leadingIcon={props.closeIcon ?? "x"}
                      class={classes().close}
                      data-slot="close"
                      data-banner-close
                      aria-label={uiT("banner.close")}
                      onClick={handleDismiss}
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

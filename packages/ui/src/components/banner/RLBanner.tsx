import {
  createComponent,
  createEffect,
  createMemo,
  createSignal,
  createUniqueId,
  omit,
  onSettled,
  For,
  Show,
  type Component,
} from "solid-js";
import type { JSX } from "@solidjs/web";
import type { RLBannerProps } from "./banner";
import { bannerTheme } from "./banner.theme";
import { RLButton } from "../button/RLButton";
import { RLIcon } from "../icon/RLIcon";
import { useHeaderStack } from "../header/useHeaderStack";
import { resolveLinkAttrs } from "../link/helpers";
import type { RLButtonProps } from "../button/button";

/** Value written to localStorage; must match the pre-hydration head script check. */
const DISMISSED_VALUE = "true";

export const RLBanner: Component<RLBannerProps> = (props) => {
  const rest = omit(
    props,
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
    "trailingIcon",
    "prefetch",
    "active",
    "disabled",
    "raw",
    "ariaLabel",
    "ariaCurrentValue",
    "theme",
  );

  const fixed = () => props.fixed ?? false;
  const sticky = () => (fixed() ? false : (props.sticky ?? false));
  const isStacked = () => fixed() || sticky();
  const hideOnScroll = () => props.hideOnScroll ?? false;
  const stackIndex = () => props.stackIndex ?? 0;
  const href = () => props.href || props.to;
  const isLink = () => Boolean(href());

  // Explicit id (or legacy dismissId) enables persistence. Otherwise a
  // createUniqueId() fallback keeps the DOM id unique and SSR/hydration stable.
  const persistId = (props.id as string | undefined) || props.dismissId || "";
  const layerId = persistId || `rl-banner-${createUniqueId()}`;
  const titleId = `${layerId}-title`;
  const storageKey = persistId ? `banner-${persistId}` : undefined;

  const isClosable = () => Boolean(props.close !== undefined ? props.close : props.dismissable);

  // Always start visible so SSR and the first client render match. The head
  // script hides dismissed banners pre-hydration; we sync after settling.
  const [dismissed, setDismissed] = createSignal(false);

  onSettled(() => {
    if (!storageKey) return;
    try {
      if (window.localStorage.getItem(storageKey) !== null) setDismissed(true);
    } catch {}
  });

  const handleClose = (e?: MouseEvent) => {
    e?.stopPropagation();
    if (storageKey) {
      try {
        window.localStorage.setItem(storageKey, DISMISSED_VALUE);
      } catch {}
    }
    setDismissed(true);
    props.onClose?.();
  };

  const hasTitle = () =>
    Boolean(
      props.titleSlot !== undefined || props.title !== undefined || props.children !== undefined,
    );
  const hasActions = () =>
    Boolean(props.actionsSlot !== undefined || (props.actions && props.actions.length > 0));

  const classes = createMemo(() =>
    bannerTheme({
      color: props.color ?? "primary",
      contain: props.contain ?? true,
      sticky: sticky(),
      fixed: fixed(),
      to: isLink(),
      ui: props.ui,
      class: props.class,
    }),
  );

  const { registerHeader } = useHeaderStack();
  const layer = registerHeader({
    id: layerId,
    order: stackIndex(),
    type: "banner",
    sticky: sticky(),
    fixed: fixed(),
    hideOnScroll: hideOnScroll(),
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
          to: props.to,
          label: props.label,
          leadingIcon: props.leadingIcon,
          trailingIcon: props.trailingIcon,
          external: props.external,
          externalIcon: props.externalIcon,
          noExternalIcon: props.noExternalIcon,
          target: props.target,
          rel: props.rel,
          prefetch: props.prefetch,
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
      leadingIcon: props.closeIcon || "close",
      ariaLabel: "Close banner",
    };
    return typeof props.close === "object" && props.close !== null
      ? { ...base, ...props.close }
      : base;
  });

  const renderRoot = (content: JSX.Element) => {
    const rootProps = {
      ref: (el: HTMLElement) => {
        rootEl = el;
        layer.ref(el);
      },
      id: layerId,
      "data-slot": "root",
      role: hasTitle() || props.ariaLabel ? ("region" as const) : undefined,
      "aria-labelledby": hasTitle() ? titleId : undefined,
      "aria-label": !hasTitle() ? props.ariaLabel : undefined,
      class: classes().root,
      "data-color": props.color ?? "primary",
      "data-contain": (props.contain ?? true) ? "true" : "false",
      "data-collapsed": isStacked() && layer.isCollapsed() ? "true" : "false",
      "data-rl-banner": isStacked() ? "true" : undefined,
      "data-stack-index": stackIndex(),
      "data-hide-on-scroll": String(hideOnScroll()),
      "data-header-layer-id": layerId,
      "data-layer-type": "banner",
      "data-dismiss-key": storageKey,
      ...rest,
    };

    if (props.as === "section") {
      return <section {...rootProps}>{content}</section>;
    }
    if (props.as === "header") {
      return <header {...rootProps}>{content}</header>;
    }
    if (props.as === "aside") {
      return <aside {...rootProps}>{content}</aside>;
    }
    if (typeof props.as === "function") {
      return createComponent(props.as as any, { ...rootProps, children: content });
    }
    return <div {...rootProps}>{content}</div>;
  };

  return (
    <Show when={!dismissed()}>
      {renderRoot(
        <>
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
                data-astro-prefetch={attrs().prefetchAttr}
                aria-labelledby={!props.ariaLabel && hasTitle() ? titleId : undefined}
                aria-label={props.ariaLabel}
              />
            )}
          </Show>

          <div class={classes().content} data-slot="content" data-header-content>
            <div class={classes().container} data-slot="container">
              <div class={classes().left} data-slot="left">
                {props.left}
              </div>

              <div class={classes().center} data-slot="center">
                <Show when={!props.center} fallback={props.center}>
                  <Show
                    when={props.leading}
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
                    {props.leading}
                  </Show>

                  <Show when={hasTitle()}>
                    <div id={titleId} class={classes().title} data-slot="title">
                      {props.titleSlot ?? props.title ?? props.children}
                    </div>
                  </Show>
                </Show>
              </div>

              <div class={classes().right} data-slot="right">
                {props.right}

                {/* Actions off to the rightmost next to the close button */}
                <Show when={hasActions()}>
                  <div class={classes().actions} data-slot="actions">
                    <Show
                      when={props.actionsSlot}
                      fallback={
                        <For each={props.actions}>
                          {(action) => <RLButton color="neutral" size="xs" {...action} />}
                        </For>
                      }
                    >
                      {props.actionsSlot}
                    </Show>
                  </div>
                </Show>

                {/* Close Button */}
                <Show
                  when={props.closeSlot}
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
                  {props.closeSlot}
                </Show>
              </div>
            </div>
          </div>
        </>,
      )}
    </Show>
  );
};

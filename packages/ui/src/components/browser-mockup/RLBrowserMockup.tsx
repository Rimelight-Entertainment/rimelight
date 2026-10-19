import type { Component } from "solid-js";
import { Show } from "solid-js";
import type { RLBrowserMockupProps } from "./browser-mockup.types";
import { RLBrowserMockupTheme } from "./browser-mockup.theme";
import { RLIcon } from "../icon/RLIcon";

const OMIT_KEYS = [
  "url",
  "urlPrefix",
  "urlIcon",
  "controls",
  "controlsVariant",
  "navigation",
  "padded",
  "shadow",
  "rounded",
  "headerSlot",
  "controlsSlot",
  "navigationSlot",
  "urlSlot",
  "urlPrefixSlot",
  "urlSuffixSlot",
  "actionsSlot",
  "ariaLabel",
] as const;

export const RLBrowserMockup: Component<RLBrowserMockupProps> = (props) => {
  const {
    Tag: RootTag,
    classes,
    rest,
    id,
  } = RLBrowserMockupTheme.setup(props, {
    omit: OMIT_KEYS,
    variants: () => ({
      controlsVariant: props.controls === false ? "none" : props.controlsVariant,
      padded: props.padded,
      shadow: props.shadow,
      rounded: props.rounded,
    }),
  });

  const titleId = id;

  const showControls = () => props.controls !== false && props.controlsVariant !== "none";

  const showNavigation = () => Boolean(props.navigation);

  const showUrlBar = () =>
    props.url !== undefined ||
    Boolean(props.urlSlot) ||
    Boolean(props.urlPrefixSlot) ||
    Boolean(props.urlSuffixSlot);

  const urlIconName = () => props.urlIcon ?? "lock";

  const renderUrlPrefix = () => {
    if (props.urlPrefixSlot) {
      return props.urlPrefixSlot;
    }
    if (props.urlPrefix === false) {
      return null;
    }
    if (typeof props.urlPrefix === "string") {
      return (
        <span class={classes().urlPrefix} data-slot="url-prefix">
          {props.urlPrefix}
        </span>
      );
    }
    return (
      <span class={classes().urlPrefix} data-slot="url-prefix">
        <RLIcon name={urlIconName()} class={classes().urlIcon} aria-hidden="true" />
      </span>
    );
  };

  return (
    <RootTag
      role="region"
      aria-label={
        props.ariaLabel ?? (props.url ? `Browser mockup: ${props.url}` : "Browser Mockup")
      }
      class={classes().root}
      data-slot="root"
      {...rest}
    >
      <header class={classes().header} data-slot="header">
        <Show
          when={props.headerSlot}
          fallback={
            <>
              {/* Window Controls (macOS / neutral dots) */}
              <Show when={showControls()}>
                <Show
                  when={props.controlsSlot}
                  fallback={
                    <div class={classes().controls} data-slot="controls" aria-hidden="true">
                      <span
                        class={`${classes().dot} ${classes().dotClose}`}
                        data-slot="dot-close"
                      />
                      <span
                        class={`${classes().dot} ${classes().dotMinimize}`}
                        data-slot="dot-minimize"
                      />
                      <span
                        class={`${classes().dot} ${classes().dotMaximize}`}
                        data-slot="dot-maximize"
                      />
                    </div>
                  }
                >
                  {props.controlsSlot}
                </Show>
              </Show>

              {/* Navigation controls (back, forward, reload) */}
              <Show when={showNavigation()}>
                <Show
                  when={props.navigationSlot}
                  fallback={
                    <div
                      class={classes().navigation}
                      data-slot="navigation"
                      aria-label="Browser navigation"
                    >
                      <button
                        type="button"
                        aria-label="Back"
                        class={`${classes().navButton} ${classes().navBack}`}
                        data-slot="nav-back"
                      >
                        <RLIcon name="arrow-left" class="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        aria-label="Forward"
                        class={`${classes().navButton} ${classes().navForward}`}
                        data-slot="nav-forward"
                      >
                        <RLIcon name="arrow-right" class="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        aria-label="Reload"
                        class={`${classes().navButton} ${classes().navReload}`}
                        data-slot="nav-reload"
                      >
                        <RLIcon name="rotate-cw" class="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  }
                >
                  {props.navigationSlot}
                </Show>
              </Show>

              {/* URL Address Bar */}
              <Show when={showUrlBar()}>
                <Show
                  when={props.urlSlot}
                  fallback={
                    <div class={classes().urlBar} data-slot="url-bar">
                      {renderUrlPrefix()}
                      <Show when={props.url}>
                        <span id={titleId()} class={classes().urlText} data-slot="url-text">
                          {props.url}
                        </span>
                      </Show>
                      <Show when={props.urlSuffixSlot}>
                        <span class={classes().urlSuffix} data-slot="url-suffix">
                          {props.urlSuffixSlot}
                        </span>
                      </Show>
                    </div>
                  }
                >
                  {props.urlSlot}
                </Show>
              </Show>

              {/* Actions slot */}
              <Show when={props.actionsSlot}>
                <div class={classes().actions} data-slot="actions">
                  {props.actionsSlot}
                </div>
              </Show>
            </>
          }
        >
          {props.headerSlot}
        </Show>
      </header>

      {/* Mockup Body Content */}
      <div class={classes().body} data-slot="body">
        {props.children}
      </div>
    </RootTag>
  );
};

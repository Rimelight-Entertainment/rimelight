import { createMemo, createUniqueId, omit, Show, type Component } from "solid-js";
import { dynamic } from "@solidjs/web";
import type { RLBrowserMockupProps } from "./browser-mockup";
import { browserMockupTheme } from "./browser-mockup.theme";
import { RLIcon } from "../icon/RLIcon";

export const RLBrowserMockup: Component<RLBrowserMockupProps> = (allProps) => {
  const rest = omit(
    allProps,
    "as",
    "variant",
    "size",
    "color",
    "url",
    "urlPrefix",
    "urlIcon",
    "controls",
    "controlsVariant",
    "navigation",
    "padded",
    "shadow",
    "rounded",
    "ui",
    "class",
    "children",
    "headerSlot",
    "controlsSlot",
    "navigationSlot",
    "urlSlot",
    "urlPrefixSlot",
    "urlSuffixSlot",
    "actionsSlot",
    "ariaLabel",
  );

  const titleId = createUniqueId();

  const resolvedClasses = createMemo(() =>
    browserMockupTheme({
      variant: allProps.variant,
      size: allProps.size,
      color: allProps.color,
      controlsVariant: allProps.controls === false ? "none" : allProps.controlsVariant,
      padded: allProps.padded,
      shadow: allProps.shadow,
      rounded: allProps.rounded,
      ui: allProps.ui,
      class: allProps.class,
    }),
  );

  const RootTag = dynamic(() => allProps.as ?? "div");

  const showControls = () => allProps.controls !== false && allProps.controlsVariant !== "none";

  const showNavigation = () => Boolean(allProps.navigation);

  const showUrlBar = () =>
    allProps.url !== undefined ||
    Boolean(allProps.urlSlot) ||
    Boolean(allProps.urlPrefixSlot) ||
    Boolean(allProps.urlSuffixSlot);

  const urlIconName = () => allProps.urlIcon ?? "lock";

  const renderUrlPrefix = () => {
    if (allProps.urlPrefixSlot) {
      return allProps.urlPrefixSlot;
    }
    if (allProps.urlPrefix === false) {
      return null;
    }
    if (typeof allProps.urlPrefix === "string") {
      return (
        <span class={resolvedClasses().urlPrefix} data-slot="url-prefix">
          {allProps.urlPrefix}
        </span>
      );
    }
    return (
      <span class={resolvedClasses().urlPrefix} data-slot="url-prefix">
        <RLIcon name={urlIconName()} class={resolvedClasses().urlIcon} aria-hidden="true" />
      </span>
    );
  };

  return (
    <RootTag
      role="region"
      aria-label={
        allProps.ariaLabel ?? (allProps.url ? `Browser mockup: ${allProps.url}` : "Browser Mockup")
      }
      class={resolvedClasses().root}
      data-slot="root"
      {...rest}
    >
      <header class={resolvedClasses().header} data-slot="header">
        <Show
          when={allProps.headerSlot}
          fallback={
            <>
              {/* Window Controls (macOS / neutral dots) */}
              <Show when={showControls()}>
                <Show
                  when={allProps.controlsSlot}
                  fallback={
                    <div class={resolvedClasses().controls} data-slot="controls" aria-hidden="true">
                      <span
                        class={`${resolvedClasses().dot} ${resolvedClasses().dotClose}`}
                        data-slot="dot-close"
                      />
                      <span
                        class={`${resolvedClasses().dot} ${resolvedClasses().dotMinimize}`}
                        data-slot="dot-minimize"
                      />
                      <span
                        class={`${resolvedClasses().dot} ${resolvedClasses().dotMaximize}`}
                        data-slot="dot-maximize"
                      />
                    </div>
                  }
                >
                  {allProps.controlsSlot}
                </Show>
              </Show>

              {/* Navigation controls (back, forward, reload) */}
              <Show when={showNavigation()}>
                <Show
                  when={allProps.navigationSlot}
                  fallback={
                    <div
                      class={resolvedClasses().navigation}
                      data-slot="navigation"
                      aria-label="Browser navigation"
                    >
                      <button
                        type="button"
                        aria-label="Back"
                        class={`${resolvedClasses().navButton} ${resolvedClasses().navBack}`}
                        data-slot="nav-back"
                      >
                        <RLIcon name="arrowLeft" class="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        aria-label="Forward"
                        class={`${resolvedClasses().navButton} ${resolvedClasses().navForward}`}
                        data-slot="nav-forward"
                      >
                        <RLIcon name="arrowRight" class="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        aria-label="Reload"
                        class={`${resolvedClasses().navButton} ${resolvedClasses().navReload}`}
                        data-slot="nav-reload"
                      >
                        <RLIcon name="rotateCw" class="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    </div>
                  }
                >
                  {allProps.navigationSlot}
                </Show>
              </Show>

              {/* URL Address Bar */}
              <Show when={showUrlBar()}>
                <Show
                  when={allProps.urlSlot}
                  fallback={
                    <div class={resolvedClasses().urlBar} data-slot="url-bar">
                      {renderUrlPrefix()}
                      <Show when={allProps.url}>
                        <span id={titleId} class={resolvedClasses().urlText} data-slot="url-text">
                          {allProps.url}
                        </span>
                      </Show>
                      <Show when={allProps.urlSuffixSlot}>
                        <span class={resolvedClasses().urlSuffix} data-slot="url-suffix">
                          {allProps.urlSuffixSlot}
                        </span>
                      </Show>
                    </div>
                  }
                >
                  {allProps.urlSlot}
                </Show>
              </Show>

              {/* Actions slot */}
              <Show when={allProps.actionsSlot}>
                <div class={resolvedClasses().actions} data-slot="actions">
                  {allProps.actionsSlot}
                </div>
              </Show>
            </>
          }
        >
          {allProps.headerSlot}
        </Show>
      </header>

      {/* Mockup Body Content */}
      <div class={resolvedClasses().body} data-slot="body">
        {allProps.children}
      </div>
    </RootTag>
  );
};

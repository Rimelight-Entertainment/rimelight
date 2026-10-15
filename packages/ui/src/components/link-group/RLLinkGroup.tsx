import type { RLLinkGroupProps } from "./link-group.types";
import { RLLinkGroupTheme } from "./link-group.theme";
import { createMemo, omit, For, Show, type Component } from "solid-js";
import { RLLink } from "../link/RLLink";
import { RLIcon } from "../icon/RLIcon";

export const RLLinkGroup: Component<RLLinkGroupProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
    "label",
    "leadingIcon",
    "trailingIcon",
    "href",
    "links",
    "theme",
    "ui",
    "class",
    "children",
  );

  const resolvedClasses = createMemo(() =>
    RLLinkGroupTheme({
      ui: props.ui,
      class: props.class,
    }),
  );

  const normalizedLinks = createMemo(() => {
    if (!props.links) return [];
    return Array.isArray(props.links) ? props.links : [props.links];
  });

  return (
    <div class={resolvedClasses().root} data-slot="root" data-theme={props.theme} {...rest}>
      <Show when={props.label}>
        {(label) => (
          <h4 class={resolvedClasses().title} data-slot="title">
            <Show
              when={props.href}
              fallback={
                <span class="flex items-center gap-1.5">
                  <Show when={props.leadingIcon}>
                    {(icon) => <RLIcon name={icon()} size="sm" />}
                  </Show>
                  <span>{label()}</span>
                  <Show when={props.trailingIcon}>
                    {(icon) => <RLIcon name={icon()} size="sm" />}
                  </Show>
                </span>
              }
            >
              {(href) => (
                <a href={href()} class="hover:underline flex items-center gap-1.5">
                  <Show when={props.leadingIcon}>
                    {(icon) => <RLIcon name={icon()} size="sm" />}
                  </Show>
                  <span>{label()}</span>
                  <Show when={props.trailingIcon}>
                    {(icon) => <RLIcon name={icon()} size="sm" />}
                  </Show>
                </a>
              )}
            </Show>
          </h4>
        )}
      </Show>

      <ul class={resolvedClasses().list} data-slot="list">
        <Show when={!props.children} fallback={props.children}>
          <For each={normalizedLinks()}>
            {(link) => (
              <li class={resolvedClasses().item} data-slot="item">
                <RLLink
                  theme={link.theme ?? props.theme}
                  class={`${resolvedClasses().link} w-full !justify-start`}
                  data-slot="link"
                  {...link}
                />
              </li>
            )}
          </For>
        </Show>
      </ul>
    </div>
  );
};

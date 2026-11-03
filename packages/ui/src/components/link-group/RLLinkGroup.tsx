import type { Component } from "solid-js";
import { createMemo, For, Show } from "solid-js";
import type { RLLinkGroupProps } from "./link-group.types";
import { RLLinkGroupTheme } from "./link-group.theme";
import { RLLink } from "../link/RLLink";
import { RLIcon } from "../icon/RLIcon";

const OMIT_KEYS = ["label", "leadingIcon", "trailingIcon", "href", "links"] as const;

export const RLLinkGroup: Component<RLLinkGroupProps> = (props) => {
  const { Tag, classes, rest, children, theme } = RLLinkGroupTheme.setup(props, {
    as: "div",
    omit: OMIT_KEYS,
  });

  const normalizedLinks = createMemo(() => {
    if (!props.links) return [];
    return Array.isArray(props.links) ? props.links : [props.links];
  });

  return (
    <Tag class={classes().root} data-slot="root" data-theme={theme()} {...rest}>
      <Show when={props.label}>
        {(label) => (
          <h4 class={classes().title} data-slot="title">
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

      <ul class={classes().list} data-slot="list">
        <Show when={!children()} fallback={children()}>
          <For each={normalizedLinks()}>
            {(link) => (
              <li class={classes().item} data-slot="item">
                <RLLink
                  class={`${classes().link} w-full !justify-start`}
                  data-slot="link"
                  {...link}
                />
              </li>
            )}
          </For>
        </Show>
      </ul>
    </Tag>
  );
};

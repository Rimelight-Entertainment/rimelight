import type { Component } from "solid-js";
import { For, Show } from "solid-js";
import type { RLEmptyProps } from "./empty.types";
import { RLEmptyTheme } from "./empty.theme";
import { RLButton } from "../button/RLButton";
import { RLAvatar } from "../avatar/RLAvatar";
import { RLIcon } from "../icon/RLIcon";

export const RLEmpty: Component<RLEmptyProps> = (props) => {
  const { Tag, classes, rest, slots, children, theme } = RLEmptyTheme.setup(props, {
    slots: [
      "icon",
      "avatar",
      "loading",
      "loadingIcon",
      "title",
      "description",
      "actions",
      "size",
      "headerSlot",
      "leadingSlot",
      "titleSlot",
      "descriptionSlot",
      "bodySlot",
      "actionsSlot",
      "footerSlot",
    ] as const,
  });

  const activeIcon = () =>
    slots.loading() ? (slots.loadingIcon() ?? "i-lucide-loader-circle") : slots.icon();

  return (
    <Tag class={classes().root} data-slot="root" data-theme={theme()} {...rest}>
      <Show
        when={slots.headerSlot()}
        fallback={
          <div class={classes().header} data-slot="header">
            <Show
              when={slots.leadingSlot()}
              fallback={
                <Show
                  when={activeIcon()}
                  fallback={
                    <Show when={slots.avatar()}>
                      {(avatar) => (
                        <div class={classes().avatar} data-slot="avatar">
                          <RLAvatar {...avatar()} />
                        </div>
                      )}
                    </Show>
                  }
                >
                  {(icon) => (
                    <div class={classes().avatar} data-slot="avatar">
                      <RLIcon
                        name={icon()}
                        class={`size-full ${slots.loading() ? "animate-spin" : ""}`}
                        aria-hidden="true"
                      />
                    </div>
                  )}
                </Show>
              }
            >
              {slots.leadingSlot()}
            </Show>

            <Show when={slots.title() || slots.titleSlot()}>
              <div class={classes().title} data-slot="title">
                <Show when={slots.titleSlot()} fallback={slots.title()}>
                  {slots.titleSlot()}
                </Show>
              </div>
            </Show>

            <Show when={slots.description() || slots.descriptionSlot()}>
              <div class={classes().description} data-slot="description">
                <Show when={slots.descriptionSlot()} fallback={slots.description()}>
                  {slots.descriptionSlot()}
                </Show>
              </div>
            </Show>
          </div>
        }
      >
        {slots.headerSlot()}
      </Show>

      <Show when={slots.bodySlot() || children()}>
        <div class={classes().body} data-slot="body">
          <Show when={slots.bodySlot()} fallback={children()}>
            {slots.bodySlot()}
          </Show>
        </div>
      </Show>

      <Show when={(slots.actions() ?? []).length > 0 || slots.actionsSlot()}>
        <div class={classes().actions} data-slot="actions">
          <Show
            when={slots.actionsSlot()}
            fallback={
              <For each={slots.actions() ?? []}>
                {(action) => {
                  const { icon, label, ...buttonProps } = action;
                  return (
                    <RLButton
                      size={slots.size() === "xs" || slots.size() === "sm" ? "xs" : "sm"}
                      {...(icon ? { leadingIcon: icon } : {})}
                      {...buttonProps}
                    >
                      {label}
                    </RLButton>
                  );
                }}
              </For>
            }
          >
            {slots.actionsSlot()}
          </Show>
        </div>
      </Show>

      <Show when={slots.footerSlot()}>
        <div class={classes().footer} data-slot="footer">
          {slots.footerSlot()}
        </div>
      </Show>
    </Tag>
  );
};

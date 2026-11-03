import type { Component } from "solid-js";
import { For, Show } from "solid-js";
import type { RLEmptyProps } from "./empty.types";
import { RLEmptyTheme } from "./empty.theme";
import { RLButton } from "../button/RLButton";
import { RLAvatar } from "../avatar/RLAvatar";
import { RLIcon } from "../icon/RLIcon";

const OMIT_KEYS = [
  "icon",
  "avatar",
  "loading",
  "loadingIcon",
  "title",
  "description",
  "actions",
] as const;

export const RLEmpty: Component<RLEmptyProps> = (props) => {
  const { classes, rest, slots } = RLEmptyTheme.setup(props, {
    omit: OMIT_KEYS,
    slots: [
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
    props.loading ? (props.loadingIcon ?? "i-lucide-loader-circle") : props.icon;
  const actionList = () => props.actions ?? [];

  return (
    <div class={classes()["root"]} data-slot="root" {...rest}>
      <Show
        when={slots.headerSlot()}
        fallback={
          <div class={classes()["header"]} data-slot="header">
            <Show
              when={slots.leadingSlot()}
              fallback={
                <Show
                  when={activeIcon()}
                  fallback={
                    <Show when={props.avatar}>
                      <div class={classes()["avatar"]} data-slot="avatar">
                        <RLAvatar {...props.avatar} />
                      </div>
                    </Show>
                  }
                >
                  <div class={classes()["avatar"]} data-slot="avatar">
                    <RLIcon
                      name={activeIcon()!}
                      class={`size-full ${props.loading ? "animate-spin" : ""}`}
                      aria-hidden="true"
                    />
                  </div>
                </Show>
              }
            >
              {slots.leadingSlot()}
            </Show>

            <Show when={props.title || slots.titleSlot()}>
              <div class={classes()["title"]} data-slot="title">
                <Show when={slots.titleSlot()} fallback={props.title}>
                  {slots.titleSlot()}
                </Show>
              </div>
            </Show>

            <Show when={props.description || slots.descriptionSlot()}>
              <div class={classes()["description"]} data-slot="description">
                <Show when={slots.descriptionSlot()} fallback={props.description}>
                  {slots.descriptionSlot()}
                </Show>
              </div>
            </Show>
          </div>
        }
      >
        {slots.headerSlot()}
      </Show>

      <Show when={slots.bodySlot() || props.children}>
        <div class={classes()["body"]} data-slot="body">
          <Show when={slots.bodySlot()} fallback={props.children}>
            {slots.bodySlot()}
          </Show>
        </div>
      </Show>

      <Show when={actionList().length > 0 || slots.actionsSlot()}>
        <div class={classes()["actions"]} data-slot="actions">
          <Show
            when={slots.actionsSlot()}
            fallback={
              <For each={actionList()}>
                {(action) => {
                  const { icon, label, color, variant, ...actionRest } = action;
                  return (
                    <RLButton
                      size={props.size === "xs" || props.size === "sm" ? "xs" : "sm"}
                      color={(color || "primary") as any}
                      variant={(variant || "solid") as any}
                      {...(icon ? { leadingIcon: icon } : {})}
                      {...actionRest}
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
        <div class={classes()["footer"]} data-slot="footer">
          {slots.footerSlot()}
        </div>
      </Show>
    </div>
  );
};

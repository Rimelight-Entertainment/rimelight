import type { RLEmptyProps } from "./empty.types";
import { RLEmptyTheme } from "./empty.theme";
import { createMemo, omit, For, Show, type Component } from "solid-js";
import { RLButton } from "../button/RLButton";
import { RLAvatar } from "../avatar/RLAvatar";
import { RLIcon } from "../icon/RLIcon";

export const RLEmpty: Component<RLEmptyProps> = (props) => {
  const rest = omit(
    props,
    "icon",
    "avatar",
    "loading",
    "loadingIcon",
    "title",
    "description",
    "actions",
    "variant",
    "size",
    "as",
    "ui",
    "class",
    "children",
    "headerSlot",
    "leadingSlot",
    "titleSlot",
    "descriptionSlot",
    "bodySlot",
    "actionsSlot",
    "footerSlot",
  );

  const activeIcon = () =>
    props.loading ? (props.loadingIcon ?? "i-lucide-loader-circle") : props.icon;
  const actionList = () => props.actions ?? [];

  const classes = createMemo(() =>
    RLEmptyTheme({
      variant: props.variant ?? "outline",
      size: props.size ?? "md",
      loading: props.loading ?? false,
      ui: props.ui,
      class: props.class,
    }),
  );

  return (
    <div class={classes()["root"]} data-slot="root" {...rest}>
      <Show
        when={props.headerSlot}
        fallback={
          <div class={classes()["header"]} data-slot="header">
            <Show
              when={props.leadingSlot}
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
              {props.leadingSlot}
            </Show>

            <Show when={props.title || props.titleSlot}>
              <div class={classes()["title"]} data-slot="title">
                <Show when={props.titleSlot} fallback={props.title}>
                  {props.titleSlot}
                </Show>
              </div>
            </Show>

            <Show when={props.description || props.descriptionSlot}>
              <div class={classes()["description"]} data-slot="description">
                <Show when={props.descriptionSlot} fallback={props.description}>
                  {props.descriptionSlot}
                </Show>
              </div>
            </Show>
          </div>
        }
      >
        {props.headerSlot}
      </Show>

      <Show when={props.bodySlot || props.children}>
        <div class={classes()["body"]} data-slot="body">
          <Show when={props.bodySlot} fallback={props.children}>
            {props.bodySlot}
          </Show>
        </div>
      </Show>

      <Show when={actionList().length > 0 || props.actionsSlot}>
        <div class={classes()["actions"]} data-slot="actions">
          <Show
            when={props.actionsSlot}
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
            {props.actionsSlot}
          </Show>
        </div>
      </Show>

      <Show when={props.footerSlot}>
        <div class={classes()["footer"]} data-slot="footer">
          {props.footerSlot}
        </div>
      </Show>
    </div>
  );
};

import type { RLEmptyProps } from "./empty.types";
import { RLEmptyTheme } from "./empty.theme";
import { children, createMemo, omit, For, Show, type Component } from "solid-js";
import { RLButton } from "../button/RLButton";
import { RLAvatar } from "../avatar/RLAvatar";
import { RLIcon } from "../icon/RLIcon";

export const RLEmpty: Component<RLEmptyProps> = (props) => {
  const resolvedChildren = children(() => props.children);
  const resolvedHeaderSlot = children(() => props.headerSlot);
  const resolvedLeadingSlot = children(() => props.leadingSlot);
  const resolvedTitleSlot = children(() => props.titleSlot);
  const resolvedDescriptionSlot = children(() => props.descriptionSlot);
  const resolvedBodySlot = children(() => props.bodySlot);
  const resolvedActionsSlot = children(() => props.actionsSlot);
  const resolvedFooterSlot = children(() => props.footerSlot);

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

  const activeIcon = props.loading ? (props.loadingIcon ?? "i-lucide-loader-circle") : props.icon;
  const actionList = props.actions ?? [];

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
        when={resolvedHeaderSlot()}
        fallback={
          <div class={classes()["header"]} data-slot="header">
            <Show
              when={resolvedLeadingSlot()}
              fallback={
                <Show
                  when={activeIcon}
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
                      name={activeIcon!}
                      class={`size-full ${props.loading ? "animate-spin" : ""}`}
                      aria-hidden="true"
                    />
                  </div>
                </Show>
              }
            >
              {resolvedLeadingSlot()}
            </Show>

            <Show when={props.title || resolvedTitleSlot()}>
              <div class={classes()["title"]} data-slot="title">
                <Show when={resolvedTitleSlot()} fallback={props.title}>
                  {resolvedTitleSlot()}
                </Show>
              </div>
            </Show>

            <Show when={props.description || resolvedDescriptionSlot()}>
              <div class={classes()["description"]} data-slot="description">
                <Show when={resolvedDescriptionSlot()} fallback={props.description}>
                  {resolvedDescriptionSlot()}
                </Show>
              </div>
            </Show>
          </div>
        }
      >
        {resolvedHeaderSlot()}
      </Show>

      <Show when={resolvedBodySlot() || resolvedChildren()}>
        <div class={classes()["body"]} data-slot="body">
          <Show when={resolvedBodySlot()} fallback={resolvedChildren()}>
            {resolvedBodySlot()}
          </Show>
        </div>
      </Show>

      <Show when={(props.actions?.length ?? 0) > 0 || resolvedActionsSlot()}>
        <div class={classes()["actions"]} data-slot="actions">
          <Show
            when={resolvedActionsSlot()}
            fallback={
              <For each={actionList}>
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
            {resolvedActionsSlot()}
          </Show>
        </div>
      </Show>

      <Show when={resolvedFooterSlot()}>
        <div class={classes()["footer"]} data-slot="footer">
          {resolvedFooterSlot()}
        </div>
      </Show>
    </div>
  );
};

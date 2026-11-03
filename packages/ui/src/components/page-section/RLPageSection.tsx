import type { Component } from "solid-js";
import { For, Show } from "solid-js";
import type { RLPageSectionProps } from "./page-section.types";
import { RLPageSectionTheme } from "./page-section.theme";
import { RLIcon } from "../icon/RLIcon";
import { RLButton } from "../button/RLButton";

const OMIT_KEYS = [
  "ctaVariant",
  "headline",
  "icon",
  "title",
  "description",
  "links",
  "reverse",
  "contentVisibility",
  "containIntrinsicSize",
] as const;

export const RLPageSection: Component<RLPageSectionProps> = (props) => {
  const resolvedLayout = () => props.layout ?? "default";

  const { Tag, classes, rest, slots, children, theme } = RLPageSectionTheme.setup(props, {
    as: "section",
    omit: OMIT_KEYS,
    slots: [
      "backgroundSlot",
      "headerSlot",
      "leadingSlot",
      "titleSlot",
      "descriptionSlot",
      "bodySlot",
      "footerSlot",
      "actionSlot",
    ] as const,
    variants: (s) => ({
      layout: resolvedLayout(),
      ...(resolvedLayout() === "cta" ? { ctaVariant: props.ctaVariant ?? "solid" } : {}),
      orientation: props.orientation ?? "vertical",
      reverse: Boolean(props.reverse),
      headline: Boolean(props.headline),
      title: Boolean(s.titleSlot() ?? props.title),
      description: Boolean(s.descriptionSlot() ?? props.description),
      body: Boolean(s.bodySlot()),
    }),
  });

  const resolvedTitle = () => slots.titleSlot() ?? props.title;
  const resolvedDescription = () => slots.descriptionSlot() ?? props.description;

  const showHeader = () =>
    Boolean(
      slots.headerSlot() ||
      props.icon ||
      slots.leadingSlot() ||
      props.headline ||
      resolvedTitle() ||
      resolvedDescription(),
    );

  const showWrapper = () =>
    Boolean(
      showHeader() ||
      slots.bodySlot() ||
      slots.footerSlot() ||
      slots.actionSlot() ||
      (props.links?.length ?? 0) > 0,
    );

  return (
    <Tag
      data-slot="root"
      data-theme={theme()}
      data-orientation={props.orientation ?? "vertical"}
      class={`${classes().root} ${
        props.contentVisibility === "auto"
          ? "[content-visibility:auto] [contain-intrinsic-size:var(--rl-contain-intrinsic-size,auto_500px)]"
          : ""
      }`}
      style={
        props.containIntrinsicSize
          ? { "--rl-contain-intrinsic-size": props.containIntrinsicSize }
          : undefined
      }
      {...rest}
    >
      <Show when={slots.backgroundSlot()}>
        <div class={classes().background} data-slot="background">
          {slots.backgroundSlot()}
        </div>
      </Show>

      <div class={classes().container}>
        <Show when={showWrapper()}>
          <div class={classes().wrapper}>
            <Show when={slots.headerSlot()}>{slots.headerSlot()}</Show>

            <Show when={!slots.headerSlot() && showHeader()}>
              <div class={classes().header}>
                <Show when={props.icon || slots.leadingSlot()}>
                  <div class={classes().leading}>
                    <Show
                      when={slots.leadingSlot()}
                      fallback={
                        <RLIcon name={props.icon!} size="md" class={classes().leadingIcon} />
                      }
                    >
                      {slots.leadingSlot()}
                    </Show>
                  </div>
                </Show>

                <Show when={props.headline}>
                  <div class={classes().headline}>{props.headline}</div>
                </Show>

                <Show when={resolvedTitle()}>
                  <Show
                    when={resolvedLayout() === "hero"}
                    fallback={<h2 class={classes().title}>{resolvedTitle()}</h2>}
                  >
                    <h1 class={classes().title}>{resolvedTitle()}</h1>
                  </Show>
                </Show>

                <Show when={resolvedDescription()}>
                  <div class={classes().description}>{resolvedDescription()}</div>
                </Show>
              </div>
            </Show>

            <Show when={slots.bodySlot()}>
              <div class={classes().body}>{slots.bodySlot()}</div>
            </Show>

            <Show when={slots.footerSlot()}>
              <div class={classes().footer}>{slots.footerSlot()}</div>
            </Show>

            <Show
              when={!slots.footerSlot() && (slots.actionSlot() || (props.links?.length ?? 0) > 0)}
            >
              <div class={classes().footer}>
                <div class={classes().links}>
                  <For each={props.links ?? []}>{(link) => <RLButton size="lg" {...link} />}</For>
                  {slots.actionSlot()}
                </div>
              </div>
            </Show>
          </div>
        </Show>

        {children()}
      </div>
    </Tag>
  );
};

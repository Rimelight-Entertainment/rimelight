import { For, Show, type Component } from "solid-js";
import type { RLPageSectionProps } from "./page-section.types";
import { RLPageSectionTheme } from "./page-section.theme";
import { RLIcon } from "../icon/RLIcon";
import { RLButton } from "../button/RLButton";
import { renderSlot } from "../../slot";

const OMIT_KEYS = [
  "icon",
  "headline",
  "title",
  "description",
  "links",
  "reverse",
  "containIntrinsicSize",
  "contentVisibility",
  "style",
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
      ctaVariant: resolvedLayout() === "cta" ? (props.ctaVariant ?? "solid") : undefined,
      reverse: Boolean(props.reverse),
      hasHeadline: Boolean(props.headline),
      hasTitle: Boolean(s.titleSlot() ?? props.title),
      hasDescription: Boolean(s.descriptionSlot() ?? props.description),
      hasBody: Boolean(s.bodySlot()),
    }),
  });

  const resolvedTitle = () => slots.titleSlot() ?? props.title;
  const resolvedDescription = () => slots.descriptionSlot() ?? props.description;
  const hasLinks = () => (props.links?.length ?? 0) > 0;
  const hasDefaultHeader = () =>
    Boolean(slots.leadingSlot() ?? props.icon) ||
    Boolean(props.headline) ||
    Boolean(resolvedTitle()) ||
    Boolean(resolvedDescription());

  return (
    <Tag
      data-slot="root"
      data-theme={theme()}
      data-orientation={props.orientation ?? "vertical"}
      class={[
        classes().root,
        props.contentVisibility === "auto"
          ? "[content-visibility:auto] [contain-intrinsic-size:var(--rl-contain-intrinsic-size,auto_500px)]"
          : undefined,
      ]
        .filter(Boolean)
        .join(" ")}
      style={{ "--rl-contain-intrinsic-size": props.containIntrinsicSize }}
      {...rest}
    >
      <Show when={slots.backgroundSlot()}>
        <div class={classes().background} data-slot="background">
          {renderSlot(slots.backgroundSlot())}
        </div>
      </Show>

      <div class={classes().container}>
        <Show
          when={
            Boolean(slots.headerSlot()) ||
            hasDefaultHeader() ||
            Boolean(slots.bodySlot()) ||
            Boolean(slots.footerSlot()) ||
            Boolean(slots.actionSlot()) ||
            hasLinks()
          }
        >
          <div class={classes().wrapper}>
            <Show when={slots.headerSlot()}>{renderSlot(slots.headerSlot())}</Show>

            <Show when={!slots.headerSlot() && hasDefaultHeader()}>
              <div class={classes().header}>
                <Show when={slots.leadingSlot() ?? props.icon}>
                  <div class={classes().leading}>
                    <Show
                      when={slots.leadingSlot()}
                      fallback={
                        <Show when={props.icon}>
                          {(icon) => (
                            <RLIcon name={icon()} size="md" class={classes().leadingIcon} />
                          )}
                        </Show>
                      }
                    >
                      {renderSlot(slots.leadingSlot())}
                    </Show>
                  </div>
                </Show>

                <Show when={props.headline}>
                  <div class={classes().headline}>{props.headline}</div>
                </Show>

                <Show when={resolvedTitle()}>
                  <Show
                    when={resolvedLayout() === "hero"}
                    fallback={<h2 class={classes().title}>{renderSlot(resolvedTitle())}</h2>}
                  >
                    <h1 class={classes().title}>{renderSlot(resolvedTitle())}</h1>
                  </Show>
                </Show>

                <Show when={resolvedDescription()}>
                  <div class={classes().description}>{renderSlot(resolvedDescription())}</div>
                </Show>
              </div>
            </Show>

            <Show when={slots.bodySlot()}>
              <div class={classes().body}>{renderSlot(slots.bodySlot())}</div>
            </Show>

            <Show when={slots.footerSlot()}>
              <div class={classes().footer}>{renderSlot(slots.footerSlot())}</div>
            </Show>

            <Show when={!slots.footerSlot() && (hasLinks() || slots.actionSlot())}>
              <div class={classes().footer}>
                <Show when={hasLinks()}>
                  <div class={classes().links}>
                    <For each={props.links ?? []}>{(link) => <RLButton size="lg" {...link} />}</For>
                  </div>
                </Show>
                <Show when={slots.actionSlot()}>
                  <div class={classes().action}>{renderSlot(slots.actionSlot())}</div>
                </Show>
              </div>
            </Show>
          </div>
        </Show>

        {children()}
      </div>
    </Tag>
  );
};

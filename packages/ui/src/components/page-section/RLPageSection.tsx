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
  "background",
  "top",
  "header",
  "leading",
  "headlineSlot",
  "titleSlot",
  "descriptionSlot",
  "body",
  "footer",
  "linksSlot",
  "content",
  "bottom",
] as const;

export const RLPageSection: Component<RLPageSectionProps> = (props) => {
  const resolvedVariant = () =>
    props.variant === "default" || props.variant === "hero" || props.variant === "cta"
      ? props.variant
      : "default";

  const resolvedHeadline = () => props.headline ?? props.headlineSlot;
  const resolvedTitle = () => props.title ?? props.titleSlot;
  const resolvedDescription = () => props.description ?? props.descriptionSlot;

  const {
    Tag: Root,
    classes,
    rest,
  } = RLPageSectionTheme.setup(props, {
    as: "section",
    omit: OMIT_KEYS,
    variants: () => ({
      variant: resolvedVariant(),
      ...(resolvedVariant() === "cta" ? { ctaVariant: props.ctaVariant ?? "solid" } : {}),
      orientation: props.orientation ?? "vertical",
      reverse: Boolean(props.reverse),
      headline: Boolean(resolvedHeadline()),
      title: Boolean(resolvedTitle()),
      description: Boolean(resolvedDescription()),
      body: Boolean(props.body),
    }),
  });

  const showHeader = () =>
    Boolean(
      props.header ||
      props.icon ||
      props.leading ||
      resolvedHeadline() ||
      resolvedTitle() ||
      resolvedDescription(),
    );

  const showWrapper = () =>
    Boolean(
      showHeader() ||
      props.body ||
      props.footer ||
      props.linksSlot ||
      (props.links?.length ?? 0) > 0,
    );

  return (
    <Root
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
      <Show when={props.background}>
        <div class={classes().background} data-slot="background">
          {props.background}
        </div>
      </Show>

      {props.top}

      <div class={classes().container}>
        <Show when={showWrapper()}>
          <div class={classes().wrapper}>
            <Show when={props.header}>{props.header}</Show>

            <Show when={!props.header && showHeader()}>
              <div class={classes().header}>
                <Show when={props.icon || props.leading}>
                  <div class={classes().leading}>
                    <Show
                      when={props.leading}
                      fallback={
                        <RLIcon name={props.icon!} size="md" ui={{ root: classes().leadingIcon }} />
                      }
                    >
                      {props.leading}
                    </Show>
                  </div>
                </Show>

                <Show when={resolvedHeadline()}>
                  <div class={classes().headline}>{resolvedHeadline()}</div>
                </Show>

                <Show when={resolvedTitle()}>
                  <Show
                    when={resolvedVariant() === "hero"}
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

            <Show when={props.body}>
              <div class={classes().body}>{props.body}</div>
            </Show>

            <Show when={props.footer}>
              <div class={classes().footer}>{props.footer}</div>
            </Show>

            <Show when={!props.footer && (props.linksSlot || (props.links?.length ?? 0) > 0)}>
              <div class={classes().footer}>
                <div class={classes().links}>
                  <For each={props.links ?? []}>{(link) => <RLButton size="lg" {...link} />}</For>
                  {props.linksSlot}
                </div>
              </div>
            </Show>
          </div>
        </Show>

        {props.children}

        <Show when={props.content}>
          <div class="col-span-full w-full">{props.content}</div>
        </Show>
      </div>

      {props.bottom}
    </Root>
  );
};

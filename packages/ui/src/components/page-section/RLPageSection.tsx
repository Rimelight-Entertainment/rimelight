import type { Component } from "solid-js";
import { For, Show, createMemo } from "solid-js";
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

  // JSX slot props are getters: each read builds a new subtree and consumes hydration ids.
  // Memoize once so every read shares one subtree and ids match the server render.
  const background = createMemo(() => props.background);
  const top = createMemo(() => props.top);
  const header = createMemo(() => props.header);
  const leading = createMemo(() => props.leading);
  const body = createMemo(() => props.body);
  const footer = createMemo(() => props.footer);
  const linksSlot = createMemo(() => props.linksSlot);
  const content = createMemo(() => props.content);
  const bottom = createMemo(() => props.bottom);

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
      body: Boolean(body()),
    }),
  });

  const showHeader = () =>
    Boolean(
      header() ||
      props.icon ||
      leading() ||
      resolvedHeadline() ||
      resolvedTitle() ||
      resolvedDescription(),
    );

  const showWrapper = () =>
    Boolean(showHeader() || body() || footer() || linksSlot() || (props.links?.length ?? 0) > 0);

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
      <Show when={background()}>
        <div class={classes().background} data-slot="background">
          {background()}
        </div>
      </Show>

      {top()}

      <div class={classes().container}>
        <Show when={showWrapper()}>
          <div class={classes().wrapper}>
            <Show when={header()}>{header()}</Show>

            <Show when={!header() && showHeader()}>
              <div class={classes().header}>
                <Show when={props.icon || leading()}>
                  <div class={classes().leading}>
                    <Show
                      when={leading()}
                      fallback={
                        <RLIcon name={props.icon!} size="md" ui={{ root: classes().leadingIcon }} />
                      }
                    >
                      {leading()}
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

            <Show when={body()}>
              <div class={classes().body}>{body()}</div>
            </Show>

            <Show when={footer()}>
              <div class={classes().footer}>{footer()}</div>
            </Show>

            <Show when={!footer() && (linksSlot() || (props.links?.length ?? 0) > 0)}>
              <div class={classes().footer}>
                <div class={classes().links}>
                  <For each={props.links ?? []}>{(link) => <RLButton size="lg" {...link} />}</For>
                  {linksSlot()}
                </div>
              </div>
            </Show>
          </div>
        </Show>

        {props.children}

        <Show when={content()}>
          <div class="col-span-full w-full">{content()}</div>
        </Show>
      </div>

      {bottom()}
    </Root>
  );
};

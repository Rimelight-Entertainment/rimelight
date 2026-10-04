import { createMemo, omit, For, children, type Component, Show } from "solid-js";
import type { JSX } from "@solidjs/web";
import { Dynamic } from "@solidjs/web";
import type { PageSectionProps } from "./page-section";
import { pageSectionTheme } from "./page-section.theme";
import { RLIcon } from "../icon/RLIcon";
import { RLButton } from "../button/RLButton";

export interface RLPageSectionProps extends PageSectionProps {
  background?: JSX.Element;
  top?: JSX.Element;
  header?: JSX.Element;
  leading?: JSX.Element;
  headlineSlot?: JSX.Element;
  titleSlot?: JSX.Element;
  descriptionSlot?: JSX.Element;
  body?: JSX.Element;
  footer?: JSX.Element;
  linksSlot?: JSX.Element;
  content?: JSX.Element;
  bottom?: JSX.Element;
  children?: JSX.Element;
}

export const RLPageSection: Component<RLPageSectionProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
    "as",
    "variant",
    "ctaVariant",
    "headline",
    "icon",
    "title",
    "description",
    "links",
    "orientation",
    "reverse",
    "contentVisibility",
    "containIntrinsicSize",
    "ui",
    "class",
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
    "children",
  );

  const resolvedBackground = children(() => props.background);
  const resolvedTop = children(() => props.top);
  const resolvedHeader = children(() => props.header);
  const resolvedLeading = children(() => props.leading);
  const resolvedHeadlineSlot = children(() => props.headlineSlot);
  const resolvedTitleSlot = children(() => props.titleSlot);
  const resolvedDescriptionSlot = children(() => props.descriptionSlot);
  const resolvedBody = children(() => props.body);
  const resolvedFooter = children(() => props.footer);
  const resolvedLinksSlot = children(() => props.linksSlot);
  const resolvedContent = children(() => props.content);
  const resolvedBottom = children(() => props.bottom);
  const resolvedChildren = children(() => props.children);

  const resolvedVariant = () =>
    props.variant === "default" || props.variant === "hero" || props.variant === "cta"
      ? props.variant
      : "default";

  const resolvedClasses = createMemo(() =>
    pageSectionTheme({
      variant: resolvedVariant(),
      ...(resolvedVariant() === "cta" ? { ctaVariant: props.ctaVariant ?? "solid" } : {}),
      orientation: props.orientation ?? "vertical",
      reverse: !!props.reverse,
      headline: !!(resolvedHeadlineSlot() || props.headline),
      title: !!(resolvedTitleSlot() || props.title),
      description: !!(resolvedDescriptionSlot() || props.description),
      body: !!resolvedBody(),
      ui: props.ui,
      class: props.class,
    }),
  );

  const tag = () => props.as ?? "section";
  const titleTag = () => (resolvedVariant() === "hero" ? "h1" : "h2");

  const showHeader = () =>
    !!(
      resolvedHeader() ||
      props.icon ||
      props.headline ||
      resolvedHeadlineSlot() ||
      props.title ||
      resolvedTitleSlot() ||
      props.description ||
      resolvedDescriptionSlot()
    );

  const showWrapper = () =>
    !!(
      showHeader() ||
      resolvedBody() ||
      resolvedFooter() ||
      resolvedLinksSlot() ||
      (props.links?.length ?? 0) > 0
    );

  return (
    <Dynamic
      component={tag()}
      data-orientation={props.orientation ?? "vertical"}
      class={`${resolvedClasses().root}  ${
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
      <Show when={resolvedBackground()}>
        <div class={resolvedClasses().background} data-slot="background">
          {resolvedBackground()}
        </div>
      </Show>

      {resolvedTop()}

      <div class={resolvedClasses().container}>
        <Show when={showWrapper()}>
          <div class={resolvedClasses().wrapper}>
            <Show
              when={resolvedHeader()}
              fallback={
                <Show when={showHeader()}>
                  <div class={resolvedClasses().header}>
                    <Show when={props.icon || resolvedLeading()}>
                      <div class={resolvedClasses().leading}>
                        <Show
                          when={resolvedLeading()}
                          fallback={
                            <Show when={props.icon}>
                              <RLIcon
                                name={props.icon!}
                                size="md"
                                ui={{ root: resolvedClasses().leadingIcon }}
                              />
                            </Show>
                          }
                        >
                          {resolvedLeading()}
                        </Show>
                      </div>
                    </Show>

                    <Show when={props.headline || resolvedHeadlineSlot()}>
                      <div class={resolvedClasses().headline}>
                        {resolvedHeadlineSlot() ?? props.headline}
                      </div>
                    </Show>

                    <Show when={props.title || resolvedTitleSlot()}>
                      <Dynamic component={titleTag()} class={resolvedClasses().title}>
                        {resolvedTitleSlot() ?? props.title}
                      </Dynamic>
                    </Show>

                    <Show when={props.description || resolvedDescriptionSlot()}>
                      <div class={resolvedClasses().description}>
                        {resolvedDescriptionSlot() ?? props.description}
                      </div>
                    </Show>
                  </div>
                </Show>
              }
            >
              <div class={resolvedClasses().header}>{resolvedHeader()}</div>
            </Show>

            <Show when={resolvedBody()}>
              <div class={resolvedClasses().body}>{resolvedBody()}</div>
            </Show>

            <Show when={resolvedFooter() || resolvedLinksSlot() || (props.links?.length ?? 0) > 0}>
              <div class={resolvedClasses().footer}>
                <Show
                  when={resolvedFooter()}
                  fallback={
                    <div class={resolvedClasses().links}>
                      <For each={props.links ?? []}>
                        {(link) => <RLButton size="lg" {...link} />}
                      </For>
                      {resolvedLinksSlot()}
                    </div>
                  }
                >
                  {resolvedFooter()}
                </Show>
              </div>
            </Show>
          </div>
        </Show>

        <Show
          when={resolvedChildren() !== undefined && resolvedChildren() !== null}
          fallback={
            <Show when={(props.orientation ?? "vertical") === "horizontal"}>
              <div class="hidden lg:block" />
            </Show>
          }
        >
          {resolvedChildren()}
        </Show>

        <Show when={resolvedContent()}>
          <div class="col-span-full w-full">{resolvedContent()}</div>
        </Show>
      </div>

      {resolvedBottom()}
    </Dynamic>
  );
};

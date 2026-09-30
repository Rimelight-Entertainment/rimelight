import { createMemo, omit, For, type Component } from "solid-js";
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

const RLPageSection: Component<RLPageSectionProps> = (allProps) => {
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
      headline: !!(props.headlineSlot || props.headline),
      title: !!(props.titleSlot || props.title),
      description: !!(props.descriptionSlot || props.description),
      body: !!props.body,
      ui: props.ui,
      class: props.class,
    }),
  );

  const tag = () => props.as ?? "section";
  const titleTag = () => (resolvedVariant() === "hero" ? "h1" : "h2");

  const showHeader = () =>
    !!(
      props.header ||
      props.icon ||
      props.headline ||
      props.headlineSlot ||
      props.title ||
      props.titleSlot ||
      props.description ||
      props.descriptionSlot
    );

  const showWrapper = () =>
    !!(
      showHeader() ||
      props.body ||
      props.footer ||
      props.linksSlot ||
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
      {props.background ? (
        <div class={resolvedClasses().background} data-slot="background">
          {props.background}
        </div>
      ) : null}

      {props.top}

      <div class={resolvedClasses().container}>
        {showWrapper() ? (
          <div class={resolvedClasses().wrapper}>
            {showHeader() ? (
              <div class={resolvedClasses().header}>
                {props.header ? (
                  props.header
                ) : (
                  <>
                    {props.icon || props.leading ? (
                      <div class={resolvedClasses().leading}>
                        {props.leading ? (
                          props.leading
                        ) : props.icon ? (
                          <RLIcon
                            name={props.icon}
                            size="md"
                            ui={{ root: resolvedClasses().leadingIcon }}
                          />
                        ) : null}
                      </div>
                    ) : null}

                    {props.headline || props.headlineSlot ? (
                      <div class={resolvedClasses().headline}>
                        {props.headlineSlot ?? props.headline}
                      </div>
                    ) : null}

                    {props.title || props.titleSlot ? (
                      <Dynamic component={titleTag()} class={resolvedClasses().title}>
                        {props.titleSlot ?? props.title}
                      </Dynamic>
                    ) : null}

                    {props.description || props.descriptionSlot ? (
                      <div class={resolvedClasses().description}>
                        {props.descriptionSlot ?? props.description}
                      </div>
                    ) : null}
                  </>
                )}
              </div>
            ) : null}

            {props.body ? <div class={resolvedClasses().body}>{props.body}</div> : null}

            {props.footer || props.linksSlot || (props.links?.length ?? 0) > 0 ? (
              <div class={resolvedClasses().footer}>
                {props.footer ? (
                  props.footer
                ) : (
                  <div class={resolvedClasses().links}>
                    <For each={props.links ?? []}>{(link) => <RLButton size="lg" {...link} />}</For>
                    {props.linksSlot}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        ) : null}

        {props.children !== undefined && props.children !== null ? (
          props.children
        ) : (props.orientation ?? "vertical") === "horizontal" ? (
          <div class="hidden lg:block" />
        ) : null}

        {props.content ? <div class="col-span-full w-full">{props.content}</div> : null}
      </div>

      {props.bottom}
    </Dynamic>
  );
};

export { RLPageSection };

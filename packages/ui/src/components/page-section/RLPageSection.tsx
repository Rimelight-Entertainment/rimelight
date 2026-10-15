import type { RLPageSectionProps } from "./page-section.types";
import { RLPageSectionTheme } from "./page-section.theme";
import { createMemo, omit, For, type Component, Show } from "solid-js";
import { dynamic } from "@solidjs/web";
import { RLIcon } from "../icon/RLIcon";
import { RLButton } from "../button/RLButton";

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

  const resolvedVariant = () =>
    props.variant === "default" || props.variant === "hero" || props.variant === "cta"
      ? props.variant
      : "default";

  const resolvedHeadline = () => props.headline ?? props.headlineSlot;
  const resolvedTitle = () => props.title ?? props.titleSlot;
  const resolvedDescription = () => props.description ?? props.descriptionSlot;

  const resolvedClasses = createMemo(() =>
    RLPageSectionTheme({
      variant: resolvedVariant(),
      ...(resolvedVariant() === "cta" ? { ctaVariant: props.ctaVariant ?? "solid" } : {}),
      orientation: props.orientation ?? "vertical",
      reverse: Boolean(props.reverse),
      headline: Boolean(resolvedHeadline()),
      title: Boolean(resolvedTitle()),
      description: Boolean(resolvedDescription()),
      body: Boolean(props.body),
      ui: props.ui,
      class: props.class,
    }),
  );

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

  const Root = dynamic(() => props.as ?? "section");

  return (
    <Root
      data-orientation={props.orientation ?? "vertical"}
      class={`${resolvedClasses().root} ${
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
        <div class={resolvedClasses().background} data-slot="background">
          {props.background}
        </div>
      </Show>

      {props.top}

      <div class={resolvedClasses().container}>
        <Show when={showWrapper()}>
          <div class={resolvedClasses().wrapper}>
            <Show when={props.header}>{props.header}</Show>

            <Show when={!props.header && showHeader()}>
              <div class={resolvedClasses().header}>
                <Show when={props.icon || props.leading}>
                  <div class={resolvedClasses().leading}>
                    <Show
                      when={props.leading}
                      fallback={
                        <RLIcon
                          name={props.icon!}
                          size="md"
                          ui={{ root: resolvedClasses().leadingIcon }}
                        />
                      }
                    >
                      {props.leading}
                    </Show>
                  </div>
                </Show>

                <Show when={resolvedHeadline()}>
                  <div class={resolvedClasses().headline}>{resolvedHeadline()}</div>
                </Show>

                <Show when={resolvedTitle()}>
                  <Show
                    when={resolvedVariant() === "hero"}
                    fallback={<h2 class={resolvedClasses().title}>{resolvedTitle()}</h2>}
                  >
                    <h1 class={resolvedClasses().title}>{resolvedTitle()}</h1>
                  </Show>
                </Show>

                <Show when={resolvedDescription()}>
                  <div class={resolvedClasses().description}>{resolvedDescription()}</div>
                </Show>
              </div>
            </Show>

            <Show when={props.body}>
              <div class={resolvedClasses().body}>{props.body}</div>
            </Show>

            <Show when={props.footer}>
              <div class={resolvedClasses().footer}>{props.footer}</div>
            </Show>

            <Show when={!props.footer && (props.linksSlot || (props.links?.length ?? 0) > 0)}>
              <div class={resolvedClasses().footer}>
                <div class={resolvedClasses().links}>
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

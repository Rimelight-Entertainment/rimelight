import type { RLTableOfContentsProps, TableOfContentsHeading } from "./table-of-contents.types";
import { RLTableOfContentsTheme } from "./table-of-contents.theme";
import { createMemo, createSignal, For, onSettled, Show, type Component } from "solid-js";
import { RLIcon } from "../icon/RLIcon";
import { RLLink } from "../link/RLLink";
import { uiT } from "../../locale";

const OMIT_KEYS = ["headings", "tableOfContents", "collapsible", "ref"] as const;

export const RLTableOfContents: Component<RLTableOfContentsProps> = (props) => {
  const { Tag, classes, rest, theme } = RLTableOfContentsTheme.setup(props, {
    as: "div",
    omit: OMIT_KEYS,
  });

  const [activeId, setActiveId] = createSignal("");
  const [open, setOpen] = createSignal(false);
  let rootRef: HTMLElement | undefined;
  let detailsRef: HTMLDetailsElement | undefined;

  const filteredHeadings = createMemo(() => {
    const config = props.tableOfContents;
    if (config === false) return [];
    const min = config?.minHeadingLevel ?? 2;
    const max = config?.maxHeadingLevel ?? 3;
    return props.headings.filter((h) => h.depth >= min && h.depth <= max);
  });

  onSettled(() => {
    if (props.collapsible === true || !rootRef) return;
    const root = rootRef;
    const update = () => {
      const links = root.querySelectorAll<HTMLAnchorElement>("a[data-slot=link]");
      if (links.length === 0) return;
      const threshold = window.innerHeight * 0.5;
      let active: string | undefined;
      links.forEach((link) => {
        const href = link.getAttribute("href");
        if (!href || href.charAt(0) !== "#") return;
        const id = href.substring(1);
        const heading = document.getElementById(id);
        if (heading && heading.getBoundingClientRect().top <= threshold) {
          active = id;
        }
      });
      setActiveId(active ?? "");
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  });

  return (
    <Show when={props.tableOfContents !== false}>
      <Show
        when={props.collapsible === true}
        fallback={
          <Tag
            ref={(el: HTMLElement) => (rootRef = el)}
            class={classes().root}
            data-slot="root"
            data-theme={theme()}
            hidden={filteredHeadings().length === 0}
            {...rest}
          >
            <div class={classes().container} data-slot="container">
              <h4 class={classes().title} data-slot="title">
                {uiT("toc.heading")}
              </h4>
              <ul class={classes().list} data-slot="list">
                <For each={filteredHeadings()}>
                  {(heading: TableOfContentsHeading) => (
                    <li class={classes().item} data-slot="item" data-depth={heading.depth}>
                      <RLLink
                        href={`#${heading.slug}`}
                        localize={false}
                        class={classes().link}
                        data-slot="link"
                        data-depth={heading.depth}
                        aria-current={activeId() === heading.slug ? "location" : undefined}
                      >
                        <span class={classes().linkText} data-slot="link-text">
                          {heading.text}
                        </span>
                      </RLLink>
                    </li>
                  )}
                </For>
              </ul>
            </div>
          </Tag>
        }
      >
        <details
          ref={(el: HTMLDetailsElement) => {
            detailsRef = el;
          }}
          class={classes().root}
          data-slot="root"
          data-theme={theme()}
          hidden={filteredHeadings().length === 0}
          onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
          {...rest}
        >
          <summary
            class={classes().trigger}
            data-slot="trigger"
            data-state={open() ? "open" : "closed"}
          >
            <span class={classes().triggerLabel} data-slot="trigger-label">
              <RLIcon
                name="list"
                class={classes().triggerIcon}
                data-slot="trigger-icon"
                aria-hidden="true"
              />
              <span>{uiT("toc.heading")}</span>
            </span>
            <RLIcon
              name="chevron-down"
              class={classes().trailingIcon}
              data-slot="trailing-icon"
              aria-hidden="true"
            />
          </summary>
          <div class={classes().body} data-slot="body">
            <ul class={classes().bodyList} data-slot="body-list">
              <For each={filteredHeadings()}>
                {(heading) => (
                  <li class={classes().bodyItem} data-slot="body-item" data-depth={heading.depth}>
                    <RLLink
                      href={`#${heading.slug}`}
                      localize={false}
                      class={classes().bodyLink}
                      data-slot="body-link"
                      data-depth={heading.depth}
                      onClick={() => {
                        if (detailsRef) detailsRef.open = false;
                        setOpen(false);
                      }}
                    >
                      {heading.text}
                    </RLLink>
                  </li>
                )}
              </For>
            </ul>
          </div>
        </details>
      </Show>
    </Show>
  );
};

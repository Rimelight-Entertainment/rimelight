import { createMemo, createSignal, For, onSettled, omit, type Component } from "solid-js"
import type { TableOfContentsProps, TableOfContentsHeading } from "./table-of-contents"
import { tableOfContentsTheme } from "./table-of-contents.theme"
import RLIcon from "../icon/RLIcon"

export interface RLTableOfContentsProps extends TableOfContentsProps {}

const RLTableOfContents: Component<RLTableOfContentsProps> = (allProps) => {
  const props = allProps
  const rest = omit(
    allProps,
    "headings",
    "collapsible",
    "containerSelector",
    "tableOfContents",
    "as",
    "ui",
    "class"
  )

  const [activeId, setActiveId] = createSignal("")
  const [open, setOpen] = createSignal(false)
  let rootRef: HTMLDivElement | undefined
  let detailsRef: HTMLDetailsElement | undefined

  const collapsible = () => props.collapsible === true
  const containerSelector = () => props.containerSelector ?? ".markdown-content"

  const minLevel = createMemo(() =>
    props.tableOfContents ? (props.tableOfContents.minHeadingLevel ?? 2) : 2
  )
  const maxLevel = createMemo(() =>
    props.tableOfContents ? (props.tableOfContents.maxHeadingLevel ?? 3) : 3
  )

  const filteredHeadings = createMemo(() =>
    props.tableOfContents !== false
      ? props.headings.filter((h) => h.depth >= minLevel() && h.depth <= maxLevel())
      : []
  )

  const headingSelector = createMemo(() =>
    Array.from(
      { length: maxLevel() - minLevel() + 1 },
      (_, i) => `:scope > h${minLevel() + i}`
    ).join(", ")
  )

  const resolvedClasses = createMemo(() =>
    tableOfContentsTheme({
      ui: props.ui,
      class: props.class
    })
  )

  onSettled(() => {
    if (collapsible() || !rootRef) return
    const update = () => {
      const root = rootRef
      if (!root) return
      const links = root.querySelectorAll(".toc-link")
      if (links.length === 0) return
      const threshold = window.innerHeight * 0.5
      let active: string | undefined
      links.forEach((link) => {
        const href = link.getAttribute("href")
        if (!href || href.charAt(0) !== "#") return
        const id = href.substring(1)
        const heading = document.getElementById(id)
        if (heading && heading.getBoundingClientRect().top <= threshold) {
          active = id
        }
      })
      setActiveId(active ?? "")
    }
    update()
    window.addEventListener("scroll", update, { passive: true })
    return () => window.removeEventListener("scroll", update)
  })

  const depthClass = (depth: number) => {
    if (depth === 2) return "pl-xs"
    if (depth === 3) return "pl-6"
    return "pl-9"
  }

  if (props.tableOfContents === false || filteredHeadings().length === 0) {
    return null
  }

  if (collapsible()) {
    return (
      <details
        ref={(el) => (detailsRef = el)}
        class={props.class}
        data-rl-toc-collapsible
        data-container-selector={containerSelector()}
        data-heading-selector={headingSelector()}
        onToggle={(e) => setOpen((e.currentTarget as HTMLDetailsElement).open)}
        {...rest}
      >
        <summary class="flex items-center justify-between gap-3 px-4 h-10 text-sm font-medium text-highlighted cursor-pointer select-none hover:bg-muted/40 transition-colors list-none">
          <span class="flex items-center gap-2">
            <RLIcon name="i-rl-list" class="size-4 text-primary shrink-0" aria-hidden="true" />
            <span>On this page</span>
          </span>
          <RLIcon
            name="i-rl-chevronDown"
            class={`rl-toc-chevron size-4 text-muted shrink-0 transition-transform duration-200 ${
              open() ? "rotate-180" : ""
            }`}
            aria-hidden="true"
          />
        </summary>
        <div class="px-4 pt-3 max-h-[40vh] overflow-y-auto border-t border-default/50 bg-default">
          <ul class="flex flex-col gap-0.5 pb-8">
            <For each={filteredHeadings()}>
              {(heading) => (
                <li class={heading.depth === 3 ? "pl-4" : undefined}>
                  <a
                    href={`#${heading.slug}`}
                    class={`toc-link block py-1.5 text-sm transition-colors hover:text-primary no-underline ${
                      heading.depth === 2 ? "text-highlighted font-medium" : "text-muted"
                    }`}
                    data-rl-toc-link
                    onClick={() => {
                      if (detailsRef) detailsRef.open = false
                      setOpen(false)
                    }}
                  >
                    {heading.text}
                  </a>
                </li>
              )}
            </For>
          </ul>
        </div>
      </details>
    )
  }

  return (
    <>
      <style>{`
  .toc-active {
    color: var(--rl-primary-500);
    font-weight: 600;
  }
`}</style>
      <div
        ref={(el) => (rootRef = el)}
        class={resolvedClasses().root}
        data-slot="root"
        data-container-selector={containerSelector()}
        data-heading-selector={headingSelector()}
        {...rest}
      >
        <div class={resolvedClasses().container} data-slot="container">
          <h4 class={resolvedClasses().title} data-slot="title">
            On this page
          </h4>
          <ul class={`${resolvedClasses().list} mt-2xl flex flex-col gap-xs`} data-slot="list">
            <For each={filteredHeadings()}>
              {(heading: TableOfContentsHeading) => (
                <li
                  class={`${resolvedClasses().item} ${depthClass(heading.depth)}`}
                  data-slot="item"
                >
                  <a
                    href={`#${heading.slug}`}
                    class={`toc-link ${resolvedClasses().link} ${
                      activeId() === heading.slug ? "toc-active" : ""
                    }`}
                    data-slot="link"
                  >
                    <span class={resolvedClasses().linkText} data-slot="link-text">
                      {heading.text}
                    </span>
                  </a>
                </li>
              )}
            </For>
          </ul>
        </div>
      </div>
    </>
  )
}

export { RLTableOfContents }
export default RLTableOfContents

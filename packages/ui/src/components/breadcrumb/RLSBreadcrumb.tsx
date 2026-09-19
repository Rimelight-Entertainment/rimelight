import { createMemo, splitProps, For, type Component, type JSX } from "solid-js"
import type { BreadcrumbItem, BreadcrumbProps } from "./breadcrumb"
import { breadcrumbTheme } from "./breadcrumb.theme"
import RLSIcon from "../icon/RLSIcon"

export interface RLSBreadcrumbProps extends BreadcrumbProps {
  children?: JSX.Element
  separator?: JSX.Element
}

const RLSBreadcrumb: Component<RLSBreadcrumbProps> = (allProps) => {
  const [props, rest] = splitProps(allProps, [
    "items",
    "maxVisible",
    "estimatedItemWidth",
    "separatorIcon",
    "separator",
    "children",
    "ui",
    "class"
  ])

  const classes = createMemo(() =>
    breadcrumbTheme({
      ui: props.ui,
      class: props.class
    })
  )

  const allItems = () => props.items ?? []
  const firstItem = () => allItems()[0]
  const lastItem = () => (allItems().length > 1 ? allItems()[allItems().length - 1] : null)
  const allMidItems = () =>
    allItems().length > 2 ? allItems().slice(1, allItems().length - 1) : []

  const effectiveMaxMid = () =>
    props.maxVisible !== undefined ? Math.max(0, props.maxVisible - 2) : allMidItems().length

  const renderedMidItems = () => allMidItems().slice(allMidItems().length - effectiveMaxMid())
  const hiddenMidCount = () => Math.max(0, allMidItems().length - effectiveMaxMid())
  const hasMidItems = () => renderedMidItems().length > 0

  const separatorEl = () => (
    <span class={classes()["separator"]} data-slot="separator" aria-hidden="true">
      {props.separator !== undefined ? (
        props.separator
      ) : (
        <RLSIcon name={props.separatorIcon ?? "chevronRight"} />
      )}
    </span>
  )

  const itemMarker = (item: BreadcrumbItem) =>
    item.href ? (
      <a href={item.href} class={classes()["link"]} data-slot="link">
        {item.label}
      </a>
    ) : (
      <span class={classes()["page"]} data-slot="page">
        {item.label}
      </span>
    )

  const ldJson = () =>
    JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": allItems().map((item, idx) => ({
        "@type": "ListItem",
        "position": idx + 1,
        "name": item.label,
        "item": item.href
          ? new URL(item.href, "https://starter.rimelight.com").toString()
          : undefined
      }))
    })

  return (
    <>
      <nav aria-label="breadcrumb" class={classes()["root"]} data-slot="breadcrumb-root" {...rest}>
        {props.items ? (
          <ol class={classes()["list"]} data-slot="list">
            {firstItem() && (
              <li class={classes()["item"]} data-slot="item">
                {itemMarker(firstItem()!)}
                {(hasMidItems() || hiddenMidCount() > 0 || lastItem()) && separatorEl()}
              </li>
            )}

            {hiddenMidCount() > 0 && (
              <li
                class="inline-flex items-center gap-1 list-none shrink-0"
                aria-hidden="true"
                data-slot="overflow"
              >
                <span class="text-muted tracking-wider font-medium">…</span>
                <span class="text-muted text-[11px] font-semibold">+{hiddenMidCount()}</span>
                {separatorEl()}
              </li>
            )}

            <For each={renderedMidItems()}>
              {(item) => (
                <li class={classes()["item"]} data-slot="item">
                  {itemMarker(item)}
                  {separatorEl()}
                </li>
              )}
            </For>

            {lastItem() && (
              <li class={classes()["item"]} data-slot="item">
                <span class={classes()["page"]} data-slot="page" aria-current="page">
                  {lastItem()!.label}
                </span>
              </li>
            )}
          </ol>
        ) : (
          <ol class={classes()["list"]} data-slot="list">
            {props.children}
          </ol>
        )}
      </nav>

      {props.items && <script type="application/ld+json" innerHTML={ldJson()} />}
    </>
  )
}

export default RLSBreadcrumb

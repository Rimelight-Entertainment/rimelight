import { createMemo, splitProps, type Component, type JSX } from "solid-js"
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

  const allItems = props.items ?? []
  const firstItem = allItems[0]
  const lastItem = allItems.length > 1 ? allItems[allItems.length - 1] : null
  const allMidItems = allItems.length > 2 ? allItems.slice(1, allItems.length - 1) : []

  const effectiveMaxMid =
    props.maxVisible !== undefined ? Math.max(0, props.maxVisible - 2) : allMidItems.length

  const renderedMidItems = allMidItems.slice(allMidItems.length - effectiveMaxMid)
  const baseHiddenCount = Math.max(0, allMidItems.length - effectiveMaxMid)

  const hasMidItems = renderedMidItems.length > 0
  const needsOverflow = allItems.length > 2

  const uid = Math.random().toString(36).substring(2, 9)
  const cName = `rla-bc-${uid}`

  let instanceCss = ""
  if (needsOverflow && hasMidItems) {
    for (let i = 0; i < renderedMidItems.length; i++) {
      const hiddenItems = i + 1
      const visibleMids = renderedMidItems.length - hiddenItems
      const visibleTotal = 2 + visibleMids
      const maxWidth = visibleTotal * (props.estimatedItemWidth ?? 120) + 60
      const hideNthChild = 3 + i

      instanceCss += `\n@container ${cName} (max-width: ${maxWidth}px) {`
      instanceCss += `\n  [data-bc="${uid}"] { --hidden-items: ${hiddenItems}; }`
      instanceCss += `\n  [data-bc="${uid}"] > li.hidable:nth-child(${hideNthChild}) { display: none; }`
      instanceCss += `\n  [data-bc="${uid}"] > .rla-bc-overflow { display: flex; }`
      instanceCss += `\n}`
    }
  }

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

  const ldJson = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": allItems.map((item, idx) => ({
      "@type": "ListItem",
      "position": idx + 1,
      "name": item.label,
      "item": item.href ? new URL(item.href, "https://starter.rimelight.com").toString() : undefined
    }))
  })

  const staticCss = `
  .rla-bc-host {
    display: block;
    width: 100%;
  }

  .rla-bc-overflow {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    list-style: none;
    flex-shrink: 0;
  }

  .rla-bc-overflow-hidden {
    display: none;
  }

  .rla-bc-ellipsis {
    color: var(--rl-neutral-600);
    letter-spacing: 0.05em;
    font-weight: 500;
  }

  .rla-bc-more-count::after {
    counter-reset: rla-bc-cnt calc(var(--base-hidden, 0) + var(--hidden-items, 0));
    content: "+" counter(rla-bc-cnt);
    color: var(--rl-neutral-600);
    font-size: 0.6875rem;
    font-weight: 600;
    vertical-align: super;
    line-height: 1;
  }`

  return (
    <>
      <nav aria-label="breadcrumb" class={classes()["root"]} data-slot="breadcrumb-root" {...rest}>
        {props.items ? (
          <div class="rla-bc-host" style={`container-type: inline-size; container-name: ${cName};`}>
            <ol
              class={classes()["list"]}
              data-slot="list"
              data-bc={uid}
              style={`--base-hidden: ${baseHiddenCount}; --hidden-items: 0;`}
            >
              {firstItem && (
                <li class={classes()["item"]} data-slot="item">
                  {itemMarker(firstItem)}
                  {(hasMidItems || lastItem) && separatorEl()}
                </li>
              )}

              {needsOverflow && (
                <li
                  class={
                    baseHiddenCount === 0
                      ? "rla-bc-overflow rla-bc-overflow-hidden"
                      : "rla-bc-overflow"
                  }
                  aria-hidden="true"
                  data-slot="overflow"
                >
                  <span class="rla-bc-ellipsis">…</span>
                  <span class="rla-bc-more-count" />
                  {separatorEl()}
                </li>
              )}

              {renderedMidItems.map((item) => (
                <li class={`${classes()["item"]} hidable`} data-slot="item">
                  {itemMarker(item)}
                  {separatorEl()}
                </li>
              ))}

              {lastItem && (
                <li class={classes()["item"]} data-slot="item">
                  <span class={classes()["page"]} data-slot="page" aria-current="page">
                    {lastItem.label}
                  </span>
                </li>
              )}
            </ol>
          </div>
        ) : (
          <ol class={classes()["list"]} data-slot="list">
            {props.children}
          </ol>
        )}
      </nav>

      <style>{staticCss + instanceCss}</style>

      {props.items && <script type="application/ld+json" innerHTML={ldJson} />}
    </>
  )
}

export default RLSBreadcrumb

export interface TableOfContentsHeading {
  depth: number
  slug: string
  text: string
}

export interface TableOfContentsConfig {
  minHeadingLevel?: number
  maxHeadingLevel?: number
}

export interface TableOfContentsProps {
  headings: TableOfContentsHeading[]
  /**
   * False = hide entirely, object = heading level bounds
   */
  tableOfContents?: false | TableOfContentsConfig
  /**
   * CSS selector for the container element whose headings should be tracked.
   *
   * @default ".markdown-content"
   */
  containerSelector?: string
  /**
   * Render as a collapsible dropdown (<details>/<summary>) with a scrollable list and a built-in
   * bottom gap. Intended for small-screen / mobile contexts.
   */
  collapsible?: boolean
  /**
   * The component the root element should render as.
   *
   * @default "div"
   */
  as?: any
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any
  [key: string]: unknown
}

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
  /** false = hide entirely, object = heading level bounds */
  tableOfContents?: false | TableOfContentsConfig
  /** @deprecated use tableOfContents.maxHeadingLevel instead */
  levels?: 1 | 2 | 3
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

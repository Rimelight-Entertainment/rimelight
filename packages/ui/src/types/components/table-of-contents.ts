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

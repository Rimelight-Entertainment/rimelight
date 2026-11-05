import type { InferThemeProps } from "../../resolver";
import type { RLTableOfContentsTheme } from "./table-of-contents.theme";

export interface TableOfContentsHeading {
  depth: number;
  slug: string;
  text: string;
}

export interface TableOfContentsConfig {
  /**
   * Shallowest heading level to include.
   * @default 2
   */
  minHeadingLevel?: number | undefined;
  /**
   * Deepest heading level to include.
   * @default 3
   */
  maxHeadingLevel?: number | undefined;
}

export type RLTableOfContentsProps = InferThemeProps<typeof RLTableOfContentsTheme> & {
  /**
   * Headings to list, in document order.
   */
  headings: TableOfContentsHeading[];
  /**
   * `false` hides the table of contents entirely. An object bounds the heading levels.
   * @default undefined
   */
  tableOfContents?: false | TableOfContentsConfig | undefined;
  /**
   * Render as a collapsible dropdown (`<details>`/`<summary>`) with a scrollable list and a built-in
   * bottom gap. Intended for small-screen / mobile contexts.
   * @default false
   */
  collapsible?: boolean | undefined;
};

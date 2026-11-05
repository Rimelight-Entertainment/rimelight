import type { SlotRenderer } from "../../types";
import type { InferThemeProps } from "../../resolver";
import type { RLTimelineTheme } from "./timeline.theme";

export interface TimelineItem {
  /**
   * Date text rendered above the title.
   */
  date?: string | undefined;
  /**
   * Title of the entry.
   */
  title?: string | undefined;
  /**
   * Description of the entry.
   */
  description?: string | undefined;
  /**
   * Icon name rendered inside the indicator when no avatar or `indicatorSlot` is set.
   */
  icon?: string | undefined;
  /**
   * Avatar rendered inside the indicator.
   */
  avatar?: { src?: string | undefined; alt?: string | undefined } | undefined;
  /**
   * Value that identifies the entry for `value`. Defaults to the item's index.
   */
  value?: string | number | undefined;
}

export interface TimelineSlotContext {
  item: TimelineItem;
  index: number;
}

export type RLTimelineProps = InferThemeProps<typeof RLTimelineTheme> & {
  /**
   * The entries to render.
   */
  items?: TimelineItem[] | undefined;
  /**
   * The size of the indicators and spacing.
   * @default "md"
   */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | undefined;
  /**
   * The orientation of the timeline.
   * @default "vertical"
   */
  orientation?: "horizontal" | "vertical" | undefined;
  /**
   * Index or value of the active entry. Entries before it are completed.
   */
  value?: string | number | undefined;
  /**
   * Initial active entry when `value` is not set.
   */
  defaultValue?: string | number | undefined;
  /**
   * When `true`, entries are laid out in reverse order.
   * @default false
   */
  reverse?: boolean | undefined;
  /**
   * Custom indicator content per entry. Replaces the avatar and icon.
   */
  indicatorSlot?: SlotRenderer<TimelineSlotContext>;
  /**
   * Custom wrapper content per entry. Replaces the date, title and description.
   */
  wrapperSlot?: SlotRenderer<TimelineSlotContext>;
  /**
   * Custom date content per entry. Falls back to `item.date`.
   */
  dateSlot?: SlotRenderer<TimelineSlotContext>;
  /**
   * Custom title content per entry. Falls back to `item.title`.
   */
  titleSlot?: SlotRenderer<TimelineSlotContext>;
  /**
   * Custom description content per entry. Falls back to `item.description`.
   */
  descriptionSlot?: SlotRenderer<TimelineSlotContext>;
};

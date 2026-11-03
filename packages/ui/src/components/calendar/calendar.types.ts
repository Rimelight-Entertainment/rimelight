import type { JSX } from "@solidjs/web";
import type { InferThemeProps } from "../../resolver";
import type { SlotRenderer } from "../../types";
import type { RLCalendarTheme } from "./calendar.theme";
import type { WeekdayFormat, WeekStartsOn } from "./calendar.helpers";

export type CalendarModelValue = string | Date | number | CalendarRangeValue | Date[] | null;
export type CalendarRangeValue = { start: Date; end: Date };

export type RLCalendarProps = Omit<
  InferThemeProps<typeof RLCalendarTheme>,
  "defaultValue" | "placeholder" | "view"
> & {
  /**
   * Picker granularity. `month` and `year` start in the matching picker view.
   * @default "date"
   */
  type?: "date" | "month" | "year";
  /**
   * Weekday label format in the header row.
   * @default "narrow"
   */
  weekdayFormat?: WeekdayFormat;
  /**
   * First day of the week (0 = Sunday). Derived from `locale` when omitted.
   * @default undefined
   */
  weekStartsOn?: WeekStartsOn;
  /**
   * BCP 47 locale used for labels and week start.
   * @default "en"
   */
  locale?: string;
  /**
   * Selected value. Providing it makes the calendar controlled.
   * @default undefined
   */
  value?: CalendarModelValue;
  /**
   * Initial value when uncontrolled.
   * @default undefined
   */
  defaultValue?: CalendarModelValue;
  /**
   * Called with the next value whenever the selection changes.
   * @default undefined
   */
  onValueChange?: (value: CalendarModelValue | undefined) => void;
  /**
   * Month/year shown in the calendar. Providing it makes the placeholder controlled.
   * @default undefined
   */
  placeholder?: Date;
  /**
   * Initial placeholder when uncontrolled. Falls back to the selected value, then today.
   * @default undefined
   */
  defaultPlaceholder?: Date;
  /**
   * Called with the next placeholder date whenever navigation changes it.
   * @default undefined
   */
  onPlaceholderChange?: (date: Date) => void;
  /**
   * Select a date range instead of a single date.
   * @default false
   */
  range?: boolean;
  /**
   * Select multiple individual dates.
   * @default false
   */
  multiple?: boolean;
  /**
   * Prevent clicking the selected date from clearing the selection.
   * @default false
   */
  preventDeselect?: boolean;
  /**
   * Keep the start or end of a range fixed while selecting the other end.
   * @default undefined
   */
  fixedDate?: "start" | "end";
  /**
   * Maximum number of days allowed in a range.
   * @default undefined
   */
  maximumDays?: number;
  /**
   * Allow ranges that span unavailable dates.
   * @default true
   */
  allowNonContiguousRanges?: boolean;
  /**
   * Called with the range start while a range is being picked.
   * @default undefined
   */
  onStartValueChange?: (value: Date | undefined) => void;
  /**
   * Called with a completed, valid range.
   * @default undefined
   */
  onValidValueChange?: (value: { start: Date; end: Date }) => void;
  /**
   * Disables the whole calendar.
   * @default false
   */
  disabled?: boolean;
  /**
   * Makes the calendar read-only: navigation works, selection does not.
   * @default false
   */
  readonly?: boolean;
  /**
   * Earliest selectable date.
   * @default undefined
   */
  minValue?: Date;
  /**
   * Latest selectable date.
   * @default undefined
   */
  maxValue?: Date;
  /**
   * Returns true for dates that cannot be selected.
   * @default undefined
   */
  isDateDisabled?: (date: Date) => boolean;
  /**
   * Returns true for dates that are shown but unavailable.
   * @default undefined
   */
  isDateUnavailable?: (date: Date) => boolean;
  /**
   * Returns true for months that cannot be selected in the month picker.
   * @default undefined
   */
  isMonthDisabled?: (date: Date) => boolean;
  /**
   * Returns true for months that are unavailable in the month picker.
   * @default undefined
   */
  isMonthUnavailable?: (date: Date) => boolean;
  /**
   * Returns true for years that cannot be selected in the year picker.
   * @default undefined
   */
  isYearDisabled?: (date: Date) => boolean;
  /**
   * Returns true for years that are unavailable in the year picker.
   * @default undefined
   */
  isYearUnavailable?: (date: Date) => boolean;
  /**
   * Hide days that belong to adjacent months.
   * @default false
   */
  disableDaysOutsideCurrentView?: boolean;
  /**
   * Always render six weeks per month so the grid height is stable.
   * @default true
   */
  fixedWeeks?: boolean;
  /**
   * Number of month grids rendered side by side.
   * @default 1
   */
  numberOfMonths?: number;
  /**
   * Navigate by a full page of months when `numberOfMonths` is greater than 1.
   * @default false
   */
  pagedNavigation?: boolean;
  /**
   * Custom function computing the previous page date.
   * @default undefined
   */
  prevPage?: (date: Date) => Date;
  /**
   * Custom function computing the next page date.
   * @default undefined
   */
  nextPage?: (date: Date) => Date;
  /**
   * Focus the selected (or today's) day after mount.
   * @default false
   */
  initialFocus?: boolean;
  /**
   * Show the button that cycles between day, month and year views.
   * @default true
   */
  viewControl?: boolean;
  /**
   * Show the previous and next month buttons in the month and year views.
   * @default true
   */
  monthControls?: boolean;
  /**
   * Show the previous and next year buttons in the day view.
   * @default true
   */
  yearControls?: boolean;
  /**
   * Icon name for the previous month button (string icon).
   * @default "chevron-left"
   */
  prevIcon?: string;
  /**
   * Icon name for the next month button (string icon).
   * @default "chevron-right"
   */
  nextIcon?: string;
  /**
   * Accessible name of the calendar. The heading is appended to it.
   * @default "Event Date" (localized)
   */
  calendarLabel?: string;
  /**
   * Content replacing the heading label. Static JSX; rendered as-is.
   * @default undefined
   */
  headingSlot?: JSX.Element;
  /**
   * Weekday header cell content. Receives the weekday label.
   * @default undefined
   */
  weekDaySlot?: SlotRenderer<{ day: string }>;
  /**
   * Day cell content. Receives the day.
   * @default undefined
   */
  daySlot?: SlotRenderer<{ day: Date }>;
  /**
   * Month cell content in the month picker. Receives the month and its state.
   * @default undefined
   */
  monthCellSlot?: SlotRenderer<{ selected: boolean; disabled: boolean; month: Date }>;
  /**
   * Year cell content in the year picker. Receives the year and its state.
   * @default undefined
   */
  yearCellSlot?: SlotRenderer<{ selected: boolean; disabled: boolean; year: Date }>;
};

import type { JSX } from "@solidjs/web";
import type { ButtonProps } from "../button/button";

export type CalendarType = "date" | "month" | "year";
export type CalendarView = "day" | "month" | "year";
export type CalendarWeekdayFormat = "narrow" | "short" | "long";

export interface CalendarRangeValue {
  start?: Date | null;
  end?: Date | null;
}

export type CalendarModelValue = Date | Date[] | CalendarRangeValue | null | undefined;

export type CalendarControl = Partial<ButtonProps>;

export interface CalendarHeadingContext {
  value: string;
  view: CalendarView;
  date: Date;
  setView: (view: CalendarView) => void;
  setPlaceholder: (date: Date) => void;
}

export interface CalendarProps {
  /**
   * The element or component this component should render as.
   * @default "div"
   */
  as?: any;
  /**
   * The type of picker.
   * - `date` renders a day calendar whose heading can switch to a month then year view.
   * - `month` renders a standalone month picker.
   * - `year` renders a standalone year picker.
   * @default "date"
   */
  type?: CalendarType;
  /** The icon to use for the next year control. @default "chevronDoubleRight" */
  nextYearIcon?: any;
  /** Configure the next year button. `{ color: "neutral", variant: "ghost" }` */
  nextYear?: CalendarControl;
  /** The icon to use for the next month control. @default "chevronRight" */
  nextMonthIcon?: any;
  /** Configure the next month button. `{ color: "neutral", variant: "ghost" }` */
  nextMonth?: CalendarControl;
  /** The icon to use for the previous year control. @default "chevronDoubleLeft" */
  prevYearIcon?: any;
  /** Configure the prev year button. `{ color: "neutral", variant: "ghost" }` */
  prevYear?: CalendarControl;
  /** The icon to use for the previous month control. @default "chevronLeft" */
  prevMonthIcon?: any;
  /** Configure the prev month button. `{ color: "neutral", variant: "ghost" }` */
  prevMonth?: CalendarControl;
  /**
   * Whether to make the heading a button that switches between the day, month and year views.
   * Has no effect when `type` is `year`. Can be an object to override the button props.
   * @default true
   */
  viewControl?: boolean | CalendarControl;
  /** @default "primary" */
  color?: "primary" | "secondary" | "success" | "info" | "warning" | "error" | "neutral";
  /** @default "solid" */
  variant?: "solid" | "outline" | "soft" | "subtle";
  /** @default "md" */
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  /** Whether or not a range of dates can be selected */
  range?: boolean;
  /** Whether or not multiple dates can be selected */
  multiple?: boolean;
  /** Show month controls @default true */
  monthControls?: boolean;
  /** Show year controls @default true */
  yearControls?: boolean;
  /** The default selected value (uncontrolled) */
  defaultValue?: CalendarModelValue;
  /** The selected value (controlled) */
  modelValue?: CalendarModelValue;
  /** Show week numbers */
  weekNumbers?: boolean;
  /** The default displayed date (uncontrolled) */
  defaultPlaceholder?: Date;
  /** The displayed date (controlled) */
  placeholder?: Date;
  /** When combined with `isDateUnavailable`, determines whether non-contiguous ranges may be selected */
  allowNonContiguousRanges?: boolean;
  /** Whether the previous and next buttons navigate by the number of months displayed at once */
  pagedNavigation?: boolean;
  /** Whether to prevent the user from deselecting a date without selecting another first */
  preventDeselect?: boolean;
  /** The maximum number of days that can be selected in a range */
  maximumDays?: number;
  /** The day of the week to start the calendar on (0 = Sunday) */
  weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  /** The format to use for the weekday strings */
  weekdayFormat?: CalendarWeekdayFormat;
  /** Whether to always display 6 weeks in the calendar @default true */
  fixedWeeks?: boolean;
  /** The maximum date that can be selected */
  maxValue?: Date;
  /** The minimum date that can be selected */
  minValue?: Date;
  /** The locale to use for formatting dates */
  locale?: string;
  /** The number of months to display at once */
  numberOfMonths?: number;
  /** Whether the calendar is disabled */
  disabled?: boolean;
  /** Whether the calendar is readonly */
  readonly?: boolean;
  /** Focus the selected/today/first date on mount */
  initialFocus?: boolean;
  /** A function that returns whether a date is disabled */
  isDateDisabled?: (date: Date) => boolean;
  /** A function that returns whether a date is unavailable */
  isDateUnavailable?: (date: Date) => boolean;
  /** A function that returns whether a date is highlightable */
  isDateHighlightable?: (date: Date) => boolean;
  /** A function that returns the next page of the calendar */
  nextPage?: (placeholder: Date) => Date;
  /** A function that returns the previous page of the calendar */
  prevPage?: (placeholder: Date) => Date;
  /** Whether to disable days outside the current view */
  disableDaysOutsideCurrentView?: boolean;
  /** Which part of the range should be fixed */
  fixedDate?: "start" | "end";
  /** A function that returns whether a month is disabled */
  isMonthDisabled?: (date: Date) => boolean;
  /** A function that returns whether a month is unavailable */
  isMonthUnavailable?: (date: Date) => boolean;
  /** A function that returns whether a year is disabled */
  isYearDisabled?: (date: Date) => boolean;
  /** A function that returns whether a year is unavailable */
  isYearUnavailable?: (date: Date) => boolean;
  /** The accessible label for the calendar */
  calendarLabel?: string;
  /** Slot-specific CSS class overrides. */
  ui?: Record<string, any>;
  /** Additional CSS classes to apply to the root element. */
  class?: any;
  /** Called whenever the model value changes (Nuxt `update:modelValue`). */
  onUpdateValue?: (value: CalendarModelValue) => void;
  /** Called whenever the displayed date changes (Nuxt `update:placeholder`). */
  onUpdatePlaceholder?: (date: Date) => void;
  /** Called whenever a valid range is committed (Nuxt `update:validModelValue`). */
  onUpdateValidValue?: (value: CalendarRangeValue) => void;
  /** Called whenever the range start changes (Nuxt `update:startValue`). */
  onUpdateStartValue?: (date: Date | undefined) => void;
  /** Replaces the heading content (Nuxt `heading` slot). */
  headingSlot?: (ctx: CalendarHeadingContext) => JSX.Element;
  /** Replaces the day cell content (Nuxt `day` slot). */
  daySlot?: (ctx: { day: Date }) => JSX.Element;
  /** Replaces the weekday header content (Nuxt `week-day` slot). */
  weekDaySlot?: (ctx: { day: string }) => JSX.Element;
  /** Replaces the month cell content (Nuxt `month-cell` slot). */
  monthCellSlot?: (ctx: { month: Date; selected: boolean; disabled: boolean }) => JSX.Element;
  /** Replaces the year cell content (Nuxt `year-cell` slot). */
  yearCellSlot?: (ctx: { year: Date; selected: boolean; disabled: boolean }) => JSX.Element;
}

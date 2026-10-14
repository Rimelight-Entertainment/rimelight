export type WeekStartsOn = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type WeekdayFormat = "narrow" | "short" | "long";
export type CalendarRangeLike = { start?: Date | null; end?: Date | null };

export interface CalendarMonthGrid {
  value: Date;
  rows: Date[][];
  cells: Date[];
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

export function endOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

export function daysInMonth(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

export function addMonths(d: Date, n: number): Date {
  const day = d.getDate();
  const target = new Date(d.getFullYear(), d.getMonth() + n, 1);
  target.setDate(Math.min(day, daysInMonth(target)));
  return target;
}

export function addYears(d: Date, n: number): Date {
  return addMonths(d, n * 12);
}

export function isSameDay(a: Date | null | undefined, b: Date | null | undefined): boolean {
  if (!a || !b) return false;
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export function isSameMonth(a: Date | null | undefined, b: Date | null | undefined): boolean {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export function isSameYear(a: Date | null | undefined, b: Date | null | undefined): boolean {
  if (!a || !b) return false;
  return a.getFullYear() === b.getFullYear();
}

export function compareDays(a: Date, b: Date): number {
  return startOfDay(a).getTime() - startOfDay(b).getTime();
}

export function isBefore(a: Date, b: Date): boolean {
  return compareDays(a, b) < 0;
}

export function isAfter(a: Date, b: Date): boolean {
  return compareDays(a, b) > 0;
}

export function isBetweenInclusive(date: Date, start: Date, end: Date): boolean {
  const t = compareDays(date, start);
  const u = compareDays(date, end);
  return t >= 0 && u <= 0;
}

export function clampDay(date: Date, min?: Date | null, max?: Date | null): Date {
  if (min && compareDays(date, min) < 0) return startOfDay(min);
  if (max && compareDays(date, max) > 0) return startOfDay(max);
  return startOfDay(date);
}

export function dateKey(d: Date): string {
  const m = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${d.getFullYear()}-${m}-${day}`;
}

export function todayKey(): string {
  return dateKey(new Date());
}

export function getWeekStartsOn(locale?: string): WeekStartsOn {
  try {
    const info = (new Intl.Locale(locale || "en") as { weekInfo?: { firstDay?: number } }).weekInfo;
    if (info && typeof info.firstDay === "number") {
      return (info.firstDay % 7) as WeekStartsOn;
    }
  } catch {
    /* Intl.Locale weekInfo unsupported */
  }
  return 1;
}

export function startOfWeek(d: Date, weekStartsOn: WeekStartsOn): Date {
  const dow = d.getDay();
  const diff = (dow - weekStartsOn + 7) % 7;
  return addDays(d, -diff);
}

export function endOfWeek(d: Date, weekStartsOn: WeekStartsOn): Date {
  return addDays(startOfWeek(d, weekStartsOn), 6);
}

/** ISO-8601 style week number (week 1 contains Jan 4), honoring `weekStartsOn`. */
export function getWeekNumber(d: Date, weekStartsOn: WeekStartsOn = 1): number {
  const date = startOfDay(d);
  const year = date.getFullYear();
  const firstWeekStart = startOfWeek(new Date(year, 0, 4), weekStartsOn);
  const thisWeekStart = startOfWeek(date, weekStartsOn);
  if (compareDays(thisWeekStart, firstWeekStart) < 0) {
    const prevFirstWeekStart = startOfWeek(new Date(year - 1, 0, 4), weekStartsOn);
    return Math.round((thisWeekStart.getTime() - prevFirstWeekStart.getTime()) / 604800000) + 1;
  }
  return Math.round((thisWeekStart.getTime() - firstWeekStart.getTime()) / 604800000) + 1;
}

export function createMonthGrid(
  dateObj: Date,
  weekStartsOn: WeekStartsOn,
  fixedWeeks: boolean,
): CalendarMonthGrid {
  const first = startOfMonth(dateObj);
  const last = endOfMonth(dateObj);
  const gridStart = startOfWeek(first, weekStartsOn);
  const gridEndCandidate = endOfWeek(last, weekStartsOn);
  let gridEnd = gridEndCandidate;

  const countDays = (a: Date, b: Date) =>
    Math.round((startOfDay(b).getTime() - startOfDay(a).getTime()) / 86400000) + 1;
  let total = countDays(gridStart, gridEnd);

  if (fixedWeeks && total < 42) {
    gridEnd = addDays(gridEnd, 42 - total);
    total = 42;
  }

  const cells: Date[] = [];
  for (let i = 0; i < total; i++) cells.push(addDays(gridStart, i));

  const rows: Date[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  return { value: first, rows, cells };
}

export function createMonths(
  dateObj: Date,
  numberOfMonths: number,
  weekStartsOn: WeekStartsOn,
  fixedWeeks: boolean,
): CalendarMonthGrid[] {
  const first = startOfMonth(dateObj);
  const months: CalendarMonthGrid[] = [];
  const count = Math.max(1, numberOfMonths || 1);
  for (let i = 0; i < count; i++) {
    months.push(createMonthGrid(addMonths(first, i), weekStartsOn, fixedWeeks));
  }
  return months;
}

/** 3x4 grid of the 12 months of `dateObj`'s year (day forced to 1). */
export function createMonthPickerGrid(dateObj: Date): Date[] {
  const out: Date[] = [];
  for (let m = 0; m < 12; m++) out.push(new Date(dateObj.getFullYear(), m, 1));
  return out;
}

/** Decade-aligned 3x4 grid of 12 years (Jan 1). */
export function createYearPickerGrid(dateObj: Date): Date[] {
  const startYear = Math.floor(dateObj.getFullYear() / 10) * 10;
  const out: Date[] = [];
  for (let i = 0; i < 12; i++) out.push(new Date(startYear + i, 0, 1));
  return out;
}

function monthFormatter(locale: string, opts: Intl.DateTimeFormatOptions): Intl.DateTimeFormat {
  return new Intl.DateTimeFormat(locale, opts);
}

export function formatWeekday(d: Date, locale: string, format: WeekdayFormat): string {
  return monthFormatter(locale, { weekday: format }).format(d);
}

export function formatDayLabel(d: Date, locale: string): string {
  return d.getDate().toLocaleString(locale);
}

export function formatMonthShort(d: Date, locale: string): string {
  return monthFormatter(locale, { month: "short" }).format(d);
}

export function formatMonthYearHeading(d: Date, locale: string): string {
  return monthFormatter(locale, { month: "long", year: "numeric" }).format(d);
}

export function formatYearHeading(d: Date, locale: string): string {
  return monthFormatter(locale, { year: "numeric" }).format(d);
}

export function formatFullDate(d: Date, locale: string): string {
  return monthFormatter(locale, {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export function formatYearRangeHeading(start: Date, end: Date, locale: string): string {
  const f = formatYearHeading(start, locale);
  const t = formatYearHeading(end, locale);
  return `${f} - ${t}`;
}

export function headingValueForGrids(grids: Date[], locale: string): string {
  if (!grids.length) return "";
  if (grids.length === 1) return formatMonthYearHeading(grids[0]!, locale);
  const start = grids[0]!;
  const end = grids[grids.length - 1]!;
  const startName = monthFormatter(locale, { month: "long" }).format(start);
  const endName = monthFormatter(locale, { month: "long" }).format(end);
  const startYear = formatYearHeading(start, locale);
  const endYear = formatYearHeading(end, locale);
  return startYear === endYear
    ? `${startName} - ${endName} ${endYear}`
    : `${startName} ${startYear} - ${endName} ${endYear}`;
}

export function weekDaysOfGrid(
  grid: CalendarMonthGrid,
  locale: string,
  format: WeekdayFormat,
): string[] {
  const row = grid.rows[0] ?? [];
  return row.slice(0, 7).map((d) => formatWeekday(d, locale, format));
}

export function resolveInitialPlaceholder(
  placeholder: Date | undefined,
  defaultPlaceholder: Date | undefined,
  value: unknown,
): Date {
  if (placeholder) return startOfDay(placeholder);
  if (defaultPlaceholder) return startOfDay(defaultPlaceholder);
  const fromValue = firstDateOf(value);
  if (fromValue) return startOfDay(fromValue);
  return startOfDay(new Date());
}

export function firstDateOf(value: unknown): Date | undefined {
  if (!value) return undefined;
  if (Array.isArray(value)) return value.length ? value[0] : undefined;
  if (value instanceof Date) return value;
  if (typeof value === "object") {
    const range = value as CalendarRangeLike;
    if (range.start instanceof Date) return range.start;
    if (range.end instanceof Date) return range.end;
  }
  return undefined;
}

export function rangeContains(value: unknown, date: Date): boolean {
  if (!value) return false;
  if (value instanceof Date) return isSameDay(value, date);
  if (Array.isArray(value)) return value.some((d) => isSameDay(d, date));
  const range = value as CalendarRangeLike;
  if (!range.start || !range.end) return false;
  return isBetweenInclusive(date, range.start, range.end);
}

export interface DayCellState {
  selected: boolean;
  today: boolean;
  outsideView: boolean;
  disabled: boolean;
  unavailable: boolean;
  focused: boolean;
}

export interface DayMatchContext {
  value: unknown;
  month: Date;
  today: Date;
  weekStartsOn: WeekStartsOn;
  disabled?: boolean;
  readonly?: boolean;
  minValue?: Date | null;
  maxValue?: Date | null;
  disableDaysOutsideCurrentView?: boolean;
  isDateDisabled?: (d: Date) => boolean;
  isDateUnavailable?: (d: Date) => boolean;
  placeholder: Date;
}

export function dayCellState(day: Date, month: Date, ctx: DayMatchContext): DayCellState {
  const outsideView = !isSameMonth(day, month);
  const minMaxDisabled =
    (!!ctx.minValue && isBefore(day, ctx.minValue)) ||
    (!!ctx.maxValue && isAfter(day, ctx.maxValue));
  const disabled =
    !!ctx.disabled ||
    minMaxDisabled ||
    !!ctx.isDateDisabled?.(day) ||
    (!!ctx.disableDaysOutsideCurrentView && outsideView);
  const unavailable = !!ctx.isDateUnavailable?.(day);
  const today = isSameDay(day, ctx.today);
  const selected = rangeContains(ctx.value, day);
  const focused = !outsideView && !disabled && isSameDay(day, ctx.placeholder);
  return { selected, today, outsideView, disabled, unavailable, focused };
}

export function isDaySelectable(date: Date, ctx: DayMatchContext): boolean {
  const s = dayCellState(date, date, { ...ctx, month: date });
  return !s.disabled && !s.unavailable && !ctx.readonly;
}

export type DayKeyResult = { target: Date; page: 0 | -1 | 1 };

export function resolveDayKey(
  key: string,
  date: Date,
  ctx: { weekStartsOn: WeekStartsOn; shiftKey?: boolean },
): DayKeyResult | null {
  switch (key) {
    case "ArrowRight":
      return { target: addDays(date, 1), page: 0 };
    case "ArrowLeft":
      return { target: addDays(date, -1), page: 0 };
    case "ArrowUp":
      return { target: addDays(date, -7), page: 0 };
    case "ArrowDown":
      return { target: addDays(date, 7), page: 0 };
    case "Home":
      return { target: startOfWeek(date, ctx.weekStartsOn), page: 0 };
    case "End":
      return { target: endOfWeek(date, ctx.weekStartsOn), page: 0 };
    case "PageUp":
      return { target: addMonths(date, ctx.shiftKey ? -12 : -1), page: ctx.shiftKey ? 0 : -1 };
    case "PageDown":
      return { target: addMonths(date, ctx.shiftKey ? 12 : 1), page: ctx.shiftKey ? 0 : 1 };
    default:
      return null;
  }
}

export type CellKeyResult = { target: Date; page: 0 | -1 | 1 };

export function resolveCellKey(
  key: string,
  date: Date,
  mode: "month" | "year",
  step: number,
): CellKeyResult | null {
  if (key === "ArrowRight")
    return { target: mode === "month" ? addMonths(date, 1) : addYears(date, 1), page: 0 };
  if (key === "ArrowLeft")
    return { target: mode === "month" ? addMonths(date, -1) : addYears(date, -1), page: 0 };
  if (key === "ArrowUp")
    return { target: mode === "month" ? addMonths(date, -4) : addYears(date, -4), page: 0 };
  if (key === "ArrowDown")
    return { target: mode === "month" ? addMonths(date, 4) : addYears(date, 4), page: 0 };
  if (key === "PageUp")
    return { target: mode === "month" ? addYears(date, -1) : addYears(date, -step), page: -1 };
  if (key === "PageDown")
    return { target: mode === "month" ? addYears(date, 1) : addYears(date, step), page: 1 };
  return null;
}

export interface RangeSelection {
  start?: Date | undefined;
  end?: Date | undefined;
}

export function applyRangeClick(
  current: RangeSelection,
  clicked: Date,
  opts: { preventDeselect?: boolean; fixedDate?: "start" | "end"; maximumDays?: number },
): RangeSelection {
  const day = startOfDay(clicked);
  if (!current.start) return { start: day, end: undefined };

  if (!current.end) {
    if (isSameDay(current.start, day) && !opts.preventDeselect) {
      return { start: undefined, end: undefined };
    }
    let start = current.start;
    let end = day;
    if (isBefore(end, start)) {
      [start, end] = [end, start];
    }
    if (
      opts.maximumDays &&
      Math.round((end.getTime() - start.getTime()) / 86400000) + 1 > opts.maximumDays
    ) {
      return { start: day, end: undefined };
    }
    return { start, end };
  }

  if (isSameDay(current.start, day) && isSameDay(current.end, day) && !opts.preventDeselect) {
    return { start: undefined, end: undefined };
  }
  if (!opts.fixedDate) return { start: day, end: undefined };
  if (opts.fixedDate === "start") {
    return isBefore(day, current.start)
      ? { start: day, end: current.end }
      : { start: current.start, end: day };
  }
  return isAfter(day, current.end ?? day)
    ? { start: current.start, end: day }
    : { start: day, end: current.end };
}

export function toggleSingleValue(
  current: Date | null | undefined,
  clicked: Date,
  preventDeselect?: boolean,
): Date | null | undefined {
  if (current && isSameDay(current, clicked) && !preventDeselect) return undefined;
  return startOfDay(clicked);
}

export function toggleMultiValue(
  current: Date[] | null | undefined,
  clicked: Date,
  preventDeselect?: boolean,
): Date[] | undefined {
  const list = current ?? [];
  const day = startOfDay(clicked);
  const idx = list.findIndex((d) => isSameDay(d, day));
  if (idx === -1) return [...list, day];
  if (preventDeselect) return list;
  const next = list.filter((_, i) => i !== idx);
  return next.length ? next : undefined;
}

export function cycleView(current: string, minView: string): string {
  const views = ["day", "month", "year"];
  const min = views.indexOf(minView);
  const idx = views.indexOf(current);
  if (idx < 0 || idx >= views.length - 1) return views[min]!;
  return views[idx + 1]!;
}

export function clampView(view: string, minView: string): string {
  const views = ["day", "month", "year"];
  const min = Math.max(0, views.indexOf(minView));
  const idx = Math.max(min, views.indexOf(view));
  return views[idx] ?? views[min]!;
}

export function initialViewFor(type: string): string {
  if (type === "year") return "year";
  if (type === "month") return "month";
  return "day";
}

export function minViewFor(type: string): string {
  return initialViewFor(type);
}

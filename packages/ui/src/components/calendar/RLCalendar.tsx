import type { RLCalendarProps, CalendarModelValue, CalendarRangeValue } from "./calendar.types";
import { RLCalendarTheme } from "./calendar.theme";
import {
  createEffect,
  createMemo,
  createSignal,
  For,
  onSettled,
  Show,
  untrack,
  type Component,
} from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  addMonths,
  addYears,
  applyRangeClick,
  clampView,
  createMonthPickerGrid,
  createMonths,
  createYearPickerGrid,
  cycleView,
  dateKey,
  dayCellState,
  firstDateOf,
  formatDayLabel,
  formatFullDate,
  formatMonthShort,
  formatYearHeading,
  formatYearRangeHeading,
  getWeekNumber,
  getWeekStartsOn,
  headingValueForGrids,
  initialViewFor,
  isSameDay,
  isSameMonth,
  minViewFor,
  resolveCellKey,
  resolveDayKey,
  resolveInitialPlaceholder,
  startOfDay,
  toggleMultiValue,
  toggleSingleValue,
  weekDaysOfGrid,
  type CalendarMonthGrid,
  type DayMatchContext,
  type WeekdayFormat,
  type WeekStartsOn,
} from "./calendar.helpers";
import { RLButton } from "../button/RLButton";

type View = "day" | "month" | "year";

export const RLCalendar: Component<RLCalendarProps> = (allProps) => {
  const props = allProps;

  const locale = () => props.locale ?? "en";
  const type = () => props.type ?? "date";
  const minView = (): View => minViewFor(type()) as View;
  const maxView: View = "year";
  const viewControlEnabled = () => props.viewControl ?? true;
  const monthControls = () => props.monthControls ?? true;
  const yearControls = () => props.yearControls ?? true;
  const fixedWeeks = () => props.fixedWeeks ?? true;
  const numberOfMonths = () => Math.max(1, props.numberOfMonths ?? 1);
  const weekStartsOn = (): WeekStartsOn =>
    props.weekStartsOn !== undefined ? props.weekStartsOn : getWeekStartsOn(locale());
  const weekdayFormat = (): WeekdayFormat => props.weekdayFormat ?? "narrow";

  const [view, setViewRaw] = createSignal<View>(
    // untrack: seed once from props.type; the effect below re-syncs on change.
    untrack(() => initialViewFor(type()) as View),
  );
  const setView = (v: string) => setViewRaw(clampView(v, minView()) as View);

  const isMinView = () => view() === minView();
  const switchable = () => minView() !== maxView;
  const cycle = () => setViewRaw(cycleView(view(), minView()) as View);

  const controlledValue = () => props.modelValue !== undefined;
  const [innerValue, setInnerValue] = createSignal<CalendarModelValue | undefined>(
    props.defaultValue,
  );
  const modelValue = (): CalendarModelValue | undefined =>
    controlledValue() ? props.modelValue : innerValue();

  const [innerPlaceholder, setInnerPlaceholder] = createSignal<Date>(
    // untrack: reads props on first render only — intentionally not tracked.
    untrack(() =>
      resolveInitialPlaceholder(
        props.placeholder,
        props.defaultPlaceholder,
        props.modelValue ?? props.defaultValue,
      ),
    ),
  );
  const placeholder = (): Date => props.placeholder ?? innerPlaceholder();

  const setPlaceholder = (d: Date) => {
    setInnerPlaceholder(startOfDay(d));
    props.onUpdatePlaceholder?.(startOfDay(d));
  };

  // Range session state (start/end commits happen progressively like reka-ui).
  // untrack: initial values are deliberately read once and not tracked.
  const [innerStart, setInnerStart] = createSignal<Date | undefined>(
    untrack(() => firstRangeDate(modelValue())),
  );
  const [innerEnd, setInnerEnd] = createSignal<Date | undefined>(
    untrack(() => secondRangeDate(modelValue())),
  );
  const controlledRange = () => props.range && controlledValue();
  const rangeStart = () => (controlledRange() ? firstRangeDate(modelValue()) : innerStart());
  const rangeEnd = () => (controlledRange() ? secondRangeDate(modelValue()) : innerEnd());

  const today = createMemo(() => startOfDay(new Date()));

  const isInvalid = createMemo(() => {
    const v = modelValue();
    if (!v) return false;
    const dates = Array.isArray(v)
      ? v
      : v instanceof Date
        ? [v]
        : typeof v === "object" && "start" in v && "end" in v
          ? [v.start, v.end]
          : [];
    return dates.some(
      (d) =>
        d instanceof Date &&
        ((props.isDateDisabled?.(d) ?? false) || (props.isDateUnavailable?.(d) ?? false)),
    );
  });

  const dayCtx = (): DayMatchContext => {
    const base: DayMatchContext = {
      modelValue: props.range
        ? rangeStart() && rangeEnd()
          ? { start: rangeStart(), end: rangeEnd() }
          : rangeStart()
            ? null
            : modelValue()
        : modelValue(),
      month: placeholder(),
      today: today(),
      weekStartsOn: weekStartsOn(),
      placeholder: placeholder(),
    };
    if (props.disabled !== undefined) base.disabled = props.disabled;
    if (props.readonly !== undefined) base.readonly = props.readonly;
    if (props.minValue !== undefined) base.minValue = props.minValue;
    if (props.maxValue !== undefined) base.maxValue = props.maxValue;
    if (props.disableDaysOutsideCurrentView !== undefined)
      base.disableDaysOutsideCurrentView = props.disableDaysOutsideCurrentView;
    if (props.isDateDisabled !== undefined) base.isDateDisabled = props.isDateDisabled;
    if (props.isDateUnavailable !== undefined) base.isDateUnavailable = props.isDateUnavailable;
    return base;
  };

  const grids = createMemo<CalendarMonthGrid[]>(() =>
    createMonths(placeholder(), numberOfMonths(), weekStartsOn(), fixedWeeks()),
  );

  const monthGrid = createMemo(() => createMonthPickerGrid(placeholder()));
  const yearGrid = createMemo(() => createYearPickerGrid(placeholder()));

  const headingValue = createMemo(() => {
    if (view() === "day")
      return headingValueForGrids(
        grids().map((g) => g.value),
        locale(),
      );
    if (view() === "month") return formatYearHeading(placeholder(), locale());
    const cells = yearGrid();
    return formatYearRangeHeading(cells[0]!, cells[cells.length - 1]!, locale());
  });

  const fullLabel = createMemo(() => `${props.calendarLabel ?? "Event Date"}, ${headingValue()}`);

  const theme = createMemo(() =>
    RLCalendarTheme({
      color: props.color,
      variant: props.variant,
      size: props.size,
      view: view(),
      weekNumbers: props.weekNumbers ?? false,
      ui: props.ui,
      class: props.class,
    }),
  );

  const commitModel = (next: CalendarModelValue | null | undefined) => {
    if (!controlledValue()) setInnerValue(next);
    props.onUpdateValue?.(next ?? undefined);
  };

  const isRangeDay = (d: Date): boolean => {
    const s = rangeStart();
    const e = rangeEnd();
    if (!s || !e) return false;
    const lo = isSameDay(s, e) ? s : s.getTime() <= e.getTime() ? s : e;
    const hi = isSameDay(s, e) ? e : s.getTime() <= e.getTime() ? e : s;
    return d.getTime() >= lo.getTime() && d.getTime() <= hi.getTime();
  };

  const onDayClick = (day: Date) => {
    if (props.disabled || props.readonly) return;
    const ctx = dayCtx();
    const state = dayCellState(day, day, { ...ctx, month: day });
    if (state.disabled || state.unavailable) return;

    if (props.range) {
      const rangeOpts: {
        preventDeselect?: boolean;
        fixedDate?: "start" | "end";
        maximumDays?: number;
      } = {};
      if (props.preventDeselect !== undefined) rangeOpts.preventDeselect = props.preventDeselect;
      if (props.fixedDate !== undefined) rangeOpts.fixedDate = props.fixedDate;
      if (props.maximumDays !== undefined) rangeOpts.maximumDays = props.maximumDays;
      const next = applyRangeClick({ start: rangeStart(), end: rangeEnd() }, day, rangeOpts);
      if (controlledRange()) {
        setInnerStart(next.start);
        setInnerEnd(next.end);
      } else {
        setInnerStart(next.start);
        setInnerEnd(next.end);
      }
      props.onUpdateStartValue?.(next.start);
      if (next.start && next.end) {
        const range: CalendarRangeValue = { start: next.start, end: next.end };
        if (!controlledRange()) {
          /* already stored in innerStart/innerEnd */
        }
        commitModel(range);
        const valid = isRangeValid(next.start, next.end);
        if (valid) props.onUpdateValidValue?.(range);
      } else if (!controlledRange()) {
        // Partial range still clears committed model
        if (controlledValue()) props.onUpdateValue?.(null);
        else setInnerValue(undefined);
      }
      return;
    }

    if (props.multiple) {
      commitModel(
        toggleMultiValue(
          Array.isArray(modelValue()) ? (modelValue() as unknown as Date[]) : undefined,
          day,
          props.preventDeselect,
        ) ?? null,
      );
      return;
    }

    const next = toggleSingleValue(
      modelValue() instanceof Date ? (modelValue() as unknown as Date) : undefined,
      day,
      props.preventDeselect,
    );
    commitModel(next ?? null);
    if (next) setPlaceholder(day);
  };

  const isRangeValid = (start: Date, end: Date): boolean => {
    if (props.maximumDays !== undefined && typeof props.maximumDays === "number") {
      const days = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
      if (days > props.maximumDays) return false;
    }
    if (props.isDateUnavailable && props.allowNonContiguousRanges === false) {
      const cursor = startOfDay(start);
      while (cursor.getTime() <= end.getTime()) {
        if (props.isDateUnavailable(cursor)) return false;
        cursor.setDate(cursor.getDate() + 1);
      }
    }
    return true;
  };

  const onMonthCellClick = (month: Date) => {
    if (props.disabled || props.readonly) return;
    if (props.isMonthDisabled?.(month) || props.isMonthUnavailable?.(month)) return;
    if (isMinView()) {
      commitValue(month, month);
      setPlaceholder(month);
      return;
    }
    setPlaceholder(month);
    setView("day");
  };

  const onYearCellClick = (year: Date) => {
    if (props.disabled || props.readonly) return;
    if (props.isYearDisabled?.(year) || props.isYearUnavailable?.(year)) return;
    if (isMinView()) {
      commitValue(year, year);
      setPlaceholder(year);
      return;
    }
    setPlaceholder(year);
    setView(minView() === "day" ? "month" : minView());
  };

  const commitValue = (day: Date, _month: Date) => {
    if (props.range) return;
    if (props.multiple) {
      commitModel(
        toggleMultiValue(
          Array.isArray(modelValue()) ? (modelValue() as unknown as Date[]) : undefined,
          day,
          props.preventDeselect,
        ) ?? null,
      );
      return;
    }
    const current = modelValue();
    commitModel(
      toggleSingleValue(
        current instanceof Date ? (current as unknown as Date) : undefined,
        day,
        props.preventDeselect,
      ) ?? null,
    );
  };

  // ---- navigation ----
  const navStep = () => (props.pagedNavigation ? numberOfMonths() : 1);

  const prevDisabled = () => {
    if (props.disabled) return true;
    if (!props.minValue) return false;
    const base = grids()[0]?.value ?? placeholder();
    if (view() === "month") return addYears(base, -1) < startOfDay(props.minValue);
    if (view() === "year") return addYears(base, -12) < startOfDay(props.minValue);
    return addMonths(base, -navStep()) < startOfDay(props.minValue);
  };

  const nextDisabled = () => {
    if (props.disabled) return true;
    if (!props.maxValue) return false;
    const base = grids()[grids().length - 1]?.value ?? placeholder();
    if (view() === "month") return addYears(base, 1) > startOfDay(props.maxValue);
    if (view() === "year") return addYears(base, 12) > startOfDay(props.maxValue);
    return addMonths(base, navStep()) > startOfDay(props.maxValue);
  };

  const prevPage = () => {
    if (prevDisabled()) return;
    if (view() === "month") {
      setPlaceholder(props.prevPage ? props.prevPage(placeholder()) : addYears(placeholder(), -1));
      return;
    }
    if (view() === "year") {
      setPlaceholder(props.prevPage ? props.prevPage(placeholder()) : addYears(placeholder(), -12));
      return;
    }
    const first = grids()[0]?.value ?? placeholder();
    if (props.prevPage) setPlaceholder(props.prevPage(first));
    else setPlaceholder(addMonths(first, -navStep()));
  };

  const nextPage = () => {
    if (nextDisabled()) return;
    if (view() === "month") {
      setPlaceholder(props.nextPage ? props.nextPage(placeholder()) : addYears(placeholder(), 1));
      return;
    }
    if (view() === "year") {
      setPlaceholder(props.nextPage ? props.nextPage(placeholder()) : addYears(placeholder(), 12));
      return;
    }
    const first = grids()[0]?.value ?? placeholder();
    if (props.nextPage) setPlaceholder(props.nextPage(first));
    else setPlaceholder(addMonths(first, navStep()));
  };

  const prevYear = () => {
    if (props.disabled) return;
    setPlaceholder(addYears(placeholder(), -1));
  };
  const nextYear = () => {
    if (props.disabled) return;
    setPlaceholder(addYears(placeholder(), 1));
  };

  const prevLabel = () => (view() === "day" ? "Previous month" : "Previous year");
  const nextLabel = () => (view() === "day" ? "Next month" : "Next year");

  // ---- keyboard ----
  const focusCell = (target: Date, page: 0 | -1 | 1) => {
    if (page === -1) prevPage();
    else if (page === 1) nextPage();
    if (page !== 0) setPlaceholder(target);
    queueMicrotask(() => {
      const root = rootEl;
      if (!root) return;
      const el = root.querySelector<HTMLElement>(`[data-value="${dateKey(target)}"]`);
      if (el && !el.hasAttribute("data-disabled")) el.focus();
    });
  };

  const onDayKey = (e: KeyboardEvent, day: Date) => {
    if (props.disabled) return;
    if ((e.key === "Enter" || e.key === " ") && (e.ctrlKey || e.metaKey || e.altKey)) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onDayClick(day);
      return;
    }
    const res = resolveDayKey(e.key, day, { weekStartsOn: weekStartsOn(), shiftKey: e.shiftKey });
    if (!res) return;
    e.preventDefault();
    focusCell(res.target, res.page);
  };

  const onCellKey = (e: KeyboardEvent, cell: Date, mode: "month" | "year") => {
    if (props.disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (mode === "month") onMonthCellClick(cell);
      else onYearCellClick(cell);
      return;
    }
    const res = resolveCellKey(e.key, cell, mode, 12);
    if (!res) return;
    e.preventDefault();
    focusCell(res.target, res.page);
  };

  let rootEl: HTMLElement | undefined;

  onSettled(() => {
    if (!props.initialFocus) return;
    const sel = firstDateOf(modelValue());
    const target = sel && isSameMonth(sel, placeholder()) ? sel : today();
    queueMicrotask(() => {
      const el = rootEl?.querySelector<HTMLElement>(`[data-value="${dateKey(target)}"]`);
      if (el && !el.hasAttribute("data-disabled")) el.focus();
    });
  });

  createEffect(
    () => type(),
    (t) => {
      setViewRaw(initialViewFor(t) as View);
    },
  );

  // ---- render helpers ----
  const controlBase = (
    override: Record<string, unknown> | (() => void) | undefined,
    icon: unknown,
    label: string,
  ) => {
    const base: Record<string, unknown> = {
      color: "neutral" as const,
      variant: "ghost" as const,
      size: props.size,
      square: true,
      icon,
      ariaLabel: label,
      type: "button" as const,
      disabled: props.disabled,
    };
    if (override && typeof override === "object") {
      Object.assign(base, override);
    }
    return base;
  };

  const renderDayGrid = (grid: CalendarMonthGrid) => (
    <table
      class={theme().grid}
      data-slot="grid"
      tabindex="-1"
      role="application"
      aria-readonly={props.readonly ? "true" : undefined}
      aria-disabled={props.disabled ? "true" : undefined}
      data-readonly={props.readonly ? "" : undefined}
      data-disabled={props.disabled ? "" : undefined}
    >
      <thead aria-hidden="true" data-slot="gridHead">
        <tr class={theme().gridWeekDaysRow} data-slot="gridWeekDaysRow">
          <For each={weekDaysOfGrid(grid, locale(), weekdayFormat())}>
            {(wd) => (
              <th class={theme().headCell} data-slot="headCell">
                {props.weekDaySlot ? props.weekDaySlot({ day: wd }) : wd}
              </th>
            )}
          </For>
        </tr>
      </thead>
      <tbody class={theme().gridBody} data-slot="gridBody">
        <For each={grid.rows}>
          {(row) => (
            <tr class={theme().gridRow} data-slot="gridRow">
              <Show when={view() === "day" && props.weekNumbers && row[0]}>
                {(first) => (
                  <td role="gridcell" class={theme().cellWeek} data-slot="cellWeek">
                    {getWeekNumber(first(), weekStartsOn())}
                  </td>
                )}
              </Show>
              <For each={row}>
                {(day) => {
                  const st = () => dayCtx() && dayCellState(day, grid.value, dayCtx());
                  const isRangeSelected = () => props.range && isRangeDay(day);
                  return (
                    <td
                      role="gridcell"
                      class={theme().cell}
                      data-slot="cell"
                      aria-selected={
                        props.range
                          ? isRangeSelected() || st().selected
                            ? "true"
                            : undefined
                          : st().selected
                            ? "true"
                            : undefined
                      }
                      aria-disabled={st().disabled || st().unavailable ? "true" : undefined}
                      data-disabled={st().disabled ? "" : undefined}
                    >
                      <div
                        role="button"
                        class={theme().cellTrigger}
                        data-slot="cellTrigger"
                        data-value={dateKey(day)}
                        data-selected={
                          props.range
                            ? isRangeSelected() || st().selected || undefined
                            : st().selected || undefined
                        }
                        data-disabled={st().disabled ? "" : undefined}
                        data-unavailable={st().unavailable ? "" : undefined}
                        data-today={st().today ? "" : undefined}
                        data-outside-view={st().outsideView ? "" : undefined}
                        data-focused={st().focused ? "" : undefined}
                        aria-label={formatFullDate(day, locale())}
                        aria-disabled={st().disabled || st().unavailable ? "true" : undefined}
                        aria-current={st().today ? "date" : undefined}
                        tabindex={
                          st().focused ? 0 : st().outsideView || st().disabled ? undefined : -1
                        }
                        onClick={() => onDayClick(day)}
                        onKeyDown={(e) => onDayKey(e, day)}
                      >
                        {props.daySlot ? props.daySlot({ day }) : formatDayLabel(day, locale())}
                      </div>
                    </td>
                  );
                }}
              </For>
            </tr>
          )}
        </For>
      </tbody>
    </table>
  );

  const monthSelected = (m: Date) => {
    const v = modelValue();
    if (!v) return false;
    if (Array.isArray(v)) return v.some((d) => isSameMonth(d, m));
    if (v instanceof Date) return isSameMonth(v, m);
    if (typeof v === "object" && "start" in v && "end" in v) {
      return isSameMonth(v.start, m) || isSameMonth(v.end, m);
    }
    return false;
  };

  const yearSelected = (y: Date) => {
    const v = modelValue();
    if (!v) return false;
    const has = (d?: Date | null) => d instanceof Date && d.getFullYear() === y.getFullYear();
    if (Array.isArray(v)) return v.some(has);
    if (v instanceof Date) return has(v);
    if (typeof v === "object" && "start" in v && "end" in v) {
      return has(v.start) || has(v.end);
    }
    return false;
  };

  const renderPickerGrid = (mode: "month" | "year") => {
    const cells = mode === "month" ? monthGrid() : yearGrid();
    return (
      <table
        class={theme().grid}
        data-slot="grid"
        tabindex="-1"
        role="application"
        aria-readonly={props.readonly ? "true" : undefined}
        aria-disabled={props.disabled ? "true" : undefined}
        data-readonly={props.readonly ? "" : undefined}
        data-disabled={props.disabled ? "" : undefined}
      >
        <tbody class={theme().gridBody} data-slot="gridBody">
          <For each={chunkFour(cells)}>
            {(row) => (
              <tr class={theme().gridRow} data-slot="gridRow">
                <For each={row}>
                  {(cell) => {
                    const disabled =
                      props.disabled ||
                      (mode === "month"
                        ? props.isMonthDisabled?.(cell) || props.isMonthUnavailable?.(cell)
                        : props.isYearDisabled?.(cell) || props.isYearUnavailable?.(cell));
                    const selected = mode === "month" ? monthSelected(cell) : yearSelected(cell);
                    const focused =
                      isSameMonth(cell, placeholder()) && mode === "month"
                        ? cell.getFullYear() === placeholder().getFullYear()
                        : mode === "year"
                          ? cell.getFullYear() === placeholder().getFullYear()
                          : false;
                    const isTodayCell =
                      mode === "month"
                        ? isSameMonth(cell, today())
                        : cell.getFullYear() === today().getFullYear();
                    return (
                      <td
                        role="gridcell"
                        class={theme().cell}
                        data-slot="cell"
                        aria-selected={selected ? "true" : undefined}
                        aria-disabled={disabled ? "true" : undefined}
                        data-disabled={disabled ? "" : undefined}
                      >
                        <div
                          role="button"
                          class={theme().cellTrigger}
                          data-slot="cellTrigger"
                          data-value={dateKey(cell)}
                          data-selected={selected || undefined}
                          data-disabled={disabled ? "" : undefined}
                          data-today={isTodayCell ? "" : undefined}
                          data-focused={focused && !props.disabled ? "" : undefined}
                          aria-label={
                            mode === "month"
                              ? new Intl.DateTimeFormat(locale(), {
                                  month: "long",
                                  year: "numeric",
                                }).format(cell)
                              : formatYearHeading(cell, locale())
                          }
                          aria-disabled={disabled ? "true" : undefined}
                          tabindex={focused && !props.disabled ? 0 : disabled ? undefined : -1}
                          onClick={() =>
                            mode === "month" ? onMonthCellClick(cell) : onYearCellClick(cell)
                          }
                          onKeyDown={(e) => onCellKey(e, cell, mode)}
                        >
                          {mode === "month"
                            ? props.monthCellSlot
                              ? props.monthCellSlot({
                                  month: cell,
                                  selected,
                                  disabled: !!disabled,
                                })
                              : formatMonthShort(cell, locale())
                            : props.yearCellSlot
                              ? props.yearCellSlot({
                                  year: cell,
                                  selected,
                                  disabled: !!disabled,
                                })
                              : formatYearHeading(cell, locale())}
                        </div>
                      </td>
                    );
                  }}
                </For>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    );
  };

  const showPrevYear = () => view() === "day" && yearControls();
  const showSideControls = () => view() !== "day" || monthControls();

  const rootProps = () => ({
    "data-slot": "root",
    "data-readonly": props.readonly ? "" : undefined,
    "data-disabled": props.disabled ? "" : undefined,
    "data-invalid": isInvalid() ? "" : undefined,
    "aria-label": fullLabel(),
    ref: (el: HTMLElement) => {
      rootEl = el;
    },
  });

  return (
    <Show
      when={props.as === undefined || props.as === "div" || typeof props.as === "string"}
      fallback={<DynamicAs />}
    >
      <div {...rootProps()} class={theme().root}>
        {renderInternal()}
      </div>
    </Show>
  );

  function DynamicAs(): JSX.Element {
    const El = props.as as any;
    return (
      <El {...rootProps()} class={theme().root}>
        {renderInternal()}
      </El>
    );
  }

  function renderInternal(): JSX.Element {
    return (
      <>
        <div class={theme().srLabel} data-slot="srLabel">
          <div role="heading" aria-level="2">
            {fullLabel()}
          </div>
        </div>

        <div class={theme().header} data-slot="header">
          <Show when={showPrevYear()}>
            <RLButton
              {...controlBase(
                props.prevYear,
                props.prevYearIcon ?? "chevronDoubleLeft",
                "Previous year",
              )}
              data-slot="prevYear"
              onClick={prevYear}
            />
          </Show>
          <Show when={showSideControls()}>
            <RLButton
              {...controlBase(props.prevMonth, props.prevMonthIcon ?? "chevronLeft", prevLabel())}
              data-slot="prevMonth"
              onClick={prevPage}
            />
          </Show>

          <div
            class={theme().heading}
            data-slot="heading"
            data-disabled={props.disabled ? "" : undefined}
          >
            <Show
              when={props.headingSlot}
              fallback={
                <Show
                  when={switchable() && viewControlEnabled()}
                  fallback={
                    <span class={theme().headingLabel} data-slot="headingLabel">
                      {headingValue()}
                    </span>
                  }
                >
                  <RLButton
                    {...controlBase(
                      typeof props.viewControl === "object" ? props.viewControl : undefined,
                      undefined,
                      headingValue(),
                    )}
                    label={headingValue()}
                    block
                    square={false}
                    data-slot="viewControl"
                    onClick={cycle}
                  />
                </Show>
              }
            >
              {props.headingSlot ? props.headingSlot() : null}
            </Show>
          </div>

          <Show when={showSideControls()}>
            <RLButton
              {...controlBase(props.nextMonth, props.nextMonthIcon ?? "chevronRight", nextLabel())}
              data-slot="nextMonth"
              onClick={nextPage}
            />
          </Show>
          <Show when={showPrevYear()}>
            <RLButton
              {...controlBase(
                props.nextYear,
                props.nextYearIcon ?? "chevronDoubleRight",
                "Next year",
              )}
              data-slot="nextYear"
              onClick={nextYear}
            />
          </Show>
        </div>

        <div class={theme().body} data-slot="body">
          <Show
            when={view() === "day"}
            fallback={view() === "month" ? renderPickerGrid("month") : renderPickerGrid("year")}
          >
            <For each={grids()}>{(grid) => renderDayGrid(grid)}</For>
          </Show>
        </div>
      </>
    );
  }
};

function chunkFour<T>(arr: T[]): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += 4) out.push(arr.slice(i, i + 4));
  return out;
}

function firstRangeDate(v: CalendarModelValue | undefined): Date | undefined {
  if (!v || v instanceof Date || Array.isArray(v) || typeof v !== "object") return undefined;
  if ("start" in v && "end" in v) return v.start;
  return undefined;
}

function secondRangeDate(v: CalendarModelValue | undefined): Date | undefined {
  if (!v || v instanceof Date || Array.isArray(v) || typeof v !== "object") return undefined;
  if ("start" in v && "end" in v) return v.end;
  return undefined;
}

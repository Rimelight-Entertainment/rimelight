import { describe, it, expect } from "vite-plus/test";
import {
  addDays,
  addMonths,
  addYears,
  applyRangeClick,
  clampView,
  createMonthGrid,
  createMonthPickerGrid,
  createMonths,
  createYearPickerGrid,
  cycleView,
  dateKey,
  dayCellState,
  endOfMonth,
  formatFullDate,
  formatMonthYearHeading,
  formatYearHeading,
  formatYearRangeHeading,
  getWeekNumber,
  getWeekStartsOn,
  headingValueForGrids,
  initialViewFor,
  isBetweenInclusive,
  isSameDay,
  isSameMonth,
  minViewFor,
  resolveCellKey,
  resolveDayKey,
  resolveInitialPlaceholder,
  startOfDay,
  startOfMonth,
  startOfWeek,
  toggleMultiValue,
  toggleSingleValue,
  weekDaysOfGrid,
  type CalendarMonthGrid,
} from "../src/components/calendar/calendar.helpers";

describe("calendar date math", () => {
  it("startOfDay zeroes time", () => {
    const d = startOfDay(new Date(2022, 1, 15, 13, 45, 30, 123));
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
    expect(d.getSeconds()).toBe(0);
    expect(d.getMilliseconds()).toBe(0);
    expect(d.getDate()).toBe(15);
  });

  it("addDays handles month boundaries", () => {
    expect(isSameDay(addDays(new Date(2022, 0, 31), 1), new Date(2022, 1, 1))).toBe(true);
    expect(isSameDay(addDays(new Date(2022, 1, 1), -1), new Date(2022, 0, 31))).toBe(true);
    expect(isSameDay(addDays(new Date(2022, 1, 1), 0), new Date(2022, 1, 1))).toBe(true);
  });

  it("addDays keeps time-of-day", () => {
    const d = new Date(2022, 1, 15, 9, 30);
    expect(addDays(d, 1).getHours()).toBe(9);
    expect(addDays(d, 1).getMinutes()).toBe(30);
  });

  it("addMonths clamps day-of-month", () => {
    expect(isSameMonth(addMonths(new Date(2022, 0, 31), 1), new Date(2022, 1, 15))).toBe(true);
    expect(addMonths(new Date(2022, 0, 31), 1).getDate()).toBe(28);
    expect(addMonths(new Date(2022, 2, 31), -1).getDate()).toBe(28);
  });

  it("addYears handles leap years", () => {
    expect(isSameDay(addYears(new Date(2020, 1, 29), 1), new Date(2021, 1, 28))).toBe(true);
    expect(addYears(new Date(2022, 5, 1), 2).getFullYear()).toBe(2024);
  });

  it("isSameDay / isSameMonth ignore time", () => {
    expect(isSameDay(new Date(2022, 1, 15, 1), new Date(2022, 1, 15, 23))).toBe(true);
    expect(isSameDay(new Date(2022, 1, 15), new Date(2022, 1, 16))).toBe(false);
    expect(isSameDay(null, undefined)).toBe(false);
    expect(isSameMonth(new Date(2022, 1, 1), new Date(2022, 1, 28))).toBe(true);
    expect(isSameMonth(null, new Date(2022, 1, 1))).toBe(false);
  });

  it("startOfMonth / endOfMonth bracket the month", () => {
    const s = startOfMonth(new Date(2022, 1, 15));
    expect(s.getDate()).toBe(1);
    expect(endOfMonth(new Date(2022, 1, 15)).getDate()).toBe(28);
    expect(endOfMonth(new Date(2020, 1, 15)).getDate()).toBe(29);
  });

  it("isBetweenInclusive includes bounds", () => {
    const d = new Date(2022, 1, 15);
    expect(isBetweenInclusive(d, new Date(2022, 1, 15), new Date(2022, 1, 20))).toBe(true);
    expect(isBetweenInclusive(d, new Date(2022, 1, 15), new Date(2022, 1, 15))).toBe(true);
    expect(
      isBetweenInclusive(new Date(2022, 1, 14), new Date(2022, 1, 15), new Date(2022, 1, 20)),
    ).toBe(false);
  });

  it("dateKey formats as YYYY-MM-DD", () => {
    expect(dateKey(new Date(2022, 0, 5))).toBe("2022-01-05");
    expect(dateKey(new Date(2022, 11, 25))).toBe("2022-12-25");
  });
});

describe("getWeekStartsOn", () => {
  it("returns a valid weekday number", () => {
    const v = getWeekStartsOn("en-US");
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThanOrEqual(6);
  });

  it("honours an explicit locale", () => {
    expect(getWeekStartsOn("en")).toBeGreaterThanOrEqual(0);
  });

  it("falls back to 1 for unknown locales", () => {
    expect(getWeekStartsOn("")).toBe(1);
  });
});

describe("week numbers", () => {
  it("startOfWeek aligns to weekStartsOn", () => {
    const d = new Date(2022, 1, 16); // Wednesday
    const mon = startOfWeek(d, 1);
    expect(mon.getDay()).toBe(1);
    const sun = startOfWeek(d, 0);
    expect(sun.getDay()).toBe(0);
  });

  it("first week of year is 1", () => {
    expect(getWeekNumber(new Date(2022, 0, 3), 1)).toBe(1);
    expect(getWeekNumber(new Date(2022, 1, 16), 1)).toBe(7);
  });

  it("year-boundary weeks stay within 1..53", () => {
    const w = getWeekNumber(new Date(2021, 11, 27), 1);
    expect(w).toBeGreaterThanOrEqual(1);
    expect(w).toBeLessThanOrEqual(53);
  });
});

describe("month grid creation", () => {
  it("createMonthGrid starts on the week start and has 7 columns", () => {
    const grid = createMonthGrid(new Date(2022, 1, 15), 1, false);
    expect(grid.rows[0]![0]!.getDay()).toBe(1);
    expect(grid.rows.slice(0, 4).every((r) => r.length === 7)).toBe(true);
    expect(grid.rows.length).toBe(5);
  });

  it("createMonthGrid pads to 6 weeks when fixedWeeks is true", () => {
    const grid = createMonthGrid(new Date(2022, 1, 15), 1, true);
    expect(grid.rows.length).toBe(6);
    expect(grid.rows.flat().length).toBe(42);
  });

  it("grid contains only days of the target month in view", () => {
    const grid = createMonthGrid(new Date(2022, 1, 15), 1, true);
    const inMonth = grid.rows.flat().filter((d) => isSameMonth(d, grid.value));
    expect(inMonth.length).toBe(28);
  });

  it("createMonths returns numberOfMonths grids", () => {
    const months = createMonths(new Date(2022, 0, 15), 3, 1, false);
    expect(months.length).toBe(3);
    expect(months[0]!.value.getMonth()).toBe(0);
    expect(months[2]!.value.getMonth()).toBe(2);
  });

  it("createMonths aligns multi-month grids on the same weekday column", () => {
    const months = createMonths(new Date(2022, 0, 15), 2, 1, true);
    expect(months[0]!.rows[0]![0]!.getDay()).toBe(months[1]!.rows[0]![0]!.getDay());
  });

  it("createMonthPickerGrid returns 12 months of the year", () => {
    const cells = createMonthPickerGrid(new Date(2022, 5, 15));
    expect(cells.length).toBe(12);
    expect(cells[0]!.getMonth()).toBe(0);
    expect(cells[11]!.getMonth()).toBe(11);
    expect(cells[0]!.getFullYear()).toBe(2022);
  });

  it("createYearPickerGrid returns a decade-aligned 12-year grid", () => {
    const cells = createYearPickerGrid(new Date(2022, 5, 15));
    expect(cells.length).toBe(12);
    expect(cells[0]!.getFullYear() % 10).toBe(0);
    expect(cells[0]!.getFullYear()).toBe(2020);
    expect(cells[11]!.getFullYear()).toBe(2031);
  });
});

describe("formatters", () => {
  it("formatFullDate is human readable", () => {
    const s = formatFullDate(new Date(2022, 1, 15), "en");
    expect(s).toContain("15");
    expect(s).toContain("2022");
  });

  it("formatMonthYearHeading", () => {
    expect(formatMonthYearHeading(new Date(2022, 1, 15), "en")).toBe("February 2022");
  });

  it("formatYearHeading", () => {
    expect(formatYearHeading(new Date(2022, 1, 15), "en")).toBe("2022");
  });

  it("formatYearRangeHeading", () => {
    expect(formatYearRangeHeading(new Date(2020, 0, 1), new Date(2031, 0, 1), "en")).toBe(
      "2020 - 2031",
    );
  });

  it("headingValueForGrids handles a single month", () => {
    expect(headingValueForGrids([new Date(2022, 1, 1)], "en")).toBe("February 2022");
  });

  it("headingValueForGrids joins consecutive months in one year", () => {
    expect(headingValueForGrids([new Date(2022, 0, 1), new Date(2022, 1, 1)], "en")).toBe(
      "January - February 2022",
    );
  });

  it("headingValueForGrids spans years", () => {
    expect(headingValueForGrids([new Date(2022, 11, 1), new Date(2023, 0, 1)], "en")).toBe(
      "December 2022 - January 2023",
    );
  });

  it("weekDaysOfGrid returns labels for every column", () => {
    const grid = createMonthGrid(new Date(2022, 1, 15), 1, true);
    expect(weekDaysOfGrid(grid, "en", "short").length).toBe(7);
    expect(weekDaysOfGrid(grid, "en", "long")[0]).toBe("Monday");
  });
});

describe("placeholder resolution", () => {
  it("prefers placeholder over defaultPlaceholder", () => {
    const a = new Date(2022, 0, 1);
    const b = new Date(2023, 0, 1);
    expect(isSameDay(resolveInitialPlaceholder(a, b, undefined), a)).toBe(true);
  });

  it("falls back to defaultPlaceholder", () => {
    const b = new Date(2023, 0, 1);
    expect(isSameDay(resolveInitialPlaceholder(undefined, b, undefined), b)).toBe(true);
  });

  it("uses the model value when no explicit placeholder", () => {
    const v = new Date(2024, 5, 10);
    const r = resolveInitialPlaceholder(undefined, undefined, v);
    expect(isSameMonth(r, v)).toBe(true);
  });

  it("uses today as the last resort", () => {
    const r = resolveInitialPlaceholder(undefined, undefined, undefined);
    expect(isSameDay(r, new Date())).toBe(true);
  });
});

describe("day cell state", () => {
  const base = {
    value: undefined,
    month: new Date(2022, 1, 15),
    today: new Date(2022, 1, 15),
    weekStartsOn: 1 as const,
    placeholder: new Date(2022, 1, 15),
  };

  it("marks today", () => {
    const s = dayCellState(new Date(2022, 1, 15), base.month, base);
    expect(s.today).toBe(true);
    expect(s.outsideView).toBe(false);
  });

  it("marks outside days", () => {
    const s = dayCellState(new Date(2022, 1, 1), base.month, base);
    expect(s.outsideView).toBe(false);
    const outside = dayCellState(new Date(2022, 0, 28), base.month, base);
    expect(outside.outsideView).toBe(true);
  });

  it("respects disabled via ctx flag", () => {
    const s = dayCellState(new Date(2022, 1, 15), base.month, { ...base, disabled: true });
    expect(s.disabled).toBe(true);
  });

  it("respects min/max values", () => {
    const s = dayCellState(new Date(2022, 1, 10), base.month, {
      ...base,
      minValue: new Date(2022, 1, 12),
    });
    expect(s.disabled).toBe(true);
    const s2 = dayCellState(new Date(2022, 1, 25), base.month, {
      ...base,
      maxValue: new Date(2022, 1, 20),
    });
    expect(s2.disabled).toBe(true);
  });

  it("respects isDateDisabled / isDateUnavailable", () => {
    const s = dayCellState(new Date(2022, 1, 15), base.month, {
      ...base,
      isDateDisabled: () => true,
    });
    expect(s.disabled).toBe(true);
    const s2 = dayCellState(new Date(2022, 1, 15), base.month, {
      ...base,
      isDateUnavailable: () => true,
    });
    expect(s2.unavailable).toBe(true);
    expect(s2.disabled).toBe(false);
  });

  it("disableDaysOutsideCurrentView disables outside days only", () => {
    const ctx = { ...base, disableDaysOutsideCurrentView: true };
    expect(dayCellState(new Date(2022, 1, 15), base.month, ctx).disabled).toBe(false);
    expect(dayCellState(new Date(2022, 0, 28), base.month, ctx).disabled).toBe(true);
  });

  it("marks selection from a single value", () => {
    const s = dayCellState(new Date(2022, 1, 15), base.month, {
      ...base,
      value: new Date(2022, 1, 15),
    });
    expect(s.selected).toBe(true);
  });

  it("marks selection from an array value", () => {
    const s = dayCellState(new Date(2022, 1, 16), base.month, {
      ...base,
      value: [new Date(2022, 1, 15), new Date(2022, 1, 16)],
    });
    expect(s.selected).toBe(true);
  });

  it("marks selection from a range value", () => {
    const s = dayCellState(new Date(2022, 1, 17), base.month, {
      ...base,
      value: { start: new Date(2022, 1, 15), end: new Date(2022, 1, 20) },
    });
    expect(s.selected).toBe(true);
    const out = dayCellState(new Date(2022, 1, 21), base.month, {
      ...base,
      value: { start: new Date(2022, 1, 15), end: new Date(2022, 1, 20) },
    });
    expect(out.selected).toBe(false);
  });

  it("focuses the placeholder day in view", () => {
    const s = dayCellState(new Date(2022, 1, 15), base.month, base);
    expect(s.focused).toBe(true);
    const other = dayCellState(new Date(2022, 1, 16), base.month, base);
    expect(other.focused).toBe(false);
  });
});

describe("keyboard resolution", () => {
  const d = new Date(2022, 1, 16); // Wednesday

  it("arrow keys move by day/week", () => {
    expect(resolveDayKey("ArrowRight", d, { weekStartsOn: 1 })!.target.getDate()).toBe(17);
    expect(resolveDayKey("ArrowLeft", d, { weekStartsOn: 1 })!.target.getDate()).toBe(15);
    expect(resolveDayKey("ArrowDown", d, { weekStartsOn: 1 })!.target.getDate()).toBe(23);
    expect(resolveDayKey("ArrowUp", d, { weekStartsOn: 1 })!.target.getDate()).toBe(9);
  });

  it("Home/End move to week bounds", () => {
    expect(resolveDayKey("Home", d, { weekStartsOn: 1 })!.target.getDay()).toBe(1);
    expect(resolveDayKey("End", d, { weekStartsOn: 1 })!.target.getDay()).toBe(0);
  });

  it("PageUp/PageDown move by month with page flags", () => {
    const up = resolveDayKey("PageUp", d, { weekStartsOn: 1 })!;
    expect(up.target.getMonth()).toBe(0);
    expect(up.page).toBe(-1);
    const down = resolveDayKey("PageDown", d, { weekStartsOn: 1 })!;
    expect(down.target.getMonth()).toBe(2);
    expect(down.page).toBe(1);
  });

  it("shift+PageUp moves a year in place", () => {
    const r = resolveDayKey("PageUp", d, { weekStartsOn: 1, shiftKey: true })!;
    expect(r.target.getFullYear()).toBe(2021);
    expect(r.page).toBe(0);
  });

  it("unknown keys return null", () => {
    expect(resolveDayKey("a", d, { weekStartsOn: 1 })).toBeNull();
  });

  it("month cell keys move by 4 and 1", () => {
    const jan = new Date(2022, 0, 1);
    expect(resolveCellKey("ArrowRight", jan, "month", 12)!.target.getMonth()).toBe(1);
    expect(resolveCellKey("ArrowDown", jan, "month", 12)!.target.getMonth()).toBe(4);
  });

  it("year cell keys move by 1 and 4", () => {
    const y = new Date(2022, 0, 1);
    expect(resolveCellKey("ArrowRight", y, "year", 12)!.target.getFullYear()).toBe(2023);
    expect(resolveCellKey("ArrowDown", y, "year", 12)!.target.getFullYear()).toBe(2026);
  });
});

describe("selection toggles", () => {
  it("selects when empty", () => {
    const d = new Date(2022, 1, 15);
    expect(isSameDay(toggleSingleValue(undefined, d)!, d)).toBe(true);
  });

  it("keeps value when clicking a different day", () => {
    const cur = new Date(2022, 1, 15);
    const next = toggleSingleValue(cur, new Date(2022, 1, 20))!;
    expect(isSameDay(next, new Date(2022, 1, 20))).toBe(true);
  });

  it("deselects when clicking the same day", () => {
    const cur = new Date(2022, 1, 15);
    expect(toggleSingleValue(cur, cur)).toBeUndefined();
  });

  it("preventDeselect keeps the value", () => {
    const cur = new Date(2022, 1, 15);
    expect(isSameDay(toggleSingleValue(cur, cur, true)!, cur)).toBe(true);
  });

  it("multi toggles membership", () => {
    const a = new Date(2022, 1, 15);
    const b = new Date(2022, 1, 20);
    const withA = toggleMultiValue(undefined, a)!;
    expect(withA.length).toBe(1);
    const withAB = toggleMultiValue(withA, b)!;
    expect(withAB.length).toBe(2);
    const back = toggleMultiValue(withAB, a)!;
    expect(back.length).toBe(1);
    expect(isSameDay(back[0]!, b)).toBe(true);
    expect(toggleMultiValue([a], a)).toBeUndefined();
  });
});

describe("range clicks", () => {
  const a = new Date(2022, 1, 10);
  const b = new Date(2022, 1, 20);
  const c = new Date(2022, 1, 25);

  it("first click sets start only", () => {
    const r = applyRangeClick({ start: undefined, end: undefined }, a, {});
    expect(isSameDay(r.start!, a)).toBe(true);
    expect(r.end).toBeUndefined();
  });

  it("second click sets end and swaps when out of order", () => {
    const first = applyRangeClick({ start: undefined, end: undefined }, b, {});
    const second = applyRangeClick(first, a, {});
    expect(isSameDay(second.start!, a)).toBe(true);
    expect(isSameDay(second.end!, b)).toBe(true);
  });

  it("third click with both set restarts", () => {
    const one = applyRangeClick({ start: undefined, end: undefined }, a, {});
    const two = applyRangeClick(one, b, {});
    const three = applyRangeClick(two, c, {});
    expect(isSameDay(three.start!, c)).toBe(true);
    expect(three.end).toBeUndefined();
  });

  it("second click on the same day deselects", () => {
    const one = applyRangeClick({ start: undefined, end: undefined }, a, {});
    const two = applyRangeClick(one, a, {});
    expect(two.start).toBeUndefined();
    expect(two.end).toBeUndefined();
  });

  it("preventDeselect builds a single-day range", () => {
    const one = applyRangeClick({ start: undefined, end: undefined }, a, { preventDeselect: true });
    const two = applyRangeClick(one, a, { preventDeselect: true });
    expect(isSameDay(two.start!, a)).toBe(true);
    expect(isSameDay(two.end!, a)).toBe(true);
  });

  it("maximumDays restarts the range when too long", () => {
    const one = applyRangeClick({ start: undefined, end: undefined }, a, { maximumDays: 3 });
    const two = applyRangeClick(one, c, { maximumDays: 3 });
    expect(two.end).toBeUndefined();
    expect(isSameDay(two.start!, c)).toBe(true);
  });

  it("fixedDate start keeps the start anchored", () => {
    const one = applyRangeClick({ start: undefined, end: undefined }, a, { fixedDate: "start" });
    const two = applyRangeClick(one, b, { fixedDate: "start" });
    expect(isSameDay(two.start!, a)).toBe(true);
    expect(isSameDay(two.end!, b)).toBe(true);
    const three = applyRangeClick(two, c, { fixedDate: "start" });
    expect(isSameDay(three.start!, a)).toBe(true);
    expect(isSameDay(three.end!, c)).toBe(true);
  });
});

describe("view helpers", () => {
  it("minViewFor maps type", () => {
    expect(minViewFor("date")).toBe("day");
    expect(minViewFor("month")).toBe("month");
    expect(minViewFor("year")).toBe("year");
  });

  it("initialViewFor matches min view", () => {
    expect(initialViewFor("date")).toBe("day");
    expect(initialViewFor("month")).toBe("month");
    expect(initialViewFor("year")).toBe("year");
  });

  it("cycleView walks day > month > year > min", () => {
    expect(cycleView("day", "day")).toBe("month");
    expect(cycleView("day", "month")).toBe("month");
    expect(cycleView("month", "month")).toBe("year");
    expect(cycleView("month", "day")).toBe("year");
    expect(cycleView("year", "day")).toBe("day");
    expect(cycleView("year", "month")).toBe("month");
    expect(cycleView("year", "year")).toBe("year");
  });

  it("clampView never goes below min", () => {
    expect(clampView("day", "month")).toBe("month");
    expect(clampView("year", "day")).toBe("year");
    expect(clampView("month", "day")).toBe("month");
  });
});

describe("grid typing sanity", () => {
  it("createMonthGrid returns a CalendarMonthGrid", () => {
    const grid: CalendarMonthGrid = createMonthGrid(new Date(2022, 1, 15), 1, true);
    expect(Array.isArray(grid.rows)).toBe(true);
    expect(grid.rows.flat().length).toBe(42);
  });
});

import { describe, it, expect, vi, afterEach } from "vite-plus/test";

vi.mock("virtual:rimelight/ui", () => ({
  default: {
    unstyled: false,
    components: { themes: {} },
    icons: {},
  },
}));

import { RLCalendar } from "../src/components/calendar/RLCalendar";
import { calendarTheme } from "../src/components/calendar/calendar.theme";
import { renderToString } from "@solidjs/web";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

function slotTag(html: string, slot: string): string {
  const match = html.match(new RegExp(`<[a-z]+[^>]*data-slot="${slot}"[^>]*>`));
  return match?.[0] ?? "";
}

function attr(tag: string, name: string): string | undefined {
  return tag.match(new RegExp(`\\s${name}="([^"]*)"`))?.[1];
}

function countMatches(html: string, re: RegExp): number {
  return (html.match(re) ?? []).length;
}

const feb2022 = new Date(2022, 1, 15);

describe("RLCalendar", () => {
  describe("structure & slots", () => {
    it("renders a root div with data-slot=root", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} />);
      expect(html).toMatch(/^<div/);
      expect(slotTag(html, "root")).not.toBe("");
    });

    it("renders header, body, heading and grid slots", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} />);
      expect(slotTag(html, "header")).not.toBe("");
      expect(slotTag(html, "body")).not.toBe("");
      expect(slotTag(html, "heading")).not.toBe("");
      expect(slotTag(html, "grid")).not.toBe("");
      expect(slotTag(html, "gridRow")).not.toBe("");
      expect(slotTag(html, "gridWeekDaysRow")).not.toBe("");
      expect(slotTag(html, "gridBody")).not.toBe("");
      expect(slotTag(html, "headCell")).not.toBe("");
      expect(slotTag(html, "cell")).not.toBe("");
      expect(slotTag(html, "cellTrigger")).not.toBe("");
      expect(slotTag(html, "srLabel")).not.toBe("");
    });

    it("renders a screen-reader heading with aria-level 2", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} />);
      const sr = html.match(/<div[^>]*data-slot="srLabel"[^>]*>(.*?)<\/div>/)?.[1] ?? "";
      expect(sr).toContain('role="heading"');
      expect(sr).toContain('aria-level="2"');
    });

    it("uses sr-only class rather than inline styles for the sr heading", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} />);
      const srTag = slotTag(html, "srLabel");
      expect(srTag).toContain("sr-only");
      expect(srTag).not.toContain("style=");
    });

    it("renders navigation buttons", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} />);
      expect(attr(slotTag(html, "prevMonth"), "aria-label")).toBe("Previous month");
      expect(attr(slotTag(html, "nextMonth"), "aria-label")).toBe("Next month");
      expect(attr(slotTag(html, "prevYear"), "aria-label")).toBe("Previous year");
      expect(attr(slotTag(html, "nextYear"), "aria-label")).toBe("Next year");
    });

    it("omits year controls when yearControls is false", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} yearControls={false} />);
      expect(slotTag(html, "prevYear")).toBe("");
      expect(slotTag(html, "nextYear")).toBe("");
      expect(slotTag(html, "prevMonth")).not.toBe("");
    });

    it("omits month controls when monthControls is false", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} monthControls={false} />);
      expect(slotTag(html, "prevMonth")).toBe("");
      expect(slotTag(html, "prevYear")).not.toBe("");
    });

    it("renders heading label when view control is off", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} viewControl={false} />);
      expect(slotTag(html, "headingLabel")).not.toBe("");
      expect(slotTag(html, "viewControl")).toBe("");
      expect(html).toContain("February 2022");
    });

    it("renders a view control button by default", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} />);
      expect(slotTag(html, "viewControl")).not.toBe("");
      expect(attr(slotTag(html, "viewControl"), "aria-label")).toBe("February 2022");
    });

    it("renders 7 weekday head cells", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} />);
      expect(countMatches(html, /data-slot="headCell"/g)).toBe(7);
    });

    it("renders 42 day cells with fixedWeeks", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} />);
      expect(countMatches(html, /data-slot="cellTrigger"/g)).toBe(42);
    });

    it("renders 35 day cells without fixedWeeks when the month needs 5 rows", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} fixedWeeks={false} />);
      expect(countMatches(html, /data-slot="cellTrigger"/g)).toBe(35);
      expect(countMatches(html, /data-slot="cellTrigger"/g)).toBeLessThan(42);
    });

    it("honours numberOfMonths", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} numberOfMonths={2} />);
      expect(countMatches(html, /data-slot="grid"/g)).toBe(2);
      expect(countMatches(html, /data-slot="cellTrigger"/g)).toBe(84);
    });
  });

  describe("ARIA", () => {
    it("labels the root with the calendar label and heading", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} />);
      const root = slotTag(html, "root");
      expect(attr(root, "aria-label")).toBe("Event Date, February 2022");
    });

    it("supports a custom calendarLabel", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} calendarLabel="Appointment" />);
      expect(attr(slotTag(html, "root"), "aria-label")).toBe("Appointment, February 2022");
    });

    it("labels the grid with role=application and tabindex -1", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} />);
      const grid = slotTag(html, "grid");
      expect(attr(grid, "role")).toBe("application");
      expect(attr(grid, "tabindex")).toBe("-1");
    });

    it("hides the weekday header row from assistive tech", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} />);
      expect(html).toMatch(/<thead[^>]*aria-hidden="true"/);
    });

    it("gives every day cell role=gridcell and a trigger with role=button", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} />);
      const cells = html.match(/<td[^>]*data-slot="cell"[^>]*>/g) ?? [];
      expect(cells.length).toBe(42);
      expect(cells.every((c) => c.includes('role="gridcell"'))).toBe(true);
      const triggers = html.match(/<div[^>]*data-slot="cellTrigger"[^>]*>/g) ?? [];
      expect(triggers.length).toBe(42);
      expect(triggers.every((t) => t.includes('role="button"'))).toBe(true);
    });

    it("gives each trigger a full-date aria-label", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} />);
      const label =
        html.match(/<div[^>]*data-slot="cellTrigger"[^>]*aria-label="([^"]+)"/)?.[1] ?? "";
      expect(label).toContain("2022");
    });

    it("marks today with data-today and aria-current=date", () => {
      const html = render(() => <RLCalendar />);
      const today = new Date();
      const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const trig = html.match(new RegExp(`<div[^>]*data-value="${key}"[^>]*>`))?.[0] ?? "";
      expect(trig).toContain("data-today");
      expect(trig).toContain('aria-current="date"');
    });

    it("marks selected days with data-selected and aria-selected", () => {
      const html = render(() => (
        <RLCalendar placeholder={feb2022} defaultValue={new Date(2022, 1, 15)} />
      ));
      expect(html).toContain("data-selected");
      const cell = html.match(/<td[^>]*data-slot="cell"[^>]*aria-selected="true"[^>]*>/);
      expect(cell).not.toBeNull();
    });

    it("sets data-disabled and aria-disabled on disabled days", () => {
      const html = render(() => (
        <RLCalendar placeholder={feb2022} isDateDisabled={(d) => d.getDate() === 20} />
      ));
      expect(html).toContain("data-disabled");
      expect(html).toContain('aria-disabled="true"');
    });

    it("sets data-unavailable on unavailable days", () => {
      const html = render(() => (
        <RLCalendar placeholder={feb2022} isDateUnavailable={(d) => d.getDate() === 21} />
      ));
      expect(html).toContain("data-unavailable");
    });

    it("marks outside-view days", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} />);
      expect(html).toContain("data-outside-view");
    });

    it("marks the root readonly/invalid/disabled", () => {
      expect(
        slotTag(
          render(() => <RLCalendar placeholder={feb2022} readonly />),
          "root",
        ),
      ).toContain("data-readonly");
      expect(
        slotTag(
          render(() => <RLCalendar placeholder={feb2022} disabled />),
          "root",
        ),
      ).toContain("data-disabled");
      const invalid = render(() => (
        <RLCalendar
          placeholder={feb2022}
          defaultValue={new Date(2022, 1, 20)}
          isDateDisabled={() => true}
        />
      ));
      expect(slotTag(invalid, "root")).toContain("data-invalid");
    });

    it("roving tabindex: exactly one enabled day cell has tabindex=0", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} />);
      expect(countMatches(html, /<div[^>]*data-slot="cellTrigger"[^>]*tabindex="0"/g)).toBe(1);
      expect(
        countMatches(html, /<div[^>]*data-slot="cellTrigger"[^>]*tabindex="-1"/g),
      ).toBeGreaterThan(1);
    });

    it("outside days have no tabindex", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} />);
      const outside =
        html.match(/<div[^>]*data-slot="cellTrigger"[^>]*\sdata-outside-view=""[^>]*>/g) ?? [];
      expect(outside.length).toBeGreaterThan(0);
      expect(outside.every((t) => !t.includes("tabindex"))).toBe(true);
    });
  });

  describe("selection modes", () => {
    it("single selection marks exactly one day", () => {
      const html = render(() => (
        <RLCalendar placeholder={feb2022} defaultValue={new Date(2022, 1, 15)} />
      ));
      expect(countMatches(html, /<td[^>]*data-slot="cell"[^>]*aria-selected="true"/g)).toBe(1);
    });

    it("multiple selection marks every value", () => {
      const html = render(() => (
        <RLCalendar
          multiple
          placeholder={feb2022}
          defaultValue={[new Date(2022, 1, 15), new Date(2022, 1, 16)]}
        />
      ));
      expect(countMatches(html, /<td[^>]*data-slot="cell"[^>]*aria-selected="true"/g)).toBe(2);
    });

    it("range selection marks all days in the range", () => {
      const html = render(() => (
        <RLCalendar
          range
          placeholder={feb2022}
          defaultValue={{ start: new Date(2022, 1, 14), end: new Date(2022, 1, 17) }}
        />
      ));
      expect(countMatches(html, /<td[^>]*data-slot="cell"[^>]*aria-selected="true"/g)).toBe(4);
    });
  });

  describe("views", () => {
    it("renders the month picker view with 12 cells and no weekday header", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} type="month" />);
      expect(countMatches(html, /data-slot="cellTrigger"/g)).toBe(12);
      expect(countMatches(html, /data-slot="headCell"/g)).toBe(0);
      expect(attr(slotTag(html, "root"), "aria-label")).toContain("2022");
    });

    it("renders the year picker view with 12 cells", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} type="year" />);
      expect(countMatches(html, /data-slot="cellTrigger"/g)).toBe(12);
      expect(attr(slotTag(html, "root"), "aria-label")).toContain("2020");
      expect(attr(slotTag(html, "root"), "aria-label")).toContain("2031");
    });

    it("type=month renders single-chevron navigation labelled as years", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} type="month" />);
      expect(attr(slotTag(html, "prevMonth"), "aria-label")).toBe("Previous year");
      expect(attr(slotTag(html, "nextMonth"), "aria-label")).toBe("Next year");
    });

    it("switchable is false for type=year, so no view control", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} type="year" />);
      expect(slotTag(html, "viewControl")).toBe("");
      expect(slotTag(html, "headingLabel")).not.toBe("");
    });
  });

  describe("values & callbacks", () => {
    it("renders a controlled modelValue as selected", () => {
      const html = render(() => (
        <RLCalendar placeholder={feb2022} modelValue={new Date(2022, 1, 15)} />
      ));
      expect(countMatches(html, /<td[^>]*data-slot="cell"[^>]*aria-selected="true"/g)).toBe(1);
    });

    it("renders null modelValue as empty", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} modelValue={null} />);
      expect(countMatches(html, /<td[^>]*aria-selected="true"/g)).toBe(0);
    });

    it("disabled calendar disables navigation controls", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} disabled />);
      expect(slotTag(html, "prevMonth")).toContain("disabled");
      expect(slotTag(html, "nextMonth")).toContain("disabled");
      expect(attr(slotTag(html, "prevMonth"), "aria-disabled")).toBe("true");
    });

    it("weekNumbers adds a week-number cell per row", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} weekNumbers />);
      expect(countMatches(html, /data-slot="cellWeek"/g)).toBe(6);
    });
  });

  describe("custom slots", () => {
    it("renders daySlot output instead of the day number", () => {
      const html = render(() => (
        <RLCalendar placeholder={feb2022} daySlot={({ day }) => `D${day.getDate()}`} />
      ));
      expect(html).toContain("D15");
      expect(html).not.toMatch(/data-slot="cellTrigger"[^>]*>\s*15\s*<\//);
    });

    it("renders weekDaySlot output", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} weekDaySlot={() => "WD"} />);
      expect(countMatches(html, /data-slot="headCell"[^>]*>WD</g)).toBe(7);
    });

    it("renders headingSlot output", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} headingSlot={() => "HEADING"} />);
      expect(html).toContain("HEADING");
    });

    it("renders monthCellSlot output in month view", () => {
      const html = render(() => (
        <RLCalendar
          placeholder={feb2022}
          type="month"
          monthCellSlot={({ month }) => `M${month.getMonth()}`}
        />
      ));
      expect(html).toContain("M0");
      expect(html).toContain("M11");
    });

    it("renders yearCellSlot output in year view", () => {
      const html = render(() => (
        <RLCalendar
          placeholder={feb2022}
          type="year"
          yearCellSlot={({ year }) => `Y${year.getFullYear()}`}
        />
      ));
      expect(html).toContain("Y2020");
      expect(html).toContain("Y2031");
    });
  });

  describe("ui overrides & theming", () => {
    it("merges ui.root override", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} ui={{ root: "custom-root" }} />);
      expect(slotTag(html, "root")).toContain("custom-root");
    });

    it("merges ui.cellTrigger override", () => {
      const html = render(() => (
        <RLCalendar placeholder={feb2022} ui={{ cellTrigger: "custom-trigger" }} />
      ));
      expect(slotTag(html, "cellTrigger")).toContain("custom-trigger");
    });

    it("applies class to the root", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} class="extra-class" />);
      expect(slotTag(html, "root")).toContain("extra-class");
    });

    it("calendarTheme exposes all 15 slots", () => {
      const ui = calendarTheme({});
      const slots: Array<keyof typeof ui> = [
        "root",
        "header",
        "body",
        "heading",
        "headingLabel",
        "grid",
        "gridRow",
        "gridWeekDaysRow",
        "gridBody",
        "headCell",
        "headCellWeek",
        "cell",
        "cellTrigger",
        "cellWeek",
        "srLabel",
      ];
      for (const slot of slots) {
        expect(typeof ui[slot]).toBe("string");
      }
    });

    it("calendarTheme applies view variants", () => {
      expect(calendarTheme({ view: "day" }).gridRow).toContain("grid-cols-7");
      expect(calendarTheme({ view: "month" }).gridRow).toContain("grid-cols-4");
      expect(calendarTheme({ view: "year" }).gridRow).toContain("grid-cols-4");
    });

    it("calendarTheme applies compound color/variant state classes", () => {
      const trigger = calendarTheme({ color: "primary", variant: "solid" }).cellTrigger;
      expect(trigger).toContain("bg-primary");
      expect(trigger).toContain("text-inverted");
      expect(trigger).toContain("data-selected");
    });

    it("calendarTheme applies weekNumbers compound", () => {
      const ui = calendarTheme({ view: "day", weekNumbers: true });
      expect(ui.gridRow).toContain("grid-cols-8");
      expect(ui.gridWeekDaysRow).toContain("grid-cols-8");
    });

    it("calendarTheme applies size variants", () => {
      expect(calendarTheme({ size: "xs", view: "day" }).cellTrigger).toContain("size-6");
      expect(calendarTheme({ size: "xl", view: "day" }).cellTrigger).toContain("size-10");
      expect(calendarTheme({ size: "md", view: "month" }).cellTrigger).toContain("h-8");
    });
  });

  describe("SSR safety", () => {
    it("renders without touching window/document", () => {
      expect(() => render(() => <RLCalendar />)).not.toThrow();
    });

    it("produces deterministic output for the same props", () => {
      const a = render(() => <RLCalendar placeholder={feb2022} />);
      const b = render(() => <RLCalendar placeholder={feb2022} />);
      expect(a).toBe(b);
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });
});

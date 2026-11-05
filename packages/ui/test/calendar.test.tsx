import { describe, it, expect, vi, afterEach } from "vite-plus/test";

import { RLCalendar } from "../src/components/calendar/RLCalendar";
import { renderToString } from "@solidjs/web";
import { cleanHtml } from "./utils/normalize";

function render(fn: () => any): string {
  return cleanHtml(renderToString(fn));
}

function slotTag(html: string, slot: string): string {
  const name = slot.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);
  const match = html.match(new RegExp(`<[a-z]+[^>]*data-slot="${name}"[^>]*>`));
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
  describe("structure", () => {
    it("renders the root with the root slot", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} />);
      expect(html).toMatch(/^<div/);
      expect(slotTag(html, "root")).not.toBe("");
    });

    it("renders header, body, heading and grid parts", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} />);
      expect(slotTag(html, "header")).not.toBe("");
      expect(slotTag(html, "body")).not.toBe("");
      expect(slotTag(html, "heading")).not.toBe("");
      expect(slotTag(html, "grid")).not.toBe("");
      expect(slotTag(html, "gridBody")).not.toBe("");
      expect(slotTag(html, "cell")).not.toBe("");
      expect(slotTag(html, "cellTrigger")).not.toBe("");
    });

    it("renders children inside the root", () => {
      const html = render(() => (
        <RLCalendar placeholder={feb2022}>
          <span>CHILD</span>
        </RLCalendar>
      ));
      expect(html).toContain("CHILD");
    });

    it("renders 7 weekday cells", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} />);
      expect(countMatches(html, /data-slot="week-day"/g)).toBe(7);
    });

    it("renders 42 day cells with fixedWeeks", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} />);
      expect(countMatches(html, /data-slot="cell-trigger"/g)).toBe(42);
    });

    it("renders 35 day cells without fixedWeeks when the month needs 5 rows", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} fixedWeeks={false} />);
      expect(countMatches(html, /data-slot="cell-trigger"/g)).toBe(35);
    });

    it("renders one grid per month when numberOfMonths is set", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} numberOfMonths={2} />);
      expect(countMatches(html, /data-slot="grid"/g)).toBe(2);
      expect(countMatches(html, /data-slot="cell-trigger"/g)).toBe(84);
    });

    it("renders a week-number cell per row when weekNumbers is set", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} weekNumbers />);
      expect(countMatches(html, /data-slot="cell-week"/g)).toBe(6);
    });
  });

  describe("controls", () => {
    it("renders the four navigation buttons by default", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} />);
      expect(slotTag(html, "prev")).not.toBe("");
      expect(slotTag(html, "next")).not.toBe("");
      expect(slotTag(html, "prevYear")).not.toBe("");
      expect(slotTag(html, "nextYear")).not.toBe("");
    });

    it("omits year controls when yearControls is false", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} yearControls={false} />);
      expect(slotTag(html, "prevYear")).toBe("");
      expect(slotTag(html, "nextYear")).toBe("");
      expect(slotTag(html, "prev")).not.toBe("");
    });

    it("omits month controls when monthControls is false", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} monthControls={false} />);
      expect(slotTag(html, "prev")).toBe("");
      expect(slotTag(html, "prevYear")).not.toBe("");
    });

    it("renders the heading label instead of a view control when viewControl is false", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} viewControl={false} />);
      expect(slotTag(html, "headingLabel")).not.toBe("");
      expect(slotTag(html, "viewControl")).toBe("");
    });

    it("renders a view control button by default", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} />);
      expect(slotTag(html, "viewControl")).not.toBe("");
    });

    it("switches to a heading label when the type has no switchable view", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} type="year" />);
      expect(slotTag(html, "viewControl")).toBe("");
      expect(slotTag(html, "headingLabel")).not.toBe("");
    });

    it("disables navigation controls when disabled", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} disabled />);
      expect(slotTag(html, "prev")).toContain("disabled");
      expect(slotTag(html, "next")).toContain("disabled");
      expect(attr(slotTag(html, "prev"), "aria-disabled")).toBe("true");
    });
  });

  describe("ARIA and state", () => {
    it("labels the root with the calendar label", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} calendarLabel="Appointment" />);
      expect(attr(slotTag(html, "root"), "aria-label")).toContain("Appointment");
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

    it("gives every day cell role=gridcell and every trigger role=button", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} />);
      const cells = html.match(/<td[^>]*data-slot="cell"[^>]*>/g) ?? [];
      expect(cells.length).toBe(42);
      expect(cells.every((c) => c.includes('role="gridcell"'))).toBe(true);
      const triggers = html.match(/<div[^>]*data-slot="cell-trigger"[^>]*>/g) ?? [];
      expect(triggers.length).toBe(42);
      expect(triggers.every((t) => t.includes('role="button"'))).toBe(true);
    });

    it("marks today with data-today and aria-current=date", () => {
      const html = render(() => <RLCalendar />);
      const today = new Date();
      const key = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
      const trig = html.match(new RegExp(`<div[^>]*data-value="${key}"[^>]*>`))?.[0] ?? "";
      expect(trig).toContain("data-today");
      expect(trig).toContain('aria-current="date"');
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

    it("marks days outside the current view", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} />);
      expect(html).toContain("data-outside-view");
    });

    it("marks the root readonly, disabled and invalid", () => {
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
      expect(slotTag(invalid, "root")).toContain('aria-invalid="true"');
    });

    it("roving tabindex: exactly one enabled day trigger has tabindex=0", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} />);
      expect(countMatches(html, /<div[^>]*data-slot="cell-trigger"[^>]*tabindex="0"/g)).toBe(1);
      expect(
        countMatches(html, /<div[^>]*data-slot="cell-trigger"[^>]*tabindex="-1"/g),
      ).toBeGreaterThan(1);
    });

    it("outside days have no tabindex", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} />);
      const outside =
        html.match(/<div[^>]*data-slot="cell-trigger"[^>]*\sdata-outside-view=""[^>]*>/g) ?? [];
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
    it("renders the month picker with 12 cells and no weekday header", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} type="month" />);
      expect(countMatches(html, /data-slot="cell-trigger"/g)).toBe(12);
      expect(countMatches(html, /data-slot="week-day"/g)).toBe(0);
    });

    it("renders the year picker with 12 cells", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} type="year" />);
      expect(countMatches(html, /data-slot="cell-trigger"/g)).toBe(12);
    });

    it("renders year-cell markup in the year picker", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} type="year" />);
      expect(countMatches(html, /data-slot="year-cell"/g)).toBe(12);
    });

    it("renders month-cell markup in the month picker", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} type="month" />);
      expect(countMatches(html, /data-slot="month-cell"/g)).toBe(12);
    });
  });

  describe("values", () => {
    it("renders a controlled value as selected", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} value={new Date(2022, 1, 15)} />);
      expect(countMatches(html, /<td[^>]*data-slot="cell"[^>]*aria-selected="true"/g)).toBe(1);
    });

    it("renders a null value as nothing selected", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} value={null} />);
      expect(countMatches(html, /<td[^>]*aria-selected="true"/g)).toBe(0);
    });
  });

  describe("custom slots", () => {
    it("renders daySlot output instead of the day number", () => {
      const html = render(() => (
        <RLCalendar placeholder={feb2022} daySlot={({ day }) => `D${day.getDate()}`} />
      ));
      expect(html).toContain("D15");
      expect(html).not.toMatch(/data-slot="cell-trigger"[^>]*>\s*15\s*<\//);
    });

    it("renders weekDaySlot output in every weekday cell", () => {
      const html = render(() => <RLCalendar placeholder={feb2022} weekDaySlot={() => "WD"} />);
      expect(countMatches(html, /data-slot="week-day"[^>]*>WD</g)).toBe(7);
    });

    it("renders headingSlot output in place of the heading", () => {
      const html = render(() => (
        <RLCalendar placeholder={feb2022} headingSlot={<span>HEADING</span>} />
      ));
      expect(html).toContain("HEADING");
      expect(slotTag(html, "headingLabel")).toBe("");
      expect(slotTag(html, "viewControl")).toBe("");
    });

    it("renders prevSlot and nextSlot output inside the navigation buttons", () => {
      const html = render(() => (
        <RLCalendar
          placeholder={feb2022}
          prevSlot={<span>PREV</span>}
          nextSlot={<span>NEXT</span>}
        />
      ));
      expect(slotTag(html, "prev")).not.toBe("");
      expect(html).toContain("PREV");
      expect(html).toContain("NEXT");
    });

    it("renders monthCellSlot output in the month picker", () => {
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

    it("renders yearCellSlot output in the year picker", () => {
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

  describe("ui overrides", () => {
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
  });

  describe("SSR safety", () => {
    it("renders without a window or document", () => {
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

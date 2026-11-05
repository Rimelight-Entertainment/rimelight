import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLCalendar } from "@rimelight/ui/components/calendar/RLCalendar.tsx";
import type { CalendarModelValue } from "@rimelight/ui/components/calendar/calendar.types.ts";
import { AUDIT_COLORS, type ComponentAuditDefinition } from "./types";
import { t } from "@rimelight/i18n";

const COLORS = AUDIT_COLORS;
const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
const VARIANTS = ["solid", "outline", "soft", "subtle"] as const;

const d = (year: number, month: number, day: number) => new Date(year, month, day);
const FEB = d(2022, 1, 15);

export const CalendarSandbox = (): JSX.Element => {
  const [color, setColor] = createSignal<string>("primary");
  const [variant, setVariant] = createSignal<(typeof VARIANTS)[number]>("solid");
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");
  const [type, setType] = createSignal<"date" | "month" | "year">("date");
  const [mode, setMode] = createSignal<"single" | "multiple" | "range">("single");
  const [weekNumbers, setWeekNumbers] = createSignal(false);
  const [disabled, setDisabled] = createSignal(false);
  const [readonly, setReadonly] = createSignal(false);
  const [fixedWeeks, setFixedWeeks] = createSignal(true);
  const [numberOfMonths, setNumberOfMonths] = createSignal(1);
  const [value, setValue] = createSignal<CalendarModelValue>(null);

  const chip = (active: boolean) =>
    `px-2 py-0.5 rounded text-xs font-mono transition-colors ${
      active
        ? "bg-primary text-inverted font-bold"
        : "bg-elevated text-muted hover:text-highlighted border border-default"
    }`;

  return (
    <div class="flex flex-col gap-6">
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">{t("app.text.color")}</span>
          <For each={COLORS}>
            {(c) => (
              <button type="button" onClick={() => setColor(c)} class={chip(color() === c)}>
                {c}
              </button>
            )}
          </For>
        </div>
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">{t("app.text.variant")}</span>
          <For each={VARIANTS}>
            {(v) => (
              <button type="button" onClick={() => setVariant(v)} class={chip(variant() === v)}>
                {v}
              </button>
            )}
          </For>
        </div>
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">{t("app.text.size")}</span>
          <For each={SIZES}>
            {(s) => (
              <button type="button" onClick={() => setSize(s)} class={chip(size() === s)}>
                {s}
              </button>
            )}
          </For>
        </div>
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">{t("app.text.type-ee3f")}</span>
          <For each={["date", "month", "year"] as const}>
            {(t) => (
              <button type="button" onClick={() => setType(t)} class={chip(type() === t)}>
                {t}
              </button>
            )}
          </For>
        </div>
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">{t("app.text.mode")}</span>
          <For each={["single", "multiple", "range"] as const}>
            {(m) => (
              <button
                type="button"
                onClick={() => {
                  setMode(m);
                  setValue(null);
                }}
                class={chip(mode() === m)}
              >
                {m}
              </button>
            )}
          </For>
        </div>
        <div class="flex items-center gap-3">
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={weekNumbers()}
              onInput={(e) => setWeekNumbers(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.week-numbers")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={disabled()}
              onInput={(e) => setDisabled(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.disabled")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={readonly()}
              onInput={(e) => setReadonly(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.readonly")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={fixedWeeks()}
              onInput={(e) => setFixedWeeks(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.fixedweeks")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={numberOfMonths() === 2}
              onInput={(e) => setNumberOfMonths(e.currentTarget.checked ? 2 : 1)}
              class="rounded border-default"
            />
            <span class="text-muted">numberOfMonths=2</span>
          </label>
        </div>
      </div>

      <RLCalendar
        color={color()}
        variant={variant()}
        size={size()}
        type={type()}
        multiple={mode() === "multiple"}
        range={mode() === "range"}
        weekNumbers={weekNumbers()}
        disabled={disabled()}
        readonly={readonly()}
        fixedWeeks={fixedWeeks()}
        numberOfMonths={numberOfMonths()}
        defaultPlaceholder={FEB}
        value={value()}
        onValueChange={(next) => {
          setValue(next ?? null);
        }}
      />

      <p class="text-xs text-muted font-mono">
        value:{" "}
        {value() == null
          ? "null"
          : value() instanceof Date
            ? (value() as Date).toDateString()
            : Array.isArray(value())
              ? (value() as Date[]).map((x) => x.toDateString()).join(", ")
              : JSON.stringify(value(), (_k, v) => (v instanceof Date ? v.toDateString() : v))}
      </p>
    </div>
  );
};

export const calendarAudit: ComponentAuditDefinition = {
  id: "calendar",
  name: "Calendar",
  category: "Form & Input",
  status: "Passed",
  description:
    "Display a monthly grid calendar with single, multiple and range date selection, day/month/year views, week numbers, navigation controls, and full WAI-ARIA grid semantics.",
  importPath: "@rimelight/ui/components/calendar/RLCalendar.tsx",
  renderSandbox: () => <CalendarSandbox />,
  testScenarios: [
    {
      id: "single-selection",
      get title() {
        return t("app.text.single-date-selection");
      },
      description:
        "Default single selection with a controlled value, today marker, roving tabindex and per-day full-date aria-labels.",
      render: () => (
        <RLCalendar defaultPlaceholder={FEB} defaultValue={d(2022, 1, 17)} initialFocus />
      ),
    },
    {
      id: "multiple-selection",
      get title() {
        return t("app.text.multiple-date-selection");
      },
      description: "`multiple` toggles membership of each clicked day independently.",
      render: () => (
        <RLCalendar
          multiple
          defaultPlaceholder={FEB}
          defaultValue={[d(2022, 1, 14), d(2022, 1, 18), d(2022, 1, 24)]}
        />
      ),
    },
    {
      id: "range-selection",
      get title() {
        return t("app.text.range-date-selection");
      },
      description:
        "`range` selects start on first click, end on second (out-of-order clicks swap), and restarts when both are set.",
      render: () => (
        <RLCalendar
          range
          defaultPlaceholder={FEB}
          defaultValue={{ start: d(2022, 1, 10), end: d(2022, 1, 19) }}
        />
      ),
    },
    {
      id: "month-year-views",
      get title() {
        return t("app.text.month-year-picker-views");
      },
      description:
        "`type='month'` renders a 12-cell month grid, `type='year'` a decade-aligned 12-year grid; both omit the weekday header and cycle navigation labels to Previous/Next year.",
      render: () => (
        <div class="flex flex-wrap gap-8">
          <RLCalendar type="month" defaultPlaceholder={FEB} />
          <RLCalendar type="year" defaultPlaceholder={FEB} />
        </div>
      ),
    },
    {
      id: "view-switching",
      get title() {
        return t("app.text.view-switching-day-month-year");
      },
      description:
        "The heading renders a button that cycles views down to the type's minimum view and wraps back.",
      render: () => <RLCalendar defaultPlaceholder={FEB} defaultValue={d(2022, 1, 17)} />,
    },
    {
      id: "week-numbers",
      get title() {
        return t("app.text.week-numbers-column");
      },
      description:
        "`weekNumbers` adds a leading week-number cell per row and widens the grid to 8 columns.",
      render: () => <RLCalendar weekNumbers defaultPlaceholder={FEB} />,
    },
    {
      id: "multi-month",
      get title() {
        return t("app.text.multiple-months-numberofmonths");
      },
      description: "`numberOfMonths=2` renders two side-by-side month grids sharing one heading.",
      render: () => <RLCalendar numberOfMonths={2} defaultPlaceholder={FEB} />,
    },
    {
      id: "disabled-dates",
      get title() {
        return t("app.text.disabled-unavailable-min-max-dates");
      },
      description:
        "`isDateDisabled`, `isDateUnavailable`, `minValue` and `maxValue` mark cells with data-disabled / data-unavailable and block selection; nav buttons clamp at min/max.",
      render: () => (
        <RLCalendar
          defaultPlaceholder={FEB}
          minValue={d(2022, 1, 7)}
          maxValue={d(2022, 1, 24)}
          isDateDisabled={(date) => date.getDay() === 0 || date.getDay() === 6}
          isDateUnavailable={(date) => date.getDate() === 22}
        />
      ),
    },
    {
      id: "disabled-readonly",
      get title() {
        return t("app.text.disabled-readonly-states");
      },
      description:
        "Root carries data-disabled/data-readonly, all day cells become aria-disabled, navigation buttons are disabled.",
      render: () => (
        <div class="flex flex-wrap gap-8">
          <RLCalendar disabled defaultPlaceholder={FEB} />
          <RLCalendar readonly defaultPlaceholder={FEB} />
        </div>
      ),
    },
    {
      id: "color-variant-matrix",
      get title() {
        return t("app.text.color-variant-matrix-857a");
      },
      get description() {
        return t("app.text.all-7-colors-with-the-4-variants-driving-the-day");
      },
      render: () => (
        <div class="flex flex-col gap-6">
          <For each={VARIANTS}>
            {(v) => (
              <div class="flex flex-wrap gap-6">
                <For each={COLORS}>
                  {(c) => (
                    <div class="flex flex-col gap-1">
                      <span class="text-[10px] font-mono text-muted">
                        {c} / {v}
                      </span>
                      <RLCalendar
                        color={c}
                        variant={v}
                        size="sm"
                        defaultPlaceholder={FEB}
                        defaultValue={d(2022, 1, 17)}
                      />
                    </div>
                  )}
                </For>
              </div>
            )}
          </For>
        </div>
      ),
    },
    {
      id: "sizes",
      get title() {
        return t("app.text.sizes-xs-xl");
      },
      get description() {
        return t("app.text.size-drives-heading-label-head-cells-and-day-cel");
      },
      render: () => (
        <div class="flex flex-wrap gap-6">
          <For each={SIZES}>
            {(s) => (
              <div class="flex flex-col gap-1">
                <span class="text-[10px] font-mono text-muted">{s}</span>
                <RLCalendar size={s} defaultPlaceholder={FEB} defaultValue={d(2022, 1, 17)} />
              </div>
            )}
          </For>
        </div>
      ),
    },
    {
      id: "heading-slot",
      title: "Heading Slot",
      description: "`headingSlot` replaces the heading label and the view control.",
      render: () => (
        <RLCalendar
          defaultPlaceholder={FEB}
          headingSlot={<span class="text-success font-bold">{"CUSTOM HEADING"}</span>}
        />
      ),
    },
    {
      id: "prev-slot",
      title: "Previous Slot",
      description: "`prevSlot` replaces the previous-month chevron content.",
      render: () => (
        <RLCalendar
          defaultPlaceholder={FEB}
          prevSlot={<span class="text-primary font-bold">{"PREV"}</span>}
        />
      ),
    },
    {
      id: "next-slot",
      title: "Next Slot",
      description: "`nextSlot` replaces the next-month chevron content.",
      render: () => (
        <RLCalendar
          defaultPlaceholder={FEB}
          nextSlot={<span class="text-primary font-bold">{"NEXT"}</span>}
        />
      ),
    },
    {
      id: "week-day-slot",
      title: "Week Day Slot",
      description: "`weekDaySlot` replaces each weekday header label.",
      render: () => (
        <RLCalendar
          defaultPlaceholder={FEB}
          weekDaySlot={(ctx) => (
            <span class="text-primary">{ctx.day.slice(0, 2).toUpperCase()}</span>
          )}
        />
      ),
    },
    {
      id: "day-slot",
      title: "Day Slot",
      description: "`daySlot` replaces the day number and receives the day as a Date.",
      render: () => (
        <RLCalendar
          defaultPlaceholder={FEB}
          daySlot={(ctx) => (
            <span class={ctx.day.getDate() === 17 ? "text-error font-bold" : ""}>
              {ctx.day.getDate()}
            </span>
          )}
        />
      ),
    },
    {
      id: "month-cell-slot",
      title: "Month Cell Slot",
      description: "`monthCellSlot` replaces each month cell in the month picker.",
      render: () => (
        <RLCalendar
          type="month"
          defaultPlaceholder={FEB}
          monthCellSlot={(ctx) => (
            <span class="text-info">{ctx.month.toLocaleString("en", { month: "long" })}</span>
          )}
        />
      ),
    },
    {
      id: "year-cell-slot",
      title: "Year Cell Slot",
      description: "`yearCellSlot` replaces each year cell in the year picker.",
      render: () => (
        <RLCalendar
          type="year"
          defaultPlaceholder={FEB}
          yearCellSlot={(ctx) => <span class="text-info">{ctx.year.getFullYear()}</span>}
        />
      ),
    },
    {
      id: "default-children",
      title: "Default Slot (children)",
      description: "Children render inside the root, after the header and grid body.",
      render: () => (
        <RLCalendar defaultPlaceholder={FEB}>
          <span class="text-xs text-muted">{"Default slot content"}</span>
        </RLCalendar>
      ),
    },
    {
      id: "custom-label",
      get title() {
        return t("app.text.custom-calendar-label-aria-label");
      },
      description:
        "`calendarLabel` prefixes the root aria-label: `<label>, <heading>` (Nuxt UI omits this prop; Rimelight addition).",
      render: () => <RLCalendar calendarLabel="Appointment Date" defaultPlaceholder={FEB} />,
    },
    {
      id: "ui-overrides",
      title: "ui Prop Overrides",
      get description() {
        return t("app.text.per-slot-class-overrides-through-the-ui-prop-mer");
      },
      render: () => (
        <RLCalendar
          defaultPlaceholder={FEB}
          defaultValue={d(2022, 1, 17)}
          ui={{
            root: "rounded-xl border border-default p-4 bg-elevated/30",
            cellTrigger: "rounded-lg!",
          }}
        />
      ),
    },
  ],
  checklist: [
    {
      criterion: "API parity (Calendar)",
      status: "pass",
      notes:
        "Props: as, type, prevIcon/nextIcon, prevSlot/nextSlot, viewControl, monthControls, yearControls, color, variant, size, range, multiple, value/defaultValue, placeholder/defaultPlaceholder, weekNumbers, allowNonContiguousRanges, pagedNavigation, preventDeselect, maximumDays, weekStartsOn, weekdayFormat, fixedWeeks, minValue, maxValue, locale, numberOfMonths, disabled, readonly, initialFocus, isDateDisabled/isDateUnavailable, isMonthDisabled/isMonthUnavailable, isYearDisabled/isYearUnavailable, nextPage/prevPage, disableDaysOutsideCurrentView, fixedDate, calendarLabel, ui, class. Emits: onValueChange, onPlaceholderChange, onValidValueChange, onStartValueChange.",
    },
    {
      criterion: "Slot pattern parity",
      status: "pass",
      notes:
        "Theme slots: root, header, body, heading, headingLabel, grid, gridRow, gridWeekDaysRow, gridBody, gridHead, weekDay, cell, day, monthCell, yearCell, cellTrigger, cellWeek, srLabel, prevYear, prev, next, nextYear, viewControl. Render-prop slots: headingSlot, prevSlot, nextSlot, weekDaySlot, daySlot, monthCellSlot, yearCellSlot. Children render inside the root.",
    },
    {
      criterion: "Full WAI-ARIA compliance",
      status: "pass",
      notes:
        "Root aria-label '<calendarLabel>, <heading>'; sr-only heading div role=heading aria-level=2; table role=application aria-readonly/aria-disabled + data-* mirrors; thead aria-hidden; td role=gridcell aria-selected/aria-disabled; day trigger role=button aria-label=<full date> aria-disabled aria-current=date; roving tabindex (0 focused, -1 in view, omitted outside/disabled); nav buttons labelled through uiT (calendar.previousMonth/nextMonth/previousYear/nextYear).",
    },
    {
      criterion: "No innerHTML / dangerouslySetInnerHTML",
      status: "pass",
      notes:
        "Pure Solid JSX; icons render through RLIcon node parsing, no markup strings injected.",
    },
    {
      criterion: "No inline styles (CSP-safe, UnoCSS only)",
      status: "pass",
      notes: "No style attribute; sr-only heading uses the theme's srLabel slot class.",
    },
    {
      criterion: "No hydration mismatches",
      status: "pass",
      notes:
        "Today marker derived from new Date() identically on server and client render pass; placeholder resolved from props with a deterministic fallback; no browser-only APIs during render (Intl.Locale weekInfo guarded in try/catch).",
    },
    {
      criterion: "No direct cx() calls in component",
      status: "pass",
      notes: "All class composition flows through the RLCalendarTheme setup classes accessor.",
    },
    {
      criterion: "Exclusively named exports",
      status: "pass",
      notes:
        "RLCalendar, RLCalendarTheme, helpers: named exports only. Types live in calendar.types.ts.",
    },
    {
      criterion: "Audit page renders component bare (no wrapper)",
      status: "pass",
      notes: "Scenarios render <RLCalendar /> directly; only matrix layouts add flex containers.",
    },
    {
      criterion: "UnoCSS emits data-attribute state selectors",
      status: "pass",
      notes:
        "Verified against built CSS: auto color on root, state selectors use literal arbitrary variants.",
    },
  ],
};

import { defineTheme } from "../../resolver";

export const RLCalendarTheme = defineTheme("calendar", {
  slots: [
    "root",
    "header",
    "body",
    "heading",
    "headingLabel",
    "grid",
    "gridRow",
    "gridWeekDaysRow",
    "gridBody",
    "gridHead",
    "headCell",
    "headCellWeek",
    "cell",
    "cellTrigger",
    "cellWeek",
    "srLabel",
    "prevYear",
    "prevMonth",
    "nextMonth",
    "nextYear",
    "viewControl",
  ],
  base: {
    root: "",
    header: "flex items-center justify-between",
    body: "flex flex-col space-y-4 pt-4 sm:flex-row sm:space-x-4 sm:space-y-0",
    heading: "flex-1 min-w-0 text-center",
    headingLabel: "font-medium block truncate p-1.5",
    grid: "w-full border-collapse select-none space-y-1 focus:outline-none",
    gridRow: "grid",
    gridWeekDaysRow: "mb-1 grid w-full grid-cols-7",
    gridBody: "grid",
    headCell: "rounded-md text-[var(--rl-text)]",
    headCellWeek: "rounded-md text-muted",
    cell: "relative text-center",
    cellTrigger: [
      "m-0.5 relative flex items-center justify-center whitespace-nowrap focus-visible:outline-3 transition",
      "outline-[var(--rl-ring)]/25",
      "[&[data-disabled]]:text-muted [&[data-unavailable]]:line-through [&[data-unavailable]]:text-muted",
      "[&[data-unavailable]]:pointer-events-none [&[data-today]]:font-semibold",
    ],
    cellWeek: "relative text-center text-muted",
    srLabel: "sr-only",
    gridHead: "",
    prevYear: "",
    prevMonth: "",
    nextMonth: "",
    nextYear: "",
    viewControl: "",
  },
  variants: {
    color: "auto",
    variant: {
      solid: {
        cellTrigger:
          "[&[data-selected]]:bg-[var(--rl-bg)] [&[data-selected]]:text-inverted [&[data-today]:not([data-selected])]:text-[var(--rl-text)] [&[data-highlighted]]:bg-[var(--rl-bg)]/20 hover:[&:not([data-selected])]:bg-[var(--rl-bg)]/20",
      },
      outline: {
        cellTrigger:
          "[&[data-selected]]:ring [&[data-selected]]:ring-inset [&[data-selected]]:ring-[var(--rl-ring)]/50 [&[data-selected]]:text-[var(--rl-text)] [&[data-selected]]:focus-visible:ring-[var(--rl-ring)] [&[data-today]:not([data-selected])]:text-[var(--rl-text)] [&[data-highlighted]]:bg-[var(--rl-bg)]/10 hover:[&:not([data-selected])]:bg-[var(--rl-bg)]/10",
      },
      soft: {
        cellTrigger:
          "[&[data-selected]]:bg-[var(--rl-bg)]/10 [&[data-selected]]:text-[var(--rl-text)] [&[data-today]:not([data-selected])]:text-[var(--rl-text)] [&[data-highlighted]]:bg-[var(--rl-bg)]/20 hover:[&:not([data-selected])]:bg-[var(--rl-bg)]/20",
      },
      subtle: {
        cellTrigger:
          "[&[data-selected]]:bg-[var(--rl-bg)]/10 [&[data-selected]]:text-[var(--rl-text)] [&[data-selected]]:ring [&[data-selected]]:ring-inset [&[data-selected]]:ring-[var(--rl-ring)]/25 [&[data-selected]]:focus-visible:ring-[var(--rl-ring)] [&[data-today]:not([data-selected])]:text-[var(--rl-text)] [&[data-highlighted]]:bg-[var(--rl-bg)]/20 hover:[&:not([data-selected])]:bg-[var(--rl-bg)]/20",
      },
    },
    size: {
      xs: {
        headingLabel: "text-xs",
        cell: "text-xs",
        cellWeek: "text-xs",
        headCell: "text-[10px]",
        headCellWeek: "text-[10px]",
        body: "space-y-2 pt-2",
      },
      sm: {
        headingLabel: "text-xs",
        headCell: "text-xs",
        headCellWeek: "text-xs",
        cellWeek: "text-xs",
        cell: "text-xs",
      },
      md: {
        headingLabel: "text-sm",
        headCell: "text-xs",
        headCellWeek: "text-xs",
        cellWeek: "text-xs",
        cell: "text-sm",
      },
      lg: {
        headingLabel: "text-sm",
        headCell: "text-sm",
        headCellWeek: "text-sm",
        cellWeek: "text-sm",
        cell: "text-sm",
      },
      xl: {
        headingLabel: "text-base",
        headCell: "text-base",
        headCellWeek: "text-base",
        cellWeek: "text-base",
        cell: "text-base",
      },
    },
    view: {
      day: {
        gridRow: "grid-cols-7 place-items-center",
        cellTrigger: "rounded-full [&[data-outside-view]]:text-muted",
      },
      month: { gridRow: "grid-cols-4", cellTrigger: "rounded-md" },
      year: { gridRow: "grid-cols-4", cellTrigger: "rounded-md" },
    },
    weekNumbers: {
      true: {},
    },
  },
  compoundVariants: [
    // Neutral does not map onto the color vars the same way as Nuxt's tokens,
    // so it keeps explicit classes (same as button/badge).
    {
      color: "neutral",
      class: {
        headCell: "text-highlighted",
        cellTrigger: "outline-inverted/25",
      },
    },
    {
      color: "neutral",
      variant: "solid",
      class: {
        cellTrigger:
          "[&[data-selected]]:bg-inverted [&[data-selected]]:text-inverted [&[data-today]:not([data-selected])]:text-highlighted [&[data-highlighted]]:bg-inverted/20 hover:[&:not([data-selected])]:bg-inverted/10",
      },
    },
    {
      color: "neutral",
      variant: "outline",
      class: {
        cellTrigger:
          "[&[data-selected]]:ring [&[data-selected]]:ring-inset [&[data-selected]]:ring-accented [&[data-selected]]:text-default [&[data-selected]]:bg-default [&[data-selected]]:focus-visible:ring-inverted [&[data-today]:not([data-selected])]:text-highlighted [&[data-highlighted]]:bg-inverted/10 hover:[&:not([data-selected])]:bg-inverted/10",
      },
    },
    {
      color: "neutral",
      variant: "soft",
      class: {
        cellTrigger:
          "[&[data-selected]]:bg-elevated [&[data-selected]]:text-default [&[data-today]:not([data-selected])]:text-highlighted [&[data-highlighted]]:bg-inverted/20 hover:[&:not([data-selected])]:bg-inverted/10",
      },
    },
    {
      color: "neutral",
      variant: "subtle",
      class: {
        cellTrigger:
          "[&[data-selected]]:bg-elevated [&[data-selected]]:text-default [&[data-selected]]:ring [&[data-selected]]:ring-inset [&[data-selected]]:ring-accented [&[data-selected]]:focus-visible:ring-inverted [&[data-today]:not([data-selected])]:text-highlighted [&[data-highlighted]]:bg-inverted/20 hover:[&:not([data-selected])]:bg-inverted/10",
      },
    },
    // size x day
    { size: "xs", view: "day", class: { cellTrigger: "size-6" } },
    { size: "sm", view: "day", class: { cellTrigger: "size-7" } },
    { size: "md", view: "day", class: { cellTrigger: "size-8" } },
    { size: "lg", view: "day", class: { cellTrigger: "size-9" } },
    { size: "xl", view: "day", class: { cellTrigger: "size-10" } },
    // size x month/year
    { size: "xs", view: ["month", "year"], class: { cellTrigger: "h-6 px-2" } },
    { size: "sm", view: ["month", "year"], class: { cellTrigger: "h-7 px-2" } },
    { size: "md", view: ["month", "year"], class: { cellTrigger: "h-8 px-3" } },
    { size: "lg", view: ["month", "year"], class: { cellTrigger: "h-9 px-4" } },
    { size: "xl", view: ["month", "year"], class: { cellTrigger: "h-10 px-5" } },
    // week numbers column
    {
      view: "day",
      weekNumbers: true,
      class: {
        gridRow: "grid-cols-8",
        gridWeekDaysRow: "grid-cols-8 [&>*:first-child]:col-start-2",
      },
    },
  ],
  defaultVariants: {
    size: "md",
    color: "primary",
    variant: "solid",
    view: "day",
    weekNumbers: false,
  },
});

import { defineTheme } from "../../resolver";

export type RLBreadcrumbSlot =
  | "root"
  | "list"
  | "item"
  | "link"
  | "linkLeadingIcon"
  | "linkLeadingAvatar"
  | "linkLabel"
  | "separator"
  | "separatorIcon"
  | "overflow"
  | "overflowEllipsis"
  | "overflowCount";

export type RLBreadcrumbClasses = Record<RLBreadcrumbSlot, string>;

export const RLBreadcrumbTheme = defineTheme("breadcrumb", {
  slots: [
    "root",
    "list",
    "item",
    "link",
    "linkLeadingIcon",
    "linkLeadingAvatar",
    "linkLabel",
    "separator",
    "separatorIcon",
    "overflow",
    "overflowEllipsis",
    "overflowCount",
  ],
  base: {
    root: "relative min-w-0",
    list: "flex items-center gap-1.5 flex-wrap",
    item: "inline-flex items-center gap-1.5 min-w-0",
    link: "group relative inline-flex items-center gap-1.5 text-sm min-w-0 rounded-md transition-colors cursor-pointer decoration-none",
    linkLeadingIcon: "shrink-0 size-4 flex items-center justify-center text-inherit",
    linkLeadingAvatar: "shrink-0 inline-flex items-center justify-center",
    linkLabel: "truncate",
    separator: "inline-flex items-center justify-center shrink-0 select-none",
    separatorIcon: "shrink-0 size-3.5 text-muted flex items-center justify-center",
    overflow: "inline-flex items-center gap-1.5 list-none shrink-0",
    overflowEllipsis: "text-muted tracking-wider font-medium select-none",
    overflowCount: "text-muted text-xs font-semibold select-none",
  },
  variants: {
    active: {
      true: {
        link: "font-semibold cursor-default text-[var(--rl-text)]",
      },
      false: {
        link: "text-muted font-medium",
      },
    },
    disabled: {
      true: {
        link: "cursor-not-allowed opacity-75 pointer-events-none",
      },
    },
    to: {
      true: "",
    },
    color: "auto",
  },
  compoundVariants: [
    {
      disabled: false,
      active: false,
      to: true,
      class: {
        link: "hover:text-default transition-colors",
      },
    },
    {
      color: "neutral",
      active: true,
      class: {
        link: "text-highlighted",
      },
    },
  ],
  defaultVariants: {
    color: "primary",
    active: false,
  },
});

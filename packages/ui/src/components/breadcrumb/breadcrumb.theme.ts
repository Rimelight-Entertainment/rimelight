import { defineTheme } from "../../resolver";

export const breadcrumbTheme = defineTheme("breadcrumb", {
  slots: [
    "root",
    "list",
    "item",
    "link",
    "linkLeadingIcon",
    "linkLeadingAvatar",
    "linkLeadingAvatarSize",
    "linkLabel",
    "separator",
    "separatorIcon",
  ],
  base: {
    root: "relative min-w-0",
    list: "flex items-center gap-1.5 flex-wrap",
    item: "inline-flex items-center gap-1.5 min-w-0",
    link: "group relative inline-flex items-center gap-1.5 text-sm min-w-0 rounded-md transition-colors cursor-pointer decoration-none",
    linkLeadingIcon: "shrink-0 size-4 flex items-center justify-center text-inherit",
    linkLeadingAvatar: "shrink-0 inline-flex items-center justify-center",
    linkLeadingAvatarSize: "3xs",
    linkLabel: "truncate",
    separator: "inline-flex items-center justify-center shrink-0 select-none",
    separatorIcon: "shrink-0 size-3.5 text-muted flex items-center justify-center",
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
      classNames: {
        link: "hover:text-default transition-colors",
      },
    },
    {
      color: "neutral",
      active: true,
      classNames: {
        link: "text-highlighted",
      },
    },
  ],
  defaultVariants: {
    color: "primary",
    active: false,
  },
});

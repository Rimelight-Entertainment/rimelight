import { defineTheme } from "../../resolver";

export const RLNavigationMenuTheme = defineTheme("navigation-menu", {
  slots: [
    "root",
    "list",
    "item",
    "link",
    "trigger",
    "content",
    "viewport",
    "viewportWrapper",
    "panel",
    "group",
    "groupTitle",
    "childList",
    "childLink",
    "childIcon",
    "childLabel",
    "childDescription",
  ],
  base: {
    root: "relative z-10 flex",
    list: "flex flex-1 list-none",
    item: "relative",
    // Shared by plain links AND dropdown triggers, so one `ui.link` override styles both.
    link: "text-highlighted inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors hover:text-primary focus-visible:text-primary focus-visible:outline-none disabled:pointer-events-none disabled:opacity-50 aria-[current]:text-primary data-[state=open]:text-primary",
    // Trigger-only extras on top of `link`.
    trigger: "cursor-pointer select-none bg-transparent",
    content: "w-full ps-4",
    // Full-bleed mega-menu anchored to the bottom of the header stack.
    viewportWrapper: "fixed inset-x-0 top-[var(--rl-header-height,4rem)] z-40 overflow-hidden",
    viewport:
      "w-full border-b border-default bg-default text-highlighted shadow-xl data-[state=open]:animate-in data-[state=open]:slide-in-from-top-4 data-[state=open]:fade-in-0 duration-200",
    panel:
      "mx-auto flex w-full max-w-90rem flex-col gap-4 p-4 sm:flex-row sm:gap-10 sm:px-xl sm:py-lg",
    group: "flex min-w-40 flex-col gap-1",
    groupTitle: "px-3 pb-1 text-xs font-semibold uppercase tracking-wide text-primary",
    childList: "flex flex-col gap-0.5",
    childLink:
      "flex items-center gap-3 rounded-sm px-3 py-2 text-sm transition-colors hover:bg-accented hover:text-highlighted",
    childIcon: "size-4 shrink-0 text-muted",
    childLabel: "font-medium leading-none",
    childDescription: "mt-1 text-xs text-muted line-clamp-2",
  },
  variants: {
    orientation: {
      horizontal: {
        root: "items-center",
        list: "items-center gap-1",
        link: "w-max",
      },
      vertical: {
        root: "w-full flex-col items-stretch",
        list: "w-full flex-col items-stretch gap-1",
        link: "w-full justify-start text-lg",
        trigger: "justify-between",
        panel: "flex-col gap-3 p-0 sm:flex-col sm:gap-3 sm:p-0",
      },
    },
  },
  defaultVariants: {
    orientation: "horizontal",
  },
});

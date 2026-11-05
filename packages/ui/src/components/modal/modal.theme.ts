import { defineTheme } from "../../resolver";

export const RLModalTheme = defineTheme("modal", {
  slots: [
    "root",
    "triggerWrapper",
    "trigger",
    "overlay",
    "content",
    "header",
    "heading",
    "body",
    "footer",
    "title",
    "description",
    "close",
    "actions",
  ],
  base: {
    root: "relative inline-block",
    triggerWrapper: "inline-flex cursor-pointer",
    overlay: "fixed inset-0 z-50 data-[state=closed]:hidden!",
    content: "bg-default flex flex-col focus:outline-none z-50 pointer-events-auto",
    header: "flex items-center gap-1.5 p-4 sm:px-6 min-h-14 relative border-b border-default/30",
    heading: "flex flex-col gap-1 min-w-0 flex-1",
    body: "flex-1 p-4 sm:p-6",
    footer: "flex items-center gap-1.5 p-4 sm:px-6 border-t border-default/30",
    title: "text-highlighted font-semibold text-base",
    description: "mt-1 text-muted text-sm leading-relaxed",
    close: "absolute top-4 right-4 end-4",
    actions: "flex items-center gap-1.5 ml-auto",
  },
  variants: {
    transition: {
      true: {
        overlay:
          "transition-opacity duration-200 data-[state=open]:opacity-100 data-[state=closed]:opacity-0",
        content:
          "transition-all duration-200 data-[state=open]:scale-100 data-[state=open]:opacity-100 data-[state=closed]:scale-95 data-[state=closed]:opacity-0",
      },
    },
    fullscreen: {
      true: {
        content: "fixed inset-0 rounded-none w-screen h-screen max-w-none max-h-none border-none",
      },
      false: {
        content: "w-[calc(100vw-2rem)] max-w-lg rounded-lg shadow-lg ring ring-default",
      },
    },
    backdrop: {
      true: {
        overlay: "bg-scrim/60 backdrop-blur-sm",
      },
    },
    modal: {
      false: {
        overlay: "pointer-events-none",
      },
    },
    scrollable: {
      true: {
        overlay: "overflow-y-auto grid place-items-center p-4 sm:py-8",
        content: "relative",
      },
      false: {
        overlay: "flex items-center justify-center p-4 sm:p-6",
        content: "max-h-[calc(100dvh-2rem)] sm:max-h-[calc(100dvh-4rem)] overflow-hidden",
        body: "overflow-y-auto",
      },
    },
    size: {
      xs: { content: "max-w-xs" },
      sm: { content: "max-w-sm" },
      md: { content: "max-w-lg" },
      lg: { content: "max-w-2xl" },
      xl: { content: "max-w-4xl" },
    },
  },
  defaultVariants: {
    transition: true,
    fullscreen: false,
    backdrop: true,
    scrollable: false,
    modal: true,
    size: "md",
  },
});

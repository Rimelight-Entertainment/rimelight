import { defineTheme } from "../../resolver";

export const drawerTheme = defineTheme("drawer", {
  slots: [
    "root",
    "trigger",
    "backdrop",
    "content",
    "handle",
    "header",
    "title",
    "description",
    "footer",
    "closeButton",
  ],
  base: {
    root: "relative inline-block",
    trigger: "",
    backdrop: "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-all duration-300",
    content: [
      "fixed z-50 bg-default p-6 shadow-xl border-default transition-all duration-300 outline-none",
      "data-[state=open]:animate-in data-[state=closed]:animate-out",
    ],
    handle: "mx-auto h-1.5 w-[100px] rounded-full bg-muted mb-4",
    header: "flex flex-col gap-1.5 mb-4 text-center",
    title: "text-lg font-semibold leading-none tracking-tight text-highlighted",
    description: "text-sm text-muted leading-relaxed",
    footer: "flex flex-col gap-2 mt-6",
    closeButton: [
      "absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100",
      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none",
    ],
  },
  variants: {
    direction: {
      top: {
        content:
          "inset-x-0 top-0 border-b rounded-b-xl data-[state=open]:slide-in-from-top data-[state=closed]:slide-out-to-top",
      },
      bottom: {
        content:
          "inset-x-0 bottom-0 border-t rounded-t-xl data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
      },
      left: {
        content:
          "inset-y-0 left-0 h-full w-3/4 max-w-sm border-r rounded-r-xl data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
      },
      right: {
        content:
          "inset-y-0 right-0 h-full w-3/4 max-w-sm border-l rounded-l-xl data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
      },
    },
  },
  defaultVariants: {
    direction: "bottom",
  },
});

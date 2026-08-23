import { defineTheme } from "../../resolver"

export const selectTheme = defineTheme("select", {
  slots: ["root", "select", "icon"],
  base: {
    root: "relative inline-flex items-center w-full",
    select:
      "rl-select w-full cursor-pointer rounded-md border border-default bg-default text-foreground shadow-sm outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
    icon: "pointer-events-none absolute right-2 flex items-center text-muted"
  },
  variants: {
    size: {
      xs: { select: "py-0.5 pl-2 pr-6 text-xs" },
      sm: { select: "py-1 pl-2.5 pr-7 text-xs" },
      md: { select: "py-1.5 pl-3 pr-8 text-sm" },
      lg: { select: "py-2 pl-3.5 pr-9 text-base" },
      xl: { select: "py-2.5 pl-4 pr-10 text-base" }
    },
    theme: {
      light: { root: "rl-light" },
      dark: { root: "rl-dark" }
    }
  },
  defaultVariants: {
    size: "md"
  }
})

export const selectPickerCss = `
  select.rl-select { appearance: base-select; }
  select.rl-select::picker-icon { display: none; }
  select.rl-select::picker(select) {
    border: 1px solid var(--rl-neutral-200);
    border-radius: var(--radius-md, 0.375rem);
    background-color: var(--rl-neutral-100);
    color: var(--rl-neutral-950);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.25), 0 4px 6px -4px rgba(0, 0, 0, 0.15);
    padding: 0.25rem;
    margin-top: 0.25rem;
  }
  select.rl-select option {
    padding: 0.375rem 0.625rem;
    border-radius: calc(var(--radius-md, 0.375rem) - 0.125rem);
    background-color: var(--rl-neutral-100);
    color: var(--rl-neutral-950);
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.15s ease, color 0.15s ease;
  }
  select.rl-select option:hover,
  select.rl-select option:focus {
    background-color: var(--rl-neutral-200);
    color: var(--rl-neutral-950);
  }
  select.rl-select option:checked {
    background-color: var(--rl-primary-500);
    color: var(--primary-foreground, #ffffff);
    font-weight: 500;
  }
`

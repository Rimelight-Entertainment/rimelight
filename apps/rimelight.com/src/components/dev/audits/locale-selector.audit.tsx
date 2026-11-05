import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLLocaleSelector } from "@rimelight/ui/components/locale-selector/RLLocaleSelector.tsx";
import { AUDIT_COLORS, type ComponentAuditDefinition, type TestScenario } from "./types";

const MODES = ["select", "icon"] as const;
const VARIANTS = ["solid", "outline", "soft", "subtle", "ghost", "link"] as const;
const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;

const LocaleSelectorSandbox = (): JSX.Element => {
  const [mode, setMode] = createSignal<(typeof MODES)[number]>("select");
  const [variant, setVariant] = createSignal<(typeof VARIANTS)[number]>("outline");
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");
  const [color, setColor] = createSignal<string>("primary");

  return (
    <div class="flex flex-col gap-6">
      <div class="flex flex-wrap gap-2">
        <For each={MODES}>
          {(m) => (
            <button type="button" onClick={() => setMode(m)}>
              mode: {m}
            </button>
          )}
        </For>
        <For each={VARIANTS}>
          {(v) => (
            <button type="button" onClick={() => setVariant(v)}>
              variant: {v}
            </button>
          )}
        </For>
        <For each={SIZES}>
          {(s) => (
            <button type="button" onClick={() => setSize(s)}>
              size: {s}
            </button>
          )}
        </For>
        <For each={AUDIT_COLORS}>
          {(c) => (
            <button type="button" onClick={() => setColor(c)}>
              color: {c}
            </button>
          )}
        </For>
      </div>
      <p>
        Selecting a different locale navigates the window. Use the dropdown carefully in this
        sandbox.
      </p>
      <RLLocaleSelector
        locales={[
          { code: "en", label: "English", href: "#en" },
          { code: "de", label: "Deutsch", href: "#de" },
          { code: "fr", label: "Français", href: "#fr" },
        ]}
        currentLocale="en"
        mode={mode()}
        variant={variant()}
        size={size()}
        color={color()}
      />
    </div>
  );
};

const testScenarios: TestScenario[] = [
  {
    id: "default-slot",
    title: "Default slot (children)",
    description: "Children render in the locale selector's default slot.",
    render: () => (
      <RLLocaleSelector locales={["en", "de"]} currentLocale="en">
        <span>Language</span>
      </RLLocaleSelector>
    ),
  },
  {
    id: "leading-slot",
    title: "leadingSlot",
    description: "leadingSlot replaces the leading icon (default globe) in the trigger.",
    render: () => (
      <RLLocaleSelector
        locales={["en", "de"]}
        currentLocale="en"
        leadingSlot={<span aria-hidden="true">LANG</span>}
      />
    ),
  },
  {
    id: "codes-and-objects",
    title: "locales (codes and LocaleItem objects)",
    description:
      "Codes use the language's own name as label. LocaleItem objects set label and href.",
    render: () => (
      <div class="flex flex-col gap-3">
        <RLLocaleSelector locales={["en", "de"]} currentLocale="en" />
        <RLLocaleSelector
          locales={[
            { code: "en", label: "English", href: "/en/" },
            { code: "de", label: "Deutsch", href: "/de/" },
          ]}
          currentLocale="de"
        />
      </div>
    ),
  },
  {
    id: "modes",
    title: "Every mode",
    description: "select (default) shows a labeled dropdown. icon shows a compact icon trigger.",
    render: () => (
      <div class="flex flex-wrap gap-3">
        <For each={MODES}>
          {(m) => <RLLocaleSelector locales={["en", "de"]} currentLocale="en" mode={m} />}
        </For>
      </div>
    ),
  },
  {
    id: "leading-icon",
    title: "leadingIcon",
    description: "leadingIcon sets the icon name. Default is globe.",
    render: () => (
      <RLLocaleSelector locales={["en", "de"]} currentLocale="en" leadingIcon="lucide:languages" />
    ),
  },
  {
    id: "variants-sizes-colors",
    title: "Variants, sizes, and colors",
    description:
      "variant forwards to the select: solid, outline (default), soft, subtle, ghost, link.",
    render: () => (
      <div class="flex flex-col gap-3">
        <For each={VARIANTS}>
          {(v) => <RLLocaleSelector locales={["en", "de"]} currentLocale="en" variant={v} />}
        </For>
        <For each={SIZES}>
          {(s) => <RLLocaleSelector locales={["en", "de"]} currentLocale="en" size={s} />}
        </For>
        <For each={AUDIT_COLORS}>
          {(c) => <RLLocaleSelector locales={["en", "de"]} currentLocale="en" color={c} />}
        </For>
      </div>
    ),
  },
  {
    id: "on-value-change",
    title: "onValueChange",
    description:
      "Called with the selected LocaleItem. Logs only; the navigation step is handled by the component.",
    render: () => (
      <RLLocaleSelector
        locales={["en", "de"]}
        currentLocale="en"
        onValueChange={(item) => console.info("onValueChange", item)}
      />
    ),
  },
];

export const localeSelectorAudit: ComponentAuditDefinition = {
  id: "locale-selector",
  name: "Locale Selector",
  category: "Navigation",
  status: "Auditing",
  description: "Locale dropdown that navigates to the chosen locale's URL.",
  importPath: "@rimelight/ui/components/locale-selector/RLLocaleSelector.tsx",
  renderSandbox: () => <LocaleSelectorSandbox />,
  testScenarios,
};

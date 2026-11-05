import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLThemeSelector } from "@rimelight/ui/components/theme-selector/RLThemeSelector.tsx";
import type { ComponentAuditDefinition } from "./types";

const MODES = ["select", "icon"] as const;
const COLORS = ["primary", "secondary", "info", "success", "warning", "error"] as const;
const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;

export const ThemeSelectorSandbox = (): JSX.Element => {
  const [mode, setMode] = createSignal<(typeof MODES)[number]>("select");
  const [color, setColor] = createSignal<(typeof COLORS)[number]>("primary");
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");
  const [lastValue, setLastValue] = createSignal("none");

  return (
    <div class="flex flex-col gap-6">
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-3 text-xs">
        <span class="font-semibold text-muted">mode:</span>
        <For each={MODES}>
          {(m) => (
            <button
              type="button"
              class={`px-2 py-1 rounded border border-default ${mode() === m ? "bg-primary text-on-primary" : ""}`}
              onClick={() => setMode(m)}
            >
              {m}
            </button>
          )}
        </For>
        <span class="font-semibold text-muted">color:</span>
        <For each={COLORS}>
          {(c) => (
            <button
              type="button"
              class={`px-2 py-1 rounded border border-default ${color() === c ? "bg-primary text-on-primary" : ""}`}
              onClick={() => setColor(c)}
            >
              {c}
            </button>
          )}
        </For>
        <span class="font-semibold text-muted">size:</span>
        <For each={SIZES}>
          {(s) => (
            <button
              type="button"
              class={`px-2 py-1 rounded border border-default ${size() === s ? "bg-primary text-on-primary" : ""}`}
              onClick={() => setSize(s)}
            >
              {s}
            </button>
          )}
        </For>
        <span class="text-muted">last onValueChange: {lastValue()}</span>
      </div>

      <RLThemeSelector
        mode={mode()}
        color={color()}
        size={size()}
        onValueChange={(theme) => setLastValue(theme)}
      />
    </div>
  );
};

export const themeSelectorAudit: ComponentAuditDefinition = {
  id: "theme-selector",
  name: "Theme Selector",
  category: "Utility",
  status: "Auditing",
  description:
    "A control that switches between system, light, and dark themes, persists the choice, and cycles it with a keyboard shortcut.",
  importPath: "@rimelight/ui/components/theme-selector/RLThemeSelector.tsx",
  renderSandbox: () => <ThemeSelectorSandbox />,
  testScenarios: [
    {
      id: "modes",
      title: "Modes",
      description: "select shows the labeled control; icon shows the compact ghost control.",
      render: () => (
        <div class="flex flex-col gap-4">
          <For each={MODES}>{(m) => <RLThemeSelector mode={m} />}</For>
        </div>
      ),
    },
    {
      id: "color-matrix",
      title: "Color matrix",
      description: "Each color is applied to the underlying select.",
      render: () => (
        <div class="flex flex-col gap-4">
          <For each={COLORS}>{(c) => <RLThemeSelector color={c} />}</For>
        </div>
      ),
    },
    {
      id: "size-matrix",
      title: "Size matrix",
      description: "Each size is applied to the underlying select.",
      render: () => (
        <div class="flex flex-col gap-4">
          <For each={SIZES}>{(s) => <RLThemeSelector size={s} />}</For>
        </div>
      ),
    },
    {
      id: "on-value-change",
      title: "onValueChange",
      description: "Called with the chosen preference after the theme is applied.",
      render: () => <RLThemeSelector onValueChange={() => {}} />,
    },
    {
      id: "children",
      title: "Default slot (children)",
      description: "Children render once inside the root, after the select.",
      render: () => (
        <RLThemeSelector>
          <span class="text-xs text-muted">Appearance</span>
        </RLThemeSelector>
      ),
    },
  ],
  checklist: [
    {
      criterion: "Preference persistence and document theme",
      status: "pending",
      notes:
        "Choosing light or dark sets data-theme on the document root and persists a cookie. System removes data-theme.",
    },
    {
      criterion: "Keyboard shortcut",
      status: "pending",
      notes: "meta+alt+t cycles system, light, dark and is registered while mounted.",
    },
  ],
};

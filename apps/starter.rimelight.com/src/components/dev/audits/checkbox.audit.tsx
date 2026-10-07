import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLCheckbox } from "@rimelight/ui/components/checkbox/RLCheckbox.tsx";
import { RLCheckboxGroup } from "@rimelight/ui/components/checkbox-group/RLCheckboxGroup.tsx";
import { AUDIT_COLORS, type ComponentAuditDefinition } from "./types";

const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
const COLORS = AUDIT_COLORS;
const INDICATORS = ["start", "end", "hidden"] as const;

export const CheckboxSandbox = (): JSX.Element => {
  const [checked, setChecked] = createSignal<boolean | "indeterminate">(true);
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");
  const [color, setColor] = createSignal<string>("primary");
  const [indicator, setIndicator] = createSignal<(typeof INDICATORS)[number]>("start");
  const [variant, setVariant] = createSignal<"list" | "card">("list");
  const [highlight, setHighlight] = createSignal(false);
  const [disabled, setDisabled] = createSignal(false);
  const [required, setRequired] = createSignal(false);
  const [hasLabel, setHasLabel] = createSignal(true);
  const [hasDescription, setHasDescription] = createSignal(true);
  const [label, setLabel] = createSignal("Enable notifications");
  const [description, setDescription] = createSignal(
    "Receive real-time alerts directly in your feed.",
  );

  return (
    <div class="flex flex-col gap-6">
      {/* Controls Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        {/* Sizes */}
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">Size:</span>
          <For each={SIZES}>
            {(s) => (
              <button
                type="button"
                onClick={() => setSize(s)}
                class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  size() === s
                    ? "bg-primary text-inverted font-bold"
                    : "bg-elevated text-muted hover:text-highlighted border border-default"
                }`}
              >
                {s}
              </button>
            )}
          </For>
        </div>

        {/* Colors */}
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">Color:</span>
          <For each={COLORS}>
            {(c) => (
              <button
                type="button"
                onClick={() => setColor(c)}
                class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  color() === c
                    ? "bg-primary text-inverted font-bold"
                    : "bg-elevated text-muted hover:text-highlighted border border-default"
                }`}
              >
                {c}
              </button>
            )}
          </For>
        </div>

        {/* Indicator */}
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">Indicator:</span>
          <For each={INDICATORS}>
            {(ind) => (
              <button
                type="button"
                onClick={() => setIndicator(ind)}
                class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  indicator() === ind
                    ? "bg-primary text-inverted font-bold"
                    : "bg-elevated text-muted hover:text-highlighted border border-default"
                }`}
              >
                {ind}
              </button>
            )}
          </For>
        </div>

        {/* Variant */}
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">Variant:</span>
          <button
            type="button"
            onClick={() => setVariant("list")}
            class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
              variant() === "list"
                ? "bg-primary text-inverted font-bold"
                : "bg-elevated text-muted hover:text-highlighted border border-default"
            }`}
          >
            list
          </button>
          <button
            type="button"
            onClick={() => setVariant("card")}
            class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
              variant() === "card"
                ? "bg-primary text-inverted font-bold"
                : "bg-elevated text-muted hover:text-highlighted border border-default"
            }`}
          >
            card
          </button>
        </div>

        {/* Toggles */}
        <div class="flex items-center gap-3 flex-wrap">
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={highlight()}
              onInput={(e) => setHighlight(e.currentTarget.checked)}
              onChange={(e) => setHighlight(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">Highlight</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={disabled()}
              onInput={(e) => setDisabled(e.currentTarget.checked)}
              onChange={(e) => setDisabled(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">Disabled</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={required()}
              onInput={(e) => setRequired(e.currentTarget.checked)}
              onChange={(e) => setRequired(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">Required</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hasLabel()}
              onInput={(e) => setHasLabel(e.currentTarget.checked)}
              onChange={(e) => setHasLabel(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">Has Label</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hasDescription()}
              onInput={(e) => setHasDescription(e.currentTarget.checked)}
              onChange={(e) => setHasDescription(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">Has Description</span>
          </label>
          <button
            type="button"
            onClick={() =>
              setChecked((prev) =>
                prev === true ? "indeterminate" : prev === "indeterminate" ? false : true,
              )
            }
            class="px-2 py-0.5 rounded text-xs bg-elevated border border-default text-highlighted hover:bg-elevated/80"
          >
            Cycle State: {String(checked())}
          </button>
        </div>

        {/* Input fields */}
        <div class="flex items-center gap-2">
          <span class="text-muted">Label:</span>
          <input
            type="text"
            value={label()}
            onInput={(e) => setLabel(e.currentTarget.value)}
            class="px-2 py-1 rounded bg-elevated border border-default text-highlighted text-xs w-44"
          />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-muted">Desc:</span>
          <input
            type="text"
            value={description()}
            onInput={(e) => setDescription(e.currentTarget.value)}
            class="px-2 py-1 rounded bg-elevated border border-default text-highlighted text-xs w-60"
          />
        </div>
      </div>

      {/* Preview Area */}
      <div class="p-8 rounded-xl border border-default bg-elevated/10 flex flex-col items-center justify-center gap-4">
        <div class="max-w-md w-full flex items-center justify-center">
          <RLCheckbox
            size={size()}
            color={color()}
            variant={variant()}
            indicator={indicator()}
            highlight={highlight()}
            disabled={disabled()}
            required={required()}
            label={hasLabel() ? label() : undefined}
            description={hasDescription() && hasLabel() ? description() : undefined}
            checked={checked() === true}
            indeterminate={checked() === "indeterminate"}
            aria-label={!hasLabel() ? "Sandbox checkbox" : undefined}
            onChange={(e) => setChecked(e.currentTarget.checked)}
          />
        </div>
      </div>
    </div>
  );
};

export const checkboxAudit: ComponentAuditDefinition = {
  id: "checkbox",
  name: "Checkbox",
  category: "Form & Input",
  status: "Passed",
  description:
    "An input element to toggle between checked, unchecked, and indeterminate states with standalone and group support.",
  importPath: "@rimelight/ui/components/checkbox/RLCheckbox.tsx",
  renderSandbox: () => <CheckboxSandbox />,
  testScenarios: [
    {
      id: "bare-checkbox-standalone",
      title: "Bare & Standalone Checkbox (No Label / No Description)",
      description:
        "Standalone bare checkbox with aria-label across all states (unchecked, checked, indeterminate, disabled, highlight, sizes, and colors) for data-table rows and toolbars.",
      render: () => (
        <div class="flex flex-col gap-6">
          <div class="flex flex-wrap items-center gap-6 p-4 rounded-xl border border-default bg-elevated/20">
            <div class="flex items-center gap-2">
              <span class="text-xs text-muted">Unchecked:</span>
              <RLCheckbox aria-label="Unchecked bare" />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-muted">Checked:</span>
              <RLCheckbox defaultValue aria-label="Checked bare" />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-muted">Indeterminate:</span>
              <RLCheckbox defaultValue="indeterminate" aria-label="Indeterminate bare" />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-muted">Highlighted:</span>
              <RLCheckbox defaultValue highlight aria-label="Highlighted bare" />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-xs text-muted">Disabled:</span>
              <RLCheckbox disabled defaultValue aria-label="Disabled bare" />
            </div>
          </div>

          <div class="flex flex-wrap items-center gap-6 p-4 rounded-xl border border-default bg-elevated/10">
            <span class="text-xs text-muted font-mono uppercase mr-2">Sizes:</span>
            <For each={SIZES}>
              {(s) => (
                <div class="flex items-center gap-1.5">
                  <RLCheckbox size={s} defaultValue aria-label={`Size ${s}`} />
                  <span class="text-2xs font-mono text-muted">{s}</span>
                </div>
              )}
            </For>
          </div>

          <div class="flex flex-wrap items-center gap-4 p-4 rounded-xl border border-default bg-elevated/10">
            <span class="text-xs text-muted font-mono uppercase mr-2">Colors:</span>
            <For each={COLORS}>
              {(c) => (
                <div class="flex items-center gap-1.5">
                  <RLCheckbox color={c} defaultValue aria-label={`Color ${c}`} />
                  <span class="text-2xs font-mono text-muted">{c}</span>
                </div>
              )}
            </For>
          </div>
        </div>
      ),
    },
    {
      id: "label-only-minimal",
      title: "Label-Only Minimal Checkbox (No Description)",
      description:
        "Minimal checkboxes with text label only, inline children, and card variant without descriptions.",
      render: () => (
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <RLCheckbox label="Remember my login" />
          <RLCheckbox defaultValue label="Accept privacy policy" />
          <RLCheckbox defaultValue="indeterminate" label="Select all 42 items" />
          <RLCheckbox highlight label="Highlighted focus ring" />
          <RLCheckbox variant="card" defaultValue label="Card variant (label only)" />
          <RLCheckbox>
            <span class="font-medium text-highlighted">Inline JSX children</span>
          </RLCheckbox>
        </div>
      ),
    },
    {
      id: "states-and-modes",
      title: "Interactive States & Description",
      description:
        "Full layout with title and description across Unchecked, Checked, Indeterminate, Disabled, and Required states.",
      render: () => (
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RLCheckbox label="Unchecked by default" description="Click to toggle state." />
          <RLCheckbox
            defaultValue
            label="Checked initially"
            description="Uncontrolled initial value."
          />
          <RLCheckbox
            defaultValue="indeterminate"
            label="Indeterminate State"
            description="Useful for select-all parent controls."
          />
          <RLCheckbox
            defaultValue="indeterminate"
            indeterminateIcon="plus"
            label="Custom Indeterminate Icon"
            description="Uses custom icon token."
          />
          <RLCheckbox disabled label="Disabled Unchecked" />
          <RLCheckbox disabled defaultValue label="Disabled Checked" />
          <RLCheckbox
            required
            label="Required Checkbox"
            description="Displays required asterisk."
          />
          <RLCheckbox highlight label="Highlighted Focus Ring" />
        </div>
      ),
    },
    {
      id: "colors-matrix",
      title: "Color Variants Matrix",
      description:
        "All built-in theme and semantic colors (primary, secondary, success, info, warning, error, commentary, ideation, source, neutral).",
      render: () => (
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <For each={COLORS}>
            {(c) => (
              <RLCheckbox
                color={c}
                defaultValue
                label={`Color: ${c}`}
                description={`Using ${c} token theme.`}
              />
            )}
          </For>
        </div>
      ),
    },
    {
      id: "sizes-matrix",
      title: "Size Scales",
      description: "Extra Small (xs), Small (sm), Medium (md), Large (lg), and Extra Large (xl).",
      render: () => (
        <div class="space-y-4">
          <For each={SIZES}>
            {(s) => (
              <RLCheckbox
                size={s}
                defaultValue
                label={`Size ${s.toUpperCase()}`}
                description={`Checkbox scaled with size="${s}".`}
              />
            )}
          </For>
        </div>
      ),
    },
    {
      id: "indicator-positions-and-card",
      title: "Indicators & Card Variant",
      description:
        "Indicator start (default), indicator end, indicator hidden (icon above label), and card variant styling.",
      render: () => (
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RLCheckbox
            variant="card"
            defaultValue
            label="Card Variant (Start Indicator)"
            description="Card container border and elevated background on hover."
          />
          <RLCheckbox
            variant="card"
            indicator="end"
            defaultValue
            label="Card Variant (End Indicator)"
            description="Reversed layout with indicator aligned to end."
          />
          <RLCheckbox
            variant="card"
            indicator="hidden"
            icon="star"
            defaultValue
            label="Hidden Indicator (Card)"
            description="Icon displayed centrally above label."
          />
          <RLCheckbox
            variant="list"
            indicator="hidden"
            icon="sparkles"
            defaultValue
            label="Hidden Indicator (List)"
            description="Minimal layout with icon above text."
          />
        </div>
      ),
    },
    {
      id: "checkbox-group",
      title: "CheckboxGroup (List, Card, Table)",
      description:
        "Multi-select checkbox groups with array models, string/object items, horizontal/vertical layouts, and max selection limits.",
      render: () => {
        const [groupVal, setGroupVal] = createSignal(["System"]);
        const [tableVal, setTableVal] = createSignal(["light"]);

        const themeItems = [
          { label: "System", value: "system", description: "Matches device settings." },
          { label: "Light", value: "light", description: "Always uses light theme." },
          { label: "Dark", value: "dark", description: "Always uses dark theme." },
        ];

        return (
          <div class="space-y-6">
            <RLCheckboxGroup
              legend="Select Themes (Vertical List)"
              items={["System", "Light", "Dark"]}
              modelValue={groupVal()}
              onUpdate:modelValue={(v) => setGroupVal(v as string[])}
            />

            <RLCheckboxGroup
              legend="Orientation Horizontal & Card Variant (Max 2)"
              orientation="horizontal"
              variant="card"
              max={2}
              items={themeItems}
              defaultValue={["system", "light"]}
            />

            <RLCheckboxGroup
              legend="Table Variant (Segmented Row)"
              orientation="horizontal"
              variant="table"
              items={themeItems}
              modelValue={tableVal()}
              onUpdate:modelValue={(v) => setTableVal(v as string[])}
            />
          </div>
        );
      },
    },
    {
      id: "slots-and-custom-ui",
      title: "Slots & Custom UI Styling",
      description: "Custom labelSlot, descriptionSlot, legendSlot, and slot-level class overrides.",
      render: () => (
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RLCheckbox
            label="Pro Feature"
            defaultValue
            labelSlot={({ label }) => (
              <span class="flex items-center gap-1.5">
                <strong class="text-highlighted">{label}</strong>
                <span class="text-3xs px-1.5 py-0.5 rounded bg-primary/10 text-primary uppercase font-bold">
                  New
                </span>
              </span>
            )}
            descriptionSlot={
              <span class="text-xs italic text-muted">Custom slot JSX description.</span>
            }
          />

          <RLCheckbox
            label="Custom UI Tokens"
            description="Custom container, base, and label slot classes."
            defaultValue
            ui={{
              root: "p-3 rounded-lg border border-primary/30 bg-primary/5",
              base: "ring-2 ring-primary",
              label: "font-bold text-primary",
            }}
          />
        </div>
      ),
    },
  ],
  checklist: [
    {
      criterion: "API and slot pattern parity",
      status: "pass",
      notes:
        "Full support for RLCheckbox and RLCheckboxGroup with as, label, description, color, variant (list, card, table), size (xs..xl), indicator (start, end, hidden), indeterminate, indeterminateIcon, max limit, and custom slots.",
    },
    {
      criterion: "Custom user defined colors support",
      status: "pass",
      notes:
        "Supports built-in theme colors (primary, secondary, success, info, warning, error, commentary, ideation, source, neutral) and custom user color ramps via color: 'auto' CSS variable tokens.",
    },
    {
      criterion: "Full WAI-ARIA compliance",
      status: "pass",
      notes:
        "Automatic aria-checked (including mixed state for indeterminate), aria-required, aria-disabled, and label linking.",
    },
    {
      criterion: "Theme token resolution",
      status: "pass",
      notes:
        "Classes live exclusively in checkbox.theme.ts and checkbox-group.theme.ts; zero inline styles.",
    },
    {
      criterion: "No innerHTML / dangerouslySetInnerHTML",
      status: "pass",
      notes: "Pure SolidJS JSX reactive template rendering.",
    },
    {
      criterion: "No hydration mismatches",
      status: "pass",
      notes: "Deterministic ID generation via createUniqueId and dynamic tag resolution.",
    },
    {
      criterion: "Audited components render bare",
      status: "pass",
      notes: "Rendered directly without test harness wrappers.",
    },
  ],
};

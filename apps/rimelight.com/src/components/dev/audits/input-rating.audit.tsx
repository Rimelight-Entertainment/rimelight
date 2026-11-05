import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLInputRating } from "@rimelight/ui/components/input-rating/RLInputRating.tsx";
import type { ComponentAuditDefinition } from "./types";

const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
const ORIENTATIONS = ["horizontal", "vertical"] as const;

export const InputRatingSandbox = (): JSX.Element => {
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");
  const [orientation, setOrientation] = createSignal<(typeof ORIENTATIONS)[number]>("horizontal");
  const [step, setStep] = createSignal(1);
  const [clearable, setClearable] = createSignal(false);
  const [hoverable, setHoverable] = createSignal(false);
  const [disabled, setDisabled] = createSignal(false);
  const [readonly, setReadonly] = createSignal(false);
  const [value, setValue] = createSignal(3);

  return (
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap gap-2 text-xs">
        <For each={SIZES}>
          {(s) => (
            <button type="button" onClick={() => setSize(s)}>
              size: {s}
            </button>
          )}
        </For>
        <For each={ORIENTATIONS}>
          {(o) => (
            <button type="button" onClick={() => setOrientation(o)}>
              orientation: {o}
            </button>
          )}
        </For>
        <button type="button" onClick={() => setStep((s) => (s === 1 ? 0.5 : 1))}>
          step: {step()}
        </button>
        <button type="button" onClick={() => setClearable((v) => !v)}>
          clearable: {String(clearable())}
        </button>
        <button type="button" onClick={() => setHoverable((v) => !v)}>
          hoverable: {String(hoverable())}
        </button>
        <button type="button" onClick={() => setDisabled((v) => !v)}>
          disabled: {String(disabled())}
        </button>
        <button type="button" onClick={() => setReadonly((v) => !v)}>
          readonly: {String(readonly())}
        </button>
      </div>
      <RLInputRating
        size={size()}
        orientation={orientation()}
        step={step()}
        clearable={clearable()}
        hoverable={hoverable()}
        disabled={disabled()}
        readonly={readonly()}
        value={value()}
        onValueChange={setValue}
      />
      <span class="text-xs">value: {value()}</span>
    </div>
  );
};

export const inputRatingAudit: ComponentAuditDefinition = {
  id: "input-rating",
  name: "Input Rating",
  category: "Form & Input",
  status: "Auditing",
  description:
    "Interactive rating control with a slider role, pointer and keyboard input, half-step support, hover preview, clearable value, and a hidden form input.",
  importPath: "@rimelight/ui/components/input-rating/RLInputRating.tsx",
  renderSandbox: () => <InputRatingSandbox />,
  testScenarios: [
    {
      id: "default-slot",
      title: "Default slot children",
      description: "Children render after the rating items. Passes a helper text node.",
      render: () => (
        <RLInputRating aria-label="Rating">
          <span class="text-xs">Helper text rendered as children</span>
        </RLInputRating>
      ),
    },
    {
      id: "uncontrolled",
      title: "defaultValue (uncontrolled)",
      description: "Initial rating without a controlled value prop.",
      render: () => <RLInputRating defaultValue={4} aria-label="Default rating" />,
    },
    {
      id: "controlled",
      title: "value with onValueChange",
      description: "Controlled value. onValueChange receives the next rating.",
      render: () => {
        const [value, setValue] = createSignal(2);
        return (
          <div class="flex flex-col gap-2">
            <RLInputRating
              value={value()}
              onValueChange={setValue}
              aria-label="Controlled rating"
            />
            <span class="text-xs">{value()}</span>
          </div>
        );
      },
    },
    {
      id: "length-and-step",
      title: "length and step",
      description: "Ten items with half-step increments.",
      render: () => (
        <RLInputRating length={10} step={0.5} defaultValue={3.5} aria-label="Half step rating" />
      ),
    },
    {
      id: "icons",
      title: "icon and emptyIcon",
      description: "Custom icon for filled items and a different icon for empty items.",
      render: () => (
        <RLInputRating
          icon="heart"
          emptyIcon="heart-outline"
          defaultValue={2}
          aria-label="Heart rating"
        />
      ),
    },
    {
      id: "clearable-and-hoverable",
      title: "clearable and hoverable",
      description:
        "Clicking the current value clears it, and hovering previews the value under the pointer.",
      render: () => (
        <RLInputRating
          clearable={true}
          hoverable={true}
          defaultValue={3}
          aria-label="Clearable rating"
        />
      ),
    },
    {
      id: "orientation",
      title: "Orientation variants",
      description: "Horizontal and vertical layouts.",
      render: () => (
        <div class="flex gap-6">
          <For each={ORIENTATIONS}>
            {(o) => (
              <RLInputRating orientation={o} defaultValue={3} aria-label={`Orientation ${o}`} />
            )}
          </For>
        </div>
      ),
    },
    {
      id: "states",
      title: "disabled, readonly, required, name",
      description: "Each state flag and the hidden input name.",
      render: () => (
        <div class="flex flex-col gap-2">
          <RLInputRating disabled={true} defaultValue={3} aria-label="Disabled rating" />
          <RLInputRating readonly={true} defaultValue={4} aria-label="Readonly rating" />
          <RLInputRating required={true} name="rating" aria-label="Required rating" />
        </div>
      ),
    },
    {
      id: "sizes",
      title: "Size variants",
      description: "Renders each size variant xs through xl.",
      render: () => (
        <div class="flex flex-col gap-2">
          <For each={SIZES}>
            {(s) => <RLInputRating size={s} defaultValue={3} aria-label={`Size ${s}`} />}
          </For>
        </div>
      ),
    },
  ],
};

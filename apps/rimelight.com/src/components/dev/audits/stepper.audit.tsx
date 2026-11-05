import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLStepper } from "@rimelight/ui/components/stepper/RLStepper.tsx";
import { RLIcon } from "@rimelight/ui/components/icon/RLIcon.tsx";
import { AUDIT_COLORS, type ComponentAuditDefinition } from "./types";

const ORIENTATIONS = ["horizontal", "vertical"] as const;
const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
const COLORS = AUDIT_COLORS;

const ITEMS = [
  {
    title: "Account",
    description: "Create your login",
    icon: "user",
    content: "Enter your details.",
  },
  {
    title: "Billing",
    description: "Add a payment method",
    icon: "credit-card",
    content: "Pay securely.",
  },
  {
    title: "Review",
    description: "Confirm the order",
    icon: "search",
    content: "Check everything.",
  },
  { title: "Done", description: "All set", icon: "check", content: "You are finished." },
];

const chipClass = (active: boolean): string =>
  `px-2 py-0.5 rounded text-xs font-mono transition-colors ${
    active
      ? "bg-primary text-inverted font-bold"
      : "bg-elevated text-muted hover:text-highlighted border border-default"
  }`;

export const StepperSandbox = (): JSX.Element => {
  const [orientation, setOrientation] = createSignal<(typeof ORIENTATIONS)[number]>("horizontal");
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");
  const [color, setColor] = createSignal<string>("primary");
  const [linear, setLinear] = createSignal(true);
  const [disabled, setDisabled] = createSignal(false);

  return (
    <div class="flex flex-col gap-6">
      {/* Control Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">orientation</span>
          <For each={ORIENTATIONS}>
            {(o) => (
              <button
                type="button"
                onClick={() => setOrientation(o)}
                class={chipClass(orientation() === o)}
              >
                {o}
              </button>
            )}
          </For>
        </div>

        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">size</span>
          <For each={SIZES}>
            {(s) => (
              <button type="button" onClick={() => setSize(s)} class={chipClass(size() === s)}>
                {s}
              </button>
            )}
          </For>
        </div>

        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">color</span>
          <For each={COLORS}>
            {(c) => (
              <button type="button" onClick={() => setColor(c)} class={chipClass(color() === c)}>
                {c}
              </button>
            )}
          </For>
        </div>

        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">linear</span>
          <button type="button" onClick={() => setLinear(true)} class={chipClass(linear())}>
            on
          </button>
          <button type="button" onClick={() => setLinear(false)} class={chipClass(!linear())}>
            off
          </button>
        </div>

        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">disabled</span>
          <button type="button" onClick={() => setDisabled(true)} class={chipClass(disabled())}>
            on
          </button>
          <button type="button" onClick={() => setDisabled(false)} class={chipClass(!disabled())}>
            off
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div class="p-8 rounded-xl border border-default bg-elevated/10">
        <RLStepper
          items={ITEMS}
          orientation={orientation()}
          size={size()}
          color={color()}
          linear={linear()}
          disabled={disabled()}
        />
      </div>
    </div>
  );
};

export const stepperAudit: ComponentAuditDefinition = {
  id: "stepper",
  name: "Stepper",
  category: "Navigation",
  status: "Auditing",
  description:
    "An interactive multi-step navigator driven by an items array. Tracks the active step, supports linear or free navigation, per-step disabling, and custom indicator and wrapper slots. Children render in the body above the step panels.",
  importPath: "@rimelight/ui/components/stepper/RLStepper.tsx",
  renderSandbox: () => <StepperSandbox />,
  testScenarios: [
    {
      id: "default-children",
      title: "Children in the body slot",
      description: "Children render above the step panels; the active panel shows its content.",
      render: () => (
        <RLStepper items={ITEMS} defaultValue={1}>
          <p class="text-xs text-muted">Shared copy shown above every step.</p>
        </RLStepper>
      ),
    },
    {
      id: "indicator-slot",
      title: "Indicator slot",
      description: "Render function replaces the icon or number with content based on step state.",
      render: () => (
        <RLStepper
          items={ITEMS}
          defaultValue={1}
          indicatorSlot={(ctx) =>
            ctx.state === "completed" ? <RLIcon name="check" /> : <span>{ctx.index + 1}</span>
          }
        />
      ),
    },
    {
      id: "wrapper-slot",
      title: "Wrapper slot",
      description: "Render function replaces the title and description for each step.",
      render: () => (
        <RLStepper
          items={ITEMS}
          wrapperSlot={(ctx) => <span class="text-xs font-mono">Step {ctx.index + 1}</span>}
        />
      ),
    },
    {
      id: "controlled",
      title: "Controlled value",
      description: "Active step driven by the value prop; onValueChange reports user activations.",
      render: () => {
        const [value, setValue] = createSignal<string | number>("billing");
        return (
          <div class="flex flex-col gap-4">
            <RLStepper
              items={ITEMS.map((item, index) => ({
                ...item,
                value: ["account", "billing", "review", "done"][index],
              }))}
              value={value()}
              onValueChange={setValue}
            />
            <span class="text-xs text-muted">Active value: {String(value())}</span>
          </div>
        );
      },
    },
    {
      id: "free-navigation",
      title: "Free navigation",
      description: "linear disabled; any step can be activated from any position.",
      render: () => <RLStepper items={ITEMS} linear={false} />,
    },
    {
      id: "item-disabled",
      title: "Disabled step",
      description: "One item disables its own step; the rest remain navigable.",
      render: () => (
        <RLStepper
          items={[{ title: "Account" }, { title: "Billing", disabled: true }, { title: "Review" }]}
          linear={false}
        />
      ),
    },
    {
      id: "vertical",
      title: "Vertical",
      description: "Vertical orientation with the default size.",
      render: () => <RLStepper items={ITEMS} orientation="vertical" defaultValue={2} />,
    },
    {
      id: "disabled",
      title: "All steps disabled",
      description: "disabled blocks every trigger.",
      render: () => <RLStepper items={ITEMS} disabled defaultValue={1} />,
    },
  ],
  checklist: [
    {
      criterion: "Static conformance (slots, data-slot, RL primitives, banned names)",
      status: "pass",
      notes:
        "Children render in data-slot body. indicatorSlot and wrapperSlot are read via setup slots accessors. Icons use RLIcon with bare lucide names.",
    },
    {
      criterion: "Native trigger elements and disabled state",
      status: "pass",
      notes:
        "Triggers are native buttons with the disabled attribute and data-disabled presence flag.",
    },
    {
      criterion: "Keyboard and interaction behavior",
      status: "pending",
      notes: "Covered by packages/ui/test/stepper.test.tsx; not yet run.",
    },
  ],
};

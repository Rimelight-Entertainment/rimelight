import { createSignal, For } from "solid-js"
import type { JSX } from "@solidjs/web"
import RLAccordion from "@rimelight/ui/components/accordion/RLAccordion.tsx"
import type { AccordionItem } from "@rimelight/ui/components/accordion/accordion.ts"
import type { ComponentAuditDefinition } from "./types"

const BASE_ITEMS: AccordionItem[] = [
  {
    label: "What is Rimelight UI?",
    icon: "i-lucide-sparkles",
    content:
      "Rimelight UI is an enterprise-grade, high-performance UI library designed for SolidJS and Astro."
  },
  {
    label: "How does Accordion grouping work?",
    icon: "i-lucide-folder-tree",
    content:
      "When `multiple={false}`, items share an HTML5 `name` attribute on the `<details>` elements to enforce exclusive single-item open state natively without heavy JS."
  },
  {
    label: "Can items be individually disabled?",
    icon: "i-lucide-shield-alert",
    disabled: true,
    content: "This item is disabled (disabled: true) and should not respond to user clicks."
  },
  {
    label: "Custom trailing icon support",
    icon: "i-lucide-settings",
    trailingIcon: "i-lucide-arrow-down-circle",
    content: "This item overrides the default chevron trailing icon."
  }
]

export const AccordionSandbox = (): JSX.Element => {
  const [multiple, setMultiple] = createSignal(false)
  const [disabled, setDisabled] = createSignal(false)
  const [useCustomIcon, setUseCustomIcon] = createSignal(false)
  const [itemCount, setItemCount] = createSignal(4)

  const items = (): AccordionItem[] =>
    BASE_ITEMS.slice(0, itemCount()).map((item): AccordionItem => {
      const res: AccordionItem = { ...item }
      if (useCustomIcon()) {
        res.trailingIcon = "i-lucide-plus"
      }
      return res
    })

  return (
    <div class="flex flex-col gap-6">
      {/* Control Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-6 text-xs">
        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={multiple()}
            onChange={(e) => setMultiple(e.currentTarget.checked)}
            class="rounded border-default"
          />
          <span class="font-medium text-highlighted">
            Multiple Mode (<code>multiple={String(multiple())}</code>)
          </span>
        </label>

        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={disabled()}
            onChange={(e) => setDisabled(e.currentTarget.checked)}
            class="rounded border-default"
          />
          <span class="font-medium text-highlighted">
            Disable All (<code>disabled={String(disabled())}</code>)
          </span>
        </label>

        <label class="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={useCustomIcon()}
            onChange={(e) => setUseCustomIcon(e.currentTarget.checked)}
            class="rounded border-default"
          />
          <span class="font-medium text-highlighted">Override Trailing Icon</span>
        </label>

        <div class="flex items-center gap-2">
          <span class="text-muted">Item Count:</span>
          <div class="flex gap-1">
            <For each={[1, 2, 3, 4]}>
              {(count) => (
                <button
                  type="button"
                  onClick={() => setItemCount(count)}
                  class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                    itemCount() === count
                      ? "bg-primary text-inverted font-bold"
                      : "bg-elevated text-muted hover:text-highlighted border border-default"
                  }`}
                >
                  {count}
                </button>
              )}
            </For>
          </div>
        </div>
      </div>

      {/* Rendered Sandbox */}
      <div class="p-6 rounded-xl border border-default bg-default shadow-xs">
        <RLAccordion items={items()} multiple={multiple()} disabled={disabled()} />
      </div>
    </div>
  )
}

export const accordionAudit: ComponentAuditDefinition = {
  id: "accordion",
  name: "Accordion",
  category: "Data Display",
  status: "Auditing",
  description:
    "A collapsible content panel component built on native HTML5 <details> & <summary> elements supporting exclusive single-open or multi-open modes, custom icons, and slot customization.",
  importPath: "@rimelight/ui/components/accordion/RLAccordion.tsx",
  renderSandbox: () => <AccordionSandbox />,
  testScenarios: [
    {
      id: "single-item-children",
      title: "Single Item with Custom Children Slot",
      description:
        "Testing single-item summary syntax with rich arbitrary nested HTML / components.",
      render: () => (
        <div class="p-4 rounded-lg border border-default bg-default">
          <RLAccordion summary="Click to expand detailed system diagnostics">
            <div class="p-3 rounded bg-elevated/40 border border-default text-xs space-y-2 mt-2">
              <div class="flex justify-between">
                <span class="text-muted">Status:</span>
                <span class="text-emerald-500 font-medium">Operational</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted">Latency:</span>
                <span class="font-mono text-highlighted">14ms</span>
              </div>
              <div class="flex justify-between">
                <span class="text-muted">Region:</span>
                <span class="font-mono text-highlighted">iad-1</span>
              </div>
            </div>
          </RLAccordion>
        </div>
      )
    },
    {
      id: "custom-icons",
      title: "Custom Leading & Trailing Icons",
      description:
        "Verifying icon resolution for UnoCSS class icons, custom trailing icons, and rotational transitions.",
      render: () => (
        <div class="p-4 rounded-lg border border-default bg-default">
          <RLAccordion
            items={[
              {
                label: "Security & Permissions",
                icon: "i-lucide-shield-check",
                trailingIcon: "i-lucide-lock",
                content: "Role-based access controls and token expirations."
              },
              {
                label: "Payment & Invoices",
                icon: "i-lucide-credit-card",
                trailingIcon: "i-lucide-external-link",
                content: "Subscription management, payment gateways, and tax history."
              }
            ]}
            multiple
          />
        </div>
      )
    },
    {
      id: "disabled-handling",
      title: "Disabled State Matrix",
      description:
        "Ensuring disabled items prevent pointer events, have dimmed opacity, and do not toggle on enter/space.",
      render: () => (
        <div class="p-4 rounded-lg border border-default bg-default">
          <RLAccordion
            items={[
              {
                label: "Enabled Section 1",
                icon: "i-lucide-check",
                content: "Can be opened and closed freely."
              },
              {
                label: "Disabled Section 2 (disabled: true)",
                icon: "i-lucide-ban",
                disabled: true,
                content: "Should not be clickable or expandable."
              },
              {
                label: "Enabled Section 3",
                icon: "i-lucide-check",
                content: "Another enabled section."
              }
            ]}
          />
        </div>
      )
    },
    {
      id: "nested-accordions",
      title: "Nested Accordion Hierarchies",
      description: "Verifying parent-child accordion nesting without group name collisions.",
      render: () => (
        <div class="p-4 rounded-lg border border-default bg-default">
          <RLAccordion summary="Parent Accordion Section">
            <div class="pt-3">
              <RLAccordion
                items={[
                  {
                    label: "Sub-Section A",
                    content: "Nested child accordion item A content."
                  },
                  {
                    label: "Sub-Section B",
                    content: "Nested child accordion item B content."
                  }
                ]}
              />
            </div>
          </RLAccordion>
        </div>
      )
    }
  ],
  checklist: [
    {
      criterion: "Native HTML5 <details> and <summary> semantics",
      status: "pass",
      notes: "Zero JS required for basic open/close toggling."
    },
    {
      criterion: "Single-item exclusive open grouping",
      status: "pass",
      notes: "Uses generated or provided `name` attribute on <details>."
    },
    {
      criterion: "Keyboard navigation (Space/Enter to toggle, Tab to focus)",
      status: "pass",
      notes: "Native browser summary keyboard accessibility preserved."
    },
    {
      criterion: "Disabled item state and accessibility",
      status: "pass",
      notes: "pointer-events-none and opacity-50 applied."
    },
    {
      criterion: "Design tokens & theme slot consistency",
      status: "pass",
      notes: "Slots: root, item, header, trigger, content, body, leadingIcon, trailingIcon, label."
    }
  ]
}

import { createMemo, createSignal, For } from "solid-js"
import type { JSX } from "@solidjs/web"
import { RLAccordion } from "@rimelight/ui/components/accordion/RLAccordion.tsx"
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

  // Memo: signal reads must live in a tracking scope (Solid 2 strict mode
  // flags eager reads during render with STRICT_READ_UNTRACKED).
  const items = createMemo((): AccordionItem[] =>
    BASE_ITEMS.slice(0, itemCount()).map((item): AccordionItem => {
      const res: AccordionItem = { ...item }
      if (useCustomIcon()) {
        res.trailingIcon = "i-lucide-plus"
      }
      return res
    })
  )

  return (
    <>
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

      <RLAccordion items={items()} multiple={multiple()} disabled={disabled()} />
    </>
  )
}

export const accordionAudit: ComponentAuditDefinition = {
  id: "accordion",
  name: "Accordion",
  category: "Data Display",
  status: "Auditing",
  description:
    "A collapsible content panel component built on native HTML5 <details> & <summary> elements with Nuxt-parity props (type, value/defaultValue + onChange, collapsible, unmountOnHide, valueKey/labelKey, slots) plus Rimelight extras (summary/children single mode, multiple alias, name, trailingIconSlot).",
  importPath: "@rimelight/ui/components/accordion/RLAccordion.tsx",
  renderSandbox: () => <AccordionSandbox />,
  testScenarios: [
    {
      id: "single-item-children",
      title: "Single Item with Custom Children Slot",
      description:
        "Testing single-item summary syntax with rich arbitrary nested HTML / components.",
      render: () => (
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
      )
    },
    {
      id: "custom-icons",
      title: "Custom Leading & Trailing Icons",
      description:
        "Verifying icon resolution for UnoCSS class icons, custom trailing icons, and rotational transitions.",
      render: () => (
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
      )
    },
    {
      id: "disabled-handling",
      title: "Disabled State Matrix",
      description:
        "Ensuring disabled items prevent pointer events, have dimmed opacity, and do not toggle on enter/space.",
      render: () => (
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
      )
    },
    {
      id: "multiple-mode",
      title: 'Multiple Open Mode (Nuxt: type="multiple")',
      description:
        "Rimelight alias: multiple={true}. All items share no `name` group so several can stay open.",
      render: () => (
        <RLAccordion
          multiple
          name="audit-multiple"
          items={[
            {
              label: "Icons",
              icon: "i-lucide-smile",
              content: "You have nothing to do, @nuxt/icon will handle it automatically."
            },
            {
              label: "Colors",
              icon: "i-lucide-swatch-book",
              content: "Choose a primary and a neutral color from your Tailwind CSS theme."
            },
            {
              label: "Components",
              icon: "i-lucide-box",
              content: "Customize via the `class` / `ui` props or in your app config."
            }
          ]}
        />
      )
    },
    {
      id: "single-exclusive-grouping",
      title: "Single Exclusive Grouping via name",
      description:
        "With multiple={false} (default) open items collapse each other through a shared HTML5 `name` attribute. Two accordions with different names must not interfere.",
      render: () => (
        <>
          <RLAccordion
            name="audit-group-a"
            items={[
              { label: "Group A — Item 1", content: "First item of group A." },
              { label: "Group A — Item 2", content: "Second item of group A." }
            ]}
          />
          <RLAccordion
            name="audit-group-b"
            items={[
              { label: "Group B — Item 1", content: "First item of group B." },
              { label: "Group B — Item 2", content: "Second item of group B." }
            ]}
          />
        </>
      )
    },
    {
      id: "trailing-icon-prop",
      title: "Global trailingIcon Prop (Nuxt: trailing-icon)",
      description:
        "The root trailingIcon prop overrides the default chevron for every item that does not set its own trailingIcon.",
      render: () => (
        <RLAccordion
          trailingIcon="i-lucide-plus"
          items={[
            {
              label: "Global plus icon",
              icon: "i-lucide-smile",
              content: "Uses the root trailingIcon."
            },
            {
              label: "Per-item override wins",
              icon: "i-lucide-swatch-book",
              trailingIcon: "i-lucide-arrow-down",
              content: "Uses its own trailingIcon."
            }
          ]}
        />
      )
    },
    {
      id: "root-disabled",
      title: "Root disabled Prop (Nuxt: disabled)",
      description:
        "disabled on the root disables every trigger. Compare with per-item disabled in the Disabled State Matrix scenario.",
      render: () => (
        <RLAccordion
          disabled
          items={[
            { label: "Section 1", content: "Should not be clickable." },
            { label: "Section 2", content: "Should not be clickable." }
          ]}
        />
      )
    },
    {
      id: "per-item-ui-override",
      title: "Per-item class / ui Override",
      description:
        "item.class appends to the item node; item.ui merges per slot over the root ui. The second row label renders rose/black.",
      render: () => (
        <RLAccordion
          items={[
            { label: "Plain item", content: "No overrides." },
            {
              label: "Item with ui override",
              content: "This label is styled by item.ui.",
              ui: { label: "text-rose-500 font-black" }
            }
          ]}
        />
      )
    },
    {
      id: "controlled-value",
      title: "Controlled value + onChange (Nuxt: v-model)",
      description:
        "Maps to Nuxt's v-model / update:modelValue. External buttons drive the open item; clicking triggers reports through onChange.",
      render: () => {
        const [active, setActive] = createSignal<string | undefined>("0")
        const ids = ["0", "1", "2"]
        return (
          <>
            <div class="flex items-center gap-2 text-xs">
              <span class="text-muted">Active:</span>
              <code class="font-mono text-primary">{active() ?? "(none)"}</code>
              <For each={ids}>
                {(id) => (
                  <button
                    type="button"
                    onClick={() => setActive(id)}
                    class="px-2 py-0.5 rounded border border-default text-xs font-mono hover:text-highlighted"
                  >
                    {id}
                  </button>
                )}
              </For>
              <button
                type="button"
                onClick={() => setActive(undefined)}
                class="px-2 py-0.5 rounded border border-default text-xs font-mono hover:text-highlighted"
              >
                clear
              </button>
            </div>
            <RLAccordion
              value={active()}
              onChange={(v) => {
                setActive(v as string | undefined)
              }}
              items={[
                { label: "Controlled 0", value: "0", content: "First panel." },
                { label: "Controlled 1", value: "1", content: "Second panel." },
                { label: "Controlled 2", value: "2", content: "Third panel." }
              ]}
            />
          </>
        )
      }
    },
    {
      id: "default-value",
      title: "defaultValue Uncontrolled (Nuxt: default-value)",
      description:
        "Second item starts open with no JS state held by the parent. String for single mode.",
      render: () => (
        <RLAccordion
          defaultValue="1"
          items={[
            { label: "Item 0", value: "0", content: "Starts closed." },
            { label: "Item 1", value: "1", content: "Starts open via defaultValue." },
            { label: "Item 2", value: "2", content: "Starts closed." }
          ]}
        />
      )
    },
    {
      id: "type-multiple",
      title: 'type="multiple" + array defaultValue (Nuxt: type)',
      description:
        "Nuxt-shaped API. Two items start open; toggling one leaves the other open. The boolean multiple prop remains as a Rimelight alias.",
      render: () => (
        <RLAccordion
          type="multiple"
          defaultValue={["m0", "m2"]}
          items={[
            { label: "M0 open", value: "m0", content: "Starts open." },
            { label: "M1 closed", value: "m1", content: "Starts closed." },
            { label: "M2 open", value: "m2", content: "Starts open." }
          ]}
        />
      )
    },
    {
      id: "collapsible-false",
      title: "collapsible={false} Single Mode",
      description:
        "The open item cannot be closed by clicking its own trigger; clicking another item still switches.",
      render: () => (
        <RLAccordion
          collapsible={false}
          defaultValue="c0"
          items={[
            { label: "Pinned open at start", value: "c0", content: "Clicking me keeps me open." },
            { label: "Switch target", value: "c1", content: "Clicking me switches here." }
          ]}
        />
      )
    },
    {
      id: "unmount-behavior",
      title: "unmountOnHide Matrix (Nuxt default: true)",
      description:
        "First: default unmounts collapsed panels (inspect the DOM after collapsing — the node is gone). Second: unmountOnHide={false} keeps the node mounted but natively hidden.",
      render: () => (
        <>
          <RLAccordion
            defaultValue="u0"
            items={[{ label: "Collapse me, then inspect DOM", value: "u0", content: "I unmount." }]}
          />
          <RLAccordion
            unmountOnHide={false}
            items={[
              {
                label: "Collapsed but mounted",
                value: "u1",
                content: "This node exists in the DOM even while collapsed."
              }
            ]}
          />
        </>
      )
    },
    {
      id: "value-label-keys",
      title: "Custom valueKey / labelKey incl. Dot Paths",
      description: "Items keyed by nested fields. Open state tracks meta.key values.",
      render: () => (
        <RLAccordion
          valueKey="meta.key"
          labelKey="meta.title"
          defaultValue="k2"
          items={[
            { meta: { key: "k1", title: "Nested one" }, content: "Resolved via dot paths." },
            { meta: { key: "k2", title: "Nested two (open)" }, content: "Starts open." }
          ]}
        />
      )
    },
    {
      id: "render-slots",
      title: "leading / trailing / body / content Render Props (Nuxt slots)",
      description:
        "Maps to Nuxt's #leading #trailing #body #content slots. Custom badge leading, action trailing, markdown-ish body. The last item's fully custom content area starts from scratch (Nuxt semantics) so it carries its own px-4 to align with default body text.",
      render: () => (
        <RLAccordion
          leading={(item) => (
            <span class="shrink-0 size-5 rounded bg-primary/15 text-primary text-[10px] font-black flex items-center justify-center">
              {(item.label ?? "?").slice(0, 1)}
            </span>
          )}
          trailing={(_item, index) => (
            <span class="shrink-0 ms-auto text-[10px] font-mono text-muted">#{index}</span>
          )}
          body={(item) => (
            <p class="text-sm">
              <strong>{item.label}</strong> — {item.content}
            </p>
          )}
          content={(item, index) =>
            index === 2 ? (
              <div class="px-4 pb-3.5">
                <div class="rounded border border-primary/40 bg-primary/5 p-3 text-xs">
                  Fully custom content area for {item.label}.
                </div>
              </div>
            ) : (
              <div class="px-4 text-sm pb-3.5 opacity-80">{item.content} (default wrapper)</div>
            )
          }
          items={[
            { label: "Alpha", content: "first" },
            { label: "Beta", content: "second" },
            { label: "Gamma", content: "third" }
          ]}
        />
      )
    },
    {
      id: "named-item-slot",
      title: "Per-item slot + slots Record (Nuxt: #{{ item.slot }})",
      description:
        "The middle item names slot='featured', rendered by the matching entry in the slots record.",
      render: () => (
        <RLAccordion
          type="multiple"
          defaultValue={["s0", "s1"]}
          slots={{
            featured: (item) => <p class="text-sm text-primary font-medium">{item.content} ★</p>
          }}
          items={[
            { label: "Standard", value: "s0", content: "Default body." },
            { label: "Featured", value: "s1", slot: "featured", content: "Named slot body." }
          ]}
        />
      )
    },
    {
      id: "nested-accordions",
      title: "Nested Accordion Hierarchies",
      description:
        "Parent-child nesting. The inner accordion uses class -mx-4 so its triggers sit flush with the parent's (negating the parent content padding) instead of indenting a second level.",
      render: () => (
        <RLAccordion summary="Parent Accordion Section">
          <RLAccordion
            class="-mx-4"
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
        </RLAccordion>
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
      notes:
        "Enforced by component state (toggleValue), not native grouping. No auto name: identical accordions previously merged into one native group and fought Solid state (all-closed). name renders only when explicitly passed."
    },
    {
      criterion: "Keyboard navigation (Space/Enter to toggle, Tab to focus)",
      status: "pass",
      notes: "Native browser summary keyboard accessibility preserved."
    },
    {
      criterion: "Disabled item state and accessibility",
      status: "pass",
      notes:
        "Theme disabled variant + aria-disabled; clicks (mouse and keyboard) are intercepted so disabled items never toggle."
    },
    {
      criterion: "Design tokens & theme slot consistency",
      status: "pass",
      notes:
        "Slots: root, item, trigger, content, body, leadingIcon, trailingIcon, label. (header removed: a wrapper div would break native <summary> toggling.)"
    },
    {
      criterion: "No innerHTML / dangerouslySetInnerHTML in RLAccordion",
      status: "pass",
      notes:
        "Item label/content render as Solid children. (RLIcon itself uses innerHTML for SVG icons — tracked in the Icon audit.)"
    },
    {
      criterion: "No inline styles (CSP-safe, UnoCSS only)",
      status: "pass",
      notes:
        "No style prop or <style> in the component; all visuals resolve via accordion.theme.ts."
    },
    {
      criterion: "No Uno/CSS class strings inside the component file",
      status: "pass",
      notes:
        "Zero cx/concatenation in the component: disabled flows through the theme variant, item.class folds into mergeUi as a ui.item entry, icons render via RLIcon."
    },
    {
      criterion: "No hydration mismatch (keys + auto group name)",
      status: "pass",
      notes:
        "Data-derived name hash (no random/child-id consumption); render path uses plain tags + ternaries only — no <Show>/<Dynamic>/effects, no per-row memos. as still works via isolated <Dynamic> branches."
    },
    {
      criterion: "Summary disclosure marker hidden cross-browser",
      status: "pass",
      notes:
        "Was webkit-only; added [&::marker]:hidden so Firefox shows no stray triangle offsetting the label."
    },
    {
      criterion: "Controlled value (Nuxt: v-model / update:modelValue)",
      status: "pass",
      notes:
        "value + defaultValue + onChange implemented (Solid idiom per RLTabs). Item value falls back to index string. See controlled-value scenario."
    },
    {
      criterion: "Non-collapsible single mode (Nuxt: collapsible={false})",
      status: "pass",
      notes: "Implemented; active trigger clicks are swallowed. See collapsible-false scenario."
    },
    {
      criterion: "Slots: leading / trailing / content / body + per-item slot",
      status: "pass",
      notes:
        "Render props map to Nuxt #leading #trailing #content #body; slots record + item.slot maps to #{{ item.slot }}(-body). See render-slots + named-item-slot scenarios."
    },
    {
      criterion: "Per-item class / ui overrides",
      status: "pass",
      notes:
        "item.class folds into mergeUi as ui.item; item.ui merges per slot over root ui. See per-item-ui-override scenario."
    },
    {
      criterion: 'Single/multiple API shape (Nuxt: type="single" | "multiple")',
      status: "pass",
      notes:
        "type union implemented; boolean multiple kept as Rimelight alias (type wins when set)."
    },
    {
      criterion: "Unmount-on-hide semantics (Nuxt default true)",
      status: "pass",
      notes:
        "unmountOnHide implemented, defaults true via <Show>. See unmount-behavior matrix scenario."
    },
    {
      criterion: "valueKey / labelKey + as prop",
      status: "pass",
      notes:
        "Both keys implemented with dot-path support; as renders via dynamic() (div default in items mode, details default in summary mode). See value-label-keys scenario."
    },
    {
      criterion: "Solid 2 strict-mode clean (no STRICT_READ_UNTRACKED)",
      status: "pass",
      notes:
        "Sandbox items derivation moved into createMemo; component reads signals only in JSX/memos, handler snapshots via untrack()."
    },
    {
      criterion: "Audited component renders bare (no harness wrappers)",
      status: "pass",
      notes:
        "Scenario renders return <RLAccordion/> directly (fragments only for multi-root); shell cards excluded from this criterion."
    },
    {
      criterion: "Disabled visuals match Nuxt theme",
      status: "warn",
      notes:
        "Uses opacity-50, Nuxt uses opacity-75. aria-disabled is now emitted; summary stays focusable (clicks blocked for mouse and keyboard)."
    },
    {
      criterion: "v-model naming (Nuxt: modelValue)",
      status: "warn",
      notes:
        "Intentional mapping: Solid codebase idiom is value + onChange (RLTabs precedent), not modelValue / update:modelValue. Document the mapping."
    },
    {
      criterion: "Open/close keyframe animations (Nuxt content slot)",
      status: "warn",
      notes:
        "Not implemented: no accordion-down/up keyframes exist in the Uno preset. Needs preset-level keyframes (permission-gated CSS work)."
    }
  ]
}

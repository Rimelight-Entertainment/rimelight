import { createMemo, createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLAccordion } from "@rimelight/ui/components/accordion/RLAccordion.tsx";
import type { AccordionItem } from "@rimelight/ui/components/accordion/accordion.types.ts";
import type { ComponentAuditDefinition } from "./types";
import { t } from "@rimelight/i18n";

export const AccordionSandbox = (): JSX.Element => {
  const BASE_ITEMS: AccordionItem[] = [
    {
      label: t("app.text.what-is-rimelight-ui"),
      icon: "sparkles",
      content:
        "Rimelight UI is an enterprise-grade, high-performance UI library designed for SolidJS.",
    },
    {
      label: t("app.text.how-does-accordion-grouping-work"),
      icon: "lucide:folder-tree",
      content:
        "When `type` is `single`, items share an HTML5 `name` attribute on the `<details>` elements to enforce exclusive single-item open state natively without heavy JS.",
    },
    {
      label: t("app.text.can-items-be-individually-disabled"),
      icon: "shield-alert",
      disabled: true,
      content: "This item is disabled (disabled: true) and should not respond to user clicks.",
    },
    {
      label: t("app.text.custom-trailing-icon-support"),
      icon: "lucide:settings",
      trailingIcon: "lucide:circle-arrow-down",
      content: "This item overrides the default chevron trailing icon.",
    },
  ];
  const [multiple, setMultiple] = createSignal(false);
  const [disabled, setDisabled] = createSignal(false);
  const [useCustomIcon, setUseCustomIcon] = createSignal(false);
  const [itemCount, setItemCount] = createSignal(4);

  // Memo: signal reads must live in a tracking scope (Solid 2 strict mode
  // flags eager reads during render with STRICT_READ_UNTRACKED).
  const items = createMemo((): AccordionItem[] =>
    BASE_ITEMS.slice(0, itemCount()).map((item): AccordionItem => {
      const res: AccordionItem = { ...item };
      if (useCustomIcon()) {
        res.trailingIcon = "lucide:plus";
      }
      return res;
    }),
  );

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
            Multiple Mode (<code>{multiple() ? 'type="multiple"' : 'type="single"'}</code>)
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
          <span class="font-medium text-highlighted">{t("app.text.override-trailing-icon")}</span>
        </label>

        <div class="flex items-center gap-2">
          <span class="text-muted">{t("app.text.item-count")}</span>
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

      <RLAccordion
        items={items()}
        type={multiple() ? "multiple" : "single"}
        disabled={disabled()}
      />
    </>
  );
};

export const accordionAudit: ComponentAuditDefinition = {
  id: "accordion",
  name: "Accordion",
  category: "Data Display",
  status: "Auditing",
  description:
    "A collapsible content panel component built on native HTML5 <details> & <summary> elements with props (type, value/defaultValue + onValueChange, collapsible, unmountOnHide, slots) plus extras (summary/children single mode, name).",
  importPath: "@rimelight/ui/components/accordion/RLAccordion.tsx",
  renderSandbox: () => <AccordionSandbox />,
  testScenarios: [
    {
      id: "single-item-children",
      get title() {
        return t("app.text.single-item-with-custom-children-slot");
      },
      description:
        "Testing single-item summary syntax with rich arbitrary nested HTML / components.",
      render: () => (
        <RLAccordion summary="Click to expand detailed system diagnostics">
          <div class="p-3 rounded bg-elevated/40 border border-default text-xs space-y-2 mt-2">
            <div class="flex justify-between">
              <span class="text-muted">{"Status:"}</span>
              <span class="text-success font-medium">{"Operational"}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted">{"Latency:"}</span>
              <span class="font-mono text-highlighted">14ms</span>
            </div>
            <div class="flex justify-between">
              <span class="text-muted">{"Region:"}</span>
              <span class="font-mono text-highlighted">iad-1</span>
            </div>
          </div>
        </RLAccordion>
      ),
    },
    {
      id: "custom-icons",
      get title() {
        return t("app.text.custom-leading-trailing-icons");
      },
      description:
        "Verifying icon resolution for built-in icon names, custom trailing icons, and rotational transitions.",
      render: () => (
        <RLAccordion
          items={[
            {
              get label() {
                return t("app.text.security-permissions");
              },
              icon: "lucide:shield-check",
              trailingIcon: "lock",
              content: "Role-based access controls and token expirations.",
            },
            {
              get label() {
                return t("app.text.payment-invoices");
              },
              icon: "lucide:credit-card",
              trailingIcon: "external-link",
              content: "Subscription management, payment gateways, and tax history.",
            },
          ]}
          type="multiple"
        />
      ),
    },
    {
      id: "disabled-handling",
      get title() {
        return t("app.text.disabled-state-matrix");
      },
      description:
        "Ensuring disabled items prevent pointer events, have dimmed opacity, and do not toggle on enter/space.",
      render: () => (
        <RLAccordion
          items={[
            {
              get label() {
                return t("app.text.enabled-section-1");
              },
              icon: "check",
              content: "Can be opened and closed freely.",
            },
            {
              get label() {
                return t("app.text.disabled-section-2-disabled-true");
              },
              icon: "lucide:ban",
              disabled: true,
              content: "Should not be clickable or expandable.",
            },
            {
              get label() {
                return t("app.text.enabled-section-3");
              },
              icon: "check",
              content: "Another enabled section.",
            },
          ]}
        />
      ),
    },
    {
      id: "multiple-mode",
      title: 'Multiple Open Mode (Nuxt: type="multiple")',
      description:
        "Set `type` to `multiple`. All items share no `name` group so several can stay open.",
      render: () => (
        <RLAccordion
          type="multiple"
          name="audit-multiple"
          items={[
            {
              get label() {
                return t("app.text.icons");
              },
              icon: "lucide:smile",
              content: "You have nothing to do, @nuxt/icon will handle it automatically.",
            },
            {
              get label() {
                return t("app.text.colors");
              },
              icon: "lucide:swatch-book",
              content: "Choose a primary and a neutral color from your Tailwind CSS theme.",
            },
            {
              get label() {
                return t("app.text.components");
              },
              icon: "lucide:box",
              content: "Customize via the `class` / `ui` props or in your app config.",
            },
          ]}
        />
      ),
    },
    {
      id: "single-exclusive-grouping",
      get title() {
        return t("app.text.single-exclusive-grouping-via-name");
      },
      description:
        "With `type` set to single (default) open items collapse each other through a shared HTML5 `name` attribute. Two accordions with different names must not interfere.",
      render: () => (
        <>
          <RLAccordion
            name="audit-group-a"
            items={[
              {
                get label() {
                  return t("app.text.group-a-item-1");
                },
                content: "First item of group A.",
              },
              {
                get label() {
                  return t("app.text.group-a-item-2");
                },
                content: "Second item of group A.",
              },
            ]}
          />
          <RLAccordion
            name="audit-group-b"
            items={[
              {
                get label() {
                  return t("app.text.group-b-item-1");
                },
                content: "First item of group B.",
              },
              {
                get label() {
                  return t("app.text.group-b-item-2");
                },
                content: "Second item of group B.",
              },
            ]}
          />
        </>
      ),
    },
    {
      id: "trailing-icon-prop",
      get title() {
        return t("app.text.global-trailingicon-prop-nuxt-trailing-icon");
      },
      description:
        "The root trailingIcon prop overrides the default chevron for every item that does not set its own trailingIcon.",
      render: () => (
        <RLAccordion
          trailingIcon="lucide:plus"
          items={[
            {
              get label() {
                return t("app.text.global-plus-icon");
              },
              icon: "lucide:smile",
              content: "Uses the root trailingIcon.",
            },
            {
              get label() {
                return t("app.text.per-item-override-wins");
              },
              icon: "lucide:swatch-book",
              trailingIcon: "arrow-down",
              content: "Uses its own trailingIcon.",
            },
          ]}
        />
      ),
    },
    {
      id: "root-disabled",
      get title() {
        return t("app.text.root-disabled-prop-nuxt-disabled");
      },
      description:
        "disabled on the root disables every trigger. Compare with per-item disabled in the Disabled State Matrix scenario.",
      render: () => (
        <RLAccordion
          disabled
          items={[
            {
              get label() {
                return t("app.text.section-1");
              },
              content: "Should not be clickable.",
            },
            {
              get label() {
                return t("app.text.section-2");
              },
              content: "Should not be clickable.",
            },
          ]}
        />
      ),
    },
    {
      id: "per-item-ui-override",
      get title() {
        return t("app.text.per-item-class-ui-override");
      },
      description:
        "item.class appends to the item node; item.ui merges per slot over the root ui. The second row label renders in the error color.",
      render: () => (
        <RLAccordion
          items={[
            {
              get label() {
                return t("app.text.plain-item");
              },
              content: "No overrides.",
            },
            {
              get label() {
                return t("app.text.item-with-ui-override");
              },
              content: "This label is styled by item.ui.",
              ui: { label: "text-error font-black" },
            },
          ]}
        />
      ),
    },
    {
      id: "controlled-value",
      get title() {
        return t("app.text.controlled-value-onchange-nuxt-v-model");
      },
      description:
        "Maps to Nuxt's v-model / update:modelValue. External buttons drive the open item; clicking triggers reports through onValueChange.",
      render: () => {
        const [active, setActive] = createSignal<string | undefined>("0");
        const ids = ["0", "1", "2"];
        return (
          <>
            <div class="flex items-center gap-2 text-xs">
              <span class="text-muted">{"Active:"}</span>
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
              onValueChange={(v) => {
                setActive(v as string | undefined);
              }}
              items={[
                {
                  get label() {
                    return t("app.text.controlled-0");
                  },
                  value: "0",
                  content: "First panel.",
                },
                {
                  get label() {
                    return t("app.text.controlled-1");
                  },
                  value: "1",
                  content: "Second panel.",
                },
                {
                  get label() {
                    return t("app.text.controlled-2");
                  },
                  value: "2",
                  content: "Third panel.",
                },
              ]}
            />
          </>
        );
      },
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
            {
              get label() {
                return t("app.text.item-0");
              },
              value: "0",
              content: "Starts closed.",
            },
            {
              get label() {
                return t("app.text.item-1");
              },
              value: "1",
              content: "Starts open via defaultValue.",
            },
            {
              get label() {
                return t("app.text.item-2");
              },
              value: "2",
              content: "Starts closed.",
            },
          ]}
        />
      ),
    },
    {
      id: "type-multiple",
      title: 'type="multiple" + array defaultValue (Nuxt: type)',
      description: "Nuxt-shaped API. Two items start open; toggling one leaves the other open.",
      render: () => (
        <RLAccordion
          type="multiple"
          defaultValue={["m0", "m2"]}
          items={[
            {
              get label() {
                return t("app.text.m0-open");
              },
              value: "m0",
              content: "Starts open.",
            },
            {
              get label() {
                return t("app.text.m1-closed");
              },
              value: "m1",
              content: "Starts closed.",
            },
            {
              get label() {
                return t("app.text.m2-open");
              },
              value: "m2",
              content: "Starts open.",
            },
          ]}
        />
      ),
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
            {
              get label() {
                return t("app.text.pinned-open-at-start");
              },
              value: "c0",
              content: "Clicking me keeps me open.",
            },
            {
              get label() {
                return t("app.text.switch-target");
              },
              value: "c1",
              content: "Clicking me switches here.",
            },
          ]}
        />
      ),
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
            items={[
              {
                get label() {
                  return t("app.text.collapse-me-then-inspect-dom");
                },
                value: "u0",
                content: "I unmount.",
              },
            ]}
          />
          <RLAccordion
            unmountOnHide={false}
            items={[
              {
                get label() {
                  return t("app.text.collapsed-but-mounted");
                },
                value: "u1",
                content: "This node exists in the DOM even while collapsed.",
              },
            ]}
          />
        </>
      ),
    },
    {
      id: "value-label-keys",
      get title() {
        return t("app.text.custom-valuekey-labelkey-incl-dot-paths");
      },
      get description() {
        return t("app.text.items-keyed-by-nested-fields-open-state-tracks-m");
      },
      render: () => (
        <RLAccordion
          defaultValue="k2"
          items={[
            {
              value: "k1",
              get label() {
                return t("app.text.nested-one");
              },
              content: "Resolved via dot paths.",
            },
            {
              value: "k2",
              get label() {
                return t("app.text.nested-two-open");
              },
              content: "Starts open.",
            },
          ]}
        />
      ),
    },
    {
      id: "leading-slot",
      title: "leadingSlot Render Prop",
      description:
        "Replaces the default leading icon per item. Receives { item, index } and renders a custom badge built from the item label.",
      render: () => (
        <RLAccordion
          leadingSlot={({ item }) => (
            <span class="shrink-0 size-5 rounded bg-primary/15 text-primary text-[10px] font-black flex items-center justify-center">
              {(item.label ?? "?").slice(0, 1)}
            </span>
          )}
          items={[
            {
              get label() {
                return t("app.text.alpha");
              },
              content: "first",
            },
            {
              get label() {
                return t("app.text.beta");
              },
              content: "second",
            },
            {
              get label() {
                return t("app.text.gamma");
              },
              content: "third",
            },
          ]}
        />
      ),
    },
    {
      id: "trailing-slot",
      title: "trailingSlot Render Prop",
      description:
        "Replaces the default chevron per item. Receives { item, index }; this scenario renders the item index in its place.",
      render: () => (
        <RLAccordion
          trailingSlot={({ index }) => (
            <span class="shrink-0 ms-auto text-[10px] font-mono text-muted">#{index}</span>
          )}
          items={[
            {
              get label() {
                return t("app.text.alpha");
              },
              content: "first",
            },
            {
              get label() {
                return t("app.text.beta");
              },
              content: "second",
            },
            {
              get label() {
                return t("app.text.gamma");
              },
              content: "third",
            },
          ]}
        />
      ),
    },
    {
      id: "body-slot",
      title: "bodySlot Render Prop",
      description:
        "Replaces the body of every item. Receives { item, index }. The third item renders a fully custom area; the others render their content inside a styled paragraph.",
      render: () => (
        <RLAccordion
          bodySlot={({ item, index }) =>
            index === 2 ? (
              <div class="px-4 pb-3.5">
                <div class="rounded border border-primary/40 bg-primary/5 p-3 text-xs">
                  Fully custom content area for {item.label}.
                </div>
              </div>
            ) : (
              <p class="text-sm">
                <strong>{item.label}</strong> — {item.content}
              </p>
            )
          }
          items={[
            {
              get label() {
                return t("app.text.alpha");
              },
              content: "first",
            },
            {
              get label() {
                return t("app.text.beta");
              },
              content: "second",
            },
            {
              get label() {
                return t("app.text.gamma");
              },
              content: "third",
            },
          ]}
        />
      ),
    },
    {
      id: "named-item-slot",
      get title() {
        return t("app.text.per-item-custom-body-render-prop");
      },
      get description() {
        return t("app.text.custom-item-body-rendered-by-the-body-render-pro");
      },
      render: () => (
        <RLAccordion
          type="multiple"
          defaultValue={["s0", "s1"]}
          bodySlot={({ item }) =>
            item.value === "s1" ? (
              <p class="text-sm text-primary font-medium">{item.content} ★</p>
            ) : (
              <p class="text-sm text-muted">{item.content}</p>
            )
          }
          items={[
            {
              get label() {
                return t("app.text.standard");
              },
              value: "s0",
              content: "Default body.",
            },
            {
              get label() {
                return t("app.text.featured");
              },
              value: "s1",
              content: "Named slot body.",
            },
          ]}
        />
      ),
    },
    {
      id: "nested-accordions",
      get title() {
        return t("app.text.nested-accordion-hierarchies");
      },
      description:
        "Parent-child nesting. The inner accordion uses class -mx-4 so its triggers sit flush with the parent's (negating the parent content padding) instead of indenting a second level.",
      render: () => (
        <RLAccordion summary="Parent Accordion Section">
          <RLAccordion
            class="-mx-4"
            items={[
              {
                get label() {
                  return t("app.text.sub-section-a");
                },
                content: "Nested child accordion item A content.",
              },
              {
                get label() {
                  return t("app.text.sub-section-b");
                },
                content: "Nested child accordion item B content.",
              },
            ]}
          />
        </RLAccordion>
      ),
    },
  ],
  checklist: [
    {
      criterion: "Native HTML5 <details> and <summary> elements",
      status: "pending",
      notes:
        "Items render <details>/<summary>. Open state comes from component state; the summary click handler calls preventDefault.",
    },
    {
      criterion: "Single-item exclusive open (type single)",
      status: "pending",
      notes:
        "toggleValue replaces the open value; native name grouping applies only when the name prop is passed.",
    },
    {
      criterion: "Keyboard toggling (Enter / Space on the summary)",
      status: "pending",
      notes: "Summary click handles keyboard activation; disabled items return before toggling.",
    },
    {
      criterion: "Disabled item and root disabled",
      status: "pending",
      notes:
        "aria-disabled on the trigger, pointer-events-none via the disabled variant, and the click handler blocks toggling.",
    },
    {
      criterion: "Design tokens & theme slot consistency",
      status: "pending",
      notes:
        "Slots: root, item, trigger, body, leadingIcon, trailingIcon, label. content was merged into body.",
    },
    {
      criterion: "No innerHTML / dangerouslySetInnerHTML in RLAccordion",
      status: "pending",
      notes: "Item labels and bodies render as Solid children.",
    },
    {
      criterion: "No inline styles and no hardcoded utility classes in the component",
      status: "pending",
      notes:
        "All visuals resolve through accordion.theme.ts; item classes compose through cx(theme item, item.class).",
    },
    {
      criterion: "Solid 2 strict-mode clean (no STRICT_READ_UNTRACKED)",
      status: "pending",
      notes: "Signals are read in JSX and memos; the toggle handler reads state through untrack().",
    },
    {
      criterion: "Audited component renders bare (no harness wrappers)",
      status: "pending",
      notes:
        "Scenario renders return <RLAccordion/> directly; fragments only for multi-root scenarios.",
    },
    {
      criterion: "Slots: leadingSlot / trailingSlot / bodySlot and single-summary children",
      status: "pending",
      notes:
        "Render props receive { item, index }. See leading-slot, trailing-slot, body-slot, named-item-slot, and single-item-children scenarios.",
    },
    {
      criterion: "Per-item class / ui overrides",
      status: "pending",
      notes:
        "item.class is appended to the item root; item.ui merges per slot over the root ui. See per-item-ui-override.",
    },
    {
      criterion: 'Single/multiple API shape (type="single" | "multiple")',
      status: "pending",
      notes:
        "type union drives the open-state model. See type-multiple and default-value scenarios.",
    },
    {
      criterion: "Non-collapsible single mode (collapsible={false})",
      status: "pending",
      notes: "The open item cannot be closed by its own trigger. See collapsible-false scenario.",
    },
    {
      criterion: "Unmount-on-hide semantics (default true)",
      status: "pending",
      notes:
        "Collapsed bodies unmount by default; unmountOnHide={false} keeps them mounted. See unmount-behavior scenario.",
    },
    {
      criterion: "Controlled and uncontrolled value (value / defaultValue / onValueChange)",
      status: "pending",
      notes: "See controlled-value and default-value scenarios.",
    },
    {
      criterion: "Disabled visuals match Nuxt theme",
      status: "warn",
      notes:
        "Uses opacity-50, Nuxt uses opacity-75. aria-disabled is emitted; summary stays focusable with clicks blocked.",
    },
    {
      criterion: "v-model naming (Nuxt: modelValue)",
      status: "warn",
      notes:
        "Intentional mapping: the Solid codebase idiom is value + onValueChange (RLTabs precedent), not modelValue / update:modelValue.",
    },
    {
      criterion: "Open/close keyframe animations (Nuxt content slot)",
      status: "warn",
      notes:
        "Not implemented: no accordion-down/up keyframes exist in the Uno preset. Needs preset-level keyframes (permission-gated CSS work).",
    },
  ],
};

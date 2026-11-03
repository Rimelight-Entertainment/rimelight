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
      icon: "i-lucide-sparkles",
      content:
        "Rimelight UI is an enterprise-grade, high-performance UI library designed for SolidJS.",
    },
    {
      label: t("app.text.how-does-accordion-grouping-work"),
      icon: "i-lucide-folder-tree",
      content:
        "When `multiple={false}`, items share an HTML5 `name` attribute on the `<details>` elements to enforce exclusive single-item open state natively without heavy JS.",
    },
    {
      label: t("app.text.can-items-be-individually-disabled"),
      icon: "i-lucide-shield-alert",
      disabled: true,
      content: "This item is disabled (disabled: true) and should not respond to user clicks.",
    },
    {
      label: t("app.text.custom-trailing-icon-support"),
      icon: "i-lucide-settings",
      trailingIcon: "i-lucide-arrow-down-circle",
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
        res.trailingIcon = "i-lucide-plus";
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

      <RLAccordion items={items()} multiple={multiple()} disabled={disabled()} />
    </>
  );
};

export const accordionAudit: ComponentAuditDefinition = {
  id: "accordion",
  name: "Accordion",
  category: "Data Display",
  status: "Passed",
  description:
    "A collapsible content panel component built on native HTML5 <details> & <summary> elements with props (type, value/defaultValue + onChange, collapsible, unmountOnHide, valueKey/labelKey, slots) plus extras (summary/children single mode, multiple alias, name, trailingIconSlot).",
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
              <span class="text-emerald-500 font-medium">{"Operational"}</span>
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
        "Verifying icon resolution for UnoCSS class icons, custom trailing icons, and rotational transitions.",
      render: () => (
        <RLAccordion
          items={[
            {
              get label() {
                return t("app.text.security-permissions");
              },
              icon: "i-lucide-shield-check",
              trailingIcon: "i-lucide-lock",
              content: "Role-based access controls and token expirations.",
            },
            {
              get label() {
                return t("app.text.payment-invoices");
              },
              icon: "i-lucide-credit-card",
              trailingIcon: "i-lucide-external-link",
              content: "Subscription management, payment gateways, and tax history.",
            },
          ]}
          multiple
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
              icon: "i-lucide-check",
              content: "Can be opened and closed freely.",
            },
            {
              get label() {
                return t("app.text.disabled-section-2-disabled-true");
              },
              icon: "i-lucide-ban",
              disabled: true,
              content: "Should not be clickable or expandable.",
            },
            {
              get label() {
                return t("app.text.enabled-section-3");
              },
              icon: "i-lucide-check",
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
        "Rimelight alias: multiple={true}. All items share no `name` group so several can stay open.",
      render: () => (
        <RLAccordion
          multiple
          name="audit-multiple"
          items={[
            {
              get label() {
                return t("app.text.icons");
              },
              icon: "i-lucide-smile",
              content: "You have nothing to do, @nuxt/icon will handle it automatically.",
            },
            {
              get label() {
                return t("app.text.colors");
              },
              icon: "i-lucide-swatch-book",
              content: "Choose a primary and a neutral color from your Tailwind CSS theme.",
            },
            {
              get label() {
                return t("app.text.components");
              },
              icon: "i-lucide-box",
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
        "With multiple={false} (default) open items collapse each other through a shared HTML5 `name` attribute. Two accordions with different names must not interfere.",
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
          trailingIcon="i-lucide-plus"
          items={[
            {
              get label() {
                return t("app.text.global-plus-icon");
              },
              icon: "i-lucide-smile",
              content: "Uses the root trailingIcon.",
            },
            {
              get label() {
                return t("app.text.per-item-override-wins");
              },
              icon: "i-lucide-swatch-book",
              trailingIcon: "i-lucide-arrow-down",
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
        "item.class appends to the item node; item.ui merges per slot over the root ui. The second row label renders rose/black.",
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
              ui: { label: "text-rose-500 font-black" },
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
        "Maps to Nuxt's v-model / update:modelValue. External buttons drive the open item; clicking triggers reports through onChange.",
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
              onChange={(v) => {
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
      description:
        "Nuxt-shaped API. Two items start open; toggling one leaves the other open. The boolean multiple prop remains as a Rimelight alias.",
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
          valueKey="meta.key"
          labelKey="meta.title"
          defaultValue="k2"
          items={[
            {
              meta: {
                key: "k1",
                get title() {
                  return t("app.text.nested-one");
                },
              },
              content: "Resolved via dot paths.",
            },
            {
              meta: {
                key: "k2",
                get title() {
                  return t("app.text.nested-two-open");
                },
              },
              content: "Starts open.",
            },
          ]}
        />
      ),
    },
    {
      id: "render-slots",
      title: "leading / trailing / body / content Render Props (Nuxt slots)",
      description:
        "Maps to Nuxt's #leading #trailing #body #content slots. Custom badge leading, action trailing, markdown-ish body. The last item's fully custom content area starts from scratch (Nuxt semantics) so it carries its own px-4 to align with default body text.",
      render: () => (
        <RLAccordion
          leadingSlot={(item) => (
            <span class="shrink-0 size-5 rounded bg-primary/15 text-primary text-[10px] font-black flex items-center justify-center">
              {(item.label ?? "?").slice(0, 1)}
            </span>
          )}
          trailingSlot={(_item, index) => (
            <span class="shrink-0 ms-auto text-[10px] font-mono text-muted">#{index}</span>
          )}
          bodySlot={(item) => (
            <p class="text-sm">
              <strong>{item.label}</strong> — {item.content}
            </p>
          )}
          contentSlot={(item, index) =>
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
          bodySlot={(item) =>
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
      criterion: "Native HTML5 <details> and <summary> semantics",
      status: "pass",
      notes: "Zero JS required for basic open/close toggling.",
    },
    {
      criterion: "Single-item exclusive open grouping",
      status: "pass",
      notes:
        "Enforced by component state (toggleValue), not native grouping. No auto name: identical accordions previously merged into one native group and fought Solid state (all-closed). name renders only when explicitly passed.",
    },
    {
      criterion: "Keyboard navigation (Space/Enter to toggle, Tab to focus)",
      status: "pass",
      notes: "Native browser summary keyboard accessibility preserved.",
    },
    {
      criterion: "Disabled item state and accessibility",
      status: "pass",
      notes:
        "Theme disabled variant + aria-disabled; clicks (mouse and keyboard) are intercepted so disabled items never toggle.",
    },
    {
      criterion: "Design tokens & theme slot consistency",
      status: "pass",
      notes:
        "Slots: root, item, trigger, content, body, leadingIcon, trailingIcon, label. (header removed: a wrapper div would break native <summary> toggling.)",
    },
    {
      criterion: "No innerHTML / dangerouslySetInnerHTML in RLAccordion",
      status: "pass",
      notes:
        "Item label/content render as Solid children. (RLIcon itself uses innerHTML for SVG icons — tracked in the Icon audit.)",
    },
    {
      criterion: "No inline styles (CSP-safe, UnoCSS only)",
      status: "pass",
      notes:
        "No style prop or <style> in the component; all visuals resolve via accordion.theme.ts.",
    },
    {
      criterion: "No Uno/CSS class strings inside the component file",
      status: "pass",
      notes:
        "Zero cx/concatenation in the component: disabled flows through the theme variant, item.class folds into mergeUi as a ui.item entry, icons render via RLIcon.",
    },
    {
      criterion: "No hydration mismatch (keys + auto group name)",
      status: "pass",
      notes:
        "Data-derived name hash (no random/child-id consumption); render path uses plain tags + ternaries only — no <Show>/<Dynamic>/effects, no per-row memos. as still works via isolated <Dynamic> branches.",
    },
    {
      criterion: "Summary disclosure marker hidden cross-browser",
      status: "pass",
      notes:
        "Was webkit-only; added [&::marker]:hidden so Firefox shows no stray triangle offsetting the label.",
    },
    {
      criterion: "Controlled value (Nuxt: v-model / update:modelValue)",
      status: "pass",
      notes:
        "value + defaultValue + onChange implemented (Solid idiom per RLTabs). Item value falls back to index string. See controlled-value scenario.",
    },
    {
      criterion: "Non-collapsible single mode (Nuxt: collapsible={false})",
      status: "pass",
      notes: "Implemented; active trigger clicks are swallowed. See collapsible-false scenario.",
    },
    {
      criterion: "Slots: leading / trailing / content / body + per-item slot",
      status: "pass",
      notes:
        "Render props map to Nuxt #leading #trailing #content #body; slots record + item.slot maps to #{{ item.slot }}(-body). See render-slots + named-item-slot scenarios.",
    },
    {
      criterion: "Per-item class / ui overrides",
      status: "pass",
      notes:
        "item.class folds into mergeUi as ui.item; item.ui merges per slot over root ui. See per-item-ui-override scenario.",
    },
    {
      criterion: 'Single/multiple API shape (Nuxt: type="single" | "multiple")',
      status: "pass",
      notes:
        "type union implemented; boolean multiple kept as Rimelight alias (type wins when set).",
    },
    {
      criterion: "Unmount-on-hide semantics (Nuxt default true)",
      status: "pass",
      notes:
        "unmountOnHide implemented, defaults true via <Show>. See unmount-behavior matrix scenario.",
    },
    {
      criterion: "valueKey / labelKey + as prop",
      status: "pass",
      notes:
        "Both keys implemented with dot-path support; as renders via dynamic() (div default in items mode, details default in summary mode). See value-label-keys scenario.",
    },
    {
      criterion: "Solid 2 strict-mode clean (no STRICT_READ_UNTRACKED)",
      status: "pass",
      notes:
        "Sandbox items derivation moved into createMemo; component reads signals only in JSX/memos, handler snapshots via untrack().",
    },
    {
      criterion: "Audited component renders bare (no harness wrappers)",
      status: "pass",
      notes:
        "Scenario renders return <RLAccordion/> directly (fragments only for multi-root); shell cards excluded from this criterion.",
    },
    {
      criterion: "Disabled visuals match Nuxt theme",
      status: "warn",
      notes:
        "Uses opacity-50, Nuxt uses opacity-75. aria-disabled is now emitted; summary stays focusable (clicks blocked for mouse and keyboard).",
    },
    {
      criterion: "v-model naming (Nuxt: modelValue)",
      status: "warn",
      notes:
        "Intentional mapping: Solid codebase idiom is value + onChange (RLTabs precedent), not modelValue / update:modelValue. Document the mapping.",
    },
    {
      criterion: "Open/close keyframe animations (Nuxt content slot)",
      status: "warn",
      notes:
        "Not implemented: no accordion-down/up keyframes exist in the Uno preset. Needs preset-level keyframes (permission-gated CSS work).",
    },
  ],
};

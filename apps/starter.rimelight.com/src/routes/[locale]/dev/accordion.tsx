import { type Component } from "solid-js";
import AppLayout from "#layouts/AppLayout";
import { RLAccordion } from "@rimelight/ui/components/accordion/RLAccordion.tsx";
import type { AccordionItem } from "@rimelight/ui/components/accordion/accordion.ts";
import { AccordionSandbox } from "../../../components/dev/audits/accordion.audit.tsx";

const standardItems: AccordionItem[] = [
  {
    label: "Getting Started with Rimelight",
    icon: "i-lucide-rocket",
    content:
      "Rimelight provides pre-built components designed for high performance, zero-runtime overhead, and full accessibility."
  },
  {
    label: "Is SSR supported out of the box?",
    icon: "i-lucide-server",
    content:
      "Yes! RLAccordion renders semantic HTML5 <details> and <summary> elements which work seamlessly on the server and client with zero JS required for basic toggling."
  },
  {
    label: "Can I customize styling?",
    icon: "i-lucide-palette",
    content:
      "You can pass custom classes via the `class` prop or target individual internal slots with the `ui` prop."
  }
];

const iconItems: AccordionItem[] = [
  {
    label: "Account Security & 2FA",
    icon: "i-lucide-shield-check",
    trailingIcon: "i-lucide-lock",
    content: "Configure multi-factor authentication, security keys, and active login sessions."
  },
  {
    label: "Billing & Subscriptions",
    icon: "i-lucide-credit-card",
    trailingIcon: "i-lucide-external-link",
    content: "Manage payment methods, invoices, and active tier subscriptions."
  },
  {
    label: "Notification Preferences",
    icon: "i-lucide-bell",
    trailingIcon: "i-lucide-sliders",
    content: "Set push, email, and SMS alert preferences."
  }
];

const mixedDisabledItems: AccordionItem[] = [
  {
    label: "Active Item 1",
    icon: "i-lucide-check-circle",
    content: "This item is active and can be expanded or collapsed freely."
  },
  {
    label: "Disabled Item 2 (disabled: true)",
    icon: "i-lucide-ban",
    disabled: true,
    content: "This content should not be accessible via click."
  },
  {
    label: "Active Item 3",
    icon: "i-lucide-check-circle",
    content: "Another normal active item to verify grouping behavior around disabled items."
  }
];

export const DevAccordionPage: Component = () => {
  return (
    <AppLayout
      title="Accordion Component Audit"
      description="Audit and test page for Rimelight UI Accordion (RLAccordion) component"
    >
      <main class="container mx-auto px-4 py-10 flex flex-col gap-10 max-w-5xl">
        {/* Header */}
        <div class="border-b border-default pb-6">
          <div class="flex items-center gap-2 text-xs font-mono text-primary mb-2">
            <a href="/dev" class="hover:underline">
              dev
            </a>
            <span>/</span>
            <span class="text-highlighted">accordion</span>
          </div>
          <h1 class="text-3xl font-extrabold tracking-tight text-highlighted">
            Accordion Component Audit
          </h1>
          <p class="text-sm text-muted mt-2">
            Testing <code class="text-primary font-mono">RLAccordion.tsx</code> across interactive
            SolidJS islands, SSR rendering, styling variants, and edge cases.
          </p>
        </div>

        {/* Section 1: Interactive Playground */}
        <section class="flex flex-col gap-4">
          <div class="flex items-center gap-2">
            <span class="size-2.5 rounded-full bg-emerald-500" />
            <h2 class="text-xl font-bold text-highlighted">
              Interactive Playground (SolidJS Island)
            </h2>
          </div>
          <p class="text-xs text-muted">
            Test reactive prop updates dynamically: single vs multiple open mode, disabling all
            items, and custom icon overrides.
          </p>
          <AccordionSandbox />
        </section>

        {/* Section 2: Standard Multi-Item Accordion */}
        <section class="flex flex-col gap-4 pt-6 border-t border-default">
          <div class="flex items-center gap-2">
            <span class="size-2.5 rounded-full bg-blue-500" />
            <h2 class="text-xl font-bold text-highlighted">Standard Multi-Item Accordion</h2>
          </div>
          <p class="text-xs text-muted">
            Rendered with standard item schema and default chevron icons.
          </p>
          <div class="rounded-lg border border-default bg-default p-4">
            <RLAccordion items={standardItems} />
          </div>
        </section>

        {/* Section 3: Single-Item with Children Slot */}
        <section class="flex flex-col gap-4 pt-6 border-t border-default">
          <div class="flex items-center gap-2">
            <span class="size-2.5 rounded-full bg-purple-500" />
            <h2 class="text-xl font-bold text-highlighted">
              Single-Item Usage (Summary + Children Slot)
            </h2>
          </div>
          <p class="text-xs text-muted">
            Testing standalone single collapsible details item with arbitrary nested HTML content.
          </p>
          <div class="rounded-lg border border-default bg-default p-4">
            <RLAccordion summary="Click to expand detailed system information">
              <div class="p-3 rounded bg-elevated/40 border border-default text-xs space-y-2">
                <div class="flex justify-between">
                  <span class="text-muted">Component:</span>
                  <span class="font-mono text-highlighted">RLAccordion</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted">Renderer:</span>
                  <span class="font-mono text-highlighted">SolidJS SSR</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-muted">Underlying Elements:</span>
                  <span class="font-mono text-highlighted">
                    &lt;details&gt; &amp; &lt;summary&gt;
                  </span>
                </div>
              </div>
            </RLAccordion>
          </div>
        </section>

        {/* Section 4: Custom Leading & Trailing Icons */}
        <section class="flex flex-col gap-4 pt-6 border-t border-default">
          <div class="flex items-center gap-2">
            <span class="size-2.5 rounded-full bg-amber-500" />
            <h2 class="text-xl font-bold text-highlighted">Custom Leading &amp; Trailing Icons</h2>
          </div>
          <p class="text-xs text-muted">
            Verifying per-item custom leading icons and trailing action icons.
          </p>
          <div class="rounded-lg border border-default bg-default p-4">
            <RLAccordion items={iconItems} multiple />
          </div>
        </section>

        {/* Section 5: Disabled States */}
        <section class="flex flex-col gap-4 pt-6 border-t border-default">
          <div class="flex items-center gap-2">
            <span class="size-2.5 rounded-full bg-rose-500" />
            <h2 class="text-xl font-bold text-highlighted">Disabled State Handling</h2>
          </div>
          <p class="text-xs text-muted">
            Testing individually disabled items alongside active items.
          </p>
          <div class="rounded-lg border border-default bg-default p-4">
            <RLAccordion items={mixedDisabledItems} />
          </div>
        </section>

        {/* Section 6: Nested Accordions */}
        <section class="flex flex-col gap-4 pt-6 border-t border-default">
          <div class="flex items-center gap-2">
            <span class="size-2.5 rounded-full bg-cyan-500" />
            <h2 class="text-xl font-bold text-highlighted">Nested Accordions</h2>
          </div>
          <p class="text-xs text-muted">
            Testing accordion hierarchies and nested collapsible sections.
          </p>
          <div class="rounded-lg border border-default bg-default p-4">
            <RLAccordion summary="Parent Accordion Section">
              <div class="pt-2">
                <RLAccordion items={standardItems} />
              </div>
            </RLAccordion>
          </div>
        </section>
      </main>
    </AppLayout>
  );
};

export default DevAccordionPage;

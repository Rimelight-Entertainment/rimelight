import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLPageSection } from "@rimelight/ui/components/page-section/RLPageSection.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import type { ComponentAuditDefinition } from "./types";
import { t } from "@rimelight/i18n";

const VARIANTS = ["default", "hero", "cta"] as const;
const CTA_VARIANTS = ["solid", "outline", "soft", "subtle", "ghost"] as const;
const ORIENTATIONS = ["vertical", "horizontal"] as const;

const SectionPlaceholder = (props: { label: string }): JSX.Element => (
  <div class="flex min-h-48 w-full items-center justify-center rounded-xl border border-default bg-gradient-to-br from-primary/30 to-secondary/30 p-8">
    <span class="text-xs font-mono font-bold text-highlighted">{props.label}</span>
  </div>
);

export const PageSectionSandbox = (): JSX.Element => {
  const [variant, setVariant] = createSignal<(typeof VARIANTS)[number]>("default");
  const [ctaVariant, setCtaVariant] = createSignal<(typeof CTA_VARIANTS)[number]>("solid");
  const [orientation, setOrientation] = createSignal<(typeof ORIENTATIONS)[number]>("vertical");
  const [reverse, setReverse] = createSignal(false);
  const [hasIcon, setHasIcon] = createSignal(false);
  const [hasHeadline, setHasHeadline] = createSignal(true);
  const [hasDescription, setHasDescription] = createSignal(true);
  const [hasLinks, setHasLinks] = createSignal(true);
  const [hasBody, setHasBody] = createSignal(false);
  const [hasFooter, setHasFooter] = createSignal(false);
  const [hasBackground, setHasBackground] = createSignal(false);
  const [headline, setHeadline] = createSignal("Announcing Rimelight");
  const [title, setTitle] = createSignal("Build pages faster with sections");
  const [description, setDescription] = createSignal(
    "A flexible, responsive page section with header, body, footer, links, slots, and content-visibility optimization.",
  );

  return (
    <div class="flex flex-col gap-6">
      {/* Control Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">{t("app.text.variant")}</span>
          <For each={VARIANTS}>
            {(v) => (
              <button
                type="button"
                onClick={() => setVariant(v)}
                class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  variant() === v
                    ? "bg-primary text-inverted font-bold"
                    : "bg-elevated text-muted hover:text-highlighted border border-default"
                }`}
              >
                {v}
              </button>
            )}
          </For>
        </div>

        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">{t("app.text.cta-variant")}</span>
          <For each={CTA_VARIANTS}>
            {(v) => (
              <button
                type="button"
                disabled={variant() !== "cta"}
                onClick={() => setCtaVariant(v)}
                class={`px-2 py-0.5 rounded text-xs font-mono transition-colors disabled:opacity-40 ${
                  ctaVariant() === v && variant() === "cta"
                    ? "bg-primary text-inverted font-bold"
                    : "bg-elevated text-muted hover:text-highlighted border border-default"
                }`}
              >
                {v}
              </button>
            )}
          </For>
        </div>

        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">{t("app.text.orientation")}</span>
          <For each={ORIENTATIONS}>
            {(o) => (
              <button
                type="button"
                onClick={() => setOrientation(o)}
                class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  orientation() === o
                    ? "bg-primary text-inverted font-bold"
                    : "bg-elevated text-muted hover:text-highlighted border border-default"
                }`}
              >
                {o}
              </button>
            )}
          </For>
        </div>

        <div class="flex items-center gap-3 flex-wrap">
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={reverse()}
              onInput={(e) => setReverse(e.currentTarget.checked)}
              onChange={(e) => setReverse(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.reverse")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hasIcon()}
              onInput={(e) => setHasIcon(e.currentTarget.checked)}
              onChange={(e) => setHasIcon(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.icon")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hasHeadline()}
              onInput={(e) => setHasHeadline(e.currentTarget.checked)}
              onChange={(e) => setHasHeadline(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.headline")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hasDescription()}
              onInput={(e) => setHasDescription(e.currentTarget.checked)}
              onChange={(e) => setHasDescription(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.description")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hasLinks()}
              onInput={(e) => setHasLinks(e.currentTarget.checked)}
              onChange={(e) => setHasLinks(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.links")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hasBody()}
              onInput={(e) => setHasBody(e.currentTarget.checked)}
              onChange={(e) => setHasBody(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.body")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hasFooter()}
              onInput={(e) => setHasFooter(e.currentTarget.checked)}
              onChange={(e) => setHasFooter(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.footer")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hasBackground()}
              onInput={(e) => setHasBackground(e.currentTarget.checked)}
              onChange={(e) => setHasBackground(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.background")}</span>
          </label>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-muted">{t("app.text.headline-4063")}</span>
          <input
            type="text"
            value={headline()}
            onInput={(e) => setHeadline(e.currentTarget.value)}
            class="px-2 py-1 rounded bg-elevated border border-default text-highlighted text-xs w-40"
          />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-muted">{t("app.text.title")}</span>
          <input
            type="text"
            value={title()}
            onInput={(e) => setTitle(e.currentTarget.value)}
            class="px-2 py-1 rounded bg-elevated border border-default text-highlighted text-xs w-56"
          />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-muted">{t("app.text.desc")}</span>
          <input
            type="text"
            value={description()}
            onInput={(e) => setDescription(e.currentTarget.value)}
            class="px-2 py-1 rounded bg-elevated border border-default text-highlighted text-xs w-72"
          />
        </div>
      </div>

      {/* Preview (bare) */}
      <div class="rounded-xl border border-default overflow-hidden">
        <RLPageSection
          layout={variant()}
          orientation={orientation()}
          reverse={reverse()}
          title={title()}
          {...(variant() === "cta" ? { ctaVariant: ctaVariant() } : {})}
          {...(hasIcon() ? { icon: "rocket" } : {})}
          {...(hasHeadline() ? { headline: headline() } : {})}
          {...(hasDescription() ? { description: description() } : {})}
          {...(hasLinks()
            ? {
                links: [
                  { label: t("app.text.get-started-90e4"), color: "primary" },
                  { label: t("app.text.learn-more"), color: "neutral", variant: "subtle" },
                ],
              }
            : {})}
          {...(hasBody() ? { bodySlot: <SectionPlaceholder label="Body region" /> } : {})}
          {...(hasFooter()
            ? {
                footerSlot: (
                  <p class="text-xs text-muted">
                    Footer region — supporting content and disclaimers.
                  </p>
                ),
              }
            : {})}
          {...(hasBackground()
            ? {
                backgroundSlot: (
                  <div class="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-secondary/10" />
                ),
              }
            : {})}
          {...(orientation() === "horizontal"
            ? { children: <SectionPlaceholder label="Default slot" /> }
            : {})}
        />
      </div>
    </div>
  );
};

export const pageSectionAudit: ComponentAuditDefinition = {
  id: "page-section",
  name: "PageSection",
  category: "Layout",
  status: "Passed",
  description:
    "A responsive full-width page section with default, hero, and CTA layouts, vertical/horizontal orientations, header, body, footer, link buttons, background, and rich slots (leading, headline, title, description, links, body).",
  importPath: "@rimelight/ui/components/page-section/RLPageSection.tsx",
  renderSandbox: () => <PageSectionSandbox />,
  testScenarios: [
    {
      id: "variants-matrix",
      get title() {
        return t("app.text.all-variants-default-hero-cta");
      },
      description:
        "default uses an h2 title, hero uses an h1 with a larger scale, and cta wraps the section in a rounded surface that pairs with ctaVariant.",
      render: () => (
        <div class="flex flex-col gap-2">
          <RLPageSection
            layout="default"
            orientation="vertical"
            headline="Default"
            title={"Default variant section"}
            description="Standard section spacing with an h2 title and centered header."
            links={[
              {
                get label() {
                  return t("app.text.primary-action");
                },
              },
              {
                get label() {
                  return t("app.text.secondary");
                },
                color: "neutral",
                variant: "subtle",
              },
            ]}
          />
          <RLPageSection
            layout="hero"
            orientation="vertical"
            icon="sparkles"
            headline="Hero"
            title={"Hero variant section"}
            description="Large type scale with an h1 title and generous vertical rhythm."
            links={[
              {
                get label() {
                  return t("app.text.get-started");
                },
              },
            ]}
          />
          <RLPageSection
            layout="cta"
            ctaVariant="solid"
            orientation="vertical"
            title={"CTA variant section"}
            description="Rounded, high-contrast surface for conversion-focused calls to action."
            links={[
              {
                get label() {
                  return t("app.text.talk-to-sales");
                },
                color: "neutral",
              },
            ]}
          />
        </div>
      ),
    },
    {
      id: "cta-variants",
      get title() {
        return t("app.text.cta-variants-solid-outline-soft-subtle-naked");
      },
      description:
        "The ctaVariant prop controls the CTA surface treatment and description contrast.",
      render: () => (
        <div class="flex flex-col gap-2">
          <For each={CTA_VARIANTS}>
            {(v) => (
              <RLPageSection
                layout="cta"
                ctaVariant={v}
                orientation="horizontal"
                title={`CTA: ${v}`}
                description={`Rendered with ctaVariant="${v}".`}
                links={[
                  {
                    get label() {
                      return t("app.text.action");
                    },
                  },
                ]}
              >
                <SectionPlaceholder label={`cta ${v}`} />
              </RLPageSection>
            )}
          </For>
        </div>
      ),
    },
    {
      id: "orientations-and-reverse",
      get title() {
        return t("app.text.orientation-reverse");
      },
      description:
        "Vertical stacks the header over the default slot; horizontal pairs the content wrapper with the default slot in a two-column grid. reverse flips their order.",
      render: () => (
        <div class="flex flex-col gap-2">
          <RLPageSection
            orientation="horizontal"
            title={"Horizontal — content left, slot right"}
            description="The wrapper sits beside the default slot on large screens."
            links={[
              {
                get label() {
                  return t("app.text.learn-more");
                },
              },
            ]}
          >
            <SectionPlaceholder label="Slot (right)" />
          </RLPageSection>
          <RLPageSection
            orientation="horizontal"
            reverse
            title={"Horizontal reverse — slot left"}
            description="reverse swaps the order of the wrapper and the default slot."
            links={[
              {
                get label() {
                  return t("app.text.learn-more");
                },
              },
            ]}
          >
            <SectionPlaceholder label="Slot (left)" />
          </RLPageSection>
        </div>
      ),
    },
    {
      id: "header-and-icon",
      get title() {
        return t("app.text.header-icon-headline-description");
      },
      description:
        "The leading icon, headline, title, and description compose the default header when no header slot is provided.",
      render: () => (
        <RLPageSection
          orientation="vertical"
          icon="shield"
          headline="Security first"
          title={"Everything you need to ship with confidence"}
          description="Icon, headline, title, and description all resolve through the default header with theme tokens."
        />
      ),
    },
    {
      id: "links-and-footer",
      get title() {
        return t("app.text.links-footer-regions");
      },
      description:
        "links render as RLButton with size='lg'; footer renders custom content when links are not enough.",
      render: () => (
        <RLPageSection
          orientation="vertical"
          title={"Links and footer"}
          description="The links array renders buttons and footer replaces them when provided."
          links={[
            {
              get label() {
                return t("app.text.primary");
              },
              color: "primary",
            },
            {
              get label() {
                return t("app.text.secondary");
              },
              color: "neutral",
              variant: "subtle",
            },
          ]}
          footerSlot={<p class="text-xs text-muted">{"Custom footer slot content."}</p>}
        />
      ),
    },
    {
      id: "background-and-content-visibility",
      get title() {
        return t("app.text.background-layer-content-visibility");
      },
      description:
        "background renders an absolutely positioned, overflow-hidden layer behind content; contentVisibility defers offscreen painting.",
      render: () => (
        <RLPageSection
          layout="hero"
          orientation="vertical"
          title={"Background and content-visibility"}
          description="The background slot is mounted behind the section container at -z-1."
          backgroundSlot={
            <div class="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20" />
          }
          contentVisibility="auto"
          containIntrinsicSize="auto 500px"
        />
      ),
    },
    {
      id: "custom-slots",
      get title() {
        return t("app.text.custom-slot-parity");
      },
      description:
        "headerSlot, leadingSlot, titleSlot, descriptionSlot, bodySlot, footerSlot, and actionSlot allow full template replacement.",
      render: () => (
        <RLPageSection
          orientation="vertical"
          headerSlot={
            <div class="flex flex-col items-center gap-2 text-center">
              <span class="text-3xl" aria-hidden="true">
                🌌
              </span>
              <h2 class="text-3xl font-bold text-highlighted">{"Custom header slot"}</h2>
              <p class="text-muted">{"The header slot replaces the default header entirely."}</p>
            </div>
          }
          bodySlot={<SectionPlaceholder label="Body slot" />}
          footerSlot={
            <RLButton variant="outline" icon="arrow-right" trailingIcon="arrow-right">
              Custom footer button
            </RLButton>
          }
        />
      ),
    },
    {
      id: "header-slot",
      title: "Header slot",
      description:
        "headerSlot replaces the whole header, including the leading icon, headline, title, and description.",
      render: () => (
        <RLPageSection
          orientation="vertical"
          title="Default title"
          headerSlot={<p class="text-muted">{"The header slot replaces the default header."}</p>}
        />
      ),
    },
    {
      id: "background-slot",
      title: "Background slot",
      description: "backgroundSlot renders behind the container as an absolutely positioned layer.",
      render: () => (
        <RLPageSection
          orientation="vertical"
          title="Background slot"
          backgroundSlot={<div class="size-full bg-elevated/50" />}
        />
      ),
    },
    {
      id: "leading-slot",
      title: "Leading slot",
      description: "leadingSlot replaces the icon in the leading position.",
      render: () => (
        <RLPageSection
          orientation="vertical"
          title="Leading slot"
          leadingSlot={
            <span class="text-3xl" aria-hidden="true">
              {"🌌"}
            </span>
          }
        />
      ),
    },
    {
      id: "title-slot",
      title: "Title slot",
      description: "titleSlot replaces the title text.",
      render: () => (
        <RLPageSection
          orientation="vertical"
          title="Ignored title"
          titleSlot={<span>{"Custom title slot"}</span>}
        />
      ),
    },
    {
      id: "description-slot",
      title: "Description slot",
      description: "descriptionSlot replaces the description text.",
      render: () => (
        <RLPageSection
          orientation="vertical"
          title="Description slot"
          description="Ignored description"
          descriptionSlot={<span>{"Custom description slot"}</span>}
        />
      ),
    },
    {
      id: "body-slot",
      title: "Body slot",
      description: "bodySlot renders between the header and the footer.",
      render: () => (
        <RLPageSection
          orientation="vertical"
          title="Body slot"
          bodySlot={<SectionPlaceholder label="Body slot" />}
        />
      ),
    },
    {
      id: "footer-slot",
      title: "Footer slot",
      description: "footerSlot replaces the footer, including links and actionSlot.",
      render: () => (
        <RLPageSection
          orientation="vertical"
          title="Footer slot"
          footerSlot={<SectionPlaceholder label="Footer slot" />}
        />
      ),
    },
    {
      id: "action-slot",
      title: "Action slot",
      description: "actionSlot renders after links in the footer.",
      render: () => (
        <RLPageSection
          orientation="vertical"
          title="Action slot"
          links={[{ label: "Primary link", href: "/" }]}
          actionSlot={<span>{"Action slot"}</span>}
        />
      ),
    },
    {
      id: "default-children",
      title: "Default slot (children)",
      description: "Children render in the default slot after the header, body, and footer.",
      render: () => (
        <RLPageSection orientation="vertical" title="Default slot (children)">
          <SectionPlaceholder label="Children" />
        </RLPageSection>
      ),
    },
    {
      id: "polymorphic-as",
      get title() {
        return t("app.text.polymorphic-as-prop");
      },
      get description() {
        return t("app.text.root-renders-the-configured-element-defaults-to");
      },
      render: () => (
        <RLPageSection
          as="article"
          orientation="vertical"
          headline="Boxed content"
          title={"Rendered as an article element"}
          description="Inspect the DOM to confirm the root tag is <article>."
        />
      ),
    },
  ],
  checklist: [
    {
      criterion: "Nuxt UI v4 PageSection parity",
      status: "pass",
      notes:
        "Supports as, layout (default, hero, cta), ctaVariant, headline, icon, title, description, links, orientation, reverse, ui, class, contentVisibility, containIntrinsicSize, and update:open-style slot parity.",
    },
    {
      criterion:
        "Slot/region parity (background, header, leading, headline, title, description, body, footer, action)",
      status: "pass",
      notes:
        "Every region can be replaced with a slot element; slots win over prop-based defaults.",
    },
    {
      criterion: "Polymorphic as prop",
      status: "pass",
      notes: "Root renders props.as ?? 'section'; the hero variant promotes the title to an h1.",
    },
    {
      criterion: "Orientation & reverse layout",
      status: "pass",
      notes:
        "horizontal enables a two-column grid (content + default slot); reverse flips ordering via compound variants per section variant.",
    },
    {
      criterion: "Content visibility optimization",
      status: "pass",
      notes:
        "contentVisibility='auto' applies [content-visibility:auto] with a contain-intrinsic-size custom property fallback.",
    },
    {
      criterion: "CSP-safe styling (UnoCSS only)",
      status: "pass",
      notes:
        "All visual styling lives in page-section.theme.ts. The only inline style is a CSS custom property for containIntrinsicSize, which is CSP-safe.",
    },
    {
      criterion: "No innerHTML / dangerouslySetInnerHTML",
      status: "pass",
      notes: "Pure Solid JSX reactive rendering and children() slot resolution.",
    },
    {
      criterion: "No hydration mismatches",
      status: "pass",
      notes: "Deterministic tag and class resolution via createMemo; no ids or random values.",
    },
    {
      criterion: "Audited component renders bare (no harness wrappers)",
      status: "pass",
      notes: "Scenario renders return <RLPageSection/> directly.",
    },
  ],
};

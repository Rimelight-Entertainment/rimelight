import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLCard } from "@rimelight/ui/components/card/RLCard.tsx";
import type { ComponentAuditDefinition } from "./types";
import { t } from "@rimelight/i18n";

const VARIANTS = ["outline", "solid", "soft", "subtle"] as const;

export const CardSandbox = (): JSX.Element => {
  const [variant, setVariant] = createSignal<(typeof VARIANTS)[number]>("outline");
  const [hasTitle, setHasTitle] = createSignal(true);
  const [hasDescription, setHasDescription] = createSignal(true);
  const [hasBody, setHasBody] = createSignal(true);
  const [hasFooter, setHasFooter] = createSignal(true);
  const [hasMedia, setHasMedia] = createSignal(false);
  const [isOverlay, setIsOverlay] = createSignal(false);
  const [isLink, setIsLink] = createSignal(false);
  const [title, setTitle] = createSignal("Card Title");
  const [description, setDescription] = createSignal("A concise description of the card content.");

  return (
    <div class="flex flex-col gap-6">
      {/* Controls Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        {/* Variants */}
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

        {/* Toggles */}
        <div class="flex items-center gap-3 flex-wrap">
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={hasTitle()}
              onInput={(e) => setHasTitle(e.currentTarget.checked)}
              onChange={(e) => setHasTitle(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.title-768e")}</span>
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
              checked={hasMedia()}
              onInput={(e) => setHasMedia(e.currentTarget.checked)}
              onChange={(e) => setHasMedia(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.media")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isOverlay()}
              onInput={(e) => setIsOverlay(e.currentTarget.checked)}
              onChange={(e) => setIsOverlay(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.overlay")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={isLink()}
              onInput={(e) => setIsLink(e.currentTarget.checked)}
              onChange={(e) => setIsLink(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.link-card")}</span>
          </label>
        </div>

        {/* Title & Description inputs */}
        <div class="flex items-center gap-2">
          <span class="text-muted">{t("app.text.title")}</span>
          <input
            type="text"
            value={title()}
            onInput={(e) => setTitle(e.currentTarget.value)}
            class="px-2 py-1 rounded bg-elevated border border-default text-highlighted text-xs w-36"
          />
        </div>
        <div class="flex items-center gap-2">
          <span class="text-muted">{t("app.text.desc")}</span>
          <input
            type="text"
            value={description()}
            onInput={(e) => setDescription(e.currentTarget.value)}
            class="px-2 py-1 rounded bg-elevated border border-default text-highlighted text-xs w-56"
          />
        </div>
      </div>

      {/* Preview Area */}
      <div class="max-w-md w-full">
        <RLCard
          variant={variant()}
          title={hasTitle() ? title() : undefined}
          description={hasDescription() ? description() : undefined}
          mediaSrc={hasMedia() ? "https://picsum.photos/seed/rimelight/600/300" : undefined}
          overlaySlot={
            isOverlay() ? <span class="text-sm">{t("app.text.overlay")}</span> : undefined
          }
          href={isLink() ? "#card-action" : undefined}
          footerSlot={
            hasFooter() ? (
              <span class="text-xs text-muted">{t("app.text.card-footer-content")}</span>
            ) : undefined
          }
        >
          {hasBody() ? (
            <p class="text-sm text-muted">
              Cards group related content and actions about a single subject.
            </p>
          ) : undefined}
        </RLCard>
      </div>
    </div>
  );
};

export const cardAudit: ComponentAuditDefinition = {
  id: "card",
  name: "Card",
  category: "Data Display",
  status: "Auditing",
  description:
    "Display content in a structured container with header, title, description, body, footer, media, and overlay slots.",
  importPath: "@rimelight/ui/components/card/RLCard.tsx",
  renderSandbox: () => <CardSandbox />,
  testScenarios: [
    {
      id: "variants-matrix",
      get title() {
        return t("app.text.all-visual-variants");
      },
      get description() {
        return t("app.text.outline-default-solid-soft-and-subtle-visual-var");
      },
      render: () => (
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <For each={VARIANTS}>
            {(v) => (
              <RLCard
                variant={v}
                title={`Variant: ${v}`}
                description={`This card demonstrates the ${v} variant.`}
                footerSlot={<span class="text-xs text-muted">{"Footer slot"}</span>}
              >
                <p class="text-sm">Main content area for variant {v}.</p>
              </RLCard>
            )}
          </For>
        </div>
      ),
    },
    {
      id: "header-title-description",
      get title() {
        return t("app.text.header-title-description-compositions");
      },
      description:
        "Title-only, description-only, title with description, and custom header slot override.",
      render: () => (
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RLCard title={"Title Only Card"}>
            <p class="text-sm text-muted">{"Card with a title header only."}</p>
          </RLCard>
          <RLCard description="Description only without a title heading.">
            <p class="text-sm text-muted">{"Body content follows the description."}</p>
          </RLCard>
          <RLCard title={"Complete Header"} description="Subtitle explaining the context.">
            <p class="text-sm text-muted">{"Both title and description rendered in header."}</p>
          </RLCard>
          <RLCard
            headerSlot={
              <div class="flex items-center justify-between">
                <span class="font-semibold text-sm text-highlighted">{"Custom Header Slot"}</span>
                <span class="text-xs px-2 py-0.5 rounded bg-primary/10 text-primary font-mono">
                  Badge
                </span>
              </div>
            }
          >
            <p class="text-sm text-muted">
              {"Header slot replaces default title/description layout."}
            </p>
          </RLCard>
        </div>
      ),
    },
    {
      id: "slots-and-structure",
      get title() {
        return t("app.text.slots-structural-customization");
      },
      description:
        "Demonstrating headerSlot, titleSlot, descriptionSlot, bodySlot, and footerSlot.",
      render: () => (
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RLCard
            titleSlot={<h3 class="text-base font-bold text-primary">{"Custom Title Slot"}</h3>}
            descriptionSlot={
              <p class="text-xs italic text-muted">{"Custom description slot styling"}</p>
            }
            footerSlot={
              <div class="flex items-center justify-end gap-2">
                <button
                  type="button"
                  class="px-3 py-1 rounded text-xs bg-elevated border border-default text-highlighted hover:bg-elevated/80"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  class="px-3 py-1 rounded text-xs bg-primary text-inverted font-medium hover:bg-primary/90"
                >
                  Submit
                </button>
              </div>
            }
          >
            <p class="text-sm text-muted">
              {"Custom slots provide fine-grained control over layout."}
            </p>
          </RLCard>
          <RLCard
            bodySlot={
              <div class="space-y-2">
                <div class="h-4 bg-elevated rounded w-3/4 animate-pulse" />
                <div class="h-4 bg-elevated rounded w-1/2 animate-pulse" />
              </div>
            }
            footerSlot={<span class="text-xs text-muted">{"Loading skeleton state"}</span>}
          />
        </div>
      ),
    },
    {
      id: "media-and-overlay",
      get title() {
        return t("app.text.media-overlay-modes");
      },
      description:
        "Card with top media image, and card with text overlaid on top of a media background.",
      render: () => (
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <RLCard
            mediaSrc="https://picsum.photos/seed/cardmedia/600/250"
            title={"Card with Media"}
            description="Media image displayed at the top."
            footerSlot={<span class="text-xs text-muted">{"Media Card Footer"}</span>}
          >
            <p class="text-sm text-muted">{"Standard layout with media header."}</p>
          </RLCard>
          <RLCard
            mediaSrc="https://picsum.photos/seed/cardoverlay/600/350"
            overlaySlot={
              <div class="flex flex-col justify-end h-full p-4 text-on-scrim">
                <h3 class="text-base font-bold">{"Overlay Title"}</h3>
                <p class="text-sm text-on-scrim/90">
                  {"Text content layered directly over the background image."}
                </p>
              </div>
            }
          />
          <RLCard
            mediaSlot={
              <div class="h-24 bg-elevated flex items-center justify-center text-sm text-muted">
                {"Custom media slot"}
              </div>
            }
            title={"Custom Media Slot"}
            description="Media area replaced by mediaSlot."
          >
            <p class="text-sm text-muted">{"Body content beside the custom media."}</p>
          </RLCard>
        </div>
      ),
    },
    {
      id: "polymorphism-and-links",
      get title() {
        return t("app.text.polymorphism-link-cards");
      },
      description:
        "Renders as semantic HTML tags (section, article) or clickable link (a) without altering card styling.",
      render: () => (
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <RLCard as="article" title={"Article Element"} description="Semantic <article> root tag.">
            <p class="text-sm text-muted">{"Inspect DOM to see article tag."}</p>
          </RLCard>
          <RLCard as="section" title={"Section Element"} description="Semantic <section> root tag.">
            <p class="text-sm text-muted">{"Inspect DOM to see section tag."}</p>
          </RLCard>
          <RLCard
            href="#card-link"
            title={"Link Card"}
            description="Renders as <a> with identical card styling."
            footerSlot={
              <span class="text-xs text-primary font-medium">Click to navigate &rarr;</span>
            }
          >
            <p class="text-sm text-muted">
              Renders as semantic anchor without altering border or cosmetics.
            </p>
          </RLCard>
        </div>
      ),
    },
    {
      id: "custom-ui-and-theme",
      get title() {
        return t("app.text.custom-ui-slot-styling");
      },
      get description() {
        return t("app.text.fine-grained-styling-overrides-via-the-ui-prop-o");
      },
      render: () => (
        <RLCard
          title={"Custom Styled Card"}
          description="Custom padding, font styling, and border treatment."
          footerSlot={<span class="text-xs font-mono text-primary">{"Status: Active"}</span>}
          ui={{
            root: "border-2 border-primary/40 shadow-lg",
            header: "bg-primary/5 p-6",
            title: "text-lg font-black tracking-wide text-primary",
            description: "text-xs italic text-muted",
            body: "p-6",
            footer: "bg-elevated/40 px-6 py-3 border-t border-default",
          }}
        >
          <p class="text-sm text-muted">
            The `ui` prop allows overriding classes for `root`, `header`, `title`, `description`,
            `body`, and `footer`.
          </p>
        </RLCard>
      ),
    },
  ],
  checklist: [
    {
      criterion: "API and slot pattern parity",
      status: "pass",
      notes:
        "Full support for as, title, description, variant (solid, outline, soft, subtle), ui, class, header, titleSlot, descriptionSlot, body, bodySlot, footer, footerSlot, media, mediaSrc, and overlay.",
    },
    {
      criterion: "Polymorphism and interactive links",
      status: "pass",
      notes:
        "Supports dynamic rendering with `as` prop (article, section, div, a) and interactive card link mode when href is passed.",
    },
    {
      criterion: "Full WAI-ARIA compliance",
      status: "pass",
      notes:
        "Automatic aria-labelledby and aria-describedby linking title/description IDs, with support for explicit aria-label and role.",
    },
    {
      criterion: "Theme token resolution",
      status: "pass",
      notes: "Theme classes live solely in card.theme.ts; zero inline styles.",
    },
    {
      criterion: "No innerHTML / dangerouslySetInnerHTML",
      status: "pass",
      notes: "Pure Solid JSX reactive rendering.",
    },
    {
      criterion: "No hydration mismatches",
      status: "pass",
      notes: "Deterministic unique ID generation and dynamic tag resolution.",
    },
    {
      criterion: "Audited components render bare",
      status: "pass",
      notes:
        "Component instances in audit scenarios are rendered directly with no harness wrappers.",
    },
  ],
};

import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLCarousel } from "@rimelight/ui/components/carousel/RLCarousel.tsx";
import type { RLCarouselHandle } from "@rimelight/ui/components/carousel/carousel.types.ts";
import type { ComponentAuditDefinition } from "./types";
import { t } from "@rimelight/i18n";

const SAMPLE_ITEMS: string[] = [
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600&auto=format&fit=crop&q=80",
];

const slideSrc = (item: unknown): string => (typeof item === "string" ? item : "");

export const CarouselSandbox = (): JSX.Element => {
  const [arrows, setArrows] = createSignal(true);
  const [dots, setDots] = createSignal(true);
  const [controls, setControls] = createSignal<"outside" | "inside">("inside");
  const [loop, setLoop] = createSignal(false);
  const [autoplay, setAutoplay] = createSignal(false);
  const [fade, setFade] = createSignal(false);
  const [orientation, setOrientation] = createSignal<"horizontal" | "vertical">("horizontal");
  const [itemCount, setItemCount] = createSignal(5);

  const activeItems = () => SAMPLE_ITEMS.slice(0, itemCount());

  return (
    <div class="flex flex-col gap-6">
      {/* Controls Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        {/* Orientation */}
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">{t("app.text.orientation")}</span>
          <button
            type="button"
            onClick={() => setOrientation("horizontal")}
            class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
              orientation() === "horizontal"
                ? "bg-primary text-inverted font-bold"
                : "bg-elevated text-muted hover:text-highlighted border border-default"
            }`}
          >
            horizontal
          </button>
          <button
            type="button"
            onClick={() => setOrientation("vertical")}
            class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
              orientation() === "vertical"
                ? "bg-primary text-inverted font-bold"
                : "bg-elevated text-muted hover:text-highlighted border border-default"
            }`}
          >
            vertical
          </button>
        </div>

        {/* Controls Placement */}
        <div class="flex items-center gap-1.5 flex-wrap">
          <span class="text-muted mr-1">{t("app.text.controls")}</span>
          <button
            type="button"
            onClick={() => setControls("inside")}
            class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
              controls() === "inside"
                ? "bg-primary text-inverted font-bold"
                : "bg-elevated text-muted hover:text-highlighted border border-default"
            }`}
          >
            inside
          </button>
          <button
            type="button"
            onClick={() => setControls("outside")}
            class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
              controls() === "outside"
                ? "bg-primary text-inverted font-bold"
                : "bg-elevated text-muted hover:text-highlighted border border-default"
            }`}
          >
            outside
          </button>
        </div>

        {/* Toggles */}
        <div class="flex items-center gap-3 flex-wrap">
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={arrows()}
              onInput={(e) => setArrows(e.currentTarget.checked)}
              onChange={(e) => setArrows(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.arrows")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={dots()}
              onInput={(e) => setDots(e.currentTarget.checked)}
              onChange={(e) => setDots(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.dots-4b44")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={loop()}
              onInput={(e) => setLoop(e.currentTarget.checked)}
              onChange={(e) => setLoop(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.loop")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={autoplay()}
              onInput={(e) => setAutoplay(e.currentTarget.checked)}
              onChange={(e) => setAutoplay(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.autoplay")}</span>
          </label>
          <label class="flex items-center gap-1.5 cursor-pointer">
            <input
              type="checkbox"
              checked={fade()}
              onInput={(e) => setFade(e.currentTarget.checked)}
              onChange={(e) => setFade(e.currentTarget.checked)}
              class="rounded border-default"
            />
            <span class="text-muted">{t("app.text.fade")}</span>
          </label>
        </div>

        {/* Items count */}
        <div class="flex items-center gap-1.5">
          <span class="text-muted">{t("app.text.items")}</span>
          <For each={[3, 4, 5, 6]}>
            {(n) => (
              <button
                type="button"
                onClick={() => setItemCount(n)}
                class={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
                  itemCount() === n
                    ? "bg-primary text-inverted font-bold"
                    : "bg-elevated text-muted hover:text-highlighted border border-default"
                }`}
              >
                {n}
              </button>
            )}
          </For>
        </div>
      </div>

      {/* Preview Area */}
      <div class="max-w-xs w-full mx-auto">
        <RLCarousel
          items={activeItems()}
          arrows={arrows()}
          dots={dots()}
          controls={controls()}
          loop={loop()}
          autoplay={autoplay() ? { delay: 2500 } : false}
          fade={fade()}
          orientation={orientation()}
          ui={orientation() === "vertical" ? { container: "h-[320px]" } : undefined}
          class="w-full"
        >
          {({ item }: { item: unknown }) => (
            <img
              src={slideSrc(item)}
              alt={t("app.text.slide")}
              width="320"
              height="320"
              class="rounded-xl object-cover w-full aspect-square border border-default shadow-sm"
            />
          )}
        </RLCarousel>
      </div>
    </div>
  );
};

export const ThumbnailsScenario = (): JSX.Element => {
  let carouselRef: RLCarouselHandle | undefined;
  const [activeIndex, setActiveIndex] = createSignal(0);

  return (
    <div class="flex flex-col gap-4 max-w-xs mx-auto">
      <RLCarousel
        ref={(handle) => (carouselRef = handle)}
        items={SAMPLE_ITEMS}
        arrows
        class="w-full"
        onSelect={(i) => setActiveIndex(i)}
      >
        {({ item }: { item: unknown }) => (
          <img
            src={slideSrc(item)}
            alt={t("app.text.product-visual")}
            width="320"
            height="320"
            class="rounded-xl object-cover w-full aspect-square border border-default shadow-sm"
          />
        )}
      </RLCarousel>

      <div class="flex gap-2 justify-between">
        <For each={SAMPLE_ITEMS}>
          {(item, i) => (
            <button
              type="button"
              class={`size-11 rounded-xl overflow-hidden border-2 transition-all cursor-pointer ${
                activeIndex() === i()
                  ? "border-primary opacity-100 scale-105 shadow-md ring-2 ring-primary/30"
                  : "border-transparent opacity-50 hover:opacity-100"
              }`}
              onClick={() => {
                setActiveIndex(i());
                carouselRef?.scrollTo(i());
              }}
            >
              <img src={item} alt="" class="w-full h-full object-cover" />
            </button>
          )}
        </For>
      </div>
    </div>
  );
};

export const carouselAudit: ComponentAuditDefinition = {
  id: "carousel",
  name: "Carousel",
  category: "Data Display",
  status: "Auditing",
  description:
    "A carousel with motion, touch swipe gestures, keyboard navigation, arrows, dots, and plugin extensions.",
  importPath: "@rimelight/ui/components/carousel/RLCarousel.tsx",
  renderSandbox: () => <CarouselSandbox />,
  testScenarios: [
    {
      id: "basic-items",
      get title() {
        return t("app.text.basic-items-carousel");
      },
      get description() {
        return t("app.text.simple-image-carousel-rendering-an-array-of-item");
      },
      render: () => (
        <div class="max-w-xs mx-auto">
          <RLCarousel items={SAMPLE_ITEMS.slice(0, 4)}>
            {({ item }: { item: unknown }) => (
              <img
                src={slideSrc(item)}
                alt={"Item"}
                width="320"
                height="320"
                class="rounded-xl object-cover w-full aspect-square border border-default shadow-sm"
              />
            )}
          </RLCarousel>
        </div>
      ),
    },
    {
      id: "arrows-and-dots",
      get title() {
        return t("app.text.arrows-dots-navigation");
      },
      get description() {
        return t("app.text.carousel-with-customized-prev-next-buttons-and-p");
      },
      render: () => (
        <div class="max-w-xs mx-auto">
          <RLCarousel items={SAMPLE_ITEMS.slice(0, 4)} arrows dots>
            {({ item }: { item: unknown }) => (
              <img
                src={slideSrc(item)}
                alt={"Item"}
                width="320"
                height="320"
                class="rounded-xl object-cover w-full aspect-square border border-default shadow-sm"
              />
            )}
          </RLCarousel>
        </div>
      ),
    },
    {
      id: "controls-inside",
      get title() {
        return t("app.text.controls-inside-viewport");
      },
      get description() {
        return t("app.text.arrows-and-pagination-dots-positioned-inside-the");
      },
      render: () => (
        <div class="max-w-xs mx-auto">
          <RLCarousel items={SAMPLE_ITEMS.slice(0, 4)} arrows dots controls="inside">
            {({ item }: { item: unknown }) => (
              <img
                src={slideSrc(item)}
                alt={"Inside Controls Item"}
                width="320"
                height="320"
                class="rounded-xl object-cover w-full aspect-square border border-default shadow-sm"
              />
            )}
          </RLCarousel>
        </div>
      ),
    },
    {
      id: "multi-items-basis",
      get title() {
        return t("app.text.multiple-items-in-view-basis");
      },
      get description() {
        return t("app.text.displaying-3-items-simultaneously-using-basis-1");
      },
      render: () => (
        <RLCarousel
          items={SAMPLE_ITEMS}
          arrows
          dots
          loop
          ui={{ item: "basis-1/3 ps-2" }}
          class="w-full max-w-lg mx-auto"
        >
          {({ item }: { item: unknown }) => (
            <img
              src={slideSrc(item)}
              alt={"Multi item"}
              width="200"
              height="200"
              class="rounded-xl object-cover w-full aspect-square border border-default shadow-sm"
            />
          )}
        </RLCarousel>
      ),
    },
    {
      id: "vertical-orientation",
      get title() {
        return t("app.text.vertical-orientation");
      },
      get description() {
        return t("app.text.vertical-navigation-with-top-bottom-arrows-and-v");
      },
      render: () => (
        <div class="max-w-xs mx-auto">
          <RLCarousel
            items={SAMPLE_ITEMS.slice(0, 4)}
            orientation="vertical"
            arrows
            dots
            ui={{ container: "h-[336px]" }}
          >
            {({ item }: { item: unknown }) => (
              <img
                src={slideSrc(item)}
                alt={"Vertical item"}
                width="320"
                height="320"
                class="rounded-2xl object-cover w-full aspect-square border border-default shadow-sm"
              />
            )}
          </RLCarousel>
        </div>
      ),
    },
    {
      id: "fade-transition",
      get title() {
        return t("app.text.fade-transition-mode");
      },
      get description() {
        return t("app.text.smooth-crossfade-between-slides-instead-of-trans");
      },
      render: () => (
        <div class="max-w-xs mx-auto">
          <RLCarousel items={SAMPLE_ITEMS.slice(0, 4)} fade arrows dots>
            {({ item }: { item: unknown }) => (
              <img
                src={slideSrc(item)}
                alt={"Fade item"}
                width="320"
                height="320"
                class="rounded-2xl object-cover w-full aspect-square border border-default shadow-sm"
              />
            )}
          </RLCarousel>
        </div>
      ),
    },
    {
      id: "class-names-plugin",
      get title() {
        return t("app.text.class-names-plugin-snapped-opacity");
      },
      get description() {
        return t("app.text.dynamically-applies-snap-states-for-customized-s");
      },
      render: () => (
        <div class="max-w-md mx-auto">
          <RLCarousel
            items={SAMPLE_ITEMS}
            classNames
            arrows
            ui={{
              item: "basis-[70%] transition-opacity [&:not(.is-snapped)]:opacity-25 ps-2",
            }}
          >
            {({ item }: { item: unknown }) => (
              <img
                src={slideSrc(item)}
                alt={"Class names slide"}
                width="320"
                height="320"
                class="rounded-2xl object-cover w-full aspect-square border border-default shadow-sm"
              />
            )}
          </RLCarousel>
        </div>
      ),
    },
    {
      id: "programmatic-thumbnails",
      get title() {
        return t("app.text.programmatic-control-thumbnails");
      },
      get description() {
        return t("app.text.syncing-external-thumbnail-buttons-via-the-carou");
      },
      render: () => <ThumbnailsScenario />,
    },
  ],
  checklist: [
    {
      criterion: "API and slot pattern parity",
      status: "pass",
      notes:
        "Supports items, arrows, prev, prevIcon, next, nextIcon, dots, orientation, autoplay, autoScroll, autoHeight, classNames, fade, wheelGestures, align, loop, slidesToScroll, and ref handle.",
    },
    {
      criterion: "Gestures, keyboard & motion",
      status: "pass",
      notes:
        "Built-in touch pointer swiping, wheel gestures, keyboard navigation (ArrowLeft/ArrowRight/ArrowUp/ArrowDown, Home, End), and transitions without third-party dependencies.",
    },
    {
      criterion: "Full WAI-ARIA compliance",
      status: "pass",
      notes:
        "region role with carousel roledescription, slide groups with roledescription, tablist for dots, and accessible button labels.",
    },
    {
      criterion: "Theme token resolution",
      status: "pass",
      notes: "All styles resolve through carousel.theme.ts; zero inline styles.",
    },
    {
      criterion: "No innerHTML / dangerouslySetInnerHTML",
      status: "pass",
      notes: "Pure SolidJS reactive rendering.",
    },
    {
      criterion: "No hydration mismatches",
      status: "pass",
      notes: "Deterministic state initialization and DOM structure.",
    },
    {
      criterion: "Audited components render bare",
      status: "pass",
      notes:
        "Component instances in audit scenarios are rendered directly with no harness wrappers.",
    },
  ],
};

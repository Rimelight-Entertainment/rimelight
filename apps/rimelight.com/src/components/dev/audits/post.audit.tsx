import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLPost } from "@rimelight/ui/components/post/RLPost.tsx";
import { AUDIT_COLORS, type ComponentAuditDefinition, type TestScenario } from "./types";

const IMAGE = "https://picsum.photos/seed/rimelight-audit/800/450";
const ORIENTATIONS = ["vertical", "horizontal"] as const;
const VARIANTS = ["soft", "ghost"] as const;

const PostSandbox = (): JSX.Element => {
  const [orientation, setOrientation] = createSignal<(typeof ORIENTATIONS)[number]>("vertical");
  const [variant, setVariant] = createSignal<(typeof VARIANTS)[number]>("soft");
  const [badgeColor, setBadgeColor] = createSignal<string>("primary");

  return (
    <div class="flex flex-col gap-6">
      <div class="flex flex-wrap gap-2">
        <For each={ORIENTATIONS}>
          {(o) => (
            <button type="button" onClick={() => setOrientation(o)}>
              orientation: {o}
            </button>
          )}
        </For>
        <For each={VARIANTS}>
          {(v) => (
            <button type="button" onClick={() => setVariant(v)}>
              variant: {v}
            </button>
          )}
        </For>
        <For each={AUDIT_COLORS}>
          {(c) => (
            <button type="button" onClick={() => setBadgeColor(c)}>
              badge: {c}
            </button>
          )}
        </For>
      </div>
      <RLPost
        title="Shipping the audit pages"
        description="A short summary of what the post covers."
        date="2025-01-15"
        image={IMAGE}
        href="/blog/audit-pages"
        badge="Engineering"
        badgeColor={badgeColor()}
        orientation={orientation()}
        variant={variant()}
      />
    </div>
  );
};

const testScenarios: TestScenario[] = [
  {
    id: "default-slot",
    title: "Default slot (children)",
    description:
      "Children render inside the body after the default title, description, badge, and date.",
    render: () => (
      <RLPost title="Body children" description="Description text">
        <p>Extra body content passed as children.</p>
      </RLPost>
    ),
  },
  {
    id: "data-props",
    title: "Data props",
    description:
      "title, description, date (string and Date), image (string and {src}), badge, badgeColor.",
    render: () => (
      <div class="flex flex-col gap-6">
        <RLPost
          title="String image and Date"
          description="Image as a string, date as a Date object."
          date={new Date("2025-02-01")}
          image={IMAGE}
          badge="News"
          badgeColor="primary"
        />
        <RLPost
          title="Object image"
          description="Image as an object with src."
          image={{ src: IMAGE }}
        />
      </div>
    ),
  },
  {
    id: "orientation",
    title: "Every orientation",
    description: "vertical (default) and horizontal.",
    render: () => (
      <div class="flex flex-col gap-6">
        <For each={ORIENTATIONS}>
          {(o) => (
            <RLPost
              title={`Orientation ${o}`}
              description="Layout check."
              image={IMAGE}
              orientation={o}
            />
          )}
        </For>
      </div>
    ),
  },
  {
    id: "variants",
    title: "Every variant",
    description: "soft (default) and ghost.",
    render: () => (
      <div class="flex flex-col gap-6">
        <For each={VARIANTS}>
          {(v) => <RLPost title={`Variant ${v}`} description="Style check." variant={v} />}
        </For>
      </div>
    ),
  },
  {
    id: "href",
    title: "href (anchor root)",
    description: "When href is set, the root renders as an anchor.",
    render: () => (
      <RLPost title="Linked post" href="/blog/linked" description="Whole card is a link." />
    ),
  },
  {
    id: "slots",
    title: "Every slot passed content",
    description:
      "imageSlot, titleSlot, descriptionSlot, badgeSlot, dateSlot, footerSlot, and children. Each slot takes precedence over its matching data prop.",
    render: () => (
      <RLPost
        title="Ignored title"
        description="Ignored description"
        date="2025-03-01"
        image={IMAGE}
        badge="Ignored badge"
        imageSlot={<div class="h-40 bg-muted">imageSlot</div>}
        titleSlot={<h3>titleSlot</h3>}
        descriptionSlot={<p>descriptionSlot</p>}
        badgeSlot={<span>badgeSlot</span>}
        dateSlot={<span>dateSlot</span>}
        footerSlot={<span>footerSlot</span>}
      >
        <p>children</p>
      </RLPost>
    ),
  },
];

export const postAudit: ComponentAuditDefinition = {
  id: "post",
  name: "Post",
  category: "Data Display",
  status: "Auditing",
  description: "Blog post card with image, title, description, badge, date, and footer.",
  importPath: "@rimelight/ui/components/post/RLPost.tsx",
  renderSandbox: () => <PostSandbox />,
  testScenarios,
};

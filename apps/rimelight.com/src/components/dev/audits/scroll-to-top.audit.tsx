import type { JSX } from "@solidjs/web";
import { RLScrollToTop } from "@rimelight/ui/components/scroll-to-top/RLScrollToTop.tsx";
import { AUDIT_COLORS, type ComponentAuditDefinition } from "./types";

export const ScrollToTopSandbox = (): JSX.Element => (
  <div class="flex flex-col gap-6">
    <p class="text-xs text-muted">
      The button is fixed to the bottom-right corner of the viewport and only appears after the page
      scrolls past <code>threshold</code>. Scroll this page to reveal it. Every scenario below
      mounts into the same fixed corner.
    </p>
    <div class="p-8 rounded-xl border border-default bg-elevated/10 flex flex-wrap items-center justify-center gap-6">
      <RLScrollToTop />
    </div>
  </div>
);

export const scrollToTopAudit: ComponentAuditDefinition = {
  id: "scroll-to-top",
  name: "Scroll To Top",
  category: "Navigation",
  status: "Auditing",
  description:
    "A fixed button that appears after the page scrolls past a threshold, shows scroll progress, and smoothly returns to the top.",
  importPath: "@rimelight/ui/components/scroll-to-top/RLScrollToTop.tsx",
  renderSandbox: () => <ScrollToTopSandbox />,
  testScenarios: [
    {
      id: "default-icon",
      title: "Default icon and progress",
      description:
        "No children. The default arrow-up icon renders inside the icon container with the progress ring.",
      render: () => <RLScrollToTop />,
    },
    {
      id: "children-icon-slot",
      title: "Default slot (children replace the icon)",
      description: "Children replace the default arrow icon inside the icon container.",
      render: () => <RLScrollToTop>Top</RLScrollToTop>,
    },
    {
      id: "threshold-zero",
      title: "Threshold 0",
      description: "Becomes visible after any downward scroll (scrollY greater than 0).",
      render: () => <RLScrollToTop threshold={0} />,
    },
    {
      id: "progress-width",
      title: "Progress width 12",
      description: "Thicker progress ring than the default width of 6.",
      render: () => <RLScrollToTop progressWidth={12} />,
    },
    {
      id: "no-progress",
      title: "hasProgress false",
      description: "Progress ring is removed. Only the button and icon render.",
      render: () => <RLScrollToTop hasProgress={false} />,
    },
    {
      id: "colors",
      title: "Color variants",
      description:
        "Color is applied through the theme. Each color is rendered in its own fixed slot position.",
      render: () => (
        <div class="flex flex-wrap gap-2">
          {AUDIT_COLORS.map((color) => (
            <RLScrollToTop color={color} />
          ))}
        </div>
      ),
    },
  ],
};

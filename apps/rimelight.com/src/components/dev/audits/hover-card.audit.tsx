import { RLHoverCard } from "@rimelight/ui/components/hover-card/RLHoverCard.tsx";
import type { ComponentAuditDefinition } from "./types";

export const HoverCardSandbox = () => (
  <RLHoverCard triggerLabel="Hover or focus me" side="bottom">
    Card body content
  </RLHoverCard>
);

export const hoverCardAudit: ComponentAuditDefinition = {
  id: "hover-card",
  name: "Hover Card",
  category: "Overlay & Dialog",
  status: "Auditing",
  description:
    "A card revealed by hovering or focusing a trigger, attached to one edge of the trigger, and dismissed with Escape.",
  importPath: "@rimelight/ui/components/hover-card/RLHoverCard.tsx",
  renderSandbox: () => <HoverCardSandbox />,
  testScenarios: [
    {
      id: "default-children",
      title: "Default slot (children)",
      description: "Children render inside the card body.",
      render: () => <RLHoverCard triggerLabel="Trigger">Card body content</RLHoverCard>,
    },
    {
      id: "trigger-label",
      title: "Trigger label",
      description: "The default trigger shows triggerLabel text.",
      render: () => <RLHoverCard triggerLabel="@rimelight">Profile preview</RLHoverCard>,
    },
    {
      id: "trigger-slot",
      title: "Trigger slot",
      description: "A custom trigger replaces triggerLabel.",
      render: () => (
        <RLHoverCard triggerSlot={<button type="button">Custom trigger</button>}>
          Card body content
        </RLHoverCard>
      ),
    },
    {
      id: "side",
      title: "Side",
      description: "Card attached to the top edge of the trigger.",
      render: () => (
        <RLHoverCard triggerLabel="Top" side="top">
          Card above the trigger
        </RLHoverCard>
      ),
    },
  ],
};

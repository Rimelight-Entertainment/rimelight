import { RLHeader } from "@rimelight/ui/components/header/RLHeader.tsx";
import type { ComponentAuditDefinition } from "./types";

export const HeaderSandbox = () => (
  <RLHeader leadingSlot={<span>Logo</span>} trailingSlot={<span>Actions</span>}>
    Navigation
  </RLHeader>
);

export const headerAudit: ComponentAuditDefinition = {
  id: "header",
  name: "Header",
  category: "Navigation",
  status: "Auditing",
  description:
    "Sticky, fixed, or static top header with leading, center, and trailing regions, stacking order, and hide-on-scroll collapse.",
  importPath: "@rimelight/ui/components/header/RLHeader.tsx",
  renderSandbox: () => <HeaderSandbox />,
  testScenarios: [
    {
      id: "default-children",
      title: "Default slot (children)",
      description: "Children render in the center region when centerSlot is omitted.",
      render: () => <RLHeader>Navigation links</RLHeader>,
    },
    {
      id: "leading-slot",
      title: "Leading slot",
      description: "Content at the leading edge.",
      render: () => <RLHeader leadingSlot={<span>Logo</span>}>Center</RLHeader>,
    },
    {
      id: "center-slot",
      title: "Center slot",
      description: "Replaces children in the center region.",
      render: () => <RLHeader centerSlot={<span>Search</span>}>Ignored children</RLHeader>,
    },
    {
      id: "trailing-slot",
      title: "Trailing slot",
      description: "Content at the trailing edge.",
      render: () => <RLHeader trailingSlot={<span>Sign in</span>}>Center</RLHeader>,
    },
  ],
};

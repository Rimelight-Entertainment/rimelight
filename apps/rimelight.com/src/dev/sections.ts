export const DEV_BRAND = "Rimelight Developer Workspace";

export type DevSectionId = "design-system" | "components" | "locale" | "og";

export type DevSectionMaxWidth =
  | "sm"
  | "md"
  | "lg"
  | "xl"
  | "2xl"
  | "3xl"
  | "4xl"
  | "5xl"
  | "6xl"
  | "7xl"
  | "full";

export interface DevSection {
  id: DevSectionId;
  title: string;
  href: string;
  description: string;
  icon: string;
  maxWidth?: DevSectionMaxWidth;
}

export const devSections: DevSection[] = [
  {
    id: "design-system",
    title: "Design System",
    href: "/dev/design-system",
    description:
      "Interactive hybrid OKLCH palette scales, 8x8 intent contrast matrix, 11x11 shade grid, dual-mode preview sandbox, and component theming.",
    icon: "i-lucide-layers",
    maxWidth: "7xl",
  },
  {
    id: "components",
    title: "Components",
    href: "/dev/components",
    description:
      "Interactive sandboxes, edge-case test scenarios, WCAG checklists, and prop spec sheets for 19+ Rimelight UI components.",
    icon: "i-lucide-component",
    maxWidth: "7xl",
  },
  {
    id: "locale",
    title: "i18n",
    href: "/dev/locale",
    description:
      "Barebones locale switcher test, URL rewriting diagnostics, and verification of @rimelight/i18n client/server sync.",
    icon: "i-lucide-globe",
    maxWidth: "2xl",
  },
  {
    id: "og",
    title: "OpenGraph",
    href: "/dev/og",
    description:
      "Live preview and validation tool for dynamic OG banner generation with customizable title, description, and tags.",
    icon: "i-lucide-image",
    maxWidth: "7xl",
  },
];

export function getDevSection(id: DevSectionId): DevSection {
  const section = devSections.find((s) => s.id === id);
  if (!section) {
    throw new Error(`Unknown dev section: ${id}`);
  }
  return section;
}

export const devHub = {
  title: DEV_BRAND,
  description: "Central hub for component auditing, runtime benchmarks, and testing utilities",
  sectionDescription:
    "Standardized, isolated test environment and feature auditing suite for Rimelight. Zero layout pollution to ensure uncompromised test accuracy.",
} as const;

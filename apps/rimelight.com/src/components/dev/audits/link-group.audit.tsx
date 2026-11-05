import { createSignal } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLLinkGroup } from "@rimelight/ui/components/link-group/RLLinkGroup.tsx";
import type { ComponentAuditDefinition, TestScenario } from "./types";

const LINKS = [
  { label: "Documentation", href: "/docs" },
  { label: "Changelog", href: "/changelog" },
  { label: "GitHub", href: "https://github.com/rimelight", external: true },
];

const LinkGroupSandbox = (): JSX.Element => {
  const [withHref, setWithHref] = createSignal(true);
  const [withIcons, setWithIcons] = createSignal(false);

  return (
    <div class="flex flex-col gap-6">
      <div class="flex flex-wrap gap-2">
        <button type="button" onClick={() => setWithHref((v) => !v)}>
          heading href: {withHref() ? "on" : "off"}
        </button>
        <button type="button" onClick={() => setWithIcons((v) => !v)}>
          icons: {withIcons() ? "on" : "off"}
        </button>
      </div>
      <RLLinkGroup
        label="Resources"
        href={withHref() ? "/resources" : undefined}
        leadingIcon={withIcons() ? "i-lucide-globe" : undefined}
        trailingIcon={withIcons() ? "chevron-right" : undefined}
        links={LINKS}
      />
    </div>
  );
};

const testScenarios: TestScenario[] = [
  {
    id: "default-slot",
    title: "Default slot (children)",
    description: "Children replace the links list when provided.",
    render: () => (
      <RLLinkGroup label="Custom content">
        <span>Custom child content</span>
      </RLLinkGroup>
    ),
  },
  {
    id: "links-array",
    title: "links (array)",
    description: "Each entry is an RLLinkProps object. External links set external.",
    render: () => <RLLinkGroup label="Resources" links={LINKS} />,
  },
  {
    id: "links-single",
    title: "links (single object)",
    description: "links also accepts one RLLinkProps object.",
    render: () => <RLLinkGroup label="Single" links={{ label: "Home", href: "/" }} />,
  },
  {
    id: "heading",
    title: "label, leadingIcon, trailingIcon, href",
    description: "href wraps the heading in a link. Icons decorate the heading.",
    render: () => (
      <RLLinkGroup
        label="Support"
        href="/support"
        leadingIcon="i-lucide-globe"
        trailingIcon="chevron-right"
        links={[{ label: "Contact", href: "/contact" }]}
      />
    ),
  },
  {
    id: "no-heading",
    title: "No label",
    description: "Without label, the group renders the links alone.",
    render: () => <RLLinkGroup links={LINKS} />,
  },
];

export const linkGroupAudit: ComponentAuditDefinition = {
  id: "link-group",
  name: "Link Group",
  category: "Navigation",
  status: "Auditing",
  description: "Titled group of links with an optional linked heading and icons.",
  importPath: "@rimelight/ui/components/link-group/RLLinkGroup.tsx",
  renderSandbox: () => <LinkGroupSandbox />,
  testScenarios,
};

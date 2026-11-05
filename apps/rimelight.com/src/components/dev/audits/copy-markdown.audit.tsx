import type { JSX } from "@solidjs/web";
import { RLCopyMarkdown } from "@rimelight/ui/components/copy-markdown/RLCopyMarkdown.tsx";
import type { ComponentAuditDefinition } from "./types";

const RAW = "## Heading\n\nSome **markdown** to copy.";

export const CopyMarkdownSandbox = (): JSX.Element => <RLCopyMarkdown raw={RAW} />;

export const copyMarkdownAudit: ComponentAuditDefinition = {
  id: "copy-markdown",
  name: "Copy Markdown",
  category: "Utility",
  status: "Auditing",
  description:
    "A button that copies the raw markdown string to the clipboard and briefly shows a copied label. Every RLButton prop is forwarded to the rendered button.",
  importPath: "@rimelight/ui/components/copy-markdown/RLCopyMarkdown.tsx",
  renderSandbox: () => <CopyMarkdownSandbox />,
  testScenarios: [
    {
      id: "default-slot-children",
      title: "Default slot (children)",
      description: "Children replace the default label inside the button.",
      render: () => (
        <RLCopyMarkdown raw={RAW}>
          <span>Copy as markdown</span>
        </RLCopyMarkdown>
      ),
    },
    {
      id: "default-label",
      title: "Default label",
      description: "Localized copy label and copy icon.",
      render: () => <RLCopyMarkdown raw={RAW} />,
    },
    {
      id: "onclick",
      title: "onClick after copy",
      description: "Consumer click handler runs after the markdown is copied.",
      render: () => <RLCopyMarkdown raw={RAW} onClick={() => console.log("clicked")} />,
    },
    {
      id: "button-props",
      title: "Forwarded button props",
      description: "Button variant, color, and size are forwarded to the button.",
      render: () => <RLCopyMarkdown raw={RAW} variant="outline" color="primary" size="sm" />,
    },
    {
      id: "leading-icon",
      title: "Leading icon",
      description: "Forwarded icon prop overrides the default copy icon.",
      render: () => <RLCopyMarkdown raw={RAW} leadingIcon="file-text" />,
    },
    {
      id: "disabled",
      title: "Disabled",
      description: "Disabled button does not copy.",
      render: () => <RLCopyMarkdown raw={RAW} disabled />,
    },
  ],
};

import type { JSX } from "@solidjs/web";
import { RLChatPalette } from "@rimelight/ui/components/chat-palette/RLChatPalette.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import type { ComponentAuditDefinition } from "./types";

export const ChatPaletteSandbox = (): JSX.Element => (
  <div class="max-w-md w-full">
    <RLChatPalette>
      <RLButton label="Summarize" variant="outline" size="sm" />
      <RLButton label="Translate" variant="outline" size="sm" />
      <RLButton label="Explain" variant="outline" size="sm" />
    </RLChatPalette>
  </div>
);

export const chatPaletteAudit: ComponentAuditDefinition = {
  id: "chat-palette",
  name: "Chat Palette",
  category: "AI & Chat",
  status: "Auditing",
  description: "Group of suggested prompts or actions shown alongside a conversation.",
  importPath: "@rimelight/ui/components/chat-palette/RLChatPalette.tsx",
  renderSandbox: () => <ChatPaletteSandbox />,
  testScenarios: [
    {
      id: "default",
      title: "Default",
      description: "Suggestion group with a localized label.",
      render: () => (
        <RLChatPalette>
          <RLButton label="Summarize" variant="outline" size="sm" />
          <RLButton label="Translate" variant="outline" size="sm" />
        </RLChatPalette>
      ),
    },
  ],
  checklist: [
    { criterion: "Renders role group with a localized default label", status: "pending" },
    { criterion: "Children wrap without extra wrapper elements", status: "pending" },
  ],
};

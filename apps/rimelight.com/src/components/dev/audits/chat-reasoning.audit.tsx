import type { JSX } from "@solidjs/web";
import { RLChatReasoning } from "@rimelight/ui/components/chat-reasoning/RLChatReasoning.tsx";
import type { ComponentAuditDefinition } from "./types";

export const ChatReasoningSandbox = (): JSX.Element => (
  <div class="max-w-md w-full">
    <RLChatReasoning defaultOpen>
      <p>First I compare the two release notes, then I pick out the breaking changes.</p>
    </RLChatReasoning>
  </div>
);

export const chatReasoningAudit: ComponentAuditDefinition = {
  id: "chat-reasoning",
  name: "Chat Reasoning",
  category: "AI & Chat",
  status: "Auditing",
  description: "Collapsible block that shows model reasoning, with a shimmer while it streams.",
  importPath: "@rimelight/ui/components/chat-reasoning/RLChatReasoning.tsx",
  renderSandbox: () => <ChatReasoningSandbox />,
  testScenarios: [
    {
      id: "default",
      title: "Default",
      description: "Collapsed reasoning with the default label.",
      render: () => (
        <RLChatReasoning>
          <p>Weighing the options.</p>
        </RLChatReasoning>
      ),
    },
    {
      id: "streaming",
      title: "Streaming",
      description: "Summary shimmers while reasoning is still streaming.",
      render: () => (
        <RLChatReasoning streaming label="Thinking">
          <p>Working through the steps.</p>
        </RLChatReasoning>
      ),
    },
  ],
  checklist: [
    { criterion: "Summary toggles the body with native details behavior", status: "pending" },
    { criterion: "defaultOpen opens the block on first render only", status: "pending" },
    { criterion: "Streaming flag uses presence data-streaming", status: "pending" },
  ],
};

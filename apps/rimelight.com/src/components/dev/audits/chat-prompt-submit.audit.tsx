import { For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLChatPromptSubmit } from "@rimelight/ui/components/chat-prompt-submit/RLChatPromptSubmit.tsx";
import type { RLChatStatus } from "@rimelight/ui/components/chat/chat.types.ts";
import type { ComponentAuditDefinition } from "./types";

const STATUSES: RLChatStatus[] = ["ready", "submitted", "streaming", "error"];

export const ChatPromptSubmitSandbox = (): JSX.Element => (
  <div class="flex flex-wrap gap-3 items-center">
    <For each={STATUSES}>
      {(status) => (
        <div class="flex flex-col items-center gap-1 text-xs">
          <RLChatPromptSubmit status={status} />
          <span>{status}</span>
        </div>
      )}
    </For>
  </div>
);

export const chatPromptSubmitAudit: ComponentAuditDefinition = {
  id: "chat-prompt-submit",
  name: "Chat Prompt Submit",
  category: "AI & Chat",
  status: "Auditing",
  description: "Send button for a prompt that becomes a stop button while a response streams.",
  importPath: "@rimelight/ui/components/chat-prompt-submit/RLChatPromptSubmit.tsx",
  renderSandbox: () => <ChatPromptSubmitSandbox />,
  testScenarios: [
    {
      id: "default",
      title: "Default",
      description: "Ready state shows the send control.",
      render: () => <RLChatPromptSubmit />,
    },
    {
      id: "streaming",
      title: "Streaming",
      description: "Streaming state shows the stop control.",
      render: () => <RLChatPromptSubmit status="streaming" />,
    },
    {
      id: "submitted",
      title: "Submitted",
      description: "Submitted state shows a loading indicator.",
      render: () => <RLChatPromptSubmit status="submitted" />,
    },
  ],
  checklist: [
    { criterion: "Icon and type switch with status (send or stop)", status: "pending" },
    { criterion: "Stop control calls onStop while streaming", status: "pending" },
    { criterion: "Accessible name comes from the locale", status: "pending" },
  ],
};

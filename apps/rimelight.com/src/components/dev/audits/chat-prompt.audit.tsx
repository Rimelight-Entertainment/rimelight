import { createSignal } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLChatPrompt } from "@rimelight/ui/components/chat-prompt/RLChatPrompt.tsx";
import { RLChatPromptSubmit } from "@rimelight/ui/components/chat-prompt-submit/RLChatPromptSubmit.tsx";
import type { ComponentAuditDefinition } from "./types";

export const ChatPromptSandbox = (): JSX.Element => {
  const [lastSubmitted, setLastSubmitted] = createSignal("");

  return (
    <div class="flex flex-col gap-3 max-w-md w-full">
      <RLChatPrompt onSubmit={setLastSubmitted}>
        <RLChatPromptSubmit />
      </RLChatPrompt>
      <p class="text-xs text-muted">Last submitted: {lastSubmitted() || "none"}</p>
    </div>
  );
};

export const chatPromptAudit: ComponentAuditDefinition = {
  id: "chat-prompt",
  name: "Chat Prompt",
  category: "AI & Chat",
  status: "Auditing",
  description: "Multi-line message composer. Enter submits, Shift+Enter inserts a newline.",
  importPath: "@rimelight/ui/components/chat-prompt/RLChatPrompt.tsx",
  renderSandbox: () => <ChatPromptSandbox />,
  testScenarios: [
    {
      id: "default",
      title: "Default",
      description: "Empty composer with the default placeholder.",
      render: () => <RLChatPrompt />,
    },
    {
      id: "footer",
      title: "Footer",
      description: "Submit control rendered in the footer slot.",
      render: () => (
        <RLChatPrompt>
          <RLChatPromptSubmit />
        </RLChatPrompt>
      ),
    },
    {
      id: "disabled",
      title: "Disabled",
      description: "Field and submission disabled.",
      render: () => <RLChatPrompt disabled />,
    },
  ],
  checklist: [
    { criterion: "Enter submits trimmed text and clears the field", status: "pending" },
    { criterion: "Shift+Enter inserts a newline without submitting", status: "pending" },
    { criterion: "Blank text is never submitted", status: "pending" },
    { criterion: "Controlled and uncontrolled value both work", status: "pending" },
  ],
};

import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLChat } from "@rimelight/ui/components/chat/RLChat.tsx";
import { RLChatMessages } from "@rimelight/ui/components/chat-messages/RLChatMessages.tsx";
import { RLChatMessage } from "@rimelight/ui/components/chat-message/RLChatMessage.tsx";
import type { RLChatStatus } from "@rimelight/ui/components/chat/chat.types.ts";
import type { ComponentAuditDefinition } from "./types";

const STATUSES: RLChatStatus[] = ["ready", "submitted", "streaming", "error"];

export const ChatSandbox = (): JSX.Element => {
  const [status, setStatus] = createSignal<RLChatStatus>("ready");

  return (
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap gap-2 text-xs">
        <For each={STATUSES}>
          {(next) => (
            <button
              type="button"
              class="px-2 py-1 rounded border border-default"
              onClick={() => setStatus(next)}
            >
              {next}
            </button>
          )}
        </For>
      </div>
      <div class="h-96 max-w-md w-full border border-default rounded-xl">
        <RLChat status={status()}>
          <RLChatMessages>
            <RLChatMessage from="user">Summarize the release notes.</RLChatMessage>
            <RLChatMessage from="assistant">Here is a short summary of the release.</RLChatMessage>
          </RLChatMessages>
        </RLChat>
      </div>
    </div>
  );
};

export const chatAudit: ComponentAuditDefinition = {
  id: "chat",
  name: "Chat",
  category: "AI & Chat",
  status: "Auditing",
  description:
    "Conversation region that exposes busy state to assistive technology while a response is pending.",
  importPath: "@rimelight/ui/components/chat/RLChat.tsx",
  renderSandbox: () => <ChatSandbox />,
  testScenarios: [
    {
      id: "default",
      title: "Default",
      description: "Ready conversation with no busy state.",
      render: () => (
        <RLChat>
          <RLChatMessages>
            <RLChatMessage from="user">Hello</RLChatMessage>
          </RLChatMessages>
        </RLChat>
      ),
    },
    {
      id: "streaming",
      title: "Streaming",
      description: "Region is marked aria-busy while a response streams.",
      render: () => (
        <RLChat status="streaming">
          <RLChatMessages>
            <RLChatMessage from="assistant">Writing</RLChatMessage>
          </RLChatMessages>
        </RLChat>
      ),
    },
  ],
  checklist: [
    { criterion: "Named export RLChat with typed props in chat.types.ts", status: "pending" },
    { criterion: "aria-busy reflects submitted and streaming status", status: "pending" },
    { criterion: "Accessible region label comes from the locale", status: "pending" },
  ],
};

import { For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLChatTool } from "@rimelight/ui/components/chat-tool/RLChatTool.tsx";
import type { RLChatToolStatus } from "@rimelight/ui/components/chat-tool/chat-tool.types.ts";
import type { ComponentAuditDefinition } from "./types";

const STATUSES: RLChatToolStatus[] = ["pending", "running", "completed", "error"];

export const ChatToolSandbox = (): JSX.Element => (
  <div class="flex flex-col gap-3 max-w-md w-full">
    <For each={STATUSES}>
      {(status) => (
        <RLChatTool toolName="search_docs" status={status}>
          <p class="text-sm">Result payload for {status}.</p>
        </RLChatTool>
      )}
    </For>
  </div>
);

export const chatToolAudit: ComponentAuditDefinition = {
  id: "chat-tool",
  name: "Chat Tool",
  category: "AI & Chat",
  status: "Auditing",
  description: "Collapsible record of one tool call with its execution status and output.",
  importPath: "@rimelight/ui/components/chat-tool/RLChatTool.tsx",
  renderSandbox: () => <ChatToolSandbox />,
  testScenarios: [
    {
      id: "default",
      title: "Default",
      description: "Pending tool call, collapsed.",
      render: () => <RLChatTool toolName="search_docs" />,
    },
    {
      id: "completed",
      title: "Completed",
      description: "Completed tool call with output in the body.",
      render: () => (
        <RLChatTool toolName="search_docs" status="completed" defaultOpen>
          <p>Found 3 matching pages.</p>
        </RLChatTool>
      ),
    },
    {
      id: "error",
      title: "Error",
      description: "Failed tool call.",
      render: () => <RLChatTool toolName="search_docs" status="error" />,
    },
  ],
  checklist: [
    { criterion: "Status label comes from the locale for every status", status: "pending" },
    { criterion: "defaultOpen opens the record on first render only", status: "pending" },
    { criterion: "Name, status, and body each render through their own slot", status: "pending" },
  ],
};

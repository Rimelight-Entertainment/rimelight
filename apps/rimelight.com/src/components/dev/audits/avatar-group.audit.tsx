import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLAvatarGroup } from "@rimelight/ui/components/avatar-group/RLAvatarGroup.tsx";
import type { ComponentAuditDefinition } from "./types";

const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
const ITEMS = [
  { alt: "Daniel Marchi", text: "DM", color: "primary" },
  { alt: "Ada Lovelace", text: "AL", color: "success" },
  { alt: "Grace Hopper", text: "GH", color: "warning" },
  { alt: "Alan Turing", text: "AT", color: "error" },
  { alt: "Katherine Johnson", text: "KJ", color: "info" },
] as const;

export const AvatarGroupSandbox = (): JSX.Element => {
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");
  const [max, setMax] = createSignal<number | undefined>(3);

  return (
    <div class="flex flex-col gap-6">
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-2 text-xs">
        <span class="text-muted mr-1">size</span>
        <For each={SIZES}>
          {(s) => (
            <button
              type="button"
              onClick={() => setSize(s)}
              class={`px-2 py-0.5 rounded text-xs font-mono ${
                size() === s
                  ? "bg-primary text-inverted"
                  : "bg-elevated text-muted border border-default"
              }`}
            >
              {s}
            </button>
          )}
        </For>
        <button
          type="button"
          onClick={() => setMax((m) => (m === undefined ? 3 : undefined))}
          class="px-2 py-0.5 rounded text-xs font-mono bg-elevated text-muted border border-default"
        >
          {max() === undefined ? "max: none" : `max: ${max()}`}
        </button>
      </div>
      <RLAvatarGroup size={size()} max={max()} items={[...ITEMS]} />
    </div>
  );
};

export const avatarGroupAudit: ComponentAuditDefinition = {
  id: "avatar-group",
  name: "Avatar Group",
  category: "Data Display",
  status: "Auditing",
  description:
    "Stacks a row of avatars from an items array with an optional max and overflow count, or renders children in the default slot.",
  importPath: "@rimelight/ui/components/avatar-group/RLAvatarGroup.tsx",
  renderSandbox: () => <AvatarGroupSandbox />,
  testScenarios: [
    {
      id: "default-slot-children",
      title: "Default slot (children)",
      description: "Children render in the group when no items are passed.",
      render: () => (
        <RLAvatarGroup>
          <span class="rounded-full bg-primary size-8 flex items-center justify-center text-xs">
            A
          </span>
          <span class="rounded-full bg-success size-8 flex items-center justify-center text-xs">
            B
          </span>
          <span class="rounded-full bg-warning size-8 flex items-center justify-center text-xs">
            C
          </span>
        </RLAvatarGroup>
      ),
    },
    {
      id: "items",
      title: "Items",
      description: "Avatars built from the items array (alt, text, color).",
      render: () => <RLAvatarGroup items={[...ITEMS]} />,
    },
    {
      id: "max",
      title: "Max overflow",
      description: "Shows at most max avatars and a count for the remainder.",
      render: () => <RLAvatarGroup items={[...ITEMS]} max={2} />,
    },
    {
      id: "sizes",
      title: "Sizes",
      description: "Every size variant: xs, sm, md, lg, xl.",
      render: () => (
        <div class="flex flex-col gap-4">
          <For each={SIZES}>{(s) => <RLAvatarGroup size={s} items={[...ITEMS]} max={3} />}</For>
        </div>
      ),
    },
    {
      id: "color-auto",
      title: "Color auto",
      description: "Color auto variant on the group.",
      render: () => <RLAvatarGroup color="auto" items={[...ITEMS]} />,
    },
  ],
};

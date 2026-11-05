import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLGamepad } from "@rimelight/ui/components/gamepad/RLGamepad.tsx";
import type { ComponentAuditDefinition } from "./types";

const BUTTON_IDS = [
  "A",
  "B",
  "X",
  "Y",
  "L1",
  "L2",
  "R1",
  "R2",
  "LS",
  "RS",
  "DPadUp",
  "DPadDown",
  "DPadLeft",
  "DPadRight",
  "View",
  "Menu",
] as const;

export const GamepadSandbox = (): JSX.Element => {
  const [highlighted, setHighlighted] = createSignal<string[]>(["A"]);

  return (
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap gap-2 text-xs">
        <For each={BUTTON_IDS}>
          {(id) => (
            <button
              type="button"
              onClick={() =>
                setHighlighted((list) =>
                  list.includes(id) ? list.filter((b) => b !== id) : [...list, id],
                )
              }
            >
              {id}: {highlighted().includes(id) ? "on" : "off"}
            </button>
          )}
        </For>
      </div>
      <RLGamepad
        highlightedButtons={highlighted()}
        highlightColor="var(--color-primary)"
        groups={[
          {
            label: "Movement",
            buttons: ["DPadUp", "DPadDown", "DPadLeft", "DPadRight"],
            color: "#38bdf8",
          },
          { label: "Actions", buttons: ["A", "B", "X", "Y"], color: "#f59e0b" },
        ]}
        backgroundColor="transparent"
      />
    </div>
  );
};

export const gamepadAudit: ComponentAuditDefinition = {
  id: "gamepad",
  name: "Gamepad",
  category: "Media & Visuals",
  status: "Auditing",
  description:
    "SVG gamepad diagram with highlightable buttons, group colors with a legend, and configurable highlight and background colors.",
  importPath: "@rimelight/ui/components/gamepad/RLGamepad.tsx",
  renderSandbox: () => <GamepadSandbox />,
  testScenarios: [
    {
      id: "default",
      title: "No highlights",
      description:
        "Default render with no highlighted buttons and no groups. The component declares no slots and renders no children.",
      render: () => <RLGamepad />,
    },
    {
      id: "highlighted-buttons",
      title: "highlightedButtons with highlightColor",
      description: "Highlights the face buttons using the highlightColor prop.",
      render: () => <RLGamepad highlightedButtons={["A", "B"]} highlightColor="#22c55e" />,
    },
    {
      id: "groups-with-legend",
      title: "groups with legend",
      description:
        "Two labeled groups produce a legend with color dots. Buttons in a group take the group color.",
      render: () => (
        <RLGamepad
          groups={[
            { label: "Triggers", buttons: ["L1", "L2", "R1", "R2"], color: "#a855f7" },
            { label: "Sticks", buttons: ["LS", "RS"], color: "#ef4444" },
          ]}
        />
      ),
    },
    {
      id: "group-without-label",
      title: "Group without label",
      description: "A group with no label colors its buttons but does not add a legend item.",
      render: () => <RLGamepad groups={[{ buttons: ["Menu", "View"], color: "#14b8a6" }]} />,
    },
    {
      id: "background-color",
      title: "backgroundColor prop",
      description: "Renders a background panel behind the gamepad body.",
      render: () => <RLGamepad backgroundColor="#111827" highlightedButtons={["Y"]} />,
    },
  ],
};

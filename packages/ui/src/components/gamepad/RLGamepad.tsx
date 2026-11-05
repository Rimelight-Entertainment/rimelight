import type { GamepadButton, RLGamepadProps } from "./gamepad.types";
import { RLGamepadTheme } from "./gamepad.theme";
import { For, Show, type Component } from "solid-js";

const shoulderButtons: GamepadButton[] = [
  { id: "L2", label: "LT", x: 65, y: 10, w: 80, h: 22 },
  { id: "L1", label: "LB", x: 65, y: 42, w: 80, h: 22 },
  { id: "R2", label: "RT", x: 255, y: 10, w: 80, h: 22 },
  { id: "R1", label: "RB", x: 255, y: 42, w: 80, h: 22 },
];

const mainButtons: GamepadButton[] = [
  { id: "Y", label: "Y", x: 315, y: 125, r: 12 },
  { id: "X", label: "X", x: 288, y: 152, r: 12 },
  { id: "B", label: "B", x: 342, y: 152, r: 12 },
  { id: "A", label: "A", x: 315, y: 179, r: 12 },
  { id: "DPadUp", x: 85, y: 130, w: 20, h: 20, type: "dpad" },
  { id: "DPadDown", x: 85, y: 174, w: 20, h: 20, type: "dpad" },
  { id: "DPadLeft", x: 63, y: 152, w: 20, h: 20, type: "dpad" },
  { id: "DPadRight", x: 107, y: 152, w: 20, h: 20, type: "dpad" },
  { id: "LS", x: 155, y: 215, r: 24 },
  { id: "RS", x: 245, y: 215, r: 24 },
  { id: "View", label: "⧉", x: 145, y: 105, w: 16, h: 10 },
  { id: "Menu", label: "≡", x: 239, y: 105, w: 16, h: 10 },
];

const OMIT_KEYS = ["highlightedButtons", "groups", "highlightColor", "backgroundColor"] as const;

export const RLGamepad: Component<RLGamepadProps> = (props) => {
  const { Tag, classes, rest, id, theme } = RLGamepadTheme.setup(props, {
    omit: OMIT_KEYS,
    idPrefix: "rl-gamepad",
  });

  const groups = () => props.groups ?? [];

  const getButtonHighlight = (buttonId: string): { active: boolean; color: string | undefined } => {
    if ((props.highlightedButtons ?? []).includes(buttonId)) {
      return { active: true, color: props.highlightColor };
    }
    for (const group of groups()) {
      if (group.buttons.includes(buttonId)) {
        return { active: true, color: group.color };
      }
    }
    return { active: false, color: undefined };
  };

  const buttonClass = (active: boolean) => (active ? classes().buttonActive : classes().button);
  const labelClass = (active: boolean) => (active ? classes().labelActive : classes().label);

  return (
    <Tag class={classes().root} data-slot="root" data-theme={theme()} {...rest}>
      <div class={classes().container} data-slot="container">
        <svg viewBox="-20 -20 440 380" class={classes().svg} data-slot="svg">
          <defs>
            <linearGradient id={`${id()}-body`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop
                class={classes().gradientTop}
                offset="0%"
                stop-color="currentColor"
                stop-opacity="1"
              />
              <stop
                class={classes().gradientBottom}
                offset="100%"
                stop-color="currentColor"
                stop-opacity="1"
              />
            </linearGradient>
          </defs>

          <Show when={props.backgroundColor && props.backgroundColor !== "transparent"}>
            <rect x="-20" y="-20" width="440" height="360" fill={props.backgroundColor} rx="24" />
          </Show>

          <For each={shoulderButtons}>
            {(btn) => {
              const highlight = getButtonHighlight(btn.id);
              const w = btn.w || 0;
              const h = btn.h || 0;
              return (
                <g class={buttonClass(highlight.active)}>
                  <rect
                    class={classes().shape}
                    x={btn.x}
                    y={btn.y}
                    width={w}
                    height={h}
                    rx="5"
                    fill={highlight.color || "currentColor"}
                  />
                  <Show when={btn.label}>
                    {(label) => (
                      <text
                        class={labelClass(highlight.active)}
                        x={btn.x + w / 2}
                        y={btn.y + h / 2}
                        text-anchor="middle"
                        dominant-baseline="central"
                        fill="currentColor"
                      >
                        {label()}
                      </text>
                    )}
                  </Show>
                </g>
              );
            }}
          </For>

          <path
            d="M120,85 L280,85 C320,85 340,95 350,115 C370,145 390,215 390,245 C390,285 360,315 320,315 C290,315 260,285 240,255 C220,245 180,245 160,255 C140,285 110,315 80,315 C40,315 10,285 10,245 C10,215 30,145 50,115 C60,95 80,85 120,85 Z"
            fill={`url(#${id()}-body)`}
            class={classes().body}
            stroke-width="1"
          />

          <path
            d="M145,90 L255,90 L262,150 L138,150 Z"
            fill="currentColor"
            class={classes().panel}
            stroke-width="0.5"
          />

          <For each={mainButtons}>
            {(btn) => {
              const highlight = getButtonHighlight(btn.id);
              const w = btn.w || 0;
              const h = btn.h || 0;
              const labelX = btn.r ? btn.x : btn.x + w / 2;
              const labelY = btn.r ? btn.y : btn.y + h / 2;
              return (
                <g class={buttonClass(highlight.active)}>
                  <Show
                    when={btn.r}
                    fallback={
                      <rect
                        class={classes().shape}
                        x={btn.x}
                        y={btn.y}
                        width={w}
                        height={h}
                        rx="3"
                        fill={highlight.color || "currentColor"}
                      />
                    }
                  >
                    {(r) => (
                      <circle
                        class={classes().shape}
                        cx={btn.x}
                        cy={btn.y}
                        r={r()}
                        fill={highlight.color || "currentColor"}
                      />
                    )}
                  </Show>
                  <Show when={btn.label}>
                    {(label) => (
                      <text
                        class={labelClass(highlight.active)}
                        x={labelX}
                        y={labelY}
                        text-anchor="middle"
                        dominant-baseline="central"
                        fill="currentColor"
                      >
                        {label()}
                      </text>
                    )}
                  </Show>
                </g>
              );
            }}
          </For>
        </svg>
      </div>

      <Show when={groups().some((group) => group.label)}>
        <div class={classes().legend} data-slot="legend">
          <For each={groups().filter((group) => group.label)}>
            {(group) => (
              <div class={classes().legendItem} data-slot="legend-item">
                <svg width="8" height="8" class={classes().legendDot} data-slot="legend-dot">
                  <rect width="8" height="8" rx="2" fill={group.color} />
                </svg>
                <span class={classes().legendLabel}>{group.label}</span>
              </div>
            )}
          </For>
        </div>
      </Show>
    </Tag>
  );
};

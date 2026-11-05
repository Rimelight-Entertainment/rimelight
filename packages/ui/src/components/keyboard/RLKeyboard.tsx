import { createMemo, For, Show, type Component } from "solid-js";
import type {
  HighlightGroup,
  Key,
  KeyHighlight,
  RenderKey,
  RLKeyboardProps,
} from "./keyboard.types";
import { RLKeyboardTheme } from "./keyboard.theme";

const mainRows: Key[][] = [
  [
    { label: "Esc", width: 1, code: "Escape" },
    { type: "spacer", width: 1 },
    { label: "F1", width: 1 },
    { label: "F2", width: 1 },
    { label: "F3", width: 1 },
    { label: "F4", width: 1 },
    { type: "spacer", width: 0.5 },
    { label: "F5", width: 1 },
    { label: "F6", width: 1 },
    { label: "F7", width: 1 },
    { label: "F8", width: 1 },
    { type: "spacer", width: 0.5 },
    { label: "F9", width: 1 },
    { label: "F10", width: 1 },
    { label: "F11", width: 1 },
    { label: "F12", width: 1 },
  ],
  [
    { label: "`", width: 1 },
    { label: "1", width: 1, code: "Digit1" },
    { label: "2", width: 1, code: "Digit2" },
    { label: "3", width: 1, code: "Digit3" },
    { label: "4", width: 1, code: "Digit4" },
    { label: "5", width: 1, code: "Digit5" },
    { label: "6", width: 1, code: "Digit6" },
    { label: "7", width: 1, code: "Digit7" },
    { label: "8", width: 1, code: "Digit8" },
    { label: "9", width: 1, code: "Digit9" },
    { label: "0", width: 1, code: "Digit0" },
    { label: "-", width: 1, code: "Minus" },
    { label: "=", width: 1, code: "Equal" },
    { label: "Bkspc", width: 2, code: "Backspace" },
  ],
  [
    { label: "Tab", width: 1.5 },
    { label: "Q", width: 1 },
    { label: "W", width: 1 },
    { label: "E", width: 1 },
    { label: "R", width: 1 },
    { label: "T", width: 1 },
    { label: "Y", width: 1 },
    { label: "U", width: 1 },
    { label: "I", width: 1 },
    { label: "O", width: 1 },
    { label: "P", width: 1 },
    { label: "[", width: 1 },
    { label: "]", width: 1 },
    { label: "\\", width: 1.5 },
  ],
  [
    { label: "Caps", width: 1.75, code: "CapsLock" },
    { label: "A", width: 1 },
    { label: "S", width: 1 },
    { label: "D", width: 1 },
    { label: "F", width: 1 },
    { label: "G", width: 1 },
    { label: "H", width: 1 },
    { label: "J", width: 1 },
    { label: "K", width: 1 },
    { label: "L", width: 1 },
    { label: ";", width: 1 },
    { label: "'", width: 1 },
    { label: "Enter", width: 2.25, code: "Enter" },
  ],
  [
    { label: "Shift", width: 2.5, code: "ShiftLeft" },
    { label: "Z", width: 1 },
    { label: "X", width: 1 },
    { label: "C", width: 1 },
    { label: "V", width: 1 },
    { label: "B", width: 1 },
    { label: "N", width: 1 },
    { label: "M", width: 1 },
    { label: ",", width: 1 },
    { label: ".", width: 1, code: "Period" },
    { label: "/", width: 1, code: "Slash" },
    { label: "Shift", width: 2.5, code: "ShiftRight" },
  ],
  [
    { label: "Ctrl", width: 1.25, code: "ControlLeft" },
    { label: "Win", width: 1.25, code: "MetaLeft" },
    { label: "Alt", width: 1.25, code: "AltLeft" },
    { label: "Space", width: 6.25, code: "Space" },
    { label: "Alt", width: 1.25, code: "AltRight" },
    { label: "Fn", width: 1.25 },
    { label: "Menu", width: 1.25, code: "ContextMenu" },
    { label: "Ctrl", width: 1.25, code: "ControlRight" },
  ],
];

const functionRows: Key[][] = [
  [
    { label: "PrtSc", width: 1, code: "PrintScreen" },
    { label: "ScrLk", width: 1, code: "ScrollLock" },
    { label: "Pause", width: 1, code: "Pause" },
  ],
  [
    { label: "Ins", width: 1 },
    { label: "Home", width: 1 },
    { label: "PgUp", width: 1 },
  ],
  [
    { label: "Del", width: 1 },
    { label: "End", width: 1 },
    { label: "PgDn", width: 1 },
  ],
  [{ type: "spacer", width: 3 }],
  [
    { type: "spacer", width: 1 },
    { label: "↑", width: 1, code: "ArrowUp" },
    { type: "spacer", width: 1 },
  ],
  [
    { label: "←", width: 1, code: "ArrowLeft" },
    { label: "↓", width: 1, code: "ArrowDown" },
    { label: "→", width: 1, code: "ArrowRight" },
  ],
];

const numpadKeys: Key[] = [
  { label: "Num", width: 1, code: "NumLock" },
  { label: "/", width: 1, code: "NumpadDivide" },
  { label: "*", width: 1, code: "NumpadMultiply" },
  { label: "-", width: 1, code: "NumpadSubtract" },
  { label: "7", width: 1, code: "Numpad7" },
  { label: "8", width: 1, code: "Numpad8" },
  { label: "9", width: 1, code: "Numpad9" },
  { label: "+", width: 1, height: 2, code: "NumpadAdd" },
  { label: "4", width: 1, code: "Numpad4" },
  { label: "5", width: 1, code: "Numpad5" },
  { label: "6", width: 1, code: "Numpad6" },
  { label: "1", width: 1, code: "Numpad1" },
  { label: "2", width: 1, code: "Numpad2" },
  { label: "3", width: 1, code: "Numpad3" },
  { label: "Enter", width: 1, height: 2, code: "NumpadEnter" },
  { label: "0", width: 2, code: "Numpad0" },
  { label: ".", width: 1, code: "NumpadDecimal" },
];

const numpadPositions: [number, number][] = [
  [0, 0],
  [1, 0],
  [2, 0],
  [3, 0],
  [0, 1],
  [1, 1],
  [2, 1],
  [3, 1],
  [0, 2],
  [1, 2],
  [2, 2],
  [0, 3],
  [1, 3],
  [2, 3],
  [3, 3],
  [0, 4],
  [2, 4],
];

const OMIT_KEYS = [
  "highlightedKeys",
  "groups",
  "keyGap",
  "sectionGap",
  "keySize",
  "layout",
  "os",
  "highlightColor",
  "backgroundColor",
] as const;

export const RLKeyboard: Component<RLKeyboardProps> = (props) => {
  const keyGap = (): number => props.keyGap ?? 8;
  const sectionGap = (): number => props.sectionGap ?? 40;
  const keySize = (): number => props.keySize ?? 40;
  const layout = (): "full" | "60" => props.layout ?? "full";
  const os = (): "windows" | "mac" => props.os ?? "windows";
  const highlightColor = (): string | undefined => props.highlightColor || undefined;
  const backgroundColor = (): string => props.backgroundColor || "transparent";
  const highlightedKeys = (): string[] => props.highlightedKeys ?? [];
  const groups = (): HighlightGroup[] => props.groups ?? [];

  const getKeyLabel = (key: Key): string | undefined => {
    if (os() !== "mac") return key.label;

    const macMap: Record<string, string> = {
      Ctrl: "control",
      Win: "option",
      Alt: "command",
      Bkspc: "delete",
      Enter: "return",
      Caps: "caps lock",
      Shift: "shift",
      Menu: "option",
      Tab: "tab",
      Esc: "esc",
    };

    const label = (key.label && macMap[key.label]) || key.label;

    if (label === "command") return "cmd ⌘";
    if (label === "option") return "opt ⌥";
    if (label === "control") return "ctrl ⌃";
    if (label === "shift") return "shift ⇧";
    if (label === "return") return "return ↩";
    if (label === "delete") return "delete ⌫";

    return label;
  };

  const getKeyHighlight = (key: Key): KeyHighlight => {
    const code = key.code || key.label || "";
    const label = key.label || "";
    const macLabel = getKeyLabel(key) || "";

    const isMatch = (list: string[]) => {
      if (!list || !Array.isArray(list)) return false;
      if (list.includes(code)) return true;
      if (list.includes(label)) {
        if (code.startsWith("Numpad") && /^\d$/.test(label)) return false;
        return true;
      }
      return os() === "mac" && list.includes(macLabel);
    };

    if (isMatch(highlightedKeys())) {
      return { active: true, color: highlightColor() };
    }

    for (const group of groups()) {
      if (isMatch(group.keys)) {
        return { active: true, color: group.color || highlightColor() };
      }
    }

    return { active: false, color: undefined };
  };

  const displayMainRows = createMemo<Key[][]>(() =>
    layout() === "60"
      ? [
          [{ label: "Esc", width: 1, code: "Escape" }, ...(mainRows[1] || []).slice(1)],
          ...mainRows.slice(2),
        ]
      : mainRows,
  );

  const processRows = (rows: Key[][], startX: number, startY: number): RenderKey[] => {
    const result: RenderKey[] = [];
    let currentY = startY;

    for (const row of rows) {
      let currentX = startX;
      for (const key of row) {
        const w = key.width || 1;
        const h = key.height || 1;
        const widthPx = w * keySize() + (w - 1) * keyGap();
        const heightPx = h * keySize() + (h - 1) * keyGap();

        if (key.type !== "spacer") {
          result.push({ ...key, x: currentX, y: currentY, w: widthPx, h: heightPx });
        }
        currentX += widthPx + keyGap();
      }
      currentY += keySize() + keyGap();
    }
    return result;
  };

  const mainRenderKeys = createMemo<RenderKey[]>(() => processRows(displayMainRows(), 0, 0));
  const mainHeight = (): number => displayMainRows().length * (keySize() + keyGap());

  const secondaryRenderKeys = createMemo<RenderKey[]>(() =>
    layout() === "full" ? processRows(functionRows, 0, mainHeight() + sectionGap()) : [],
  );

  const numpadRenderKeys = createMemo<RenderKey[]>(() => {
    if (layout() !== "full") return [];
    const result: RenderKey[] = [];
    const secondaryY = mainHeight() + sectionGap();
    const numpadX = 3 * keySize() + 3 * keyGap() + sectionGap();

    numpadKeys.forEach((key, i) => {
      const w = key.width || 1;
      const h = key.height || 1;
      const pxOffset = numpadPositions[i]?.[0] ?? 0;
      const pyOffset = numpadPositions[i]?.[1] ?? 0;
      const px = numpadX + pxOffset * (keySize() + keyGap());
      const py = secondaryY + (pyOffset + 1) * (keySize() + keyGap());

      result.push({
        ...key,
        x: px,
        y: py,
        w: w * keySize() + (w - 1) * keyGap(),
        h: h * keySize() + (h - 1) * keyGap(),
      });
    });

    return result;
  });

  const totalWidth = createMemo(() => {
    let width = 15 * keySize() + 14 * keyGap();
    if (layout() === "full") {
      const numpadX = 3 * keySize() + 3 * keyGap() + sectionGap();
      width = Math.max(width, numpadX + 4 * keySize() + 3 * keyGap());
    }
    return width;
  });

  const finalHeight = createMemo(() => {
    if (layout() === "full") {
      const secondaryY = mainHeight() + sectionGap();
      return secondaryY + 6 * keySize() + 5 * keyGap();
    }
    return mainHeight();
  });

  const allKeys = createMemo<RenderKey[]>(() => [
    ...mainRenderKeys(),
    ...secondaryRenderKeys(),
    ...numpadRenderKeys(),
  ]);

  const { Tag, classes, rest, children, theme } = RLKeyboardTheme.setup(props, {
    omit: OMIT_KEYS,
  });

  return (
    <Tag class={classes().root} data-slot="root" data-theme={theme()} {...rest}>
      <div class={classes().container} data-slot="container">
        <svg
          viewBox={`-16 -16 ${totalWidth() + 32} ${finalHeight() + 64}`}
          class={classes().svg}
          preserveAspectRatio="xMidYMid meet"
        >
          <Show when={backgroundColor() !== "transparent"}>
            <rect
              x="-16"
              y="-16"
              width={totalWidth() + 32}
              height={finalHeight() + 64}
              fill={backgroundColor()}
              rx="12"
            />
          </Show>

          <For each={allKeys()}>
            {(key) => {
              const highlight = getKeyHighlight(key);
              const label = getKeyLabel(key);
              const fillClass = highlight.color
                ? undefined
                : highlight.active
                  ? classes().keyCapFillActive
                  : classes().keyCapFill;
              const strokeClass = highlight.active
                ? classes().keyCapStrokeActive
                : classes().keyCapStroke;
              const labelClass = highlight.active
                ? classes().keyLabelActive
                : classes().keyLabelIdle;

              return (
                <g class={classes().keyGroup} data-highlighted={highlight.active ? "" : undefined}>
                  <rect
                    class={classes().keyShadow}
                    x={key.x}
                    y={key.y + 1}
                    width={key.w}
                    height={key.h}
                    rx="4"
                  />
                  <rect
                    class={fillClass}
                    x={key.x}
                    y={key.y}
                    width={key.w}
                    height={key.h}
                    rx="4"
                    fill={highlight.color}
                  />
                  <rect
                    class={strokeClass}
                    x={key.x}
                    y={key.y}
                    width={key.w}
                    height={key.h}
                    rx="4"
                    fill="none"
                    stroke-width="1"
                  />
                  <Show when={label}>
                    <text
                      x={key.x + key.w / 2}
                      y={key.y + key.h / 2}
                      text-anchor="middle"
                      dominant-baseline="central"
                      class={labelClass}
                    >
                      {label}
                    </text>
                  </Show>
                </g>
              );
            }}
          </For>
        </svg>
      </div>

      <Show when={groups().some((group) => group.label)}>
        <div class={classes().legend}>
          <For each={groups().filter((group) => group.label)}>
            {(group) => (
              <div class={classes().legendItem}>
                <svg width="8" height="8" class={classes().legendMarker}>
                  <rect
                    width="8"
                    height="8"
                    rx="2"
                    fill={group.color}
                    class={group.color ? undefined : classes().legendSwatch}
                  />
                </svg>
                <span class={classes().legendLabel}>{group.label}</span>
              </div>
            )}
          </For>
        </div>
      </Show>
      {children()}
    </Tag>
  );
};

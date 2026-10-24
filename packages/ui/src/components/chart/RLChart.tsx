import type { RLChartProps, ChartDataPoint } from "./chart.types";
import { RLChartTheme } from "./chart.theme";
import { createMemo, For, Show, type Component } from "solid-js";

const OMIT_KEYS = ["type", "data", "title", "height", "color"] as const;

const palette = [
  "hsl(221 83% 53%)",
  "hsl(262 83% 58%)",
  "hsl(142 76% 36%)",
  "hsl(32 95% 44%)",
  "hsl(0 84% 60%)",
  "hsl(187 85% 43%)",
];

const PIE_R = 80;
const PIE_CX = 100;
const PIE_CY = 100;
const DONUT_INNER_R = 45;
const LINE_W = 400;
const LINE_H = 160;
const LINE_PAD = 32;

const polarToCartesian = (cx: number, cy: number, r: number, angleDeg: number) => {
  const rad = (angleDeg - 90) * (Math.PI / 180);
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
};

const describeArc = (cx: number, cy: number, r: number, start: number, end: number) => {
  const s = polarToCartesian(cx, cy, r, start);
  const e = polarToCartesian(cx, cy, r, end);
  const largeArc = end - start > 180 ? 1 : 0;
  return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
};

export const RLChart: Component<RLChartProps> = (props) => {
  const { classes, rest, id } = RLChartTheme.setup(props, {
    omit: OMIT_KEYS,
    idPrefix: "rl-chart",
  });

  const data = createMemo(() => props.data ?? []);
  const chartType = () => props.type ?? "bar";

  const max = createMemo(() => {
    const items = data();
    return items.length > 0 ? Math.max(...items.map((d) => d.value)) : 1;
  });

  const total = createMemo(() => data().reduce((sum, d) => sum + d.value, 0));

  const getColor = (item: ChartDataPoint, index: number) => {
    const res = item.color ?? palette[index % palette.length];
    return res ?? "#000000";
  };

  const pieSlices = createMemo(() => {
    let cursor = 0;
    return data().map((item, i) => {
      const angle = (item.value / (total() || 1)) * 360;
      const start = cursor;
      const end = cursor + angle;
      cursor = end;
      return { item, i, start, end };
    });
  });

  const linePoints = createMemo(() =>
    data().map((d, i) => {
      const x =
        data().length < 2
          ? LINE_PAD
          : LINE_PAD + (i / (data().length - 1)) * (LINE_W - LINE_PAD * 2);
      const y = LINE_H - LINE_PAD - (d.value / (max() || 1)) * (LINE_H - LINE_PAD * 2);
      return { x, y, d, i };
    }),
  );

  const linePath = createMemo(() =>
    linePoints()
      .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
      .join(" "),
  );

  const areaPath = createMemo(() => {
    const pts = linePoints();
    if (pts.length === 0) return "";
    const last = pts[pts.length - 1]!;
    const first = pts[0]!;
    return (
      linePath() + ` L ${last.x} ${LINE_H - LINE_PAD}` + ` L ${first.x} ${LINE_H - LINE_PAD} Z`
    );
  });

  const gridLines = [0, 0.25, 0.5, 0.75, 1];

  const height = () => props.height ?? 280;

  return (
    <>
      <style>{`
  .${id()} { min-height: ${height()}px; }
  .${id()} [data-slot="container"] { height: ${height() - 60}px; gap: 6px; align-items: flex-end; }
  .${id()} .rl-chart-line-wrap { height: ${height() - 60}px; }
  .${id()} .rl-chart-pie-wrap { height: ${height() - 60}px; }
`}</style>

      <div class={`${classes().root}  ${id()}`} data-slot="root" {...rest}>
        <Show when={props.title}>
          {(t) => (
            <div class={classes().title} data-slot="title">
              {t()}
            </div>
          )}
        </Show>

        <Show when={chartType() === "bar"}>
          <div class={classes().container} data-slot="container">
            <For each={data()}>
              {(item, i) => {
                const pct = max() > 0 ? (item.value / max()) * 100 : 0;
                return (
                  <div class="flex flex-col items-center gap-1 flex-1 group">
                    <span class="text-[10px] text-muted font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.value}
                    </span>
                    <div
                      class={`${classes().bar} h-full w-full overflow-hidden !bg-transparent`}
                      title={`${item.label}: ${item.value}`}
                    >
                      <svg
                        class="h-full w-full overflow-visible"
                        viewBox="0 0 20 100"
                        preserveAspectRatio="none"
                      >
                        <rect
                          x="0"
                          y={100 - pct}
                          width="20"
                          height={pct}
                          fill={getColor(item, i())}
                          rx="2"
                        />
                      </svg>
                    </div>
                    <span class={classes().axis}>{item.label}</span>
                  </div>
                );
              }}
            </For>
          </div>
        </Show>

        <Show when={chartType() === "line" || chartType() === "area"}>
          <div class="relative w-full rl-chart-line-wrap">
            <svg
              class={classes().svg}
              viewBox={`0 0 ${LINE_W} ${LINE_H}`}
              preserveAspectRatio="none"
              aria-label={props.title ?? "Line chart"}
            >
              <For each={gridLines}>
                {(t) => {
                  const y = LINE_PAD + t * (LINE_H - LINE_PAD * 2);
                  return (
                    <line
                      x1={LINE_PAD}
                      y1={y}
                      x2={LINE_W - LINE_PAD}
                      y2={y}
                      stroke="currentColor"
                      stroke-opacity={0.08}
                    />
                  );
                }}
              </For>

              <Show when={chartType() === "area"}>
                <path d={areaPath()} fill={palette[0] ?? "currentColor"} fill-opacity={0.15} />
              </Show>

              <path
                d={linePath()}
                class={classes().line}
                stroke={palette[0] ?? "currentColor"}
                stroke-width={2.5}
              />

              <For each={linePoints()}>
                {(p) => (
                  <circle
                    cx={p.x}
                    cy={p.y}
                    r={4}
                    fill={getColor(p.d, p.i)}
                    stroke="white"
                    stroke-width={1.5}
                  >
                    {/* textContent, not children: dynamic children inside an SVG <title> break SSR
                        (the fragment is parsed as an HTML <title>, which can't hold hydration markers). */}
                    <title textContent={`${p.d.label}: ${p.d.value}`} />
                  </circle>
                )}
              </For>

              <For each={linePoints()}>
                {(p) => (
                  <text x={p.x} y={LINE_H - 4} text-anchor="middle" class={classes().axis}>
                    {p.d.label}
                  </text>
                )}
              </For>
            </svg>
          </div>
        </Show>

        <Show when={chartType() === "pie" || chartType() === "donut"}>
          <div class="flex items-center gap-6 justify-center rl-chart-pie-wrap">
            <svg
              viewBox="0 0 200 200"
              class="h-full w-auto max-h-48"
              aria-label={props.title ?? "Pie chart"}
            >
              <For each={pieSlices()}>
                {({ item, i, start, end }) => {
                  const isFullCircle = Math.abs(end - start - 360) < 0.01;
                  const d = isFullCircle
                    ? `M ${PIE_CX} ${PIE_CY - PIE_R} A ${PIE_R} ${PIE_R} 0 1 1 ${PIE_CX - 0.001} ${PIE_CY - PIE_R} Z`
                    : describeArc(PIE_CX, PIE_CY, PIE_R, start, end) + ` L ${PIE_CX} ${PIE_CY} Z`;
                  return (
                    <path
                      d={d}
                      fill={getColor(item, i)}
                      class="transition-opacity hover:opacity-85 cursor-pointer"
                    >
                      {/* textContent, not children: dynamic children inside an SVG <title> break SSR
                          (the fragment is parsed as an HTML <title>, which can't hold hydration markers). */}
                      <title textContent={`${item.label}: ${item.value}`} />
                    </path>
                  );
                }}
              </For>
              <Show when={chartType() === "donut"}>
                <circle cx={PIE_CX} cy={PIE_CY} r={DONUT_INNER_R} fill="var(--rl-neutral-50)" />
              </Show>
            </svg>

            <div class="flex flex-col gap-1.5">
              <For each={data()}>
                {(item, i) => (
                  <div class="flex items-center gap-2 text-xs text-muted">
                    <svg class="size-3 shrink-0" viewBox="0 0 10 10">
                      <rect width="10" height="10" rx="2" fill={getColor(item, i())} />
                    </svg>
                    <span>{item.label}</span>
                    <span class="ml-1 font-mono text-highlighted">{item.value}</span>
                  </div>
                )}
              </For>
            </div>
          </div>
        </Show>

        {props.children}

        <Show
          when={
            (chartType() === "bar" || chartType() === "line" || chartType() === "area") &&
            data().length > 0
          }
        >
          <div class={classes().legend} data-slot="legend">
            <For each={data()}>
              {(item, i) => (
                <div class="flex items-center gap-1.5">
                  <svg class="size-2.5 shrink-0" viewBox="0 0 10 10">
                    <circle cx="5" cy="5" r="5" fill={getColor(item, i())} />
                  </svg>
                  <span>{item.label}</span>
                </div>
              )}
            </For>
          </div>
        </Show>
      </div>
    </>
  );
};

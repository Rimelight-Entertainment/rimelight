import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLMarquee } from "@rimelight/ui/components/marquee/RLMarquee.tsx";
import type { ComponentAuditDefinition, TestScenario } from "./types";

const ORIENTATIONS = ["horizontal", "vertical"] as const;
const ITEMS = ["Design", "Build", "Ship", "Repeat"];

const MarqueeSandbox = (): JSX.Element => {
  const [orientation, setOrientation] = createSignal<(typeof ORIENTATIONS)[number]>("horizontal");
  const [reverse, setReverse] = createSignal(false);
  const [pauseOnHover, setPauseOnHover] = createSignal(true);
  const [speed, setSpeed] = createSignal(20);

  return (
    <div class="flex flex-col gap-6">
      <div class="flex flex-wrap gap-2">
        <For each={ORIENTATIONS}>
          {(o) => (
            <button type="button" onClick={() => setOrientation(o)}>
              orientation: {o}
            </button>
          )}
        </For>
        <button type="button" onClick={() => setReverse((v) => !v)}>
          reverse: {reverse() ? "on" : "off"}
        </button>
        <button type="button" onClick={() => setPauseOnHover((v) => !v)}>
          pauseOnHover: {pauseOnHover() ? "on" : "off"}
        </button>
        <button type="button" onClick={() => setSpeed((s) => (s === 20 ? 40 : 20))}>
          speed: {speed()}s
        </button>
      </div>
      <div class="p-4 rounded-xl border border-default overflow-hidden">
        <RLMarquee
          orientation={orientation()}
          reverse={reverse()}
          pauseOnHover={pauseOnHover()}
          speed={speed()}
          gap="2rem"
        >
          <For each={ITEMS}>{(item) => <span class="font-semibold">{item}</span>}</For>
        </RLMarquee>
      </div>
    </div>
  );
};

const testScenarios: TestScenario[] = [
  {
    id: "default-slot",
    title: "Default slot (children)",
    description: "Children are duplicated into two tracks. The second track is aria-hidden.",
    render: () => (
      <RLMarquee>
        <span>Scrolling text</span>
      </RLMarquee>
    ),
  },
  {
    id: "orientation",
    title: "Every orientation",
    description: "horizontal (default) and vertical.",
    render: () => (
      <div class="flex flex-col gap-6">
        <For each={ORIENTATIONS}>
          {(o) => (
            <RLMarquee orientation={o}>
              <span>{o}</span>
            </RLMarquee>
          )}
        </For>
      </div>
    ),
  },
  {
    id: "reverse",
    title: "reverse",
    description: "Reverses the scroll direction.",
    render: () => (
      <RLMarquee reverse>
        <span>Reversed</span>
      </RLMarquee>
    ),
  },
  {
    id: "speed",
    title: "speed",
    description: "Duration of one loop in seconds.",
    render: () => (
      <div class="flex flex-col gap-6">
        <RLMarquee speed={10}>
          <span>Fast (10s)</span>
        </RLMarquee>
        <RLMarquee speed={40}>
          <span>Slow (40s)</span>
        </RLMarquee>
      </div>
    ),
  },
  {
    id: "pause-on-hover",
    title: "pauseOnHover",
    description: "Default true pauses on hover. Set false to keep moving under the cursor.",
    render: () => (
      <div class="flex flex-col gap-6">
        <RLMarquee pauseOnHover>
          <span>Pauses on hover (default)</span>
        </RLMarquee>
        <RLMarquee pauseOnHover={false}>
          <span>Never pauses</span>
        </RLMarquee>
      </div>
    ),
  },
  {
    id: "gap",
    title: "gap (string and number)",
    description: "gap sets the spacing between repeated items.",
    render: () => (
      <div class="flex flex-col gap-6">
        <RLMarquee gap="4rem">
          <span>String gap</span>
        </RLMarquee>
        <RLMarquee gap={8}>
          <span>Number gap</span>
        </RLMarquee>
      </div>
    ),
  },
];

export const marqueeAudit: ComponentAuditDefinition = {
  id: "marquee",
  name: "Marquee",
  category: "Media & Visuals",
  status: "Auditing",
  description: "Continuously scrolling content track, duplicated for a seamless loop.",
  importPath: "@rimelight/ui/components/marquee/RLMarquee.tsx",
  renderSandbox: () => <MarqueeSandbox />,
  testScenarios,
};

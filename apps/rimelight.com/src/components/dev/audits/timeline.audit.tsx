import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLTimeline } from "@rimelight/ui/components/timeline/RLTimeline.tsx";
import { RLIcon } from "@rimelight/ui/components/icon/RLIcon.tsx";
import type { ComponentAuditDefinition } from "./types";

const SIZES = ["xs", "sm", "md", "lg", "xl"] as const;
const ORIENTATIONS = ["vertical", "horizontal"] as const;

const ITEMS = [
  {
    value: "created",
    date: "Jan 4",
    title: "Project created",
    description: "The workspace was set up with the default template.",
    icon: "circle-check",
  },
  {
    value: "review",
    date: "Feb 12",
    title: "Design review",
    description: "Feedback collected from three reviewers.",
    icon: "eye",
  },
  {
    value: "launch",
    date: "Mar 30",
    title: "Launch",
    description: "Version 1.0 shipped to production.",
    icon: "rocket",
  },
];

export const TimelineSandbox = (): JSX.Element => {
  const [size, setSize] = createSignal<(typeof SIZES)[number]>("md");
  const [orientation, setOrientation] = createSignal<(typeof ORIENTATIONS)[number]>("vertical");
  const [value, setValue] = createSignal<string | undefined>("review");
  const [reverse, setReverse] = createSignal(false);

  return (
    <div class="flex flex-col gap-6">
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-3 text-xs">
        <span class="font-semibold text-muted">size:</span>
        <For each={SIZES}>
          {(s) => (
            <button
              type="button"
              class={`px-2 py-1 rounded border border-default ${size() === s ? "bg-primary text-on-primary" : ""}`}
              onClick={() => setSize(s)}
            >
              {s}
            </button>
          )}
        </For>
        <span class="font-semibold text-muted">orientation:</span>
        <For each={ORIENTATIONS}>
          {(o) => (
            <button
              type="button"
              class={`px-2 py-1 rounded border border-default ${orientation() === o ? "bg-primary text-on-primary" : ""}`}
              onClick={() => setOrientation(o)}
            >
              {o}
            </button>
          )}
        </For>
        <span class="font-semibold text-muted">value:</span>
        <button
          type="button"
          class="px-2 py-1 rounded border border-default"
          onClick={() => setValue(undefined)}
        >
          none
        </button>
        <For each={ITEMS}>
          {(item) => (
            <button
              type="button"
              class={`px-2 py-1 rounded border border-default ${value() === item.value ? "bg-primary text-on-primary" : ""}`}
              onClick={() => setValue(item.value)}
            >
              {item.value}
            </button>
          )}
        </For>
        <button
          type="button"
          class={`px-2 py-1 rounded border border-default ${reverse() ? "bg-primary text-on-primary" : ""}`}
          onClick={() => setReverse(!reverse())}
        >
          reverse
        </button>
      </div>

      <RLTimeline
        items={ITEMS}
        size={size()}
        orientation={orientation()}
        value={value()}
        reverse={reverse()}
      />
    </div>
  );
};

export const timelineAudit: ComponentAuditDefinition = {
  id: "timeline",
  name: "Timeline",
  category: "Data Display",
  status: "Auditing",
  description:
    "An ordered list of dated entries with indicators, connecting separators, and active or completed states derived from value.",
  importPath: "@rimelight/ui/components/timeline/RLTimeline.tsx",
  renderSandbox: () => <TimelineSandbox />,
  testScenarios: [
    {
      id: "sizes",
      title: "Size matrix",
      description: "Every size scales the indicators and spacing.",
      render: () => (
        <div class="flex flex-col gap-8">
          <For each={SIZES}>{(s) => <RLTimeline items={ITEMS} size={s} value="review" />}</For>
        </div>
      ),
    },
    {
      id: "horizontal",
      title: "Horizontal orientation",
      description: "Entries are laid out along the horizontal axis.",
      render: () => <RLTimeline items={ITEMS} orientation="horizontal" value="launch" />,
    },
    {
      id: "value-states",
      title: "Active and completed states",
      description: "Entries before value are completed; the matching entry is active.",
      render: () => <RLTimeline items={ITEMS} value="review" />,
    },
    {
      id: "default-value",
      title: "defaultValue",
      description: "Initial active entry when value is not controlled.",
      render: () => <RLTimeline items={ITEMS} defaultValue={0} />,
    },
    {
      id: "reverse",
      title: "Reverse",
      description: "Reverses the completion order for the active entry.",
      render: () => <RLTimeline items={ITEMS} value="launch" reverse />,
    },
    {
      id: "indicator-slot",
      title: "indicatorSlot",
      description:
        "Render-function slot that replaces the avatar and icon in each indicator. Receives item and index.",
      render: () => (
        <RLTimeline
          items={ITEMS}
          value="review"
          indicatorSlot={({ index }) => (
            <span class="flex size-full items-center justify-center text-xs font-semibold">
              {index + 1}
            </span>
          )}
        />
      ),
    },
    {
      id: "wrapper-slot",
      title: "wrapperSlot",
      description:
        "Render-function slot that replaces the date, title, and description of each entry.",
      render: () => (
        <RLTimeline
          items={ITEMS}
          wrapperSlot={({ item }) => (
            <div class="flex flex-col">
              <span class="font-semibold">{item.title}</span>
              <span class="text-xs text-muted">{item.date}</span>
            </div>
          )}
        />
      ),
    },
    {
      id: "date-slot",
      title: "dateSlot",
      description: "Render-function slot that replaces the date text of each entry.",
      render: () => (
        <RLTimeline
          items={ITEMS}
          dateSlot={({ item }) => <span class="uppercase text-xs">{item.date}</span>}
        />
      ),
    },
    {
      id: "title-slot",
      title: "titleSlot",
      description: "Render-function slot that replaces the title text of each entry.",
      render: () => (
        <RLTimeline
          items={ITEMS}
          titleSlot={({ item, index }) => (
            <span class="font-semibold">
              {index + 1}. {item.title}
            </span>
          )}
        />
      ),
    },
    {
      id: "description-slot",
      title: "descriptionSlot",
      description: "Render-function slot that replaces the description text of each entry.",
      render: () => (
        <RLTimeline
          items={ITEMS}
          descriptionSlot={({ item }) => <span class="italic">{item.description}</span>}
        />
      ),
    },
    {
      id: "children",
      title: "Default slot (children)",
      description: "Children render in place of the items when items is empty.",
      render: () => (
        <RLTimeline items={[]}>
          <p class="flex items-center gap-2 text-sm text-muted">
            <RLIcon name="clock" />
            No activity yet.
          </p>
        </RLTimeline>
      ),
    },
  ],
  checklist: [
    {
      criterion: "Active and completed state",
      status: "pending",
      notes: "data-state reflects value (active or completed) and is absent for upcoming entries.",
    },
    {
      criterion:
        "Slot parity (indicatorSlot, wrapperSlot, dateSlot, titleSlot, descriptionSlot, children)",
      status: "pending",
      notes: "Each slot replaces only its region. Children render only when items is empty.",
    },
  ],
};

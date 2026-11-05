import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLError } from "@rimelight/ui/components/error/RLError.tsx";
import type { ComponentAuditDefinition } from "./types";

const STATUSES = [400, 401, 403, 404, 408, 429, 500, 503] as const;
const COLORS = ["error", "primary", "warning"] as const;

export const ErrorSandbox = (): JSX.Element => {
  const [status, setStatus] = createSignal<number>(404);
  const [color, setColor] = createSignal<(typeof COLORS)[number]>("error");
  const [fullscreen, setFullscreen] = createSignal(false);
  const [hideStatus, setHideStatus] = createSignal(false);

  return (
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap gap-2 text-xs">
        <For each={STATUSES}>
          {(s) => (
            <button type="button" onClick={() => setStatus(s)}>
              status: {s}
            </button>
          )}
        </For>
        <For each={COLORS}>
          {(c) => (
            <button type="button" onClick={() => setColor(c)}>
              color: {c}
            </button>
          )}
        </For>
        <button type="button" onClick={() => setFullscreen((v) => !v)}>
          fullscreen: {String(fullscreen())}
        </button>
        <button type="button" onClick={() => setHideStatus((v) => !v)}>
          hideStatus: {String(hideStatus())}
        </button>
      </div>
      <RLError
        status={status()}
        title="Page not found"
        description="The page you were looking for does not exist."
        color={color()}
        fullscreen={fullscreen()}
        hideStatus={hideStatus()}
      />
    </div>
  );
};

export const errorAudit: ComponentAuditDefinition = {
  id: "error",
  name: "Error",
  category: "Feedback",
  status: "Auditing",
  description:
    "Error page with an HTTP status badge, title, description, actions, optional developer details, and a fullscreen or inline layout.",
  importPath: "@rimelight/ui/components/error/RLError.tsx",
  renderSandbox: () => <ErrorSandbox />,
  testScenarios: [
    {
      id: "status-codes",
      title: "Status codes",
      description: "Renders the status badge for each mapped status code.",
      render: () => (
        <div class="flex flex-col gap-3">
          <For each={STATUSES}>
            {(s) => <RLError status={s} title={`Status ${s}`} fullscreen={false} />}
          </For>
        </div>
      ),
    },
    {
      id: "hide-status",
      title: "hideStatus prop",
      description: "Hides the status badge while keeping the title and description.",
      render: () => (
        <RLError
          status={404}
          hideStatus={true}
          title="Hidden status"
          description="No badge shown."
          fullscreen={false}
        />
      ),
    },
    {
      id: "actions-prop",
      title: "actions prop",
      description: "Actions covering label, icon, color, variant, href, onClick, and class.",
      render: () => (
        <RLError
          status={500}
          title="Actions"
          fullscreen={false}
          actions={[
            {
              label: "Retry",
              icon: "i-lucide-refresh-cw",
              color: "primary",
              variant: "solid",
              onClick: () => {},
            },
            { label: "Contact support", href: "/support", variant: "outline", class: "uppercase" },
          ]}
        />
      ),
    },
    {
      id: "error-and-details",
      title: "error prop and hasDetails",
      description:
        "Passes an Error value and enables hasDetails. Details only render in dev builds, per the component's isDevEnvironment check.",
      render: () => (
        <RLError
          status={500}
          title="Details"
          error={new Error("Something broke in the loader")}
          hasDetails={true}
          fullscreen={false}
        />
      ),
    },
    {
      id: "icon-prop",
      title: "icon prop",
      description: "Overrides the default icon.",
      render: () => <RLError status={403} icon="lock" title="Forbidden" fullscreen={false} />,
    },
    {
      id: "icon-slot",
      title: "iconSlot slot",
      description: "Passes a custom element as the icon region.",
      render: () => (
        <RLError
          status={404}
          iconSlot={<span class="text-4xl">🧭</span>}
          title="Lost"
          fullscreen={false}
        />
      ),
    },
    {
      id: "actions-slot",
      title: "actionsSlot slot",
      description: "Replaces the actions prop with custom action content.",
      render: () => (
        <RLError
          status={404}
          actionsSlot={
            <button type="button" class="underline">
              Custom action
            </button>
          }
          title="Actions slot"
          fullscreen={false}
        />
      ),
    },
    {
      id: "footer-slot",
      title: "footerSlot slot",
      description: "Passes content into the footer region.",
      render: () => (
        <RLError
          status={404}
          footerSlot={<span class="text-xs">Footer note</span>}
          title="Footer slot"
          fullscreen={false}
        />
      ),
    },
    {
      id: "default-slot",
      title: "Default slot children (body)",
      description: "Children render in the body region.",
      render: () => (
        <RLError status={404} title="Body slot" fullscreen={false}>
          <p class="text-sm">Custom body content.</p>
        </RLError>
      ),
    },
    {
      id: "color-and-fullscreen",
      title: "color and fullscreen variants",
      description: "Renders each color variant inline, and the fullscreen layout once.",
      render: () => (
        <div class="flex flex-col gap-3">
          <For each={COLORS}>
            {(c) => <RLError status={500} color={c} title={`Color ${c}`} fullscreen={false} />}
          </For>
          <RLError status={404} title="Fullscreen" fullscreen={true} />
        </div>
      ),
    },
  ],
};

import { createSignal, Show } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLErrorBoundary } from "@rimelight/ui/components/error-boundary/RLErrorBoundary.tsx";
import { HttpError } from "@rimelight/ui/components/error/http-error.ts";
import type { ComponentAuditDefinition } from "./types";

const ThrowOnRender = (props: { error: unknown }): JSX.Element => {
  if (props.error !== undefined) throw props.error;
  return <p class="text-sm">Protected content renders normally.</p>;
};

export const ErrorBoundarySandbox = (): JSX.Element => {
  const [failing, setFailing] = createSignal<unknown>(undefined);

  return (
    <div class="flex flex-col gap-4">
      <div class="flex flex-wrap gap-2 text-xs">
        <button type="button" onClick={() => setFailing(new HttpError(404, "Not here"))}>
          throw HttpError 404
        </button>
        <button type="button" onClick={() => setFailing(new Error("Unexpected failure"))}>
          throw Error
        </button>
        <button type="button" onClick={() => setFailing(undefined)}>
          clear
        </button>
      </div>
      <RLErrorBoundary homeHref="/" retryLabel="Try again" homeLabel="Home">
        <Show when={failing() === undefined} fallback={<ThrowOnRender error={failing()} />}>
          <p class="text-sm">Protected content.</p>
        </Show>
      </RLErrorBoundary>
    </div>
  );
};

export const errorBoundaryAudit: ComponentAuditDefinition = {
  id: "error-boundary",
  name: "Error Boundary",
  category: "Feedback",
  status: "Auditing",
  description:
    "Catches errors thrown by its children and renders an error page (RLError) with retry and home actions, or a custom fallback.",
  importPath: "@rimelight/ui/components/error-boundary/RLErrorBoundary.tsx",
  renderSandbox: () => <ErrorBoundarySandbox />,
  testScenarios: [
    {
      id: "default-slot",
      title: "Default slot children (protected content)",
      description: "Children render normally when nothing throws.",
      render: () => (
        <RLErrorBoundary>
          <p class="text-sm">Protected content.</p>
        </RLErrorBoundary>
      ),
    },
    {
      id: "fallback-slot",
      title: "fallbackSlot slot with reset",
      description:
        "fallbackSlot receives { error, reset }. Renders a custom fallback instead of the default RLError page.",
      render: () => (
        <RLErrorBoundary
          fallbackSlot={({ error, reset }) => (
            <div class="flex flex-col gap-2 rounded-md border border-default p-4">
              <span class="text-sm">Custom fallback: {(error as Error).message}</span>
              <button type="button" class="underline" onClick={reset}>
                Reset
              </button>
            </div>
          )}
        >
          <ThrowOnRender error={new Error("Boom")} />
        </RLErrorBoundary>
      ),
    },
    {
      id: "error-props",
      title: "errorProps prop",
      description: "Forwards props (title, description, fullscreen) to the RLError fallback.",
      render: () => (
        <RLErrorBoundary
          errorProps={{
            title: "Custom title",
            description: "Custom description",
            fullscreen: false,
          }}
        >
          <ThrowOnRender error={new HttpError(403, "Forbidden area")} />
        </RLErrorBoundary>
      ),
    },
    {
      id: "labels-and-href",
      title: "retryLabel, homeLabel, homeHref",
      description: "Overrides the retry and home button labels and the home link.",
      render: () => (
        <RLErrorBoundary retryLabel="Retry now" homeLabel="Back to start" homeHref="/start">
          <ThrowOnRender error={new Error("Labels")} />
        </RLErrorBoundary>
      ),
    },
    {
      id: "reset-key-and-on-error",
      title: "resetKey and onError",
      description:
        "resetKey clears the error state when it changes. onError receives each caught error.",
      render: () => {
        const [key, setKey] = createSignal(0);
        return (
          <div class="flex flex-col gap-2">
            <button type="button" class="text-xs underline" onClick={() => setKey((k) => k + 1)}>
              Change resetKey ({key()})
            </button>
            <RLErrorBoundary resetKey={key()} onError={(e) => console.error(e)}>
              <ThrowOnRender error={new Error("Reset key demo")} />
            </RLErrorBoundary>
          </div>
        );
      },
    },
    {
      id: "conditional-children",
      title: "Children toggled by Show",
      description: "Children mounted and unmounted by a Show guard.",
      render: () => {
        const [visible, setVisible] = createSignal(true);
        return (
          <div class="flex flex-col gap-2">
            <button type="button" class="text-xs underline" onClick={() => setVisible((v) => !v)}>
              Toggle children
            </button>
            <RLErrorBoundary>
              <Show when={visible()}>
                <p class="text-sm">Visible child</p>
              </Show>
            </RLErrorBoundary>
          </div>
        );
      },
    },
  ],
};

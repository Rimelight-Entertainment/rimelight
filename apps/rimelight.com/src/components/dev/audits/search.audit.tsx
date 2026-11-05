import { createSignal, For } from "solid-js";
import type { JSX } from "@solidjs/web";
import { RLSearch } from "@rimelight/ui/components/search/RLSearch.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { type ComponentAuditDefinition } from "./types";

export const SearchSandbox = (): JSX.Element => {
  const [open, setOpen] = createSignal(false);
  const [endpoint, setEndpoint] = createSignal("/api/search");

  return (
    <div class="flex flex-col gap-6">
      <p class="text-xs text-muted">
        Opens a search modal. Shortcuts: Cmd/Ctrl+K and "/" open it, Escape closes it. Each instance
        registers these global shortcuts, so mount only one at a time. The default endpoint is{" "}
        <code>/api/search</code>. This app does not serve that route, so queries show the empty
        state.
      </p>

      {/* Control Toolbar */}
      <div class="p-4 rounded-xl border border-default bg-elevated/20 flex flex-wrap items-center gap-4 text-xs">
        <div class="flex items-center gap-2">
          <span class="text-muted">Endpoint:</span>
          <For each={["/api/search", "/api/missing-search"]}>
            {(e) => (
              <button
                type="button"
                onClick={() => setEndpoint(e)}
                class={`px-2 py-1 rounded-md transition-colors ${
                  endpoint() === e
                    ? "bg-primary text-inverted"
                    : "bg-elevated text-muted hover:text-default border border-default"
                }`}
              >
                {e}
              </button>
            )}
          </For>
        </div>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          class={`px-2 py-1 rounded-md transition-colors ${
            open()
              ? "bg-primary text-inverted"
              : "bg-elevated text-muted hover:text-default border border-default"
          }`}
        >
          controlled open: {open() ? "open" : "closed"}
        </button>
      </div>

      {/* Preview Area */}
      <div class="p-8 rounded-xl border border-default bg-elevated/10 flex flex-wrap items-center justify-center gap-6">
        <RLSearch endpoint={endpoint()} open={open()} onOpenChange={setOpen} />
      </div>
    </div>
  );
};

export const searchAudit: ComponentAuditDefinition = {
  id: "search",
  name: "Search",
  category: "Navigation",
  status: "Auditing",
  description:
    "A search trigger that opens a modal with a query input and live results from a search endpoint, with keyboard shortcuts and an empty state.",
  importPath: "@rimelight/ui/components/search/RLSearch.tsx",
  renderSandbox: () => <SearchSandbox />,
  testScenarios: [
    {
      id: "default-slot",
      title: "Default slot (trigger children)",
      description: "Children are used as the trigger content when no triggerSlot is set.",
      render: () => <RLSearch>Search the site</RLSearch>,
    },
    {
      id: "trigger-slot",
      title: "triggerSlot (takes precedence over children)",
      description: "triggerSlot renders the trigger. Children are ignored in this case.",
      render: () => (
        <RLSearch triggerSlot={() => <RLButton variant="outline">Trigger slot</RLButton>}>
          Ignored children
        </RLSearch>
      ),
    },
    {
      id: "placeholder-and-messages",
      title: "placeholder and messages",
      description: "Custom input placeholder plus custom no-results and footer hint strings.",
      render: () => (
        <RLSearch
          placeholder="Find a page"
          messages={{
            searchPlaceholder: "Type to search",
            noResultsLabel: "Nothing matched",
            footerBackendHint: "Backend hint text",
          }}
        >
          Custom messages
        </RLSearch>
      ),
    },
    {
      id: "default-endpoint-empty-state",
      title: "Default endpoint (empty state)",
      description:
        "Uses the default /api/search endpoint. Typing a query shows the empty state because the app does not serve this route.",
      render: () => <RLSearch>Default endpoint</RLSearch>,
    },
    {
      id: "default-open",
      title: "defaultOpen",
      description: "Modal starts open. Escape or the close control dismisses it.",
      render: () => <RLSearch defaultOpen>Starts open</RLSearch>,
    },
  ],
};

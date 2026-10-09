import { createSignal, Show, type Component } from "solid-js";
import { CMSDashboardLayout } from "../layouts/CMSDashboardLayout";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { useCmsApi } from "./_shared";

export interface SettingsPageProps {
  basePath?: string | undefined;
  apiBase?: string | undefined;
  initialSettings?: any;
}

export const SettingsPage: Component<SettingsPageProps> = (props) => {
  const apiBase = () => props.apiBase ?? "/api/cms";
  const remote = useCmsApi<{ settings: any }>(() =>
    props.initialSettings ? null : `${apiBase()}/settings`,
  );
  const settings = () => props.initialSettings ?? remote.data()?.settings ?? {};

  const [name, setName] = createSignal("");
  const [description, setDescription] = createSignal("");
  const [url, setUrl] = createSignal("");
  const [hydrated, setHydrated] = createSignal(false);
  const [saving, setSaving] = createSignal(false);
  const [status, setStatus] = createSignal<string | null>(null);

  const hydrate = () => {
    if (!hydrated() && (remote.data() || props.initialSettings)) {
      const s = settings();
      setName(s.name ?? "");
      setDescription(s.description ?? "");
      setUrl(s.url ?? "");
      setHydrated(true);
    }
  };
  hydrate();

  const save = async (e: Event) => {
    e.preventDefault();
    setSaving(true);
    setStatus(null);
    try {
      const res = await fetch(`${apiBase()}/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name(), description: description(), url: url() }),
      });
      if (!res.ok) throw new Error(`Save failed (${res.status})`);
      setStatus("Settings saved");
    } catch (e: any) {
      setStatus(e?.message ?? "Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <CMSDashboardLayout
      title="Settings"
      description="Global site branding and SEO defaults"
      activeSection="settings"
      basePath={props.basePath ?? "/cms"}
    >
      <Show when={remote.loading() && !props.initialSettings}>
        <p class="text-sm text-muted">Loading settings…</p>
      </Show>
      <Show when={hydrated()}>
        <form onSubmit={(e) => void save(e)} class="max-w-2xl flex flex-col gap-4">
          <Show when={status()}>
            <p class="text-sm text-muted">{status()}</p>
          </Show>
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-medium">Site name</span>
            <input
              class="border border-default rounded-md px-3 py-2 bg-default"
              value={name()}
              onInput={(e) => setName(e.currentTarget.value)}
            />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-medium">Description</span>
            <input
              class="border border-default rounded-md px-3 py-2 bg-default"
              value={description()}
              onInput={(e) => setDescription(e.currentTarget.value)}
            />
          </label>
          <label class="flex flex-col gap-1 text-sm">
            <span class="font-medium">URL</span>
            <input
              class="border border-default rounded-md px-3 py-2 bg-default"
              value={url()}
              onInput={(e) => setUrl(e.currentTarget.value)}
            />
          </label>
          <div>
            <RLButton type="submit" variant="solid" color="primary" size="sm" disabled={saving()}>
              {saving() ? "Saving…" : "Save Settings"}
            </RLButton>
          </div>
        </form>
      </Show>
    </CMSDashboardLayout>
  );
};

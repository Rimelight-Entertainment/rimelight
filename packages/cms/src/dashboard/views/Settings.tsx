import { Show, createSignal, type Component } from "solid-js";
import { useDashboard } from "../context";
import { inputClass } from "../fields/FieldInput";
import { Button, Field, Loading, PageHeader, useLoader } from "../ui";

export const Settings: Component = () => {
  const { api, toast } = useDashboard();
  const loaded = useLoader(() => api.settings.get());
  const [draft, setDraft] = createSignal<any>(null);
  const s = () => draft() ?? loaded.data()?.settings;
  const set = (patch: Record<string, unknown>) => setDraft({ ...s(), ...patch });
  const [busy, setBusy] = createSignal(false);

  const text = (key: string, label: string, hint?: string) => (
    <Field label={label} {...(hint ? { hint } : {})}>
      <input
        class={inputClass}
        value={s()?.[key] ?? ""}
        onInput={(e) => set({ [key]: e.currentTarget.value })}
      />
    </Field>
  );

  return (
    <div>
      <PageHeader
        icon="i-lucide-settings"
        title="Settings"
        actions={
          <Button
            variant="primary"
            loading={busy()}
            disabled={!draft()}
            onClick={async () => {
              setBusy(true);
              try {
                const { createdAt: _c, updatedAt: _u, id: _i, ...body } = draft();
                await api.settings.update(body);
                setDraft(null);
                void loaded.reload();
                toast("Settings saved", "success");
              } catch (err) {
                toast((err as Error).message, "error");
              } finally {
                setBusy(false);
              }
            }}
          >
            Save
          </Button>
        }
      />
      <Loading when={!s()}>
        <div class="grid max-w-4xl gap-8 p-6 md:grid-cols-2">
          <section class="flex flex-col gap-3">
            <h2 class="text-sm font-semibold text-highlighted">Site</h2>
            {text("name", "Site name")}
            {text("description", "Description")}
            {text("url", "URL")}
            {text("author", "Author")}
            {text("email", "Contact email")}
            {text("ogImage", "Default social image")}
          </section>
          <section class="flex flex-col gap-3">
            <h2 class="text-sm font-semibold text-highlighted">SEO</h2>
            <Field label="Title template" hint="%s is replaced with the page title">
              <input
                class={inputClass}
                value={s()?.seo?.titleTemplate ?? ""}
                onInput={(e) => set({ seo: { ...s().seo, titleTemplate: e.currentTarget.value } })}
              />
            </Field>
            <Field label="Max description length">
              <input
                type="number"
                class={inputClass}
                value={s()?.seo?.maxDescriptionLength ?? 160}
                onInput={(e) =>
                  set({ seo: { ...s().seo, maxDescriptionLength: Number(e.currentTarget.value) } })
                }
              />
            </Field>
            <h2 class="pt-4 text-sm font-semibold text-highlighted">Maintenance</h2>
            <Show when={true}>
              <Button
                icon="i-lucide-refresh-cw"
                onClick={async () => {
                  try {
                    const { indexed } = await api.reindex();
                    toast(`Reindexed ${indexed} entries`, "success");
                  } catch (err) {
                    toast((err as Error).message, "error");
                  }
                }}
              >
                Rebuild search index
              </Button>
            </Show>
          </section>
        </div>
      </Loading>
    </div>
  );
};

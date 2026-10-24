import { For, Show, createSignal, type Component } from "solid-js";
import { useDashboard } from "../context";
import { FieldInput, inputClass } from "../fields/FieldInput";
import { Button, Empty, Field, Loading, Modal, PageHeader, useLoader } from "../ui";

export const Bylines: Component = () => {
  const { api, toast } = useDashboard();
  const list = useLoader(() => api.bylines.list());
  const [editing, setEditing] = createSignal<Record<string, any> | null>(null);
  const set = (patch: Record<string, any>) => setEditing({ ...editing()!, ...patch });

  const save = async () => {
    const { id, createdAt: _c, updatedAt: _u, deletedAt: _d, ...body } = editing()!;
    try {
      if (id) await api.bylines.update(id, body);
      else await api.bylines.create(body);
      setEditing(null);
      void list.reload();
    } catch (err) {
      toast((err as Error).message, "error");
    }
  };

  return (
    <div>
      <PageHeader
        icon="i-lucide-users"
        title="Bylines"
        description="Public author and contributor profiles credited on entries."
        actions={<Button variant="primary" icon="i-lucide-plus" onClick={() => setEditing({ name: "", socials: {} })}>New byline</Button>}
      />
      <div class="p-6">
        <Loading when={list.loading() && !list.data()}>
          <Show when={list.data()?.bylines.length} fallback={<Empty icon="i-lucide-user" title="No bylines yet" />}>
            <div class="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <For each={list.data()!.bylines}>
                {(b) => (
                  <button type="button" class="flex items-center gap-3 rounded-xl border border-default p-4 text-left hover:bg-elevated" onClick={() => setEditing({ ...b })}>
                    <Show when={b.avatar} fallback={<span class="flex size-10 items-center justify-center rounded-full bg-elevated text-sm font-semibold">{b.name.slice(0, 1)}</span>}>
                      <img src={b.avatar} alt="" class="size-10 rounded-full object-cover" />
                    </Show>
                    <div class="min-w-0">
                      <div class="truncate font-medium text-highlighted">{b.name}</div>
                      <div class="truncate text-xs text-muted">{b.bio ?? `@${b.slug}`}</div>
                    </div>
                  </button>
                )}
              </For>
            </div>
          </Show>
        </Loading>
      </div>
      <Modal
        open={!!editing()}
        title={editing()?.id ? "Edit byline" : "New byline"}
        onClose={() => setEditing(null)}
        footer={
          <>
            <Show when={editing()?.id}>
              <Button variant="ghost" class="mr-auto text-error-500" onClick={async () => {
                if (!confirm("Delete this byline?")) return;
                await api.bylines.remove(editing()!.id);
                setEditing(null);
                void list.reload();
              }}>Delete</Button>
            </Show>
            <Button variant="primary" onClick={() => void save()}>Save</Button>
          </>
        }
      >
        <Show when={editing()}>
          <div class="flex flex-col gap-3">
            <Field label="Name"><input class={inputClass} value={editing()!.name} onInput={(e) => set({ name: e.currentTarget.value })} /></Field>
            <Field label="Slug"><input class={`${inputClass} font-mono`} placeholder="auto" value={editing()!.slug ?? ""} onInput={(e) => set({ slug: e.currentTarget.value })} /></Field>
            <FieldInput name="avatar" field={{ type: "media", label: "Avatar" }} value={editing()!.avatar} onChange={(v) => set({ avatar: v })} />
            <Field label="Bio"><textarea class={inputClass} value={editing()!.bio ?? ""} onInput={(e) => set({ bio: e.currentTarget.value })} /></Field>
            <Field label="Website"><input class={inputClass} value={editing()!.websiteUrl ?? ""} onInput={(e) => set({ websiteUrl: e.currentTarget.value })} /></Field>
            <Field label="Linked user id" hint="Optional: ties this byline to a sign-in account."><input class={inputClass} value={editing()!.userId ?? ""} onInput={(e) => set({ userId: e.currentTarget.value || null })} /></Field>
            <For each={["twitter", "github", "bluesky", "youtube"]}>
              {(net) => (
                <Field label={net}><input class={inputClass} value={editing()!.socials?.[net] ?? ""} onInput={(e) => set({ socials: { ...editing()!.socials, [net]: e.currentTarget.value } })} /></Field>
              )}
            </For>
          </div>
        </Show>
      </Modal>
    </div>
  );
};

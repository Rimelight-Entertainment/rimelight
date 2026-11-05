import { For, Match, Show, Switch, createMemo, createSignal, type Component } from "solid-js";
import { useDashboard } from "../context";
import { FieldInput } from "../fields/FieldInput";
import { RLInput } from "@rimelight/ui/components/input/RLInput.tsx";
import { RLSelect } from "@rimelight/ui/components/select/RLSelect.tsx";
import { RLSwitch } from "@rimelight/ui/components/switch/RLSwitch.tsx";
import { RLTable, type TableColumn } from "@rimelight/ui/components/table/RLTable.tsx";
import { RLTabs } from "@rimelight/ui/components/tabs/RLTabs.tsx";
import { RLTextarea } from "@rimelight/ui/components/textarea/RLTextarea.tsx";
import { Button, Empty, Field, Loading, Modal, PageHeader, useLoader } from "../ui";
import type { BylineFieldRecord, BylineRecord, BylineWriteInput } from "../api";
import {
  BYLINE_FIELD_TYPES,
  type BylineFieldInputValue,
  type BylineFieldStored,
  type BylineFieldType,
  type BylineFieldValue,
  type BylineFieldsPatch,
} from "../../core/types/bylines";
import { cmsT } from "../../locale";

const FIELD_TYPE_LABELS: Record<BylineFieldType, string> = {
  string: "Short text",
  text: "Long text",
  url: "URL",
  boolean: "Boolean",
  select: "Select",
};

const SOCIALS = ["twitter", "github", "bluesky", "youtube"];

type TypeFilter = "all" | "guest" | "non-guest";

/** Editable byline. Dates and ids come from the server; form fields are strings. */
interface BylineDraft {
  id?: string;
  name: string;
  slug: string;
  avatar: unknown;
  bio: string;
  websiteUrl: string;
  userId: string;
  isGuest: boolean;
  socials: Record<string, string>;
  fields: Record<string, BylineFieldStored>;
}

interface FieldDraft {
  id?: string;
  label: string;
  slug: string;
  type: BylineFieldType;
  options: string;
  required: boolean;
  translatable: boolean;
}

const toDraft = (b: BylineRecord): BylineDraft => ({
  id: b.id,
  name: b.name,
  slug: b.slug,
  avatar: b.avatar,
  bio: b.bio ?? "",
  websiteUrl: b.websiteUrl ?? "",
  userId: b.userId ?? "",
  isGuest: b.isGuest,
  socials: b.socials,
  fields: b.fields,
});

const scalarOf = (draft: BylineDraft, slug: string): string | boolean => {
  const value = draft.fields[slug];
  return typeof value === "string" || typeof value === "boolean" ? value : "";
};

const localeOf = (draft: BylineDraft, slug: string, locale: string): string => {
  const value = draft.fields[slug];
  const localeValue = typeof value === "object" ? value[locale] : undefined;
  return typeof localeValue === "string" ? localeValue : "";
};

/**
 * Form value to API value. Blank means "no value", sent as `null`, which removes the stored
 * value. Translatable fields send one entry per locale.
 */
function toInputValue(
  def: BylineFieldRecord,
  value: BylineFieldStored | undefined,
  locales: string[],
): BylineFieldInputValue {
  if (def.translatable) {
    const perLocale: Record<string, BylineFieldValue | null> = {};
    for (const locale of locales) {
      const localeValue = typeof value === "object" ? value[locale] : undefined;
      perLocale[locale] = localeValue === undefined || localeValue === "" ? null : localeValue;
    }
    return perLocale;
  }
  if (value === undefined || typeof value === "object" || value === "") return null;
  return value;
}

const toWriteInput = (
  draft: BylineDraft,
  defs: BylineFieldRecord[],
  locales: string[],
): BylineWriteInput => {
  const fields: BylineFieldsPatch = {};
  for (const def of defs) fields[def.slug] = toInputValue(def, draft.fields[def.slug], locales);
  return {
    name: draft.name,
    slug: draft.slug || undefined,
    bio: draft.bio || null,
    avatar: typeof draft.avatar === "string" && draft.avatar ? draft.avatar : null,
    websiteUrl: draft.websiteUrl || null,
    userId: draft.userId || null,
    isGuest: draft.isGuest,
    socials: draft.socials,
    fields,
  };
};

const TypeBadge: Component<{ byline: BylineRecord }> = (props) => (
  <span class="rounded-full border border-default px-2 py-0.5 text-xs text-toned">
    {props.byline.isGuest ? "Guest" : props.byline.userId ? "Linked user" : "Unlinked"}
  </span>
);

/** One value input for a field. Translatable fields render one of these per locale. */
const FieldControl: Component<{
  def: BylineFieldRecord;
  value: string | boolean;
  onValue: (value: string | boolean) => void;
}> = (props) => (
  <Switch
    fallback={
      <RLInput value={String(props.value)} onInput={(e) => props.onValue(e.currentTarget.value)} />
    }
  >
    <Match when={props.def.type === "boolean"}>
      <RLSwitch checked={props.value === true} onValueChange={(next) => props.onValue(next)} />
    </Match>
    <Match when={props.def.type === "text"}>
      <RLTextarea
        value={String(props.value)}
        onInput={(e) => props.onValue(e.currentTarget.value)}
      />
    </Match>
    <Match when={props.def.type === "select"}>
      <RLSelect
        value={String(props.value)}
        items={[
          { label: "—", value: "" },
          ...props.def.options.map((option) => ({ label: option, value: option })),
        ]}
        onChange={(e) => props.onValue(e.currentTarget.value)}
      />
    </Match>
  </Switch>
);

export const Bylines: Component = () => {
  const { api, toast, locales } = useDashboard();
  const list = useLoader(() => api.bylines.list());
  const fields = useLoader(() => api.bylineFields.list());

  const [tab, setTab] = createSignal<"bylines" | "schema">("bylines");
  const [query, setQuery] = createSignal("");
  const [typeFilter, setTypeFilter] = createSignal<TypeFilter>("all");
  const [editing, setEditing] = createSignal<BylineDraft | null>(null);
  const [editingField, setEditingField] = createSignal<FieldDraft | null>(null);

  const bylines = () => list.data()?.bylines ?? [];
  const definitions = () => fields.data()?.fields ?? [];

  const filtered = createMemo(() => {
    const q = query().trim().toLowerCase();
    const filter = typeFilter();
    return bylines().filter((b) => {
      if (filter === "guest" && !b.isGuest) return false;
      if (filter === "non-guest" && b.isGuest) return false;
      return !q || b.name.toLowerCase().includes(q) || b.slug.toLowerCase().includes(q);
    });
  });

  const attempt = async (action: () => Promise<void>) => {
    try {
      await action();
    } catch (err) {
      toast((err as Error).message, "error");
    }
  };

  const set = (patch: Partial<BylineDraft>) => {
    const draft = editing();
    if (draft) setEditing({ ...draft, ...patch });
  };

  const setFieldValue = (slug: string, value: BylineFieldStored) => {
    const draft = editing();
    if (draft) setEditing({ ...draft, fields: { ...draft.fields, [slug]: value } });
  };

  const setLocaleValue = (slug: string, locale: string, value: string) => {
    const draft = editing();
    if (!draft) return;
    const current = draft.fields[slug];
    const perLocale = typeof current === "object" ? current : {};
    setFieldValue(slug, { ...perLocale, [locale]: value });
  };

  const setFieldDraft = (patch: Partial<FieldDraft>) => {
    const draft = editingField();
    if (!draft) return;
    const next = { ...draft, ...patch };
    // Boolean fields cannot be translatable.
    if (next.type === "boolean") next.translatable = false;
    setEditingField(next);
  };

  const openNewByline = () =>
    setEditing({
      name: "",
      slug: "",
      avatar: null,
      bio: "",
      websiteUrl: "",
      userId: "",
      isGuest: false,
      socials: {},
      fields: {},
    });

  const openByline = (b: BylineRecord) => setEditing(toDraft(b));

  const openNewField = () =>
    setEditingField({
      label: "",
      slug: "",
      type: "string",
      options: "",
      required: false,
      translatable: false,
    });

  const openField = (f: BylineFieldRecord) =>
    setEditingField({
      id: f.id,
      label: f.label,
      slug: f.slug,
      type: f.type,
      options: f.options.join("\n"),
      required: f.required,
      translatable: f.translatable,
    });

  const saveByline = () =>
    attempt(async () => {
      const draft = editing();
      if (!draft) return;
      const body = toWriteInput(draft, definitions(), locales);
      if (draft.id) await api.bylines.update(draft.id, body);
      else await api.bylines.create(body);
      setEditing(null);
      void list.reload();
    });

  const removeByline = () =>
    attempt(async () => {
      const id = editing()?.id;
      if (!id || !confirm("Delete this byline?")) return;
      await api.bylines.remove(id);
      setEditing(null);
      void list.reload();
    });

  const saveField = () =>
    attempt(async () => {
      const draft = editingField();
      if (!draft) return;
      const options =
        draft.type === "select"
          ? draft.options
              .split("\n")
              .map((option) => option.trim())
              .filter(Boolean)
          : [];
      if (draft.id) {
        await api.bylineFields.update(draft.id, {
          label: draft.label,
          type: draft.type,
          required: draft.required,
          translatable: draft.translatable,
          options,
        });
      } else {
        await api.bylineFields.create({
          slug: draft.slug || undefined,
          label: draft.label,
          type: draft.type,
          required: draft.required,
          translatable: draft.translatable,
          options,
        });
      }
      setEditingField(null);
      void fields.reload();
    });

  const removeField = (f: BylineFieldRecord) =>
    attempt(async () => {
      if (!confirm(`Delete "${f.label}"? Its value is removed from every byline.`)) return;
      await api.bylineFields.remove(f.id);
      void fields.reload();
      void list.reload();
    });

  const bylineColumns = createMemo<TableColumn<BylineRecord>[]>(() => [
    {
      id: "name",
      header: "Byline",
      cell: ({ row }) => (
        <button
          type="button"
          class="flex items-center gap-3 text-left"
          onClick={() => openByline(row.original)}
        >
          {row.original.avatar ? (
            <img src={row.original.avatar} alt="" class="size-8 rounded-full object-cover" />
          ) : (
            <span class="flex size-8 items-center justify-center rounded-full bg-elevated text-xs font-semibold">
              {row.original.name.slice(0, 1)}
            </span>
          )}
          <span class="flex flex-col">
            <span class="font-medium text-highlighted">{row.original.name}</span>
            <span class="font-mono text-xs text-muted">{row.original.slug}</span>
          </span>
        </button>
      ),
    },
    {
      id: "type",
      header: "Type",
      cell: ({ row }) => <TypeBadge byline={row.original} />,
    },
    {
      id: "website",
      header: "Website",
      meta: { class: { td: "text-toned" } },
      cell: ({ row }) => row.original.websiteUrl ?? "—",
    },
    {
      id: "actions",
      header: "",
      meta: { class: { td: "text-right" } },
      cell: ({ row }) => (
        <Button variant="ghost" icon="i-lucide-pencil" onClick={() => openByline(row.original)}>
          Edit
        </Button>
      ),
    },
  ]);

  const fieldColumns = createMemo<TableColumn<BylineFieldRecord>[]>(() => [
    {
      id: "label",
      header: "Label",
      cell: ({ row }) => <span class="font-medium text-highlighted">{row.original.label}</span>,
    },
    {
      id: "slug",
      header: "Slug",
      meta: { class: { td: "font-mono text-xs text-toned" } },
      cell: ({ row }) => row.original.slug,
    },
    {
      id: "type",
      header: "Type",
      cell: ({ row }) => FIELD_TYPE_LABELS[row.original.type],
    },
    {
      id: "translatable",
      header: "Translatable",
      cell: ({ row }) => (row.original.translatable ? "Yes" : "No"),
    },
    {
      id: "required",
      header: "Required",
      cell: ({ row }) => (row.original.required ? "Yes" : "No"),
    },
    {
      id: "actions",
      header: "",
      meta: { class: { td: "text-right" } },
      cell: ({ row }) => (
        <div class="flex justify-end gap-1">
          <Button variant="ghost" icon="i-lucide-pencil" onClick={() => openField(row.original)}>
            Edit
          </Button>
          <Button
            variant="ghost"
            class="text-error-500"
            icon="i-lucide-trash-2"
            onClick={() => void removeField(row.original)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ]);

  return (
    <div>
      <PageHeader
        icon="i-lucide-users"
        title={cmsT("text.bylines")}
        description="Public author and contributor profiles credited on entries."
        actions={
          tab() === "bylines" ? (
            <Button variant="primary" icon="i-lucide-plus" onClick={openNewByline}>
              New byline
            </Button>
          ) : (
            <Button variant="primary" icon="i-lucide-plus" onClick={openNewField}>
              New field
            </Button>
          )
        }
      />
      <div class="p-6">
        <div class="mb-6">
          <RLTabs
            items={[
              { label: "Bylines", value: "bylines" },
              { label: "Byline schema", value: "schema" },
            ]}
            value={tab()}
            onValueChange={(value: string) => setTab(value as "bylines" | "schema")}
            body={false}
            size="sm"
            variant="solid"
          />
        </div>
        <Show
          when={tab() === "bylines"}
          fallback={
            <Loading when={fields.loading() && !fields.data()}>
              <Show
                when={definitions().length}
                fallback={
                  <Empty
                    icon="i-lucide-list"
                    title="No byline fields yet."
                    description="Add fields like 'job title' or 'Pronouns' to enrich every byline."
                    action={
                      <Button variant="primary" icon="i-lucide-plus" onClick={openNewField}>
                        New field
                      </Button>
                    }
                  />
                }
              >
                <RLTable data={definitions()} columns={fieldColumns()} />
              </Show>
            </Loading>
          }
        >
          <div class="flex flex-wrap items-center gap-3">
            <RLInput
              class="max-w-xs"
              placeholder="Search name or slug"
              value={query()}
              onInput={(e) => setQuery(e.currentTarget.value)}
            />
            <RLSelect
              aria-label="Filter byline type"
              value={typeFilter()}
              items={[
                { label: "All bylines", value: "all" },
                { label: "Guest only", value: "guest" },
                { label: "Non-guest", value: "non-guest" },
              ]}
              onChange={(e) => setTypeFilter(e.currentTarget.value as TypeFilter)}
            />
            <span class="ml-auto text-xs text-muted">
              {filtered().length} {filtered().length === 1 ? "byline" : "bylines"}
            </span>
          </div>
          <div class="mt-4">
            <Loading when={list.loading() && !list.data()}>
              <Show
                when={filtered().length}
                fallback={
                  <Show
                    when={bylines().length}
                    fallback={
                      <Empty
                        icon="i-lucide-user"
                        title={cmsT("text.no-bylines-yet")}
                        action={
                          <Button variant="primary" icon="i-lucide-plus" onClick={openNewByline}>
                            New byline
                          </Button>
                        }
                      />
                    }
                  >
                    <Empty
                      icon="i-lucide-search-x"
                      title="No matching bylines"
                      action={
                        <Button
                          onClick={() => {
                            setQuery("");
                            setTypeFilter("all");
                          }}
                        >
                          Clear filters
                        </Button>
                      }
                    />
                  </Show>
                }
              >
                <RLTable data={filtered()} columns={bylineColumns()} />
              </Show>
            </Loading>
          </div>
        </Show>
      </div>

      <Modal
        open={!!editing()}
        title={editing()?.id ? "Edit byline" : "New byline"}
        onClose={() => setEditing(null)}
        footer={
          <>
            <Show when={editing()?.id}>
              <Button
                variant="ghost"
                class="mr-auto text-error-500"
                onClick={() => void removeByline()}
              >
                Delete
              </Button>
            </Show>
            <Button variant="primary" onClick={() => void saveByline()}>
              Save
            </Button>
          </>
        }
      >
        <Show when={editing()}>
          {(draft) => (
            <div class="flex flex-col gap-3">
              <Field label="Name">
                <RLInput
                  value={draft().name}
                  onInput={(e) => set({ name: e.currentTarget.value })}
                />
              </Field>
              <Field label="Slug">
                <RLInput
                  class="font-mono"
                  placeholder={cmsT("text.auto")}
                  value={draft().slug}
                  onInput={(e) => set({ slug: e.currentTarget.value })}
                />
              </Field>
              <FieldInput
                name="avatar"
                field={{ type: "media", label: "Avatar" }}
                value={draft().avatar}
                onChange={(v) => set({ avatar: v })}
              />
              <Field label="Bio">
                <RLTextarea
                  value={draft().bio}
                  onInput={(e) => set({ bio: e.currentTarget.value })}
                />
              </Field>
              <Field label="Website">
                <RLInput
                  value={draft().websiteUrl}
                  onInput={(e) => set({ websiteUrl: e.currentTarget.value })}
                />
              </Field>
              <Field label="Linked user id" hint="Optional: ties this byline to a sign-in account.">
                <RLInput
                  value={draft().userId}
                  onInput={(e) => set({ userId: e.currentTarget.value })}
                />
              </Field>
              <Field label="Guest" hint="Guests are credited by name and have no site account.">
                <RLSwitch
                  checked={draft().isGuest}
                  label="Guest contributor"
                  onValueChange={(next) => set({ isGuest: next })}
                />
              </Field>
              <For each={SOCIALS}>
                {(net) => (
                  <Field label={net}>
                    <RLInput
                      value={draft().socials[net] ?? ""}
                      onInput={(e) =>
                        set({ socials: { ...draft().socials, [net]: e.currentTarget.value } })
                      }
                    />
                  </Field>
                )}
              </For>
              <For each={definitions()}>
                {(def) => (
                  <Show
                    when={def.translatable}
                    fallback={
                      <Field label={def.required ? `${def.label} *` : def.label}>
                        <FieldControl
                          def={def}
                          value={scalarOf(draft(), def.slug)}
                          onValue={(value) => setFieldValue(def.slug, value)}
                        />
                      </Field>
                    }
                  >
                    <For each={locales}>
                      {(locale) => (
                        <Field label={`${def.label} (${locale})`}>
                          <FieldControl
                            def={def}
                            value={localeOf(draft(), def.slug, locale)}
                            onValue={(value) => setLocaleValue(def.slug, locale, String(value))}
                          />
                        </Field>
                      )}
                    </For>
                  </Show>
                )}
              </For>
            </div>
          )}
        </Show>
      </Modal>

      <Modal
        open={!!editingField()}
        title={editingField()?.id ? "Edit field" : "New field"}
        onClose={() => setEditingField(null)}
        footer={
          <>
            <Button variant="ghost" onClick={() => setEditingField(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => void saveField()}>
              {editingField()?.id ? "Save" : "Create field"}
            </Button>
          </>
        }
      >
        <Show when={editingField()}>
          {(draft) => (
            <div class="flex flex-col gap-3">
              <Field label="Label">
                <RLInput
                  value={draft().label}
                  autofocus
                  onInput={(e) => setFieldDraft({ label: e.currentTarget.value })}
                />
              </Field>
              <Field
                label="Slug"
                hint={
                  draft().id
                    ? "The slug cannot change after creation."
                    : "Leave blank to derive from the label."
                }
              >
                <RLInput
                  class="font-mono"
                  placeholder="job_title"
                  value={draft().slug}
                  disabled={!!draft().id}
                  onInput={(e) => setFieldDraft({ slug: e.currentTarget.value })}
                />
              </Field>
              <Field label="Type">
                <RLSelect
                  value={draft().type}
                  items={BYLINE_FIELD_TYPES.map((type) => ({
                    label: FIELD_TYPE_LABELS[type],
                    value: type,
                  }))}
                  onChange={(e) =>
                    setFieldDraft({ type: e.currentTarget.value as BylineFieldType })
                  }
                />
              </Field>
              <Show when={draft().type === "select"}>
                <Field label="Options" hint="One option per line.">
                  <RLTextarea
                    value={draft().options}
                    onInput={(e) => setFieldDraft({ options: e.currentTarget.value })}
                  />
                </Field>
              </Show>
              <RLSwitch
                checked={draft().required}
                label="Required"
                onValueChange={(next) => setFieldDraft({ required: next })}
              />
              <div class="flex flex-col gap-1">
                <RLSwitch
                  checked={draft().translatable}
                  disabled={draft().type === "boolean"}
                  label="Translatable"
                  onValueChange={(next) => setFieldDraft({ translatable: next })}
                />
                <p class="text-xs text-muted">
                  Stores a separate value for each language. Boolean fields cannot be translatable.
                </p>
              </div>
            </div>
          )}
        </Show>
      </Modal>
    </div>
  );
};

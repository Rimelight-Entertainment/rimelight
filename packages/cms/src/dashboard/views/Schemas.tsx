import { For, Show, createSignal, type Component } from "solid-js";
import { resolveLabel } from "../../core/collections/define";
import { collectionColor } from "../../core/collections/color";
import type { FieldDefinition, FieldType, ResolvedCollection } from "../../core/collections/types";
import { useDashboard } from "../context";
import { inputClass } from "../fields/FieldInput";
import { Button, Field, Loading, PageHeader, useLoader } from "../ui";

const FIELD_TYPES: FieldType[] = [
  "text",
  "textarea",
  "richtext",
  "slug",
  "url",
  "email",
  "number",
  "boolean",
  "date",
  "datetime",
  "select",
  "multiselect",
  "tags",
  "color",
  "media",
  "reference",
  "references",
  "currency",
  "json",
];

const FEATURES: [keyof ResolvedCollection["features"], string, string][] = [
  [
    "blocks",
    "Block editor",
    "Entries have a Notion-style body. Off = fields only (like a database row).",
  ],
  ["versioned", "Versions", "Publishing keeps an immutable history."],
  ["hierarchical", "Nested slugs", "Allow slugs like guides/setup (docs, wikis)."],
  ["scheduled", "Scheduling", "Publish at a future date."],
  ["bylines", "Bylines", "Credit authors and contributors."],
  ["search", "Search", "Index published entries for site search."],
];

/** Collections list + schema builder (fields, features, workflow). */
export const Schemas: Component<{ slug?: string }> = (props) => {
  const { collections, href } = useDashboard();
  return (
    <Show when={!props.slug} fallback={<SchemaEditor slug={props.slug!} />}>
      <div>
        <PageHeader
          icon="i-lucide-database"
          title="Collections"
          description="Content models. Built-in and cms.config.ts collections can be overridden here; new ones are stored in the database."
          actions={
            <Button variant="primary" icon="i-lucide-plus" href={href("/schemas/new")}>
              New collection
            </Button>
          }
        />
        <div class="grid grid-cols-1 gap-3 p-6 md:grid-cols-2">
          <For each={collections()}>
            {(c) => (
              <a
                href={href(`/schemas/${c.slug}`)}
                class="flex items-start gap-3 rounded-xl border border-default p-4 hover:bg-elevated"
              >
                <span
                  class={`${c.icon ?? "i-lucide-box"} mt-0.5 size-5`}
                  style={{ color: c.color }}
                />
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-2">
                    <span class="font-medium text-highlighted">{resolveLabel(c.label)}</span>
                    <span class="font-mono text-[11px] text-muted">{c.slug}</span>
                    <span class="ml-auto rounded bg-elevated px-1.5 py-0.5 text-[10px] uppercase text-muted">
                      {c.source}
                    </span>
                  </div>
                  <div class="mt-1 text-xs text-muted">
                    {Object.keys(c.fields).length} fields · {c.kind}
                    {c.features.ecommerce ? " · commerce" : ""}
                    {c.workflow.minApprovals ? ` · ${c.workflow.minApprovals} approval(s)` : ""}
                  </div>
                </div>
              </a>
            )}
          </For>
        </div>
      </div>
    </Show>
  );
};

interface FieldRow extends FieldDefinition {
  key: string;
}

const SchemaEditor: Component<{ slug: string }> = (props) => {
  const { api, href, navigate, reloadCollections, toast } = useDashboard();
  const isNew = props.slug === "new";
  const loaded = useLoader(async () =>
    isNew
      ? ({
          slug: "",
          label: "",
          icon: "i-lucide-box",
          kind: "document",
          features: {
            blocks: true,
            versioned: true,
            scheduled: true,
            search: true,
            routable: true,
          },
          workflow: { minApprovals: 0, allowSelfApproval: true },
          fields: {},
          groups: {},
          source: "database",
        } as unknown as ResolvedCollection)
      : (await api.collections.get(props.slug)).collection,
  );
  return (
    <Loading when={!loaded.data()}>
      <SchemaForm
        initial={loaded.data()!}
        isNew={isNew}
        onSaved={async (slug) => {
          await reloadCollections();
          toast("Collection saved", "success");
          if (isNew) navigate(`/schemas/${slug}`);
        }}
        onDeleted={async () => {
          await reloadCollections();
          navigate("/schemas");
        }}
        back={href("/schemas")}
        api={api}
        toast={toast}
      />
    </Loading>
  );
};

const SchemaForm: Component<{
  initial: ResolvedCollection;
  isNew: boolean;
  back: string;
  api: ReturnType<typeof useDashboard>["api"];
  toast: ReturnType<typeof useDashboard>["toast"];
  onSaved: (slug: string) => Promise<void>;
  onDeleted: () => Promise<void>;
}> = (props) => {
  const [def, setDef] = createSignal<ResolvedCollection>(structuredClone(props.initial));
  const [fields, setFields] = createSignal<FieldRow[]>(
    Object.entries(props.initial.fields).map(([key, f]) => ({ key, ...f })),
  );
  const [busy, setBusy] = createSignal(false);
  const patch = (p: Partial<ResolvedCollection>) => setDef({ ...def(), ...p });
  const setFeature = (k: string, v: unknown) =>
    patch({ features: { ...def().features, [k]: v } as any });
  const updateField = (i: number, p: Partial<FieldRow>) =>
    setFields(fields().map((f, j) => (j === i ? { ...f, ...p } : f)));
  const moveField = (i: number, d: -1 | 1) => {
    const list = [...fields()];
    const [f] = list.splice(i, 1);
    list.splice(Math.max(0, Math.min(list.length, i + d)), 0, f!);
    setFields(list);
  };

  const save = async () => {
    const keys = fields().map((f) => f.key);
    if (keys.some((k) => !/^[a-zA-Z][a-zA-Z0-9_]*$/.test(k)))
      return props.toast("Field keys must be identifiers (letters, numbers, _)", "error");
    if (new Set(keys).size !== keys.length)
      return props.toast("Field keys must be unique", "error");
    const { source: _s, id: _id, ...rest } = def() as any;
    const body = { ...rest, fields: Object.fromEntries(fields().map(({ key, ...f }) => [key, f])) };
    setBusy(true);
    try {
      const { collection } = props.isNew
        ? await props.api.collections.create(body)
        : await props.api.collections.update(def().slug, body);
      await props.onSaved(collection.slug);
    } catch (err) {
      props.toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        {...(def().icon ? { icon: def().icon } : {})}
        title={props.isNew ? "New collection" : resolveLabel(def().label)}
        description={
          <a class="text-primary-500" href={props.back}>
            ← All collections
          </a>
        }
        actions={
          <>
            <Show when={!props.isNew && def().source === "database"}>
              <Button
                variant="ghost"
                class="text-error-500"
                onClick={async () => {
                  if (!confirm("Delete this collection definition? Entries are kept.")) return;
                  await props.api.collections.remove(def().slug);
                  await props.onDeleted();
                }}
              >
                Delete
              </Button>
            </Show>
            <Button variant="primary" loading={busy()} onClick={() => void save()}>
              {def().source === "database" || props.isNew ? "Save" : "Save override"}
            </Button>
          </>
        }
      />
      <div class="grid max-w-6xl gap-8 p-6 lg:grid-cols-[1fr_320px]">
        <section class="flex flex-col gap-3">
          <h2 class="text-sm font-semibold text-highlighted">Fields</h2>
          <For each={fields()}>
            {(f, i) => (
              <div class="grid grid-cols-12 items-start gap-2 rounded-lg border border-default p-3">
                <input
                  class={`${inputClass} col-span-3 font-mono text-xs`}
                  placeholder="key"
                  value={f.key}
                  onInput={(e) => updateField(i(), { key: e.currentTarget.value })}
                />
                <input
                  class={`${inputClass} col-span-4`}
                  placeholder="Label"
                  value={resolveLabel(f.label)}
                  onInput={(e) => updateField(i(), { label: e.currentTarget.value })}
                />
                <select
                  class={`${inputClass} col-span-3`}
                  value={f.type}
                  onChange={(e) => updateField(i(), { type: e.currentTarget.value as FieldType })}
                >
                  <For each={FIELD_TYPES}>{(t) => <option value={t}>{t}</option>}</For>
                </select>
                <div class="col-span-2 flex justify-end gap-1">
                  <button
                    type="button"
                    class="i-lucide-arrow-up size-4 text-muted"
                    onClick={() => moveField(i(), -1)}
                  />
                  <button
                    type="button"
                    class="i-lucide-arrow-down size-4 text-muted"
                    onClick={() => moveField(i(), 1)}
                  />
                  <button
                    type="button"
                    class="i-lucide-trash-2 size-4 text-muted hover:text-error-500"
                    onClick={() => setFields(fields().filter((_, j) => j !== i()))}
                  />
                </div>
                <div class="col-span-12 flex flex-wrap items-center gap-4 text-xs text-toned">
                  <label class="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={!!f.required}
                      onChange={(e) => updateField(i(), { required: e.currentTarget.checked })}
                    />{" "}
                    Required
                  </label>
                  <label class="flex items-center gap-1">
                    <input
                      type="checkbox"
                      checked={!!f.translatable}
                      onChange={(e) => updateField(i(), { translatable: e.currentTarget.checked })}
                    />{" "}
                    Translatable
                  </label>
                  <label class="flex items-center gap-1">
                    Group{" "}
                    <input
                      class="w-28 rounded border border-default bg-default px-1.5 py-0.5"
                      value={f.group ?? ""}
                      onInput={(e) => {
                        const val = e.currentTarget.value;
                        updateField(i(), val ? { group: val } : { group: "" });
                      }}
                    />
                  </label>
                  <Show when={f.type === "select" || f.type === "multiselect"}>
                    <label class="flex flex-1 items-center gap-1">
                      Options
                      <input
                        class="flex-1 rounded border border-default bg-default px-1.5 py-0.5"
                        placeholder="comma,separated"
                        value={(f.options ?? []).map((o) => o.value).join(",")}
                        onChange={(e) =>
                          updateField(i(), {
                            options: e.currentTarget.value
                              .split(",")
                              .map((v) => v.trim())
                              .filter(Boolean)
                              .map((v) => ({ value: v, label: v })),
                          })
                        }
                      />
                    </label>
                  </Show>
                  <Show when={f.type === "reference" || f.type === "references"}>
                    <label class="flex flex-1 items-center gap-1">
                      Collections
                      <input
                        class="flex-1 rounded border border-default bg-default px-1.5 py-0.5"
                        placeholder="blog,wiki"
                        value={(f.collections ?? []).join(",")}
                        onChange={(e) =>
                          updateField(i(), {
                            collections: e.currentTarget.value
                              .split(",")
                              .map((v) => v.trim())
                              .filter(Boolean),
                          })
                        }
                      />
                    </label>
                  </Show>
                  <Show when={f.type === "currency"}>
                    <label class="flex items-center gap-1">
                      Currency{" "}
                      <input
                        class="w-16 rounded border border-default bg-default px-1.5 py-0.5 uppercase"
                        value={f.currency ?? "USD"}
                        onInput={(e) =>
                          updateField(i(), { currency: e.currentTarget.value.toUpperCase() })
                        }
                      />
                    </label>
                  </Show>
                </div>
              </div>
            )}
          </For>
          <Button
            icon="i-lucide-plus"
            onClick={() =>
              setFields([
                ...fields(),
                { key: `field${fields().length + 1}`, type: "text", label: "New field" },
              ])
            }
          >
            Add field
          </Button>
        </section>

        <aside class="flex flex-col gap-4">
          <Field label="Name">
            <input
              class={inputClass}
              value={resolveLabel(def().label)}
              onInput={(e) => patch({ label: e.currentTarget.value })}
            />
          </Field>
          <Field label="Plural name">
            <input
              class={inputClass}
              value={resolveLabel(def().labelPlural)}
              onInput={(e) => patch({ labelPlural: e.currentTarget.value })}
            />
          </Field>
          <Field
            label="Slug"
            hint="Stored on every entry; changing it later orphans existing entries."
          >
            <input
              class={`${inputClass} font-mono`}
              value={def().slug}
              disabled={!props.isNew}
              onInput={(e) => patch({ slug: e.currentTarget.value })}
            />
          </Field>
          <Field label="Icon" hint="Any iconify class, e.g. i-lucide-shopping-bag">
            <input
              class={inputClass}
              value={def().icon ?? ""}
              onInput={(e) => patch({ icon: e.currentTarget.value })}
            />
          </Field>
          <Field
            label="Colour"
            hint="Mentions of this collection's entries use this colour, so each type is recognizable."
          >
            <div class="flex items-center gap-2">
              <input
                type="color"
                class="h-8 w-10 cursor-pointer rounded border border-default bg-transparent"
                value={collectionColor(def().slug, def().color)}
                onInput={(e) => patch({ color: e.currentTarget.value })}
              />
              <input
                class={`${inputClass} font-mono text-xs`}
                placeholder={collectionColor(def().slug)}
                value={def().color ?? ""}
                onInput={(e) =>
                  patch({ color: e.currentTarget.value || collectionColor(def().slug) })
                }
              />
              <span
                class="shrink-0 rounded px-1.5 py-0.5 text-xs font-medium"
                style={{
                  color: collectionColor(def().slug, def().color),
                  background: `color-mix(in srgb, ${collectionColor(def().slug, def().color)} 15%, transparent)`,
                }}
              >
                @{resolveLabel(def().label) || "Entry"}
              </span>
            </div>
          </Field>
          <Field label="Description">
            <textarea
              class={inputClass}
              value={resolveLabel(def().description)}
              onInput={(e) => patch({ description: e.currentTarget.value })}
            />
          </Field>
          <Field label="Kind">
            <select
              class={inputClass}
              value={def().kind}
              onChange={(e) => patch({ kind: e.currentTarget.value as any })}
            >
              <option value="document">Document — many entries with content</option>
              <option value="data">Data — many entries, fields only</option>
              <option value="singleton">Singleton — exactly one entry</option>
            </select>
          </Field>
          <Field
            label="Public URL pattern"
            hint="e.g. /blog/{slug}. Leave empty for non-routable data."
          >
            <input
              class={`${inputClass} font-mono`}
              value={
                typeof def().features.routable === "string"
                  ? (def().features.routable as string)
                  : ""
              }
              onInput={(e) => setFeature("routable", e.currentTarget.value || false)}
            />
          </Field>
          <div class="flex flex-col gap-2">
            <span class="text-xs font-medium text-toned">Features</span>
            <For each={FEATURES}>
              {([key, label, hint]) => (
                <label class="flex items-start gap-2 text-xs" title={hint}>
                  <input
                    type="checkbox"
                    class="mt-0.5"
                    checked={!!def().features[key]}
                    onChange={(e) => setFeature(key, e.currentTarget.checked)}
                  />
                  <span>
                    <span class="text-highlighted">{label}</span>
                    <br />
                    <span class="text-muted">{hint}</span>
                  </span>
                </label>
              )}
            </For>
            <label class="flex items-start gap-2 text-xs">
              <input
                type="checkbox"
                class="mt-0.5"
                checked={!!def().features.ecommerce}
                onChange={(e) =>
                  setFeature(
                    "ecommerce",
                    e.currentTarget.checked ? { currency: "USD", trackInventory: true } : false,
                  )
                }
              />
              <span>
                <span class="text-highlighted">Commerce</span>
                <br />
                <span class="text-muted">Products: price, inventory and variants fields.</span>
              </span>
            </label>
            <Show when={def().features.ecommerce && !fields().some((f) => f.type === "currency")}>
              <Button
                icon="i-lucide-wand-sparkles"
                onClick={() =>
                  setFields([
                    ...fields(),
                    ...COMMERCE_FIELDS.filter((c) => !fields().some((f) => f.key === c.key)),
                  ])
                }
              >
                Add product fields
              </Button>
            </Show>
          </div>
          <Field label="Taxonomies" hint="Comma-separated, e.g. category, tag">
            <input
              class={inputClass}
              value={(def().features.taxonomies ?? []).join(", ")}
              onChange={(e) =>
                setFeature(
                  "taxonomies",
                  e.currentTarget.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                )
              }
            />
          </Field>
          <Field label="Approvals required to publish">
            <input
              type="number"
              min="0"
              class={inputClass}
              value={def().workflow.minApprovals}
              onInput={(e) =>
                patch({
                  workflow: { ...def().workflow, minApprovals: Number(e.currentTarget.value) },
                })
              }
            />
          </Field>
          <label class="flex items-center gap-2 text-xs text-toned">
            <input
              type="checkbox"
              checked={def().workflow.allowSelfApproval}
              onChange={(e) =>
                patch({
                  workflow: { ...def().workflow, allowSelfApproval: e.currentTarget.checked },
                })
              }
            />
            Authors may approve their own changes
          </label>
        </aside>
      </div>
    </div>
  );
};

const COMMERCE_FIELDS: FieldRow[] = [
  {
    key: "price",
    type: "currency",
    label: "Price",
    required: true,
    group: "commerce",
    currency: "USD",
  },
  {
    key: "compareAtPrice",
    type: "currency",
    label: "Compare-at price",
    group: "commerce",
    currency: "USD",
  },
  { key: "sku", type: "text", label: "SKU", group: "commerce" },
  { key: "stock", type: "number", label: "Stock", group: "commerce", min: 0 },
  { key: "images", type: "json", label: "Gallery", group: "commerce" },
  {
    key: "variants",
    type: "json",
    label: "Variants",
    group: "commerce",
    description: "[{ sku, name, price, stock, options }]",
  },
  { key: "digital", type: "boolean", label: "Digital product", group: "commerce" },
];

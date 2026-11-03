import { For, Show, createEffect, createSignal, type Component } from "solid-js";
import type { FieldDefinition } from "../../core/collections/types";
import { resolveLabel } from "../../core/collections/define";
import { useDashboard } from "../context";
import { MediaPicker } from "../views/Media";
import { InlineText } from "../../editor/InlineText";
import { toRichText } from "../../core/richtext";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { RLCheckbox } from "@rimelight/ui/components/checkbox/RLCheckbox.tsx";
import { RLCollapsible } from "@rimelight/ui/components/collapsible/RLCollapsible.tsx";
import { RLInput } from "@rimelight/ui/components/input/RLInput.tsx";
import { RLSelect } from "@rimelight/ui/components/select/RLSelect.tsx";
import { RLTextarea } from "@rimelight/ui/components/textarea/RLTextarea.tsx";
import { cmsT } from "../../locale";

/**
 * One input for any field type. Used by the entry properties panel, the block inspector and the
 * schema builder's default-value editor, so every field type behaves the same everywhere.
 */
export interface FieldInputProps {
  name: string;
  field: FieldDefinition;
  value: unknown;
  onChange: (value: unknown) => void;
  readOnly?: boolean;
  locale?: string;
}

/** Only for composite boxes that wrap several native pieces (the tag chips). */
export const inputClass =
  "w-full rounded-md border border-default bg-default px-2.5 py-1.5 text-sm text-highlighted outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/40 disabled:opacity-60";

export const FieldInput: Component<FieldInputProps> = (props) => {
  const { locales } = useDashboard();
  const [locale, setLocale] = createSignal(props.locale ?? locales[0] ?? "en");

  /** Translatable fields store `{ en, pt, ... }`; others store the value directly. */
  const value = () =>
    props.field.translatable &&
    props.value &&
    typeof props.value === "object" &&
    !Array.isArray(props.value)
      ? (props.value as Record<string, unknown>)[locale()]
      : props.value;
  const set = (v: unknown) => {
    if (!props.field.translatable) return props.onChange(v);
    const map =
      props.value && typeof props.value === "object" && !Array.isArray(props.value)
        ? (props.value as Record<string, unknown>)
        : {};
    props.onChange({ ...map, [locale()]: v });
  };

  return (
    <label class="flex flex-col gap-1">
      <span class="flex items-center justify-between gap-2 text-xs font-medium text-toned">
        <span>
          {resolveLabel(props.field.label) || props.name}
          <Show when={props.field.required}>
            <span class="text-error-500"> *</span>
          </Show>
        </span>
        <Show when={props.field.translatable && locales.length > 1}>
          <span class="flex gap-1">
            <For each={locales}>
              {(l) => (
                <RLButton
                  size="xs"
                  variant={locale() === l ? "soft" : "ghost"}
                  color={locale() === l ? "primary" : "neutral"}
                  label={l.toUpperCase()}
                  onClick={(e: MouseEvent) => {
                    e.preventDefault();
                    setLocale(l);
                  }}
                />
              )}
            </For>
          </span>
        </Show>
      </span>
      <Control
        name={props.name}
        field={props.field}
        value={value()}
        onChange={set}
        readOnly={!!props.readOnly}
      />
      <Show when={props.field.description}>
        <span class="text-[11px] text-muted">{resolveLabel(props.field.description)}</span>
      </Show>
    </label>
  );
};

const Control: Component<{
  name: string;
  field: FieldDefinition;
  value: unknown;
  onChange: (v: unknown) => void;
  readOnly: boolean;
}> = (props) => {
  const f = () => props.field;
  const text = () =>
    props.value == null
      ? ""
      : typeof props.value === "string"
        ? props.value
        : JSON.stringify(props.value);

  switch (props.field.type) {
    case "richtext":
      // Rich text: marks, links, @mentions. Stores InlineNode[] (per locale when translatable).
      return (
        <div
          class={`${inputClass} min-h-20 cursor-text py-2 leading-relaxed`}
          onClick={(e) => {
            if (e.target === e.currentTarget)
              (e.currentTarget.firstElementChild as HTMLElement | null)?.focus();
          }}
        >
          <InlineText
            blockId={`field:${props.name}`}
            value={toRichText(props.value)}
            mode="rich"
            readOnly={props.readOnly}
            placeholder={resolveLabel(f().label)}
            class="min-h-[1.5em]"
            onChange={(v) => props.onChange(v)}
          />
        </div>
      );
    case "textarea":
      return (
        <RLTextarea
          value={text()}
          disabled={props.readOnly}
          {...(f().max !== undefined ? { maxLength: f().max } : {})}
          onInput={(e) => props.onChange(e.currentTarget.value)}
        />
      );
    case "number":
      return (
        <RLInput
          type="number"
          value={text()}
          min={f().min}
          max={f().max}
          disabled={props.readOnly}
          onInput={(e) =>
            props.onChange(e.currentTarget.value === "" ? null : Number(e.currentTarget.value))
          }
        />
      );
    case "boolean":
      return (
        <RLCheckbox
          as="div"
          checked={!!props.value}
          disabled={props.readOnly}
          onCheckedChange={(checked) => props.onChange(checked)}
        />
      );
    case "date":
    case "datetime":
      return (
        <RLInput
          type={f().type === "date" ? "date" : "datetime-local"}
          value={text().slice(0, f().type === "date" ? 10 : 16)}
          disabled={props.readOnly}
          onInput={(e) => props.onChange(e.currentTarget.value || null)}
        />
      );
    case "color":
      // Native swatch: the design system has no colour-input primitive.
      return (
        <input
          type="color"
          class="h-8 w-16 rounded border border-default"
          value={text() || "#000000"}
          disabled={props.readOnly}
          onInput={(e) => props.onChange(e.currentTarget.value)}
        />
      );
    case "select":
      return (
        <RLSelect
          value={text()}
          disabled={props.readOnly}
          items={[
            { label: "—", value: "" },
            ...(f().options ?? []).map((o) => ({
              label: resolveLabel(o.label) || o.value,
              value: o.value,
            })),
          ]}
          onChange={(e) => props.onChange(e.currentTarget.value || null)}
        />
      );
    case "multiselect":
      return (
        <div class="flex flex-wrap gap-1.5">
          <For each={f().options ?? []}>
            {(o) => {
              const selected = () => Array.isArray(props.value) && props.value.includes(o.value);
              return (
                <RLButton
                  size="xs"
                  variant={selected() ? "soft" : "outline"}
                  color={selected() ? "primary" : "neutral"}
                  disabled={props.readOnly}
                  label={resolveLabel(o.label) || o.value}
                  onClick={() => {
                    const cur = Array.isArray(props.value) ? (props.value as string[]) : [];
                    props.onChange(
                      selected() ? cur.filter((v) => v !== o.value) : [...cur, o.value],
                    );
                  }}
                />
              );
            }}
          </For>
        </div>
      );
    case "tags":
      return (
        <TagsInput
          value={(props.value as string[]) ?? []}
          onChange={props.onChange}
          readOnly={props.readOnly}
        />
      );
    case "currency":
      return (
        <CurrencyInput
          field={f()}
          value={props.value as any}
          onChange={props.onChange}
          readOnly={props.readOnly}
        />
      );
    case "media":
      return <MediaInput value={props.value} onChange={props.onChange} readOnly={props.readOnly} />;
    case "reference":
    case "references":
      return (
        <ReferenceInput
          field={f()}
          value={props.value}
          onChange={props.onChange}
          readOnly={props.readOnly}
        />
      );
    case "json":
      return <JsonInput value={props.value} onChange={props.onChange} readOnly={props.readOnly} />;
    default:
      return (
        <RLInput
          type={f().type === "email" ? "email" : f().type === "url" ? "url" : "text"}
          value={text()}
          {...(f().pattern ? { pattern: f().pattern } : {})}
          {...(f().max !== undefined ? { maxLength: f().max } : {})}
          disabled={props.readOnly}
          onInput={(e) => props.onChange(e.currentTarget.value)}
        />
      );
  }
};

const TagsInput: Component<{
  value: string[];
  onChange: (v: unknown) => void;
  readOnly: boolean;
}> = (props) => {
  const [draft, setDraft] = createSignal("");
  const add = () => {
    const tag = draft().trim();
    if (tag && !props.value.includes(tag)) props.onChange([...props.value, tag]);
    setDraft("");
  };
  return (
    <div class={`${inputClass} flex flex-wrap items-center gap-1`}>
      <For each={props.value}>
        {(tag) => (
          <span class="inline-flex items-center gap-1 rounded bg-elevated px-1.5 text-xs">
            {tag}
            <Show when={!props.readOnly}>
              <RLButton
                size="xs"
                variant="ghost"
                color="neutral"
                icon="i-lucide-x"
                aria-label={`Remove ${tag}`}
                onClick={() => props.onChange(props.value.filter((t) => t !== tag))}
              />
            </Show>
          </span>
        )}
      </For>
      <input
        class="min-w-20 flex-1 bg-transparent outline-none"
        value={draft()}
        disabled={props.readOnly}
        placeholder={cmsT("text.add")}
        onInput={(e) => setDraft(e.currentTarget.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            add();
          } else if (e.key === "Backspace" && !draft() && props.value.length) {
            props.onChange(props.value.slice(0, -1));
          }
        }}
        onBlur={add}
      />
    </div>
  );
};

const CurrencyInput: Component<{
  field: FieldDefinition;
  value: { amount?: number; currency?: string } | null;
  onChange: (v: unknown) => void;
  readOnly: boolean;
}> = (props) => {
  const currency = () => props.value?.currency ?? props.field.currency ?? "USD";
  return (
    <div class="flex gap-2">
      <RLInput
        type="number"
        step="0.01"
        min="0"
        disabled={props.readOnly}
        // Stored in minor units (cents) to avoid float rounding.
        value={props.value?.amount == null ? "" : (props.value.amount / 100).toFixed(2)}
        onInput={(e) =>
          props.onChange(
            e.currentTarget.value === ""
              ? null
              : { amount: Math.round(Number(e.currentTarget.value) * 100), currency: currency() },
          )
        }
      />
      <RLInput
        class="w-20 uppercase"
        maxlength={3}
        value={currency()}
        disabled={props.readOnly}
        onInput={(e) =>
          props.onChange({
            amount: props.value?.amount ?? 0,
            currency: e.currentTarget.value.toUpperCase(),
          })
        }
      />
    </div>
  );
};

const MediaInput: Component<{
  value: unknown;
  onChange: (v: unknown) => void;
  readOnly: boolean;
}> = (props) => {
  const [open, setOpen] = createSignal(false);
  const src = () =>
    typeof props.value === "string" ? props.value : ((props.value as any)?.src ?? "");
  return (
    <div class="flex flex-col gap-2">
      <Show when={src()}>
        <img
          src={src()}
          alt=""
          class="max-h-32 w-auto self-start rounded border border-default object-contain"
        />
      </Show>
      <div class="flex gap-2">
        <RLInput
          value={src()}
          placeholder={cmsT("text.https-or-pick-from-library")}
          disabled={props.readOnly}
          onInput={(e) => props.onChange(e.currentTarget.value)}
        />
        <RLButton
          variant="outline"
          color="neutral"
          label="Browse"
          disabled={props.readOnly}
          onClick={() => setOpen(true)}
        />
      </div>
      <MediaPicker
        open={open()}
        onClose={() => setOpen(false)}
        onPick={(file) => {
          props.onChange(file.url);
          setOpen(false);
        }}
      />
    </div>
  );
};

const ReferenceInput: Component<{
  field: FieldDefinition;
  value: unknown;
  onChange: (v: unknown) => void;
  readOnly: boolean;
}> = (props) => {
  const { api } = useDashboard();
  const many = () => props.field.type === "references";
  const ids = () =>
    many() ? ((props.value as string[]) ?? []) : props.value ? [props.value as string] : [];
  const [query, setQuery] = createSignal("");
  const [results, setResults] = createSignal<any[]>([]);
  const [labels, setLabels] = createSignal<Record<string, string>>({});

  // Resolve titles for stored ids we don't have a label for yet.
  createEffect(
    () => ids().join(","),
    () => {
      const missing = ids().filter((id) => !(id in labels()));
      for (const id of missing) {
        void api.entries
          .get(id)
          .then(({ entry }) =>
            setLabels((l) => ({ ...l, [id]: resolveLabel(entry.title) || entry.slug })),
          )
          .catch(() => setLabels((l) => ({ ...l, [id]: id })));
      }
    },
  );

  const search = async (q: string): Promise<void> => {
    setQuery(q);
    if (q.length < 2) {
      setResults([]);
      return;
    }
    const collections = props.field.collections?.length ? props.field.collections : [undefined];
    const all = await Promise.all(
      collections.map((c) => api.entries.list({ q, ...(c ? { collection: c } : {}), limit: 8 })),
    );
    setResults(all.flatMap((r) => r.entries));
  };
  const pick = (entry: any) => {
    setLabels({ ...labels(), [entry.id]: entry.excerptTitle });
    props.onChange(many() ? [...ids().filter((i) => i !== entry.id), entry.id] : entry.id);
    setQuery("");
    setResults([]);
  };

  return (
    <div class="relative flex flex-col gap-1.5">
      <div class="flex flex-wrap gap-1">
        <For each={ids()}>
          {(id) => (
            <span class="inline-flex items-center gap-1 rounded bg-elevated px-2 py-0.5 text-xs">
              <span class="i-lucide-file-text size-3" />
              {labels()[id] ?? id.slice(0, 8)}
              <Show when={!props.readOnly}>
                <RLButton
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  icon="i-lucide-x"
                  aria-label={cmsT("text.remove-reference")}
                  onClick={() => props.onChange(many() ? ids().filter((i) => i !== id) : null)}
                />
              </Show>
            </span>
          )}
        </For>
      </div>
      <Show when={!props.readOnly && (many() || ids().length === 0)}>
        <RLInput
          placeholder={cmsT("text.search-entries")}
          value={query()}
          onInput={(e) => void search(e.currentTarget.value)}
        />
      </Show>
      <Show when={results().length}>
        <div class="absolute top-full z-20 mt-1 w-full rounded-md border border-default bg-default shadow-lg">
          <For each={results()}>
            {(r) => (
              <RLButton
                variant="ghost"
                color="neutral"
                class="w-full justify-between"
                label={r.excerptTitle}
                trailingSlot={<span class="text-xs text-muted">{r.collection}</span>}
                onClick={() => pick(r)}
              />
            )}
          </For>
        </div>
      </Show>
    </div>
  );
};

const JsonInput: Component<{
  value: unknown;
  onChange: (v: unknown) => void;
  readOnly: boolean;
}> = (props) => {
  const [error, setError] = createSignal<string | null>(null);
  return (
    <div class="flex flex-col gap-1">
      <RLTextarea
        class="font-mono text-xs"
        disabled={props.readOnly}
        value={props.value === undefined ? "" : JSON.stringify(props.value, null, 2)}
        onChange={(e) => {
          try {
            props.onChange(e.currentTarget.value.trim() ? JSON.parse(e.currentTarget.value) : null);
            setError(null);
          } catch (err) {
            setError((err as Error).message);
          }
        }}
      />
      <Show when={error()}>
        <span class="text-[11px] text-error-500">{error()}</span>
      </Show>
    </div>
  );
};

/** Renders all fields of a collection/block, grouped. */
export const FieldGroups: Component<{
  fields: Record<string, FieldDefinition>;
  groups?: Record<string, { label: unknown; defaultOpen?: boolean }>;
  values: Record<string, unknown>;
  onChange: (key: string, value: unknown) => void;
  readOnly?: boolean;
}> = (props) => {
  const grouped = () => {
    const out = new Map<string, [string, FieldDefinition][]>();
    for (const [key, field] of Object.entries(props.fields)) {
      const g = field.group ?? "";
      if (!out.has(g)) out.set(g, []);
      out.get(g)!.push([key, field]);
    }
    return [...out.entries()];
  };
  const fieldList = (fields: [string, FieldDefinition][]) => (
    <div class="flex flex-col gap-3">
      <For each={fields}>
        {([key, field]) => (
          <FieldInput
            name={key}
            field={field}
            value={props.values[key]}
            readOnly={!!props.readOnly}
            onChange={(v) => props.onChange(key, v)}
          />
        )}
      </For>
    </div>
  );
  return (
    <div class="flex flex-col gap-4">
      <For each={grouped()}>
        {([group, fields]) => (
          <Show when={group} fallback={fieldList(fields)}>
            <RLCollapsible
              defaultOpen={props.groups?.[group]?.defaultOpen !== false}
              trigger={
                <span class="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                  {resolveLabel(props.groups?.[group]?.label as any) || group}
                </span>
              }
            >
              {fieldList(fields)}
            </RLCollapsible>
          </Show>
        )}
      </For>
    </div>
  );
};

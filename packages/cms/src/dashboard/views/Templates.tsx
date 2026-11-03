import { For, Show, createSignal, untrack, type Component } from "solid-js";
import { resolveLabel } from "../../core/collections/define";
import type { PageTemplate } from "../../core/types/templates";
import { createBlockEditor } from "../../editor/store";
import { BlockEditor } from "../../editor/BlockEditor";
import { BlockInspector } from "../../editor/BlockInspector";
import { useDashboard } from "../context";
import { FieldGroups } from "../fields/FieldInput";
import { RLInput } from "@rimelight/ui/components/input/RLInput.tsx";
import { RLInputNumber } from "@rimelight/ui/components/input-number/RLInputNumber.tsx";
import { RLTextarea } from "@rimelight/ui/components/textarea/RLTextarea.tsx";
import { RLSelect } from "@rimelight/ui/components/select/RLSelect.tsx";
import { RLCheckbox } from "@rimelight/ui/components/checkbox/RLCheckbox.tsx";
import { RLTabs } from "@rimelight/ui/components/tabs/RLTabs.tsx";
import { Button, Empty, Field, Loading, Modal, PageHeader, useLoader } from "../ui";
import { cmsT } from "../../locale";

/** Templates: reusable starting layouts + defaults + permissions within a collection. */
export const Templates: Component<{ id?: string }> = (props) => {
  const { api, collections, href, navigate, toast } = useDashboard();
  const list = useLoader(() => api.templates.list());
  const [creating, setCreating] = createSignal(false);
  const [title, setTitle] = createSignal("");
  const [collection, setCollection] = createSignal("");

  return (
    <Show when={!props.id} fallback={<TemplateEditor id={props.id!} />}>
      <div>
        <PageHeader
          icon="i-lucide-layout-template"
          title={cmsT("text.templates")}
          description="Starting layouts for new entries, with their own permissions and approval rules."
          actions={
            <Button variant="primary" icon="i-lucide-plus" onClick={() => setCreating(true)}>
              New template
            </Button>
          }
        />
        <div class="p-6">
          <Loading when={list.loading() && !list.data()}>
            <Show
              when={list.data()?.templates.length}
              fallback={<Empty icon="i-lucide-layout-template" title={cmsT("text.no-templates")} />}
            >
              <div class="divide-y divide-default rounded-xl border border-default">
                <For each={list.data()!.templates}>
                  {(t) => (
                    <a
                      href={href(`/templates/${t.id}`)}
                      class="flex items-center gap-3 px-4 py-3 hover:bg-elevated"
                    >
                      <div class="min-w-0 flex-1">
                        <div class="font-medium text-highlighted">{resolveLabel(t.title)}</div>
                        <div class="truncate text-xs text-muted">
                          {resolveLabel(t.description) || t.slug}
                        </div>
                      </div>
                      <span class="text-xs text-muted">{t.pageType}</span>
                      <span class="text-xs text-muted">v{t.version}</span>
                    </a>
                  )}
                </For>
              </div>
            </Show>
          </Loading>
        </div>
        <Modal
          open={creating()}
          title={cmsT("text.new-template")}
          onClose={() => setCreating(false)}
          footer={
            <Button
              variant="primary"
              disabled={!title() || !collection()}
              onClick={async () => {
                try {
                  const { template } = await api.templates.create({
                    title: title(),
                    collection: collection(),
                    initialBlocks: [],
                  });
                  navigate(`/templates/${template.id}`);
                } catch (err) {
                  toast((err as Error).message, "error");
                }
              }}
            >
              Create
            </Button>
          }
        >
          <div class="flex flex-col gap-3">
            <Field label="Title">
              <RLInput value={title()} onInput={(e) => setTitle(e.currentTarget.value)} />
            </Field>
            <Field label="Collection">
              <RLSelect
                value={collection()}
                items={[
                  { label: "Choose…", value: "" },
                  ...collections().map((c) => ({ label: resolveLabel(c.label), value: c.slug })),
                ]}
                onChange={(e) => setCollection(e.currentTarget.value)}
              />
            </Field>
          </div>
        </Modal>
      </div>
    </Show>
  );
};

const roleKeys = [
  ["whoCanCreate", "Can create from it"],
  ["whoCanEdit", "Can edit entries"],
  ["whoCanReview", "Can approve"],
  ["whoCanView", "Can view"],
] as const;

const TemplateEditor: Component<{ id: string }> = (props) => {
  const { api } = useDashboard();
  const tpl = useLoader(() => api.templates.get(props.id));
  return (
    <Loading when={!tpl.data()}>
      {/* keyed: the workspace takes its template from a tracked render, not a read in its body */}
      <Show when={tpl.data()} keyed>
        {(data) => <TemplateWorkspace template={data.template} />}
      </Show>
    </Loading>
  );
};

const TemplateWorkspace: Component<{ template: PageTemplate }> = (props) => {
  const { api, registry, collection, href, navigate, toast } = useDashboard();
  const [meta, setMeta] = createSignal<PageTemplate>(structuredClone(props.template));
  const [tab, setTab] = createSignal<"settings" | "block">("settings");
  const col = () => collection(meta().pageType);

  const editor = createBlockEditor({
    initial: untrack(() => ({
      blocks: props.template.initialBlocks,
      properties: props.template.defaultProperties ?? {},
    })),
    registry,
    onSelect: (id) => id && setTab("block"),
    save: async (content) => {
      await api.templates.update(props.template.id, {
        initialBlocks: content.blocks,
        defaultProperties: content.properties,
      });
    },
  });

  const saveMeta = async () => {
    const m = meta();
    try {
      await api.templates.update(m.id, {
        title: m.title,
        description: m.description ?? null,
        collection: m.pageType,
        rolePermissions: m.rolePermissions,
        approvalRules: m.approvalRules,
        requiredPermission: m.requiredPermission ?? null,
      });
      toast("Template saved", "success");
    } catch (err) {
      toast((err as Error).message, "error");
    }
  };
  const csv = (v?: string[]) => (v ?? []).join(", ");
  const parse = (s: string) =>
    s
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);

  return (
    <div class="flex h-full flex-col">
      <PageHeader
        title={resolveLabel(meta().title)}
        description={
          <a class="text-primary-500" href={href("/templates")}>
            ← All templates
          </a>
        }
        actions={
          <>
            <span class="text-xs text-muted">
              {
                { saved: "Saved", dirty: "Unsaved", saving: "Saving…", error: "Save failed" }[
                  editor.status()
                ]
              }
            </span>
            <Button
              variant="ghost"
              class="text-error-500"
              icon="i-lucide-trash-2"
              onClick={async () => {
                if (!confirm("Delete this template? Entries made from it keep their content."))
                  return;
                await api.templates.remove(props.template.id);
                navigate("/templates");
              }}
            >
              Delete
            </Button>
          </>
        }
      />
      <div class="flex min-h-0 flex-1">
        <div class="min-w-0 flex-1 overflow-y-auto">
          <div class="mx-auto max-w-3xl px-6 py-8">
            <p class="mb-4 text-xs text-muted">
              Blocks below are copied into every new entry. Lock blocks in the inspector to keep
              editors from moving or changing them.
            </p>
            <BlockEditor editor={editor} />
          </div>
        </div>
        <aside class="w-80 shrink-0 overflow-y-auto border-l border-default">
          <div class="border-b border-default px-4">
            <RLTabs
              items={[
                { label: "Template", value: "settings" },
                { label: "Block", value: "block" },
              ]}
              value={tab()}
              onValueChange={(value: string) => setTab(value as "settings" | "block")}
              content={false}
            />
          </div>
          <div class="p-4">
            <Show when={tab() === "block"}>
              <BlockInspector editor={editor} />
            </Show>
            <Show when={tab() === "settings"}>
              <div class="flex flex-col gap-3">
                <Field label="Title">
                  <RLInput
                    value={resolveLabel(meta().title)}
                    onInput={(e) =>
                      setMeta({ ...meta(), title: { ...meta().title, en: e.currentTarget.value } })
                    }
                  />
                </Field>
                <Field label="Description">
                  <RLTextarea
                    value={resolveLabel(meta().description)}
                    onInput={(e) =>
                      setMeta({ ...meta(), description: { en: e.currentTarget.value } })
                    }
                  />
                </Field>
                <h3 class="pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Permissions (roles, comma-separated)
                </h3>
                <For each={roleKeys}>
                  {([key, label]) => (
                    <Field label={label} hint="Empty = everyone">
                      <RLInput
                        value={csv(meta().rolePermissions?.[key])}
                        onChange={(e) =>
                          setMeta({
                            ...meta(),
                            rolePermissions: {
                              ...meta().rolePermissions,
                              [key]: parse(e.currentTarget.value),
                            },
                          })
                        }
                      />
                    </Field>
                  )}
                </For>
                <h3 class="pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Approval
                </h3>
                <Field label="Approvals required to publish">
                  <RLInputNumber
                    min={0}
                    value={meta().approvalRules?.minApprovals ?? 0}
                    onValueChange={(v) =>
                      setMeta({
                        ...meta(),
                        approvalRules: {
                          ...meta().approvalRules,
                          minApprovals: v,
                        },
                      })
                    }
                  />
                </Field>
                <RLCheckbox
                  label="Authors may approve their own changes"
                  checked={meta().approvalRules?.allowSelfApproval !== false}
                  onCheckedChange={(checked) =>
                    setMeta({
                      ...meta(),
                      approvalRules: {
                        ...meta().approvalRules,
                        allowSelfApproval: checked,
                      },
                    })
                  }
                />
                <Button variant="primary" onClick={() => void saveMeta()}>
                  Save settings
                </Button>
                <Show when={Object.keys(col()?.fields ?? {}).length}>
                  <h3 class="pt-4 text-[11px] font-semibold uppercase tracking-wide text-muted">
                    Default property values
                  </h3>
                  <FieldGroups
                    fields={col()!.fields}
                    groups={col()!.groups}
                    values={editor.doc.properties}
                    onChange={(k, v) => editor.setProperty(k, v)}
                  />
                </Show>
              </div>
            </Show>
          </div>
        </aside>
      </div>
    </div>
  );
};

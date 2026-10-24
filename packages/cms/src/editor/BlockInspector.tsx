import { For, Show, type Component } from "solid-js";
import { FieldGroups, inputClass } from "../dashboard/fields/FieldInput";
import { useDashboard } from "../dashboard/context";
import { isAdmin } from "../auth/roles";
import type { BlockEditorState } from "./store";

/**
 * Settings for the selected block: its declared `fields`, plus access rules and template locks
 * (admins only). Custom blocks get this for free by declaring `fields`.
 */
export const BlockInspector: Component<{ editor: BlockEditorState }> = (props) => {
  const { user } = useDashboard();
  const selected = () => {
    const id = props.editor.selectedId();
    return id ? props.editor.get(id) : null;
  };
  const def = () => (selected() ? props.editor.registry.get(selected()!.block.type) : undefined);
  const update = (patch: Record<string, unknown>) =>
    selected() && props.editor.updateProps(selected()!.block.id, patch, { coalesce: true });

  return (
    <Show
      when={selected()}
      fallback={<p class="text-xs text-muted">Select a block to see its settings.</p>}
    >
      {(sel) => (
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-2">
            <span class={`${def()?.icon ?? "i-lucide-square"} size-4 text-muted`} />
            <span class="text-sm font-semibold text-highlighted">{def()?.label ?? sel().block.type}</span>
          </div>
          <Show when={def()?.description}>
            <p class="text-xs text-muted">{def()!.description}</p>
          </Show>
          <Show
            when={def()?.fields && Object.keys(def()!.fields!).length}
            fallback={<p class="text-xs text-muted">This block has no extra settings.</p>}
          >
            <FieldGroups
              fields={def()!.fields!}
              values={sel().block.props}
              readOnly={props.editor.readOnly || sel().block.templatedProps === true}
              onChange={(k, v) => update({ [k]: v })}
            />
          </Show>

          <Show when={user() && isAdmin(user()!)}>
            <details class="border-t border-default pt-3">
              <summary class="cursor-pointer text-[11px] font-semibold uppercase tracking-wide text-muted">Access & locks</summary>
              <div class="mt-3 flex flex-col gap-3 text-xs">
                <label class="flex flex-col gap-1">
                  <span class="text-toned">Visible to roles (empty = everyone)</span>
                  <input
                    class={inputClass}
                    value={(sel().block.allowedRoles ?? []).join(", ")}
                    placeholder="e.g. employee, admin"
                    onChange={(e) => {
                      const roles = e.currentTarget.value.split(",").map((s) => s.trim()).filter(Boolean);
                      props.editor.setBlockMeta(sel().block.id, { allowedRoles: roles.length ? roles : undefined });
                    }}
                  />
                </label>
                <label class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!sel().block.isTemplated}
                    onChange={(e) => props.editor.setBlockMeta(sel().block.id, { isTemplated: e.currentTarget.checked || undefined })}
                  />
                  <span class="text-toned">Structural lock (can't be moved or deleted)</span>
                </label>
                <label class="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={sel().block.templatedProps === true}
                    onChange={(e) => props.editor.setBlockMeta(sel().block.id, { templatedProps: e.currentTarget.checked || undefined })}
                  />
                  <span class="text-toned">Content lock (props can't be edited)</span>
                </label>
                <span class="text-muted">Locks apply to entries created from this content as a template.</span>
              </div>
            </details>
          </Show>
          <div class="flex gap-2 border-t border-default pt-3">
            <For each={[
              ["Duplicate", "i-lucide-copy", () => props.editor.duplicate(sel().block.id)],
              ["Delete", "i-lucide-trash-2", () => props.editor.remove(sel().block.id)],
            ] as const}>
              {([label, icon, fn]) => (
                <button type="button" class="flex items-center gap-1 rounded border border-default px-2 py-1 text-xs hover:bg-elevated" onClick={fn}>
                  <span class={`${icon} size-3`} /> {label}
                </button>
              )}
            </For>
          </div>
        </div>
      )}
    </Show>
  );
};

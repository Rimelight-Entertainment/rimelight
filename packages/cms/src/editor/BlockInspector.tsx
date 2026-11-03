import { For, Show, type Component } from "solid-js";
import { FieldGroups } from "../dashboard/fields/FieldInput";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { RLCheckbox } from "@rimelight/ui/components/checkbox/RLCheckbox.tsx";
import { RLCollapsible } from "@rimelight/ui/components/collapsible/RLCollapsible.tsx";
import { RLFormField } from "@rimelight/ui/components/form-field/RLFormField.tsx";
import { RLInput } from "@rimelight/ui/components/input/RLInput.tsx";
import { useDashboard } from "../dashboard/context";
import { isAdmin } from "../auth/roles";
import type { BlockEditorState } from "./store";
import { cmsT } from "../locale";

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
      fallback={<p class="text-xs text-muted">{cmsT("text.select-a-block-to-see-its-settings")}</p>}
    >
      {(sel) => (
        <div class="flex flex-col gap-4">
          <div class="flex items-center gap-2">
            <span class={`${def()?.icon ?? "i-lucide-square"} size-4 text-muted`} />
            <span class="text-sm font-semibold text-highlighted">
              {def()?.label ?? sel().block.type}
            </span>
          </div>
          <Show when={def()?.description}>
            <p class="text-xs text-muted">{def()!.description}</p>
          </Show>
          <Show
            when={def()?.fields && Object.keys(def()!.fields!).length}
            fallback={
              <p class="text-xs text-muted">{cmsT("text.this-block-has-no-extra-settings")}</p>
            }
          >
            <FieldGroups
              fields={def()!.fields!}
              values={sel().block.props}
              readOnly={props.editor.readOnly || sel().block.templatedProps === true}
              onChange={(k, v) => update({ [k]: v })}
            />
          </Show>

          <Show when={user() && isAdmin(user()!)}>
            <RLCollapsible
              class="border-t border-default pt-3"
              triggerSlot={
                <span class="text-[11px] font-semibold uppercase tracking-wide text-muted">
                  Access & locks
                </span>
              }
            >
              <div class="mt-3 flex flex-col gap-3 text-xs">
                <RLFormField label="Visible to roles (empty = everyone)">
                  <RLInput
                    value={(sel().block.allowedRoles ?? []).join(", ")}
                    placeholder={cmsT("text.e-g-employee-admin")}
                    onChange={(e) => {
                      const roles = e.currentTarget.value
                        .split(",")
                        .map((s) => s.trim())
                        .filter(Boolean);
                      props.editor.setBlockMeta(
                        sel().block.id,
                        roles.length ? { allowedRoles: roles } : {},
                      );
                    }}
                  />
                </RLFormField>
                <RLCheckbox
                  size="sm"
                  label="Structural lock (can't be moved or deleted)"
                  checked={!!sel().block.isTemplated}
                  onCheckedChange={(checked) =>
                    props.editor.setBlockMeta(sel().block.id, checked ? { isTemplated: true } : {})
                  }
                />
                <RLCheckbox
                  size="sm"
                  label="Content lock (props can't be edited)"
                  checked={sel().block.templatedProps === true}
                  onCheckedChange={(checked) =>
                    props.editor.setBlockMeta(
                      sel().block.id,
                      checked ? { templatedProps: true } : {},
                    )
                  }
                />
                <span class="text-muted">
                  Locks apply to entries created from this content as a template.
                </span>
              </div>
            </RLCollapsible>
          </Show>
          <div class="flex gap-2 border-t border-default pt-3">
            <For
              each={
                [
                  ["Duplicate", "i-lucide-copy", () => props.editor.duplicate(sel().block.id)],
                  ["Delete", "i-lucide-trash-2", () => props.editor.remove(sel().block.id)],
                ] as const
              }
            >
              {([label, icon, fn]) => (
                <RLButton
                  size="xs"
                  variant="outline"
                  color="neutral"
                  leadingIcon={icon}
                  label={label}
                  onClick={fn}
                />
              )}
            </For>
          </div>
        </div>
      )}
    </Show>
  );
};

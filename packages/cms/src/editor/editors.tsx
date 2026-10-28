import { For, Show, type Component } from "solid-js";
import type { BlockEditorProps } from "../core/blocks/registry";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { RLInput } from "@rimelight/ui/components/input/RLInput.tsx";
import { cmsT } from "../locale";

/**
 * Canvas editors for built-in blocks whose content isn't a single line of text. Everything
 * else about these blocks (caption, language, …) is edited in the inspector via `fields`.
 */

const TableEditor: Component<BlockEditorProps> = (props) => {
  const columns = () =>
    (props.block.props["columns"] ?? []) as { key: string; header: string; align?: string }[];
  const rows = () => (props.block.props["rows"] ?? []) as Record<string, string>[];

  const setHeader = (i: number, header: string) =>
    props.update({ columns: columns().map((c, j) => (j === i ? { ...c, header } : c)) });
  const setCell = (r: number, key: string, value: string) =>
    props.update({ rows: rows().map((row, j) => (j === r ? { ...row, [key]: value } : row)) });
  const addColumn = () => {
    const key = `c${Date.now().toString(36)}`;
    props.update({ columns: [...columns(), { key, header: `Column ${columns().length + 1}` }] });
  };
  const removeColumn = (key: string) =>
    props.update({
      columns: columns().filter((c) => c.key !== key),
      rows: rows().map((row) => {
        const { [key]: _removed, ...rest } = row;
        return rest;
      }),
    });
  const addRow = () =>
    props.update({ rows: [...rows(), Object.fromEntries(columns().map((c) => [c.key, ""]))] });
  const removeRow = (i: number) => props.update({ rows: rows().filter((_, j) => j !== i) });

  return (
    <div class="overflow-x-auto rounded-md border border-default">
      <table class="w-full border-collapse text-sm">
        <thead class="bg-elevated">
          <tr>
            <For each={columns()}>
              {(col, i) => (
                <th class="group/col border-b border-r border-default p-0 text-left font-semibold">
                  <div class="flex items-center">
                    <RLInput
                      variant="ghost"
                      size="sm"
                      class="min-w-24 font-semibold"
                      value={col.header}
                      disabled={props.readOnly}
                      onInput={(e) => setHeader(i(), e.currentTarget.value)}
                    />
                    <Show when={!props.readOnly && columns().length > 1}>
                      <RLButton
                        size="xs"
                        variant="ghost"
                        color="neutral"
                        icon="i-lucide-x"
                        title={cmsT("text.remove-column")}
                        aria-label={cmsT("text.remove-column")}
                        onClick={() => removeColumn(col.key)}
                      />
                    </Show>
                  </div>
                </th>
              )}
            </For>
            <Show when={!props.readOnly}>
              <th class="w-8 border-b border-default">
                <RLButton
                  size="xs"
                  variant="ghost"
                  color="neutral"
                  icon="i-lucide-plus"
                  title={cmsT("text.add-column")}
                  aria-label={cmsT("text.add-column")}
                  onClick={addColumn}
                />
              </th>
            </Show>
          </tr>
        </thead>
        <tbody>
          <For each={rows()}>
            {(row, r) => (
              <tr class="group/row">
                <For each={columns()}>
                  {(col) => (
                    <td class="border-b border-r border-default p-0">
                      <RLInput
                        variant="ghost"
                        size="sm"
                        class="min-w-24"
                        value={row[col.key] ?? ""}
                        disabled={props.readOnly}
                        onInput={(e) => setCell(r(), col.key, e.currentTarget.value)}
                      />
                    </td>
                  )}
                </For>
                <Show when={!props.readOnly}>
                  <td class="w-8 border-b border-default text-center">
                    <RLButton
                      size="xs"
                      variant="ghost"
                      color="error"
                      icon="i-lucide-trash-2"
                      title={cmsT("text.remove-row")}
                      aria-label={cmsT("text.remove-row")}
                      onClick={() => removeRow(r())}
                    />
                  </td>
                </Show>
              </tr>
            )}
          </For>
        </tbody>
      </table>
      <Show when={!props.readOnly}>
        <RLButton
          size="xs"
          variant="ghost"
          color="neutral"
          block
          leadingIcon="i-lucide-plus"
          label="Row"
          onClick={addRow}
        />
      </Show>
    </div>
  );
};

const CodeEditor: Component<BlockEditorProps> = (props) => (
  <div class="overflow-hidden rounded-md border border-default bg-neutral-950">
    <div class="flex items-center justify-between border-b border-white/10 px-3 py-1 text-[11px] text-neutral-400">
      <RLInput
        variant="ghost"
        size="sm"
        value={props.block.props["filename"] ?? ""}
        placeholder={cmsT("text.filename")}
        disabled={props.readOnly}
        onInput={(e) => props.update({ filename: e.currentTarget.value })}
      />
      <RLInput
        variant="ghost"
        size="sm"
        class="w-24 text-right"
        value={props.block.props["language"] ?? ""}
        placeholder={cmsT("text.language")}
        disabled={props.readOnly}
        onInput={(e) => props.update({ language: e.currentTarget.value })}
      />
    </div>
    <textarea
      class="block min-h-24 w-full resize-y bg-transparent p-3 font-mono text-[13px] leading-relaxed text-neutral-100 outline-none"
      spellcheck={false}
      value={props.block.props["code"] ?? ""}
      disabled={props.readOnly}
      onKeyDown={(e) => {
        if (e.key === "Tab") {
          e.preventDefault();
          const t = e.currentTarget;
          const { selectionStart: s, selectionEnd: end } = t;
          t.setRangeText("  ", s, end, "end");
          props.update({ code: t.value });
        }
      }}
      onInput={(e) => props.update({ code: e.currentTarget.value })}
    />
  </div>
);

const ImageEditor: Component<BlockEditorProps> = (props) => {
  const src = () => {
    const v = props.block.props["src"];
    return typeof v === "string" ? v : (v?.src ?? "");
  };
  return (
    <figure class="flex flex-col gap-1">
      <Show
        when={src()}
        fallback={
          <div class="flex h-32 items-center justify-center rounded-md border border-dashed border-default text-xs text-muted">
            <span class="i-lucide-image mr-1.5 size-4" /> Select an image in the inspector →
          </div>
        }
      >
        <img
          src={src()}
          alt={props.block.props["alt"] ?? ""}
          class="max-h-96 rounded-md object-contain"
        />
      </Show>
      <RLInput
        variant="ghost"
        size="sm"
        class="text-center text-xs"
        placeholder={cmsT("text.caption")}
        value={props.block.props["caption"] ?? ""}
        disabled={props.readOnly}
        onInput={(e) => props.update({ caption: e.currentTarget.value })}
      />
    </figure>
  );
};

export const builtinEditors: Record<string, Component<BlockEditorProps<any>>> = {
  TableBlock: TableEditor,
  CodeBlock: CodeEditor,
  ImageBlock: ImageEditor,
};

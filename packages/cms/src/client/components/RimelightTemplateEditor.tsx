import { createSignal, onSettled, onCleanup, For, type Component } from "solid-js";
import type { BaseBlock } from "../../core/types/blocks";
import { initBlockSortable, cleanAllSortableClasses } from "../utils/sortable";
import { RLSelect } from "@rimelight/ui/components/select/RLSelect.tsx";
import { RLInput } from "@rimelight/ui/components/input/RLInput.tsx";
import { RLCheckbox } from "@rimelight/ui/components/checkbox/RLCheckbox.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { RLIcon } from "@rimelight/ui/components/icon/RLIcon.tsx";

export interface RimelightTemplateEditorProps {
  initialBlocks?: BaseBlock[];
  onChange?: (blocks: BaseBlock[]) => void;
  ref?: (el: any) => void;
}

function escapeHtml(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const TEMPLATE_BLOCK_OPTIONS = [
  { label: "Paragraph", value: "ParagraphBlock" },
  { label: "Section Heading", value: "SectionBlock" },
  { label: "Callout Box", value: "CalloutBlock" },
  { label: "Code Snippet", value: "CodeBlock" },
  { label: "Image", value: "ImageBlock" },
  { label: "Script", value: "ScriptBlock" },
  { label: "Scene", value: "SceneBlock" },
  { label: "Dialogue", value: "DialogueBlock" },
];

export const RimelightTemplateEditor: Component<RimelightTemplateEditorProps> = (props) => {
  const [blocks, setBlocks] = createSignal<BaseBlock[]>(
    props.initialBlocks ? JSON.parse(JSON.stringify(props.initialBlocks)) : [],
  );
  const [selectedType, setSelectedType] = createSignal("ParagraphBlock");
  let canvasContainer: HTMLDivElement | undefined;
  let sortableInstance: any = null;

  const updateBlocks = (newBlocks: BaseBlock[]) => {
    setBlocks(newBlocks);
    props.onChange?.(newBlocks);
  };

  onSettled(() => {
    if (canvasContainer) {
      sortableInstance = initBlockSortable(canvasContainer, {
        onReorder: (oldIdx: number, newIdx: number) => {
          cleanAllSortableClasses();
          const list = [...blocks()];
          const item = list.splice(oldIdx, 1)[0];
          if (item) {
            list.splice(newIdx, 0, item);
            updateBlocks(list);
          }
          requestAnimationFrame(() => cleanAllSortableClasses());
          setTimeout(cleanAllSortableClasses, 50);
          setTimeout(cleanAllSortableClasses, 200);
        },
      });
    }

    const publicMethods = {
      getBlocks: () => JSON.parse(JSON.stringify(blocks())),
      setBlocks: (newBlocks: BaseBlock[]) => updateBlocks(JSON.parse(JSON.stringify(newBlocks))),
    };

    if (props.ref) props.ref(publicMethods);

    onCleanup(() => {
      if (sortableInstance) sortableInstance.destroy();
    });
  });

  const addBlock = (type: string) => {
    let blockProps: Record<string, any> = {};
    if (type === "SectionBlock") {
      blockProps = { title: "Section Heading" };
    } else if (type === "CalloutBlock") {
      blockProps = { text: { en: "Callout note content..." }, variant: "info" };
    } else if (type === "CodeBlock") {
      blockProps = { code: "// Code snippet", language: "typescript" };
    } else if (type === "ImageBlock") {
      blockProps = { src: "https://via.placeholder.com/600x300", alt: "Image description" };
    } else if (type === "ScriptBlock") {
      blockProps = { title: "Scene Script" };
    } else if (type === "SceneBlock") {
      blockProps = { heading: "INT. SCENE - DAY" };
    } else if (type === "DialogueBlock") {
      blockProps = { character: "CHARACTER", text: { en: "Dialogue text..." } };
    } else {
      blockProps = { text: { en: "Paragraph content..." } };
    }

    const newBlock: BaseBlock = {
      id: crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2),
      type,
      isTemplated: false,
      props: blockProps,
    };

    updateBlocks([...blocks(), newBlock]);
  };

  const deleteBlock = (id: string) => {
    updateBlocks(blocks().filter((b) => b.id !== id));
  };

  const updateBlockItem = (id: string, updater: (b: BaseBlock) => void) => {
    const list: BaseBlock[] = JSON.parse(JSON.stringify(blocks()));
    const target = list.find((b) => b.id === id);
    if (target) {
      updater(target);
      updateBlocks(list);
    }
  };

  return (
    <div class="cms-template-editor border border-default rounded-xl p-4 space-y-4">
      <div class="flex items-center justify-between p-3 rounded-lg border border-default">
        <div>
          <h4 class="text-sm font-semibold text-highlighted">Initial Template Blocks</h4>
          <p class="text-xs text-muted">
            Visually design the initial layout and set block locks for pages instantiated from this
            template.
          </p>
        </div>
        <div class="flex items-center gap-2">
          <div class="w-44">
            <RLSelect
              items={TEMPLATE_BLOCK_OPTIONS}
              value={selectedType()}
              onChange={(e: Event & { currentTarget: HTMLSelectElement }) =>
                setSelectedType(e.currentTarget.value)
              }
              size="sm"
            />
          </div>
          <RLButton
            variant="solid"
            color="primary"
            size="sm"
            onClick={() => addBlock(selectedType())}
            leadingIcon="plus"
            label="Add Block"
          />
        </div>
      </div>

      <div
        ref={(el) => (canvasContainer = el)}
        id="tmpl-block-canvas"
        class="space-y-3 min-h-[120px] p-3 border border-dashed border-default rounded-lg"
      >
        {blocks().length === 0 ? (
          <div class="text-center py-8 text-xs text-muted italic">
            No initial blocks added yet. Use the dropdown above to add initial template blocks.
          </div>
        ) : (
          <For each={blocks()}>
            {(block, index) => {
              const rawText =
                block.props["text"] ||
                block.props["title"] ||
                block.props["code"] ||
                block.props["src"] ||
                "";
              const textVal = typeof rawText === "object" ? rawText.en || "" : rawText || "";

              return (
                <div
                  data-id={block.id}
                  class="cms-template-block-card border border-default rounded-lg p-3 text-xs space-y-2 relative"
                >
                  <div class="flex items-center justify-between border-b border-default/60 pb-2">
                    <div class="flex items-center gap-2">
                      <span class="font-bold text-highlighted uppercase">{block.type}</span>
                      <span class="text-[10px] text-muted">#{index() + 1}</span>
                    </div>
                    <RLButton
                      variant="ghost"
                      color="neutral"
                      size="xs"
                      onClick={() => deleteBlock(block.id)}
                      class="!text-red-500 hover:!text-red-600"
                      leading={<RLIcon name="trash" size="xs" />}
                      label="Delete"
                    />
                  </div>

                  <div class="flex items-center gap-4 py-1">
                    <RLCheckbox
                      checked={!!block.isTemplated}
                      onChange={(e: Event & { currentTarget: HTMLInputElement }) =>
                        updateBlockItem(block.id, (b) => {
                          b.isTemplated = e.currentTarget.checked;
                        })
                      }
                      label="📌 Anchor (Permanent)"
                      size="sm"
                    />
                    <RLCheckbox
                      checked={block.templatedProps === true}
                      onChange={(e: Event & { currentTarget: HTMLInputElement }) =>
                        updateBlockItem(block.id, (b) => {
                          b.templatedProps = e.currentTarget.checked;
                        })
                      }
                      label="🔒 Lock Content"
                      size="sm"
                    />
                  </div>

                  <div>
                    <div>
                      <span class="block text-[11px] text-muted mb-1">Block Content / Text</span>
                      <div class="mt-1">
                        <RLInput
                          id={`tmpl-content-${block.id}`}
                          value={escapeHtml(textVal)}
                          onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) => {
                            const val = e.currentTarget.value;
                            updateBlockItem(block.id, (b) => {
                              if (b.type === "SectionBlock") b.props["title"] = val;
                              else if (b.type === "CodeBlock") b.props["code"] = val;
                              else if (b.type === "ImageBlock") b.props["src"] = val;
                              else b.props["text"] = { en: val };
                            });
                          }}
                          size="sm"
                          placeholder="Enter default block content..."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              );
            }}
          </For>
        )}
      </div>
    </div>
  );
};

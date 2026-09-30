import { createSignal, onSettled, onCleanup, For, type Component } from "solid-js";
import { RLInput } from "@rimelight/ui/components/input/RLInput.tsx";
import { RLIcon } from "@rimelight/ui/components/icon/RLIcon.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";

const BLOCK_DEFS = [
  {
    group: "Text",
    type: "ParagraphBlock",
    label: "Paragraph",
    desc: "Rich text paragraph",
    icon: "paragraph"
  },
  {
    group: "Text",
    type: "SectionBlock",
    label: "Section",
    desc: "Collapsible section with heading",
    icon: "heading"
  },
  {
    group: "Media",
    type: "ImageBlock",
    label: "Image",
    desc: "Embed an image with caption",
    icon: "image"
  },
  {
    group: "Media",
    type: "CodeBlock",
    label: "Code",
    desc: "Code block with syntax highlighting",
    icon: "code"
  },
  {
    group: "Callout",
    type: "CalloutBlock",
    label: "Callout",
    desc: "Highlighted info/warning/note box",
    icon: "info"
  },
  {
    group: "Documentation",
    type: "TableBlock",
    label: "Table",
    desc: "Structured data table with columns and rows",
    icon: "table"
  },
  {
    group: "Documentation",
    type: "TabsBlock",
    label: "Tabs",
    desc: "Tabbed content container",
    icon: "layers"
  },
  {
    group: "Documentation",
    type: "TabItemBlock",
    label: "Tab Item",
    desc: "Individual tab page",
    icon: "fileText"
  },
  {
    group: "Documentation",
    type: "StepsBlock",
    label: "Steps",
    desc: "Step-by-step walkthrough sequence",
    icon: "listOrdered"
  },
  {
    group: "Documentation",
    type: "StepItemBlock",
    label: "Step Item",
    desc: "Individual step",
    icon: "check"
  },
  {
    group: "Documentation",
    type: "CardsBlock",
    label: "Cards Grid",
    desc: "Grid container for link cards",
    icon: "grid"
  },
  {
    group: "Documentation",
    type: "CardBlock",
    label: "Card",
    desc: "Interactive doc/link card",
    icon: "file"
  },
  {
    group: "Documentation",
    type: "FileTreeBlock",
    label: "File Tree",
    desc: "Directory and file structure visualizer",
    icon: "folder"
  },
  {
    group: "Screenplay",
    type: "ScriptBlock",
    label: "Script",
    desc: "Script container with plot tracking",
    icon: "fileText"
  },
  {
    group: "Screenplay",
    type: "SceneBlock",
    label: "Scene",
    desc: "Scene with location and time-of-day",
    icon: "video"
  },
  {
    group: "Screenplay",
    type: "DialogueBlock",
    label: "Dialogue",
    desc: "Character dialogue line",
    icon: "messageSquare"
  }
];

import { ALLOWED_CHILDREN_MAP, MAX_SECTION_DEPTH } from "../../core/types/blocks";
import { toast } from "../toast";
export { ALLOWED_CHILDREN_MAP };

export interface RimelightBlockPickerProps {
  open: boolean;
  sectionDepth?: number | undefined;
  containerType?: string | null | undefined;
  onSelect: (type: string) => void;
  onClose: () => void;
}

export const RimelightBlockPicker: Component<RimelightBlockPickerProps> = (props) => {
  let searchInput: HTMLInputElement | undefined = undefined;
  const [query, setQuery] = createSignal("");
  const [selectedIndex, setSelectedIndex] = createSignal(0);

  const allowedTypes = (): string[] => {
    const parent = props.containerType || "Root";
    return ALLOWED_CHILDREN_MAP[parent] || ALLOWED_CHILDREN_MAP["Root"] || [];
  };

  const filteredBlocks = () => {
    const q = query().toLowerCase();
    const depth = props.sectionDepth || 0;
    const allowed = allowedTypes();

    return BLOCK_DEFS.filter((b) => {
      if (!allowed.includes(b.type)) return false;
      if (b.type === "SectionBlock" && depth > MAX_SECTION_DEPTH) return false;
      return (
        b.label.toLowerCase().includes(q) ||
        b.type.toLowerCase().includes(q) ||
        b.desc.toLowerCase().includes(q) ||
        b.group.toLowerCase().includes(q)
      );
    });
  };

  const handleSelectBlock = (type: string) => {
    const depth = props.sectionDepth || 0;
    if (type === "SectionBlock" && depth > MAX_SECTION_DEPTH) {
      toast.error(
        "Invalid Section Nesting",
        "Sections cannot be nested inside an H6 section. H6 is the maximum heading level."
      );
      return;
    }
    props.onSelect(type);
  };

  onSettled(() => {
    const handleGlobalKeydown = (e: KeyboardEvent) => {
      if (props.open && e.key === "Escape") {
        props.onClose();
      }
    };
    if (typeof document !== "undefined") {
      document.addEventListener("keydown", handleGlobalKeydown);
      onCleanup(() => document.removeEventListener("keydown", handleGlobalKeydown));
    }
  });

  const handleKeydown = (e: KeyboardEvent) => {
    const list = filteredBlocks();
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.min(prev + 1, Math.max(0, list.length - 1)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = list[selectedIndex()];
      if (selected) {
        handleSelectBlock(selected.type);
      }
    }
  };

  return (
    <div class={!props.open ? "hidden" : undefined}>
      <div
        role="presentation"
        onClick={(e) => {
          if (e.target === e.currentTarget) props.onClose();
        }}
        class="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      >
        <div class="bg-elevated border border-default rounded-2xl w-full max-w-md shadow-2xl flex flex-col overflow-hidden">
          <div class="flex items-center justify-between px-4 py-3 border-b border-default">
            <div class="text-sm font-semibold text-highlighted">
              Add Block{" "}
              {props.containerType ? `to ${props.containerType.replace("Block", "")}` : ""}
            </div>
            <RLButton
              variant="ghost"
              color="neutral"
              size="xs"
              square={true}
              onClick={() => props.onClose()}
              aria-label="Close"
              leading={<RLIcon name="close" size="xs" />}
            />
          </div>

          <div class="px-4 py-3 border-b border-default/50">
            <RLInput
              ref={(el: HTMLInputElement) => {
                searchInput = el;
                if (props.open) setTimeout(() => searchInput?.focus(), 10);
              }}
              value={query()}
              onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) => {
                setQuery(e.currentTarget.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeydown}
              placeholder="Search blocks..."
              leadingIcon="search"
              size="sm"
            />
          </div>

          <div class="overflow-y-auto max-h-[50vh] pb-2">
            {filteredBlocks().length === 0 ? (
              <div class="text-center py-4 text-muted text-sm">No compatible blocks found</div>
            ) : (
              (() => {
                let currentGroup = "";
                return (
                  <For each={filteredBlocks()}>
                    {(block, index) => {
                      const showHeader = block.group !== currentGroup;
                      if (showHeader) currentGroup = block.group;
                      const isSelected = index() === selectedIndex();

                      return (
                        <>
                          {showHeader && (
                            <div class="text-[10px] font-bold text-muted uppercase tracking-widest px-4 py-1.5 mt-2">
                              {block.group}
                            </div>
                          )}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              handleSelectBlock(block.type);
                            }}
                            onMouseEnter={() => setSelectedIndex(index())}
                            class={`cms-picker-item flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors hover:bg-neutral-100 w-full text-left bg-transparent border-none ${isSelected ? "bg-neutral-100" : ""}`}
                          >
                            <div class="text-base w-8 h-8 flex items-center justify-center shrink-0 rounded-lg bg-neutral-100 text-highlighted border border-default">
                              <RLIcon name={block.icon} size="sm" />
                            </div>
                            <div class="flex flex-col flex-1 min-w-0">
                              <div class="flex items-center justify-between">
                                <span class="text-sm font-medium text-highlighted">
                                  {block.label}
                                </span>
                                <span class="text-[10px] font-mono text-muted bg-neutral-100 px-1.5 py-0.5 rounded border border-default/50">
                                  {block.type}
                                </span>
                              </div>
                              <span class="text-xs text-muted mt-0.5 truncate">{block.desc}</span>
                            </div>
                          </button>
                        </>
                      );
                    }}
                  </For>
                );
              })()
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import { createSignal, onSettled, Show, type Component } from "solid-js";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { RLModal } from "@rimelight/ui/components/modal/RLModal.tsx";
import { RLInput } from "@rimelight/ui/components/input/RLInput.tsx";

export interface InlineNode {
  type: "text" | "link";
  text?: string;
  marks?: string[];
  url?: string;
  children?: InlineNode[];
  openInNewTab?: boolean;
}

export interface ParagraphEditorProps {
  props: Record<string, any>;
  onPropsChange: (newProps: Record<string, any>) => void;
}

const renderNodesToHtml = (nodes: InlineNode[]): string => {
  return nodes
    .map((node) => {
      if (node.type === "text") {
        let text = node.text || "";
        text = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        if (node.marks) {
          if (node.marks.includes("bold")) text = `<strong>${text}</strong>`;
          if (node.marks.includes("italic")) text = `<em>${text}</em>`;
          if (node.marks.includes("underline")) text = `<u>${text}</u>`;
          if (node.marks.includes("strikethrough")) text = `<s>${text}</s>`;
          if (node.marks.includes("code")) text = `<code>${text}</code>`;
        }
        return text;
      } else if (node.type === "link") {
        const target = node.openInNewTab ? ' target="_blank"' : "";
        return `<a href="${node.url || "#"}"${target}>${renderNodesToHtml(node.children || [])}</a>`;
      }
      return "";
    })
    .join("");
};

export const ParagraphEditor: Component<ParagraphEditorProps> = (componentProps) => {
  let editableDiv: HTMLDivElement | null = null as HTMLDivElement | null;
  let containerDiv: HTMLDivElement | null = null as HTMLDivElement | null;

  const [toolbarVisible, setToolbarVisible] = createSignal(false);
  const [linkModalOpen, setLinkModalOpen] = createSignal(false);
  const [linkUrl, setLinkUrl] = createSignal("");

  const parseDOM = (root: Node): InlineNode[] => {
    const nodes: InlineNode[] = [];
    root.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        if (child.textContent) {
          nodes.push({ type: "text", text: child.textContent });
        }
      } else if (child instanceof HTMLElement) {
        const el = child;
        const tagName = el.tagName.toLowerCase();

        if (el instanceof HTMLAnchorElement) {
          const a = el;
          nodes.push({
            type: "link",
            url: a.href,
            children: parseDOM(el)
          });
        } else {
          const childNodes = parseDOM(el);
          let mark = "";
          if (["strong", "b"].includes(tagName)) mark = "bold";
          else if (["em", "i"].includes(tagName)) mark = "italic";
          else if (["u"].includes(tagName)) mark = "underline";
          else if (["s", "strike"].includes(tagName)) mark = "strikethrough";
          else if (["code"].includes(tagName)) mark = "code";

          if (mark) {
            childNodes.forEach((n) => {
              if (n.type === "text") {
                n.marks = n.marks || [];
                if (!n.marks.includes(mark)) n.marks.push(mark);
              }
            });
          }
          nodes.push(...childNodes);
        }
      }
    });
    return nodes;
  };

  const saveProps = () => {
    if (!editableDiv) return;
    const parsedNodes = parseDOM(editableDiv);
    componentProps.onPropsChange({
      ...componentProps.props,
      text: parsedNodes
    });
  };

  const execCommand = (cmd: string) => {
    if (cmd === "createLink") {
      // Open our modal instead of using browser prompt()
      setLinkUrl("");
      setLinkModalOpen(true);
    } else {
      // Use Selection API instead of deprecated execCommand
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedText = range.toString();

        if (selectedText) {
          if (cmd === "bold") {
            const strong = document.createElement("strong");
            range.surroundContents(strong);
          } else if (cmd === "italic") {
            const em = document.createElement("em");
            range.surroundContents(em);
          } else if (cmd === "underline") {
            const u = document.createElement("u");
            range.surroundContents(u);
          }
          selection.removeAllRanges();
        }
      }
      editableDiv?.focus();
    }
  };

  const applyLink = () => {
    const url = linkUrl().trim();
    if (url) {
      editableDiv?.focus();
      // Use Selection API instead of deprecated execCommand
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedText = range.toString();

        if (selectedText) {
          const a = document.createElement("a");
          a.href = url;
          a.textContent = selectedText;
          range.deleteContents();
          range.insertNode(a);
          selection.removeAllRanges();
        }
      }
      saveProps();
    }
    setLinkModalOpen(false);
  };

  onSettled(() => {
    if (!editableDiv) return;
    const text = componentProps.props["text"];
    if (!text) {
      editableDiv.innerHTML = "";
    } else if (Array.isArray(text)) {
      editableDiv.innerHTML = renderNodesToHtml(text);
    } else if (typeof text === "object" && text.en) {
      editableDiv.innerText = text.en;
    } else {
      editableDiv.innerText = String(text);
    }

    editableDiv.addEventListener("input", () => {
      saveProps();
    });
    editableDiv.addEventListener("focus", () => setToolbarVisible(true));
    editableDiv.addEventListener("blur", () => {
      setTimeout(() => {
        if (containerDiv && !containerDiv.contains(document.activeElement)) {
          setToolbarVisible(false);
          saveProps();
        }
      }, 200);
    });
    editableDiv.addEventListener("keydown", (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === "b") {
          e.preventDefault();
          execCommand("bold");
        } else if (e.key === "i") {
          e.preventDefault();
          execCommand("italic");
        } else if (e.key === "u") {
          e.preventDefault();
          execCommand("underline");
        } else if (e.key === "k") {
          e.preventDefault();
          execCommand("createLink");
        }
      }
    });
    editableDiv.addEventListener("paste", (e: ClipboardEvent) => {
      e.preventDefault();
      const clipboardText = e.clipboardData?.getData("text/plain") || "";
      // Use Selection API instead of deprecated execCommand
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        range.deleteContents();
        const textNode = document.createTextNode(clipboardText);
        range.insertNode(textNode);
        selection.removeAllRanges();
      }
      saveProps();
    });
  });

  return (
    <div
      ref={(el) => (containerDiv = el)}
      class="rimelight-paragraph-editor flex flex-col w-full relative"
    >
      <div
        class={`toolbar-div flex items-center gap-0.5 px-1.5 py-1 bg-elevated border border-default rounded-lg shadow-sm mb-1 self-start ${!toolbarVisible() ? "hidden" : ""}`}
      >
        <RLButton
          variant="ghost"
          color="neutral"
          size="xs"
          square={true}
          onClick={() => execCommand("bold")}
          class="font-bold !px-2"
          label="B"
        />
        <RLButton
          variant="ghost"
          color="neutral"
          size="xs"
          square={true}
          onClick={() => execCommand("italic")}
          class="italic font-serif !px-2"
          label="I"
        />
        <RLButton
          variant="ghost"
          color="neutral"
          size="xs"
          square={true}
          onClick={() => execCommand("underline")}
          class="underline !px-2"
          label="U"
        />
        <div class="w-px h-3.5 bg-default mx-1" />
        <RLButton
          variant="ghost"
          color="neutral"
          size="xs"
          onClick={() => execCommand("createLink")}
          leadingIcon="link"
          label="Link"
        />
      </div>
      <div
        ref={(el) => (editableDiv = el)}
        aria-label="Paragraph text content"
        contenteditable="true"
        class="editable-div py-1.5 px-2 outline-none min-h-[2.5rem] text-sm text-highlighted bg-transparent leading-relaxed focus:ring-1 focus:ring-primary/40 rounded-lg"
      />

      {/* Link URL Modal — replaces browser prompt() */}
      <Show when={linkModalOpen()}>
        <RLModal
          open={linkModalOpen()}
          onClose={() => setLinkModalOpen(false)}
          title="Insert Link"
          footerSlot={
            <>
              <RLButton
                variant="outline"
                color="neutral"
                size="sm"
                onClick={() => setLinkModalOpen(false)}
                label="Cancel"
              />
              <RLButton
                variant="solid"
                color="primary"
                size="sm"
                onClick={applyLink}
                label="Insert"
              />
            </>
          }
        >
          <div class="flex flex-col gap-2 py-2">
            <span class="text-xs font-semibold text-muted">URL</span>
            <RLInput
              value={linkUrl()}
              onInput={(e: InputEvent & { currentTarget: HTMLInputElement }) =>
                setLinkUrl(e.currentTarget.value)
              }
              onKeyDown={(e: KeyboardEvent) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyLink();
                }
              }}
              placeholder="https://..."
              leadingIcon="link"
              autofocus
            />
          </div>
        </RLModal>
      </Show>
    </div>
  );
};

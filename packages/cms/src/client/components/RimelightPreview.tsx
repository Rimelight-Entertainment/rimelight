import { For, type Component } from "solid-js"
import type { BaseBlock } from "../../core/types/blocks"

export interface RimelightPreviewProps {
  blocks: () => BaseBlock[]
}

function escapeHtml(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function getChildren(b: BaseBlock): BaseBlock[] {
  if (Array.isArray(b.props?.children)) return b.props.children
  if (Array.isArray(b.children)) return b.children
  return []
}

function renderBlockPreviewHtml(b: BaseBlock, sectionDepth: number = 0): string {
  const rawText = b.props.text
  const textVal = typeof rawText === "object" ? rawText.en || "" : rawText || ""

  if (b.type === "ParagraphBlock") {
    let html = textVal
    if (Array.isArray(rawText)) {
      html = rawText
        .map((node) => {
          if (node.type === "text") return escapeHtml(node.text)
          if (node.type === "link")
            return `<a href="${escapeHtml(node.url)}" class="text-blue-400 hover:underline">${escapeHtml(node.text)}</a>`
          if (node.type === "page_mention")
            return `<span class="px-1 py-0.5 bg-blue-900/50 text-blue-300 rounded text-sm">${escapeHtml(node.text)}</span>`
          return ""
        })
        .join("")
    } else {
      html = escapeHtml(textVal)
    }
    return `<p class="text-gray-200 text-base leading-relaxed my-3">${html}</p>`
  }

  if (b.type === "SectionBlock") {
    const level = Math.min(6, sectionDepth + 2)
    const title = b.props.title || "Untitled Section"
    const slug = title.toLowerCase().replace(/\W+/g, "-")
    const description = b.props.description
    let headingClasses = "font-bold text-gray-100"
    if (level === 2) headingClasses += " text-2xl"
    else if (level === 3) headingClasses += " text-xl"
    else if (level === 4) headingClasses += " text-lg"
    else if (level === 5) headingClasses += " text-base"
    else headingClasses += " text-sm"

    return `<div class="section-block my-6">
      <h${level} id="${slug}" class="${headingClasses} mb-1">${escapeHtml(title)}</h${level}>
      ${description ? `<p class="text-gray-400 text-sm mb-2">${escapeHtml(description)}</p>` : ""}
      <hr class="border-gray-800 mb-4" />
      <div class="pl-4 border-l-2 border-gray-800">
        ${getChildren(b)
          .map((c) => renderBlockPreviewHtml(c, sectionDepth + 1))
          .join("")}
      </div>
    </div>`
  }

  if (b.type === "CalloutBlock") {
    const variant = b.props.variant || "info"
    const variantLabel = variant.toUpperCase()
    let borderColor = "border-blue-500",
      bgColor = "bg-blue-950/30",
      textColor = "text-blue-400"
    if (variant === "success") {
      borderColor = "border-green-500"
      bgColor = "bg-green-950/30"
      textColor = "text-green-400"
    } else if (variant === "warning") {
      borderColor = "border-amber-500"
      bgColor = "bg-amber-950/30"
      textColor = "text-amber-400"
    } else if (variant === "error") {
      borderColor = "border-red-500"
      bgColor = "bg-red-950/30"
      textColor = "text-red-400"
    } else if (variant === "commentary") {
      borderColor = "border-gray-500"
      bgColor = "bg-gray-800/50"
      textColor = "text-gray-400"
    } else if (variant === "ideation") {
      borderColor = "border-purple-500"
      bgColor = "bg-purple-950/30"
      textColor = "text-purple-400"
    } else if (variant === "source") {
      borderColor = "border-teal-500"
      bgColor = "bg-teal-950/30"
      textColor = "text-teal-400"
    }

    return `<div class="callout my-3 p-4 border-l-4 ${borderColor} ${bgColor} rounded-r-lg">
      <div class="text-sm font-semibold mb-1 ${textColor}">${variantLabel}</div>
      <div class="text-sm text-gray-300">
        ${getChildren(b)
          .map((c) => renderBlockPreviewHtml(c, sectionDepth))
          .join("")}
      </div>
    </div>`
  }

  if (b.type === "ImageBlock") {
    const src = b.props.url || b.props.src || ""
    const alt = b.props.alt || ""
    const caption = b.props.caption
    return `<figure class="my-4">
      <img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" class="w-full rounded-lg border border-gray-800 max-h-96 object-contain" />
      ${caption ? `<figcaption class="text-center text-xs text-gray-500 mt-2">${escapeHtml(caption)}</figcaption>` : ""}
    </figure>`
  }

  if (b.type === "CodeBlock") {
    const code = b.props.code || textVal
    const language = b.props.language || "plaintext"
    const caption = b.props.caption
    return `<div class="my-3">
      ${caption ? `<div class="text-xs text-gray-500 mb-1">${escapeHtml(caption)}</div>` : ""}
      <pre class="bg-gray-950 border border-gray-800 rounded-lg p-4 overflow-x-auto">
        <code class="text-sm text-green-300 font-mono">${escapeHtml(code)}</code>
      </pre>
      <div class="text-[10px] text-gray-600 text-right mt-1">${escapeHtml(language)}</div>
    </div>`
  }

  if (b.type === "ScriptBlock") {
    const title = b.props.title || "Untitled Script"
    const synopsis = b.props.synopsis
    const chars = b.props.characters || []
    return `<div class="script-block my-4 border-l-4 border-amber-500 pl-4 py-2 bg-amber-950/10 rounded-r-md">
      <div class="text-xs font-bold text-amber-400 uppercase tracking-widest mb-2">SCRIPT</div>
      <div class="font-bold text-gray-100">${escapeHtml(title)}</div>
      ${synopsis ? `<div class="text-sm text-gray-400 mt-1 italic">${escapeHtml(synopsis)}</div>` : ""}
      ${chars.length ? `<div class="flex gap-1 flex-wrap mt-2">${chars.map((c: string) => `<span class="text-xs px-2 py-0.5 bg-amber-900/40 text-amber-300 rounded-full">${escapeHtml(c)}</span>`).join("")}</div>` : ""}
      <div class="mt-3 pl-4 border-l-2 border-amber-800/50">
        ${getChildren(b)
          .map((c) => renderBlockPreviewHtml(c, sectionDepth))
          .join("")}
      </div>
    </div>`
  }

  if (b.type === "SceneBlock") {
    const setting = b.props.setting || "NONE"
    const location = b.props.location || "LOCATION"
    const timeOfDay = b.props.timeOfDay || "DAY"
    const slugLine = `${setting === "INTERIOR" ? "INT." : setting === "EXTERIOR" ? "EXT." : ""} ${location.toUpperCase()} - ${timeOfDay}`
    const description = b.props.description
    const transition = b.props.transition || "NONE"
    return `<div class="scene-block my-4">
      <div class="font-mono text-sm font-bold text-cyan-400 uppercase tracking-wide py-1">${escapeHtml(slugLine)}</div>
      ${description ? `<p class="text-sm text-gray-300 mt-1 leading-relaxed">${escapeHtml(description)}</p>` : ""}
      ${transition !== "NONE" ? `<div class="text-right text-xs font-mono text-gray-500 mt-2">${escapeHtml(transition.replace("_", " "))}</div>` : ""}
      <div class="mt-2 pl-4 border-l-2 border-cyan-900">
        ${getChildren(b)
          .map((c) => renderBlockPreviewHtml(c, sectionDepth))
          .join("")}
      </div>
    </div>`
  }

  if (b.type === "DialogueBlock") {
    const character = b.props.character || "CHARACTER"
    const parenthetical = b.props.parenthetical
    const line = b.props.line || ""
    return `<div class="dialogue-block my-2">
      <div class="text-center font-bold text-sm text-purple-300 uppercase tracking-wider">${escapeHtml(character)}</div>
      ${parenthetical ? `<div class="text-center italic text-xs text-gray-500">(${escapeHtml(parenthetical)})</div>` : ""}
      <div class="text-center text-sm text-gray-200 max-w-sm mx-auto mt-1">${escapeHtml(line)}</div>
    </div>`
  }

  return `<div class="p-3 bg-gray-900 border border-gray-800 rounded text-sm text-gray-400 my-2">${escapeHtml(b.type)}: ${escapeHtml(textVal)}</div>`
}

export const RimelightPreview: Component<RimelightPreviewProps> = (props) => {
  return (
    <div class="cms-preview-pane flex-1 w-full h-full overflow-y-auto">
      <div class="cms-preview-header px-6 py-3 border-b border-gray-800 text-xs font-medium text-gray-400 uppercase tracking-widest">
        Live Preview
      </div>
      <div class="cms-preview-document p-8 max-w-3xl mx-auto space-y-4">
        <For each={props.blocks()}>
          {(b) => <div innerHTML={renderBlockPreviewHtml(b, 0)} />}
        </For>
      </div>
    </div>
  )
}

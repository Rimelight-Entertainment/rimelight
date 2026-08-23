import { createSignal, onMount, onCleanup, For, type Component } from "solid-js"
import { type BaseBlock, calculateHeadingLevel } from "../../core/types/blocks"

export interface RimelightPreviewProps {
  blocks?: BaseBlock[] | (() => BaseBlock[]) | undefined
  title?: string | undefined
  description?: string | undefined
  banner?: string | undefined
  category?: string | undefined
}

export const RimelightPreview: Component<RimelightPreviewProps> = (props) => {
  const getInitialBlocks = (): BaseBlock[] => {
    if (typeof props.blocks === "function") {
      try {
        return props.blocks() || []
      } catch {
        return []
      }
    }
    if (Array.isArray(props.blocks)) {
      return props.blocks
    }
    return []
  }

  const [blocks, setBlocks] = createSignal<BaseBlock[]>(getInitialBlocks())
  const [title, setTitle] = createSignal<string>(props.title || "")
  const [description, setDescription] = createSignal<string>(props.description || "")
  const [banner, setBanner] = createSignal<string>(props.banner || "")
  const [category, setCategory] = createSignal<string>(props.category || "")

  onMount(() => {
    const handleBlocksChange = (e: Event) => {
      if (e instanceof CustomEvent && Array.isArray(e.detail?.blocks)) {
        setBlocks(e.detail.blocks)
      }
    }

    const handleMetaChange = (e: Event) => {
      if (e instanceof CustomEvent && e.detail) {
        if (typeof e.detail.title === "string") setTitle(e.detail.title)
        if (typeof e.detail.description === "string") setDescription(e.detail.description)
        if (typeof e.detail.banner === "string") setBanner(e.detail.banner)
        if (typeof e.detail.category === "string") setCategory(e.detail.category)
      }
    }

    const handlePropsChange = (e: Event) => {
      if (e instanceof CustomEvent && e.detail?.properties) {
        if (typeof e.detail.properties.heroImage === "string") {
          setBanner(e.detail.properties.heroImage)
        }
        if (typeof e.detail.properties.category === "string") {
          setCategory(e.detail.properties.category)
        }
      }
    }

    document.addEventListener("blocks-change", handleBlocksChange)
    document.addEventListener("page-meta-change", handleMetaChange)
    document.addEventListener("properties-change", handlePropsChange)

    onCleanup(() => {
      document.removeEventListener("blocks-change", handleBlocksChange)
      document.removeEventListener("page-meta-change", handleMetaChange)
      document.removeEventListener("properties-change", handlePropsChange)
    })
  })

  return (
    <div class="cms-preview-pane flex-1 w-full h-full overflow-y-auto bg-transparent">
      <div class="cms-preview-document p-6 sm:p-8 max-w-4xl mx-auto space-y-6">
        {banner() && (
          <div class="rounded-2xl overflow-hidden border border-default shadow-sm aspect-[21/9]">
            <img src={banner()} alt={title() || "Banner"} class="w-full h-full object-cover" />
          </div>
        )}

        {(title() || description() || category()) && (
          <header class="border-b border-default pb-6 mb-6">
            {category() && (
              <span class="inline-block px-2.5 py-1 text-xs font-semibold rounded-full bg-primary/10 text-primary mb-3 uppercase tracking-wider">
                {category()}
              </span>
            )}
            {title() && (
              <h1 class="text-3xl sm:text-4xl font-extrabold text-highlighted tracking-tight leading-tight">
                {title()}
              </h1>
            )}
            {description() && (
              <p class="text-lg text-dimmed mt-3 leading-relaxed">{description()}</p>
            )}
          </header>
        )}

        <div class="space-y-4">
          {blocks().length === 0 ? (
            <div class="text-center py-12 text-neutral-500 text-sm italic">
              No blocks in this page yet.
            </div>
          ) : (
            <For each={blocks()}>{(b) => <div innerHTML={renderBlockPreviewHtml(b, 0)} />}</For>
          )}
        </div>
      </div>
    </div>
  )
}

function escapeHtml(str: string): string {
  return (str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}

function getChildren(b: BaseBlock): BaseBlock[] {
  if (!b) return []
  if (Array.isArray(b.children)) return b.children
  if (Array.isArray(b.props?.children)) return b.props.children
  return []
}

function renderBlockPreviewHtml(b: BaseBlock, sectionDepth: number = 0): string {
  if (!b) return ""
  const props = b.props || {}
  const rawText = props.text
  const textVal = typeof rawText === "object" && rawText !== null ? rawText.en || "" : rawText || ""

  if (b.type === "ParagraphBlock") {
    const renderNodes = (nodes: any[]): string => {
      return nodes
        .map((node) => {
          if (!node) return ""
          if (node.type === "text") {
            let t = escapeHtml(node.text || "")
            if (node.marks && Array.isArray(node.marks)) {
              if (node.marks.includes("bold")) t = `<strong>${t}</strong>`
              if (node.marks.includes("italic")) t = `<em>${t}</em>`
              if (node.marks.includes("underline")) t = `<u>${t}</u>`
              if (node.marks.includes("strikethrough")) t = `<s>${t}</s>`
              if (node.marks.includes("code"))
                t = `<code class="bg-neutral-800 text-neutral-200 px-1.5 py-0.5 rounded text-sm font-mono">${t}</code>`
            }
            return t
          }
          if (node.type === "link") {
            const inner = node.children ? renderNodes(node.children) : escapeHtml(node.text || "")
            const target = node.openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : ""
            return `<a href="${escapeHtml(node.url || "#")}"${target} class="text-blue-500 hover:text-blue-400 underline underline-offset-2">${inner}</a>`
          }
          if (node.type === "page_mention") {
            const title = escapeHtml(node.displayTitle || node.pageSlug || node.pageId || "Page")
            return `<span class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 text-sm font-medium">📄 ${title}</span>`
          }
          return ""
        })
        .join("")
    }

    let html = ""
    if (Array.isArray(rawText)) {
      html = renderNodes(rawText)
    } else {
      html = escapeHtml(textVal)
    }
    return `<p class="text-neutral-800 dark:text-neutral-200 text-base leading-relaxed my-3 whitespace-pre-wrap break-words">${html || '<span class="text-neutral-500 italic">Empty paragraph</span>'}</p>`
  }

  if (b.type === "SectionBlock") {
    const level = calculateHeadingLevel(sectionDepth)
    const title = props.title || "Untitled Section"
    const slug = title.toLowerCase().replace(/\W+/g, "-")
    const description = props.description
    let headingClasses = "font-bold text-neutral-900 dark:text-white"
    if (level === 2)
      headingClasses += " text-3xl mt-6 mb-3 border-b border-gray-200 dark:border-gray-800 pb-2"
    else if (level === 3) headingClasses += " text-2xl font-semibold mt-5 mb-2.5"
    else if (level === 4) headingClasses += " text-xl font-medium mt-4 mb-2"
    else if (level === 5) headingClasses += " text-lg font-medium mt-3 mb-1.5"
    else headingClasses += " text-base font-normal mt-2 mb-1"

    return `<div class="section-block my-6">
      <h${level} id="${slug}" class="${headingClasses}">${escapeHtml(title)}</h${level}>
      ${description ? `<p class="text-gray-500 dark:text-gray-400 text-sm mt-1 mb-4 italic">${escapeHtml(description)}</p>` : ""}
      <div class="mt-4 pl-4 border-l-2 border-gray-200 dark:border-gray-800">
        ${getChildren(b)
          .map((c) => renderBlockPreviewHtml(c, sectionDepth + 1))
          .join("")}
      </div>
    </div>`
  }

  if (b.type === "CalloutBlock") {
    const variant = props.variant || "info"
    const to = props.to
    const target = props.target || "_self"
    const icons: Record<string, string> = {
      info: "ℹ️",
      success: "✅",
      warning: "⚠️",
      error: "🛑",
      commentary: "💬",
      ideation: "💡",
      source: "💻"
    }
    const icon = icons[variant] || icons.info

    let variantClasses =
      "bg-blue-50/50 dark:bg-blue-950/10 border-blue-200 dark:border-blue-900/50 text-blue-800 dark:text-blue-200"
    if (variant === "success") {
      variantClasses =
        "bg-green-50/50 dark:bg-green-950/10 border-green-200 dark:border-green-900/50 text-green-800 dark:text-green-200"
    } else if (variant === "warning") {
      variantClasses =
        "bg-yellow-50/50 dark:bg-yellow-950/10 border-yellow-200 dark:border-yellow-900/50 text-yellow-800 dark:text-yellow-200"
    } else if (variant === "error") {
      variantClasses =
        "bg-red-50/50 dark:bg-red-950/10 border-red-200 dark:border-red-900/50 text-red-800 dark:text-red-200"
    } else if (variant === "commentary") {
      variantClasses =
        "bg-purple-50/50 dark:bg-purple-950/10 border-purple-200 dark:border-purple-900/50 text-purple-800 dark:text-purple-200"
    } else if (variant === "ideation") {
      variantClasses =
        "bg-amber-50/50 dark:bg-amber-950/10 border-amber-200 dark:border-amber-900/50 text-amber-800 dark:text-amber-200"
    } else if (variant === "source") {
      variantClasses =
        "bg-indigo-50/50 dark:bg-indigo-950/10 border-indigo-200 dark:border-indigo-900/50 text-indigo-800 dark:text-indigo-200"
    }

    const tag = to ? `a href="${escapeHtml(to)}" target="${escapeHtml(target)}"` : "div"
    const closeTag = to ? "a" : "div"

    return `<${tag} class="callout border rounded-xl p-4 my-4 flex items-start gap-3 text-sm no-underline ${variantClasses}">
      <span class="text-base shrink-0 mt-0.5 select-none">${icon}</span>
      <div class="flex-1 min-w-0 text-sm">
        ${getChildren(b)
          .map((c) => renderBlockPreviewHtml(c, sectionDepth))
          .join("")}
      </div>
    </${closeTag}>`
  }

  if (b.type === "ImageBlock") {
    const src = props.src || props.url || ""
    const alt = props.alt || "Image"
    const caption = props.caption
    return `<figure class="mx-auto my-6 flex flex-col items-center max-w-full">
      <img src="${escapeHtml(src)}" alt="${escapeHtml(alt)}" class="h-auto max-w-full rounded-xl object-cover border border-neutral-200 dark:border-neutral-800 shadow-sm" />
      ${caption ? `<figcaption class="mt-2 text-center text-xs text-neutral-500 dark:text-neutral-400 italic">${escapeHtml(caption)}</figcaption>` : ""}
    </figure>`
  }

  if (b.type === "CodeBlock") {
    const code = props.code || textVal
    const language = props.language || "plaintext"
    const caption = props.caption
    return `<div class="cms-code my-4 rounded-lg bg-gray-950 p-4 font-mono text-sm border border-gray-800 overflow-x-auto">
      <div class="text-xs text-gray-500 uppercase mb-2 select-none">${escapeHtml(language)}</div>
      <pre class="m-0"><code class="text-green-300 font-mono">${escapeHtml(code)}</code></pre>
      ${caption ? `<div class="mt-2 text-center text-xs text-gray-500 italic">${escapeHtml(caption)}</div>` : ""}
    </div>`
  }

  if (b.type === "ScriptBlock") {
    const title = props.title || "Untitled Script"
    const synopsis = props.synopsis
    const chars = props.characters || []
    const { aPlot, bPlot, cPlot, stinger } = props
    return `<div class="my-6 p-4 border-l-4 border-amber-400 bg-amber-50/20 dark:bg-amber-950/10 rounded-r-lg">
      <div class="mb-4">
        <h3 class="text-xl font-bold text-amber-900 dark:text-amber-100">${escapeHtml(title)}</h3>
        ${synopsis ? `<p class="text-sm text-gray-500 dark:text-gray-400 mt-1 italic">${escapeHtml(synopsis)}</p>` : ""}
        ${chars.length ? `<div class="flex flex-wrap gap-3 mt-3 text-xs">${chars.map((c: string) => `<span class="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200">${escapeHtml(c)}</span>`).join("")}</div>` : ""}
      </div>
      ${
        aPlot || bPlot || cPlot
          ? `<div class="grid grid-cols-1 md:grid-cols-3 gap-3 my-3">
        ${aPlot ? `<div class="bg-white/50 dark:bg-neutral-900/30 rounded p-2 border border-gray-200 dark:border-gray-700"><div class="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">A Plot</div><div class="text-sm mt-0.5">${escapeHtml(aPlot)}</div></div>` : ""}
        ${bPlot ? `<div class="bg-white/50 dark:bg-neutral-900/30 rounded p-2 border border-gray-200 dark:border-gray-700"><div class="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">B Plot</div><div class="text-sm mt-0.5">${escapeHtml(bPlot)}</div></div>` : ""}
        ${cPlot ? `<div class="bg-white/50 dark:bg-neutral-900/30 rounded p-2 border border-gray-200 dark:border-gray-700"><div class="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">C Plot</div><div class="text-sm mt-0.5">${escapeHtml(cPlot)}</div></div>` : ""}
      </div>`
          : ""
      }
      ${stinger ? `<p class="text-sm text-gray-500 dark:text-gray-400 italic mt-2 border-t border-gray-200 dark:border-gray-700 pt-2">Stinger: ${escapeHtml(stinger)}</p>` : ""}
      <div class="mt-4">
        ${getChildren(b)
          .map((c) => renderBlockPreviewHtml(c, sectionDepth))
          .join("")}
      </div>
    </div>`
  }

  if (b.type === "SceneBlock") {
    const settingLabels: Record<string, string> = {
      INTERIOR: "INT.",
      EXTERIOR: "EXT.",
      OTHER: "Other"
    }
    const timeOfDayLabels: Record<string, string> = {
      MORNING: "Morning",
      NOON: "Noon",
      AFTERNOON: "Afternoon",
      EVENING: "Evening",
      NIGHT: "Night",
      OTHER: "Other"
    }
    const transitionLabels: Record<string, string> = {
      CUT_TO: "CUT TO",
      CUT_BACK_TO: "CUT BACK TO",
      FADE_TO: "FADE TO",
      NONE: ""
    }

    const setting = settingLabels[props.setting] || props.setting || "INT."
    const location = props.location || ""
    const tod = timeOfDayLabels[props.timeOfDay] || props.timeOfDay || "Morning"
    const transition = transitionLabels[props.transition] || ""

    const parts: string[] = []
    if (setting && setting !== "Other") parts.push(setting)
    if (location) parts.push(location)
    if (tod && tod !== "Other") parts.push(`- ${tod}`)

    return `<div class="my-4 p-3 border-l-4 border-indigo-400 bg-indigo-50/20 dark:bg-indigo-950/10 rounded-r-lg">
      <div class="flex flex-wrap items-center gap-2 text-sm font-semibold text-indigo-800 dark:text-indigo-200 mb-2">
        ${parts.map((p) => `<span>${escapeHtml(p)}</span>`).join("")}
        ${transition ? `<span class="ml-auto text-[10px] italic text-gray-500 dark:text-gray-400">${escapeHtml(transition)}</span>` : ""}
      </div>
      ${props.description ? `<p class="text-sm text-gray-700 dark:text-gray-300 mb-2">${escapeHtml(props.description)}</p>` : ""}
      <div class="mt-3">
        ${getChildren(b)
          .map((c) => renderBlockPreviewHtml(c, sectionDepth))
          .join("")}
      </div>
    </div>`
  }

  if (b.type === "DialogueBlock") {
    const character = props.character || "CHARACTER"
    const parenthetical = props.parenthetical
    const line = props.line || ""
    return `<div class="my-3 mx-8 max-w-md">
      <div class="text-sm font-bold text-center text-pink-800 dark:text-pink-200">${escapeHtml(character)}</div>
      ${parenthetical ? `<div class="text-xs italic text-center text-gray-500 dark:text-gray-400 mt-0.5">(${escapeHtml(parenthetical)})</div>` : ""}
      <div class="text-sm text-center text-gray-700 dark:text-gray-300 mt-1">${escapeHtml(line)}</div>
    </div>`
  }

  return `<div class="p-3 bg-gray-900 border border-gray-800 rounded text-sm text-gray-400 my-2">${escapeHtml(b.type)}: ${escapeHtml(textVal)}</div>`
}

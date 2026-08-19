<script setup lang="ts">
import { computed, ref } from "vue"
import chroma from "chroma-js"
import { scv } from "css-variants"
import ColorSwatch from "./ColorSwatch.vue"

/* region Props */
export interface SwatchData {
  name: string
  value: string
  format: "hex" | "rgb" | "hsl" | "oklch" | "cmyk" | "unknown"
}

export interface PaletteSubSection {
  label: string
  swatches: SwatchData[]
}

export interface PaletteTab {
  label: string
  subsections: PaletteSubSection[]
}

export interface ColorPaletteProps {
  css?: string
}

const { css = "" } = defineProps<ColorPaletteProps>()
/* endregion */

/* region Emits */
export interface ColorPaletteEmits {}
defineEmits<ColorPaletteEmits>()
/* endregion */

/* region Slots */
export interface ColorPaletteSlots {}
defineSlots<ColorPaletteSlots>()
/* endregion */

/* region Styles */
const colorPaletteStyles = scv({
  slots: ["root", "grid", "tabsList", "tabsContent", "tabsRoot", "title", "accordion"],
  base: {
    root: "w-full",
    grid: "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4",
    tabsList:
      "md:w-64 shrink-0 md:sticky md:top-24 self-start z-10 overflow-visible flex flex-col gap-2",
    tabsContent: "flex-1 min-w-0 w-full",
    tabsRoot: "flex flex-col md:flex-row gap-12 items-start overflow-visible",
    title: "text-3xl font-bold text-highlighted mb-8",
    accordion: "w-full flex flex-col gap-2"
  }
})

const styles = colorPaletteStyles()
/* endregion */

/* region State */
const activeTabIndex = ref(0)
const openSections = ref<Record<string, boolean>>({})

function getFormat(value: string): SwatchData["format"] {
  if (value.startsWith("#")) return "hex"
  if (value.startsWith("oklch")) return "oklch"
  if (value.startsWith("rgb")) return "rgb"
  if (value.startsWith("hsl")) return "hsl"
  if (value.startsWith("cmyk")) return "cmyk"
  return "unknown"
}

function getName(fullVarName: string): string {
  const parts = fullVarName.split("-")
  return parts[parts.length - 1] ?? ""
}

const tabItems = computed(() => {
  if (!css) return []
  const tabs: PaletteTab[] = []
  const lines = css.split("\n")
  const stack: string[] = []

  lines.forEach((line) => {
    // Check for region markers
    const regionStartMatch = line.match(/\/\*\s*region\s+(\S+)\s*\*\//)
    const regionEndMatch = line.match(/\/\*\s*endregion\s*\*\//)
    if (regionStartMatch) {
      stack.push(regionStartMatch[1] ?? "")
    }
    // Capture colors only if NOT a comment line (except for the regions we just identified)
    const colorMatch = line.match(/^\s*--color-([\w-]+):([^;]*);/)
    if (colorMatch && !line.trim().startsWith("/*")) {
      const fullVarName = colorMatch[1] ?? ""
      const value = colorMatch[2]?.trim() ?? ""
      // Remove top-level "Colors" if it exists in the breadcrumb
      const activeStack = stack[0] === "Colors" ? stack.slice(1) : stack
      const topLevelLabel = activeStack[0] || "Other"
      const subLevelLabel =
        activeStack.length > 1 ? activeStack.slice(1).join(" › ") : topLevelLabel
      let tab = tabs.find((t) => t.label === topLevelLabel)
      if (!tab) {
        tab = {
          label: topLevelLabel,
          subsections: []
        }
        tabs.push(tab)
      }
      let subSection = tab.subsections.find((s) => s.label === subLevelLabel)
      if (!subSection) {
        subSection = {
          label: subLevelLabel,
          swatches: []
        }
        tab.subsections.push(subSection)
      }
      subSection.swatches.push({
        name: getName(fullVarName),
        value,
        format: getFormat(value)
      })
    }
    if (regionEndMatch) {
      stack.pop()
    }
  })
  return tabs
})

const activeTab = computed(() => tabItems.value[activeTabIndex.value] || null)
/* endregion */

/* region Meta */
defineOptions({
  name: "ColorPalette"
})
/* endregion */

/* region Logic */
function parseOklch(str: string): [number, number, number] | null {
  const match = str.match(/oklch\(([\d.]+%?)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*[\d.]+%?)?\)/)
  if (match) {
    let l = parseFloat(match[1] ?? "0")
    if (match[1]?.endsWith("%")) l /= 100
    const c = parseFloat(match[2] ?? "0")
    const h = parseFloat(match[3] ?? "0")
    return [l, c, h]
  }
  return null
}

function getSwatchProps(swatch: SwatchData) {
  const p: any = { name: swatch.name }
  try {
    let color: chroma.Color
    if (swatch.format === "oklch") {
      const oklchValues = parseOklch(swatch.value)
      if (oklchValues) {
        color = (chroma as any).oklch(...oklchValues)
      } else {
        color = chroma(swatch.value)
      }
    } else {
      color = chroma(swatch.value)
    }
    p.hex = color.hex()
    p.rgb = color.css()
    p.hsl = color.css("hsl")
    const [l, c, h] = (color as any).oklch()
    p.oklch = `oklch(${Math.round(l * 1000) / 10}% ${Math.round(c * 1000) / 1000} ${Math.round(h * 100) / 100})`
    const [cy, m, y, k] = color.cmyk()
    p.cmyk = `cmyk(${Math.round(cy * 100)}%, ${Math.round(m * 100)}%, ${Math.round(y * 100)}%, ${Math.round(k * 100)}%)`
    // Calculate best contrasting text color
    p.textColor = color.luminance() > 0.45 ? "#000000" : "#FFFFFF"
  } catch (e) {
    // Fallback if conversion fails
    if (swatch.format !== "unknown") {
      p[swatch.format] = swatch.value
    } else {
      p.oklch = swatch.value
    }
    p.textColor = "#FFFFFF"
  }
  return p
}

function toggleSection(label: string) {
  openSections.value[label] = !openSections.value[label]
}

function isSectionOpen(label: string) {
  return openSections.value[label] !== false // open by default
}
/* endregion */
</script>

<template>
  <div :class="styles.root">
    <div :class="styles.tabsRoot">
      <!-- Custom vertical tabs list -->
      <div :class="styles.tabsList">
        <button
          v-for="(item, index) in tabItems"
          :key="item.label"
          @click="activeTabIndex = index"
          :class="[
            'text-left px-4 py-2 rounded-lg font-medium transition-all text-sm',
            activeTabIndex === index
              ? 'bg-primary-500 text-white shadow-md'
              : 'hover:bg-neutral-100 dark:hover:bg-neutral-800 text-dimmed hover:text-highlighted'
          ]"
        >
          {{ item.label }}
        </button>
      </div>
      <!-- Tab Content -->
      <div v-if="activeTab" :class="styles.tabsContent">
        <h2 :class="styles.title">
          {{ activeTab.label }}
        </h2>
        <!-- Custom Accordion for subsections -->
        <div :class="styles.accordion">
          <div
            v-for="subSection in activeTab.subsections"
            :key="subSection.label"
            class="border-b border-neutral-200 dark:border-neutral-800 last:border-b-0"
          >
            <button
              @click="toggleSection(subSection.label)"
              class="w-full flex items-center justify-between text-xl font-bold py-4 text-left hover:text-primary transition-colors"
            >
              <span>{{ subSection.label }}</span>
              <span
                :class="[
                  'transition-transform duration-200 i-lucide-chevron-down',
                  isSectionOpen(subSection.label) ? 'rotate-180' : ''
                ]"
              />
            </button>
            <!-- Accordion Body -->
            <div v-show="isSectionOpen(subSection.label)" class="py-6 px-4">
              <div :class="styles.grid">
                <ColorSwatch
                  v-for="swatch in subSection.swatches"
                  :key="swatch.name"
                  v-bind="getSwatchProps(swatch)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

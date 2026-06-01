<script setup lang="ts">
import { computed, ref } from "vue"
import chroma from "chroma-js"
import { useRC, useHeaderStack } from "~/composables"
import { scv, cx } from "css-variants"

/* region Props */
export interface FontData {
  name: string
  family: string
}

export interface ColorData {
  name: string
  fullVarName: string
  lightValue: string
  lightBg: string
  darkValue: string
  darkBg: string
}

export interface FontPaletteProps {
  /**
   * Raw CSS content to parse
   */
  css?: string
  /**
   * UI custom classes
   */
  rc?: {
    root?: string
    section?: string
    title?: string
    grid?: string
  }
  t?: (key: string) => string
}

const {
  css = "",
  rc: rcProp,
  t = (key: string) => {
    const map: Record<string, string> = {
      "font_palette.heading_1": "Heading 1",
      "font_palette.heading_2": "Heading 2",
      "font_palette.heading_3": "Heading 3",
      "font_palette.heading_4": "Heading 4",
      "font_palette.heading_5": "Heading 5",
      "font_palette.heading_6": "Heading 6",
      "font_palette.specimen": "Specimen",
      "font_palette.hierarchy": "Hierarchy",
      "font_palette.color": "Color Contexts",
      "font_palette.uppercase": "Uppercase",
      "font_palette.lowercase": "Lowercase",
      "font_palette.numbers": "Numbers",
      "font_palette.symbols": "Symbols"
    }
    return map[key] || key
  }
} = defineProps<FontPaletteProps>()

const { rc } = useRC("FontPalette", rcProp)
/* endregion */

/* region Emits */
export interface FontPaletteEmits {}
defineEmits<FontPaletteEmits>()
/* endregion */

/* region Slots */
export interface FontPaletteSlots {}
defineSlots<FontPaletteSlots>()
/* endregion */

/* region Styles */
const fontPaletteStyles = scv({
  slots: [
    "root",
    "section",
    "tabsRoot",
    "tabsList",
    "tabsContent",
    "contentHeader",
    "title",
    "familyCode",
    "accordionWrapper",
    "specimenGrid",
    "specimenRow",
    "specimenLabel",
    "specimenValue",
    "hierarchyGrid",
    "hierarchyRow",
    "hierarchyLabel",
    "paragraphText",
    "colorGrid",
    "colorRow",
    "colorVarLabel",
    "colorComparisonGrid",
    "colorCell",
    "colorPreviewText",
    "colorValueLabel"
  ],
  base: {
    root: "w-full",
    section: "flex flex-col gap-12",
    tabsRoot: "flex flex-col md:flex-row gap-12 items-start overflow-visible",
    tabsList:
      "md:w-64 shrink-0 md:sticky md:top-24 self-start z-10 overflow-visible flex flex-col gap-2",
    tabsContent: "flex-1 min-w-0 w-full",
    contentHeader: "flex flex-col gap-8",
    title: "text-3xl font-bold text-highlighted mb-2",
    familyCode: "text-sm text-muted",
    accordionWrapper: "flex flex-col gap-8",
    specimenGrid: "flex flex-col gap-8 py-4 text-highlighted",
    specimenRow: "flex flex-col md:flex-row md:items-baseline gap-4",
    specimenLabel: "w-32 text-xs text-muted font-mono uppercase shrink-0",
    specimenValue: "text-4xl break-all line-height-none tracking-tight",
    hierarchyGrid: "flex flex-col gap-8 pb-8",
    hierarchyRow: "flex flex-col md:flex-row md:items-baseline gap-4",
    hierarchyLabel: "w-12 text-xs text-muted font-mono uppercase shrink-0",
    paragraphText: "m-0 leading-relaxed max-w-2xl",
    colorGrid: "flex flex-col gap-8 pb-8",
    colorRow: "flex flex-col md:flex-row gap-4",
    colorVarLabel: "w-32 text-xs text-muted font-mono shrink-0 pt-2",
    colorComparisonGrid: "flex-1 grid grid-cols-2 rounded-lg overflow-hidden h-20",
    colorCell: "flex flex-col items-center justify-center p-2 gap-1",
    colorPreviewText: "text-2xl font-bold",
    colorValueLabel: "text-[10px] opacity-50 font-mono hidden md:block"
  }
})

const styles = computed(() => {
  const resolved = fontPaletteStyles()
  const result: Record<string, string> = {}
  for (const [slot, value] of Object.entries(resolved)) {
    result[slot] = cx(value, (rc.value as Record<string, string>)[slot])
  }
  return result
})
/* endregion */

/* region State */
const { totalHeight } = useHeaderStack()
const stickyTop = computed(() => `${totalHeight.value + 32}px`)

const activeTabIndex = ref(0)
const openSections = ref<Record<string, boolean>>({})

const parsedData = computed(() => {
  if (!css) return { fonts: [], colors: [] }

  const fonts: FontData[] = []
  const rootVars = new Map<string, string>()
  const darkVars = new Map<string, string>()

  const lines = css.split("\n")
  let currentBlock = "root" // 'root' or 'dark'

  lines.forEach((line) => {
    // Detect block context
    if (line.includes(".dark {")) {
      currentBlock = "dark"
      return
    }
    if (line.includes("}") && currentBlock === "dark") {
      currentBlock = "root"
      return
    }

    // Parse Variables
    const varMatch = line.match(/^\s*(--[\w-]+):\s*(.*?);/)
    if (varMatch && !line.trim().startsWith("/*")) {
      const key = varMatch[1] ?? ""
      const value = varMatch[2]?.trim() ?? ""
      if (currentBlock === "root") {
        rootVars.set(key, value)
      } else {
        darkVars.set(key, value)
      }
    }

    // Parse Fonts (Independent of block, usually root/static)
    const fontMatch = line.match(/^\s*--font-([\w-]+):\s*(.*?);/)
    if (fontMatch && !line.trim().startsWith("/*")) {
      fonts.push({
        name: fontMatch[1] ?? "",
        family: fontMatch[2]?.trim() ?? ""
      })
    }
  })

  // Collect Text Colors
  const colors: ColorData[] = []
  const keys = new Set([...rootVars.keys(), ...darkVars.keys()])

  keys.forEach((key) => {
    // Filter for --text- or --ui-text-
    if (key.startsWith("--text-") || key.startsWith("--ui-text-")) {
      const name = key.replace(/^--(?:ui-)?text-/, "")

      // Resolve light value
      const resolvedLight = resolveVariable(key, rootVars)
      const colorCheck = getColor(resolvedLight)

      if (colorCheck) {
        // Resolve Dark Value
        const resolvedDark = resolveVariable(key, darkVars, rootVars)

        const lightBg = "bg-white text-black"
        const darkBg = "bg-black text-white"

        colors.push({
          name,
          fullVarName: key,
          lightValue: resolvedLight,
          lightBg,
          darkValue: resolvedDark,
          darkBg
        })
      }
    }
  })

  return { fonts, colors }
})

const sampleText = "The quick brown fox jumps over the lazy dog"
const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
const alphabetLower = "abcdefghijklmnopqrstuvwxyz"
const numbers = "0123456789"
const symbols = "!@#$%^&*()_+-=[]{};':\",./<>?"

const headingLevels = [
  { tag: "h1", label: t("font_palette.heading_1") },
  { tag: "h2", label: t("font_palette.heading_2") },
  { tag: "h3", label: t("font_palette.heading_3") },
  { tag: "h4", label: t("font_palette.heading_4") },
  { tag: "h5", label: t("font_palette.heading_5") },
  { tag: "h6", label: t("font_palette.heading_6") }
]

const tabItems = computed(() => {
  return parsedData.value.fonts.map((f) => ({
    label: f.name.charAt(0).toUpperCase() + f.name.slice(1),
    font: f
  }))
})

const activeTab = computed(() => tabItems.value[activeTabIndex.value] || null)
/* endregion */

/* region Meta */
defineOptions({
  name: "FontPalette"
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

function getColor(value: string): chroma.Color | null {
  try {
    if (value.startsWith("oklch")) {
      const oklchValues = parseOklch(value)
      if (oklchValues) {
        return (chroma as any).oklch(...oklchValues)
      }
    } else if (value.startsWith("#") || value.startsWith("rgb") || value.startsWith("hsl")) {
      return chroma(value)
    }
  } catch (e) {
    // ignore
  }
  return null
}

function resolveVariable(
  varName: string,
  map: Map<string, string>,
  fallbackMap?: Map<string, string>
): string {
  let value = map.get(varName)
  if (!value && fallbackMap) {
    value = fallbackMap.get(varName)
  }
  if (!value) return varName

  const varMatch = value.match(/^var\(([\w-]+)\)$/)
  if (varMatch && varMatch[1]) {
    return resolveVariable(varMatch[1], map, fallbackMap)
  }
  return value
}

function getFontStyles(family: string) {
  return { fontFamily: family }
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
    <div :class="styles.tabsRoot" :style="{ '--palette-sticky-top': stickyTop }">
      <!-- Tabs List -->
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
        <div :class="styles.contentHeader">
          <header>
            <h2 :class="styles.title">
              {{ activeTab.label }}
            </h2>
            <code :class="styles.familyCode">{{ activeTab.font.family }}</code>
          </header>

          <div :class="styles.accordionWrapper">
            <!-- Specimen Section -->
            <div class="border-b border-neutral-200 dark:border-neutral-800">
              <button
                @click="toggleSection('specimen')"
                class="w-full flex items-center justify-between text-xl font-bold py-4 text-left hover:text-primary transition-colors"
              >
                <span>{{ t("font_palette.specimen") }}</span>
                <span
                  :class="[
                    'transition-transform duration-200 i-lucide-chevron-down',
                    isSectionOpen('specimen') ? 'rotate-180' : ''
                  ]"
                />
              </button>
              <div v-show="isSectionOpen('specimen')" class="py-6 px-4">
                <div :class="styles.specimenGrid" :style="getFontStyles(activeTab.font.family)">
                  <div :class="styles.specimenRow">
                    <span :class="styles.specimenLabel">{{ t("font_palette.uppercase") }}</span>
                    <div :class="styles.specimenValue%">{{ alphabet }}</div>
                  </div>
                  <div :class="styles.specimenRow">
                    <span :class="styles.specimenLabel">{{ t("font_palette.lowercase") }}</span>
                    <div :class="styles.specimenValue%">{{ alphabetLower }}</div>
                  </div>
                  <div :class="styles.specimenRow">
                    <span :class="styles.specimenLabel">{{ t("font_palette.numbers") }}</span>
                    <div class="text-4xl">{{ numbers }}</div>
                  </div>
                  <div :class="styles.specimenRow">
                    <span :class="styles.specimenLabel">{{ t("font_palette.symbols") }}</span>
                    <div class="text-4xl">{{ symbols }}</div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Hierarchy Section -->
            <div class="border-b border-neutral-200 dark:border-neutral-800">
              <button
                @click="toggleSection('hierarchy')"
                class="w-full flex items-center justify-between text-xl font-bold py-4 text-left hover:text-primary transition-colors"
              >
                <span>{{ t("font_palette.hierarchy") }}</span>
                <span
                  :class="[
                    'transition-transform duration-200 i-lucide-chevron-down',
                    isSectionOpen('hierarchy') ? 'rotate-180' : ''
                  ]"
                />
              </button>
              <div v-show="isSectionOpen('hierarchy')" class="py-6 px-4">
                <div :class="styles.hierarchyGrid" :style="getFontStyles(activeTab.font.family)">
                  <div v-for="h in headingLevels" :key="h.tag" :class="styles.hierarchyRow">
                    <span :class="styles.hierarchyLabel">{{ h.tag }}</span>
                    <component :is="h.tag" class="m-0">{{ h.label }}</component>
                  </div>
                  <div :class="styles.hierarchyRow">
                    <span :class="styles.hierarchyLabel">p</span>
                    <p :class="styles.paragraphText">
                      {{ sampleText }}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Colors Section -->
            <div class="border-b border-neutral-200 dark:border-neutral-800">
              <button
                @click="toggleSection('colors')"
                class="w-full flex items-center justify-between text-xl font-bold py-4 text-left hover:text-primary transition-colors"
              >
                <span>{{ t("font_palette.color") }}</span>
                <span
                  :class="[
                    'transition-transform duration-200 i-lucide-chevron-down',
                    isSectionOpen('colors') ? 'rotate-180' : ''
                  ]"
                />
              </button>
              <div v-show="isSectionOpen('colors')" class="py-6 px-4">
                <div :class="styles.colorGrid" :style="getFontStyles(activeTab.font.family)">
                  <div v-for="c in parsedData.colors" :key="c.name" :class="styles.colorRow">
                    <span :class="styles.colorVarLabel">{{ c.fullVarName }}</span>
                    <div :class="styles.colorComparisonGrid">
                      <!-- Light Mode -->
                      <div :class="[styles.colorCell, c.lightBg]" :style="{ color: c.lightValue }">
                        <p :class="styles.colorPreviewText">Aa</p>
                        <span :class="styles.colorValueLabel"
                          >{{ c.lightValue.slice(0, 15) }}...</span
                        >
                      </div>
                      <!-- Dark Mode -->
                      <div :class="[styles.colorCell, c.darkBg]" :style="{ color: c.darkValue }">
                        <p :class="styles.colorPreviewText">Aa</p>
                        <span :class="styles.colorValueLabel"
                          >{{ c.darkValue.slice(0, 15) }}...</span
                        >
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { scv } from "css-variants"
import { useUi, resolveClasses } from "../../utils"
import type { ComponentVariants } from "../../types"
import sectionTheme from "../../themes/section.theme"

const section = scv(sectionTheme)
type SectionVariants = ComponentVariants<typeof sectionTheme>

export interface RLVSectionProps {
  variant?: SectionVariants["variant"]
  headline?: string
  icon?: string
  title?: string
  description?: string
  orientation?: SectionVariants["orientation"]
  reverse?: boolean
  ctaVariant?: SectionVariants["ctaVariant"]
  ui?: Partial<Record<string, string>>
  class?: string
}

const {
  variant = "default",
  orientation = "vertical",
  reverse = false,
  ctaVariant = "outline",
  class: className,
  ui: uiProp
} = defineProps<RLVSectionProps>()

const resolvedClasses = computed(() =>
  resolveClasses(
    section,
    {
      variant,
      orientation,
      reverse,
      ...(variant === "cta" && { ctaVariant }),
      headline: false,
      title: false,
      description: false,
      body: false
    },
    useUi("section", uiProp),
    className
  )
)
</script>

<template>
  <div data-slot="rlv-section" :class="[resolvedClasses.root]" v-bind="$attrs">
    <slot name="background">
      <div :class="resolvedClasses.background" data-slot="background">
        <slot name="background" />
      </div>
    </slot>

    <slot name="top" />

    <div :class="resolvedClasses.container">
      <div :class="resolvedClasses.wrapper">
        <div :class="resolvedClasses.header">
          <slot name="leading">
            <span v-if="icon" :class="resolvedClasses.leadingIcon" data-slot="leading-icon">
              <span :class="icon" aria-hidden="true" />
            </span>
          </slot>

          <div v-if="headline" :class="resolvedClasses.headline">
            {{ headline }}
          </div>

          <h2 v-if="title" :class="resolvedClasses.title">
            {{ title }}
          </h2>

          <div v-if="description" :class="resolvedClasses.description">
            {{ description }}
          </div>
        </div>

        <div :class="resolvedClasses.body">
          <slot name="body" />
        </div>

        <div :class="resolvedClasses.footer">
          <slot name="links" />
        </div>
      </div>

      <slot />
    </div>

    <slot name="bottom" />
  </div>
</template>

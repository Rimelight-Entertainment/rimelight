<script setup lang="ts">
import { computed } from "vue"
import { scv } from "css-variants"
import { useUi, resolveClasses } from "../../utils"
import type { ComponentVariants, ComponentSlots } from "../../types"
import sectionTheme from "../../themes/section.theme"
import type { RLVButtonProps } from "./RLVButton.vue"
import RLVIcon from "./RLVIcon.vue"
import RLVButton from "./RLVButton.vue"

const section = scv(sectionTheme)
type SectionVariants = ComponentVariants<typeof sectionTheme>

export interface RLVSectionProps {
  as?: any
  variant?: SectionVariants["variant"]
  headline?: string
  icon?: string
  title?: string
  description?: string
  links?: RLVButtonProps[]
  orientation?: SectionVariants["orientation"]
  reverse?: boolean
  ctaVariant?: SectionVariants["ctaVariant"]
  ui?: ComponentSlots<typeof sectionTheme>
  class?: any
}

const {
  as = "div",
  variant = "default",
  orientation = "vertical",
  reverse = false,
  ctaVariant = "solid",
  ui: uiProp,
  class: className
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
  <component :is="as" data-slot="root" :data-orientation="orientation" :class="[resolvedClasses.root]" v-bind="$attrs">
    <slot v-if="$slots.background" name="background">
      <div :class="resolvedClasses.background" data-slot="background">
        <slot name="background" />
      </div>
    </slot>

    <slot name="top" />

    <div data-slot="container" :class="resolvedClasses.container">
      <div
        v-if="
          $slots.header || icon || headline || title || description || $slots.body || $slots.footer || $slots.links || links?.length
        "
        data-slot="wrapper"
        :class="resolvedClasses.wrapper"
      >
        <div
          v-if="$slots.header || icon || headline || title || description"
          data-slot="header"
          :class="resolvedClasses.header"
        >
          <slot name="header">
            <div v-if="icon || $slots.leading" data-slot="leading" :class="resolvedClasses.leading">
              <slot name="leading" :ui="resolvedClasses">
                <RLVIcon v-if="icon" :name="icon" size="md" :ui="{ root: resolvedClasses.leadingIcon }" />
              </slot>
            </div>

            <div v-if="headline" data-slot="headline" :class="resolvedClasses.headline">
              <slot name="headline">
                {{ headline }}
              </slot>
            </div>

            <component
              :is="variant === 'hero' ? 'h1' : 'h2'"
              v-if="title"
              data-slot="title"
              :class="resolvedClasses.title"
            >
              <slot name="title">
                {{ title }}
              </slot>
            </component>

            <div v-if="description" data-slot="description" :class="resolvedClasses.description">
              <slot name="description">
                {{ description }}
              </slot>
            </div>
          </slot>
        </div>

        <div v-if="$slots.body" data-slot="body" :class="resolvedClasses.body">
          <slot name="body" />
        </div>

        <div v-if="$slots.footer || $slots.links || links?.length" data-slot="footer" :class="resolvedClasses.footer">
          <slot name="footer">
            <RLVButton v-for="(link, index) in links" :key="index" size="lg" v-bind="link" />
            <div v-if="$slots.links" data-slot="links" :class="resolvedClasses.links">
              <slot name="links" />
            </div>
          </slot>
        </div>
      </div>

      <slot v-if="$slots.default" />
      <div v-else-if="orientation === 'horizontal'" class="hidden lg:block" />
    </div>

    <slot name="bottom" />
  </component>
</template>

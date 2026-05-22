<script setup lang="ts">
import { computed, useSlots } from "vue"
import { scv } from "css-variants"
import { useUi, resolveClasses } from "../../utils"
import type { SectionProps } from "../../types/components/section"
import sectionTheme from "../../themes/section.theme"
import RLVIcon from "./RLVIcon.vue"
import RLVButton from "./RLVButton.vue"

const section = scv(sectionTheme)

const {
  as = "div",
  variant = "default",
  orientation = "vertical",
  reverse = false,
  ctaVariant = "solid",
  ui: uiProp,
  class: className,
  headline,
  title,
  description,
  links
} = defineProps<SectionProps>()

const slots = useSlots()

const resolvedClasses = computed(() =>
  resolveClasses(
    section,
    {
      variant,
      orientation,
      reverse,
      ...(variant === "cta" && { ctaVariant }),
      headline: !!(slots.headline || headline),
      title: !!(slots.title || title),
      description: !!(slots.description || description),
      body: !!slots.body
    },
    useUi("section", uiProp),
    className
  )
)
</script>

<template>
  <component
    :is="as"
    data-slot="root"
    :data-orientation="orientation"
    :class="[resolvedClasses.root]"
    v-bind="$attrs"
  >
    <slot v-if="$slots.background" name="background">
      <div :class="resolvedClasses.background" data-slot="background">
        <slot name="background" />
      </div>
    </slot>

    <slot name="top" />

    <div data-slot="container" :class="resolvedClasses.container">
      <div
        v-if="
          $slots.header ||
          icon ||
          headline ||
          title ||
          description ||
          $slots.body ||
          $slots.footer ||
          $slots.links ||
          links?.length
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
                <RLVIcon
                  v-if="icon"
                  :name="icon"
                  size="md"
                  :ui="{ root: resolvedClasses.leadingIcon }"
                />
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

        <div
          v-if="$slots.footer || $slots.links || links?.length"
          data-slot="footer"
          :class="resolvedClasses.footer"
        >
          <slot name="footer">
            <div
              v-if="links?.length || $slots.links"
              data-slot="links"
              :class="resolvedClasses.links"
            >
              <RLVButton v-for="(link, index) in links" :key="index" size="lg" v-bind="link" />
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

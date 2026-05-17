<script setup lang="ts">
import { computed } from "vue"
import { scv, cx } from "css-variants"
import { twMerge } from "tailwind-merge"
import { useUi } from "@/composables"
import sectionTheme from "@/themes/section.theme"

const section = scv({
  slots: [...sectionTheme.slots],
  base: sectionTheme.base,
  variants: sectionTheme.variants,
  compoundVariants: [...sectionTheme.compoundVariants],
  defaultVariants: sectionTheme.defaultVariants,
  classNameResolver: (...args) => twMerge(cx(...args))
})

export interface RLVSectionProps {
  /**
   * The variant of the section. - `default` — standard page section - `hero` — hero section with
   * larger text - `cta` — call-to-action section with style variants
   *
   * @default "default"
   */
  variant?: "default" | "hero" | "cta"
  /**
   * The headline displayed above the title.
   */
  headline?: string
  /**
   * The icon displayed above the title.
   */
  icon?: string
  title?: string
  description?: string
  /**
   * The orientation of the section.
   *
   * @default "vertical"
   */
  orientation?: "horizontal" | "vertical"
  /**
   * Reverse the order of the default slot.
   *
   * @default false
   */
  reverse?: boolean
  /**
   * The style variant when variant is 'cta'.
   *
   * @default "outline"
   */
  ctaVariant?: "solid" | "outline" | "soft" | "subtle" | "naked"
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

const mergedUI = useUi("section", uiProp as Record<string, unknown> | undefined)

const resolvedClasses = computed(() => {
  const classes = section({
    variant,
    orientation,
    reverse,
    ctaVariant: variant === "cta" ? ctaVariant : undefined,
    headline: false,
    title: false,
    description: false,
    body: false
  })

  return {
    root: twMerge(classes.root, mergedUI.value.root as string | undefined),
    background: twMerge(classes.background, mergedUI.value.background as string | undefined),
    container: twMerge(classes.container, mergedUI.value.container as string | undefined),
    wrapper: twMerge(classes.wrapper, mergedUI.value.wrapper as string | undefined),
    header: twMerge(classes.header, mergedUI.value.header as string | undefined),
    leading: twMerge(classes.leading, mergedUI.value.leading as string | undefined),
    leadingIcon: twMerge(classes.leadingIcon, mergedUI.value.leadingIcon as string | undefined),
    headline: twMerge(classes.headline, mergedUI.value.headline as string | undefined),
    title: twMerge(classes.title, mergedUI.value.title as string | undefined),
    description: twMerge(classes.description, mergedUI.value.description as string | undefined),
    body: twMerge(classes.body, mergedUI.value.body as string | undefined),
    features: twMerge(classes.features, mergedUI.value.features as string | undefined),
    footer: twMerge(classes.footer, mergedUI.value.footer as string | undefined),
    links: twMerge(classes.links, mergedUI.value.links as string | undefined)
  }
})
</script>

<template>
  <div data-slot="rlv-section" :class="[resolvedClasses.root, className]" v-bind="$attrs">
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

<script setup lang="ts">
import { computed, useSlots, useAttrs } from "vue"
import type { CardProps } from "./card"
import { cardTheme } from "./card.theme"

defineOptions({ name: "RLVCard" })

const attrs = useAttrs()
const slots = useSlots()

const props = withDefaults(defineProps<CardProps>(), {
  overlay: false
})

const resolvedClasses = computed(() =>
  cardTheme({
    interactive: !!props.href,
    overlay: props.overlay,
    class: props.class
  })
)

const Tag = computed(() => (props.href ? "a" : "div"))
</script>

<template>
  <component
    :is="Tag"
    v-bind="attrs"
    :href="href"
    :class="resolvedClasses.root"
    data-slot="card-root"
    :style="href ? { textDecoration: 'none' } : undefined"
  >
    <slot name="media">
      <div v-if="mediaSrc" :class="resolvedClasses.media" data-slot="media">
        <img :src="mediaSrc" :alt="title || ''" class="h-full w-full object-cover" />
      </div>
    </slot>

    <template v-if="overlay">
      <div :class="resolvedClasses.overlay" data-slot="overlay">
        <div v-if="title" :class="resolvedClasses.title" data-slot="title">{{ title }}</div>
        <div v-if="description" :class="resolvedClasses.description" data-slot="description">
          {{ description }}
        </div>
        <slot />
      </div>
    </template>

    <template v-else>
      <slot name="header">
        <div
          v-if="title || description || slots.title || slots.description"
          :class="resolvedClasses.header"
          data-slot="header"
        >
          <div v-if="title" :class="resolvedClasses.title" data-slot="title">{{ title }}</div>
          <slot name="title" />

          <div v-if="description" :class="resolvedClasses.description" data-slot="description">
            {{ description }}
          </div>
          <slot name="description" />
        </div>
      </slot>

      <div v-if="slots.default" :class="resolvedClasses.body" data-slot="body">
        <slot />
      </div>

      <div v-if="slots.footer" :class="resolvedClasses.footer" data-slot="footer">
        <slot name="footer" />
      </div>
    </template>
  </component>
</template>

<script setup lang="ts">
import { computed, useSlots } from "vue"
import { scv } from "css-variants"
import { useUi, resolveClasses } from "../../utils"
import type { PostProps } from "../../types/components/post"
import postTheme from "../../themes/post.theme"

const post = scv(postTheme)

const props = withDefaults(defineProps<PostProps>(), {
  variant: "soft",
  orientation: "vertical"
})

const slots = useSlots()

const resolvedClasses = computed(() =>
  resolveClasses(
    post,
    { variant: props.variant, orientation: props.orientation },
    useUi("post", props.ui),
    props.class
  )
)

const Tag = props.to ? "a" : "div"
const formattedDate = computed(() =>
  props.date ? (props.date instanceof Date ? props.date.toLocaleDateString() : props.date) : null
)
</script>

<template>
  <component :is="Tag" :href="to" :class="resolvedClasses.root" data-slot="root">
    <slot name="image" :ui="resolvedClasses">
      <div v-if="image" :class="resolvedClasses.imageWrapper" data-slot="image-wrapper">
        <img
          :src="typeof image === 'string' ? image : image.src"
          :alt="title"
          :class="resolvedClasses.image"
          data-slot="image"
        />
      </div>
    </slot>

    <div :class="resolvedClasses.content" data-slot="content">
      <slot name="title" :ui="resolvedClasses">
        <h3 v-if="title" :class="resolvedClasses.title" data-slot="title">{{ title }}</h3>
      </slot>

      <slot name="description" :ui="resolvedClasses">
        <p v-if="description" :class="resolvedClasses.description" data-slot="description">
          {{ description }}
        </p>
      </slot>

      <slot name="date" :ui="resolvedClasses">
        <time v-if="formattedDate" :class="resolvedClasses.date" data-slot="date">{{
          formattedDate
        }}</time>
      </slot>

      <slot />
    </div>

    <div v-if="slots.footer" :class="resolvedClasses.footer" data-slot="footer">
      <slot name="footer" :ui="resolvedClasses" />
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed } from "vue"
import { scv } from "css-variants"
import { useUi, resolveClasses } from "../../utils"
import type { PostsProps } from "../../types/components/posts"
import postsTheme from "../../themes/posts.theme"

const posts = scv(postsTheme)

const props = defineProps<PostsProps>()

const resolvedClasses = computed(() =>
  resolveClasses(posts, {}, useUi("posts", props.ui), props.class)
)
</script>

<template>
  <div :class="resolvedClasses.root" data-slot="root">
    <slot />
  </div>
</template>

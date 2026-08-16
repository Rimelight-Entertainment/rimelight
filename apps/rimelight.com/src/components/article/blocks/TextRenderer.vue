<script setup lang="ts">
import {
  type RichTextContent,
  type InlineContent,
  type InlineText,
  type InlineLink,
  type InlineMention
} from "@/types/blocks"
import TextNode from "./nodes/TextNode.vue"
import LinkNode from "./nodes/LinkNode.vue"
import PageMention from "../PageMention.vue"
import { scv } from "css-variants"

/* region Props */
export interface TextRendererProps {
  content: RichTextContent
}

const { content } = defineProps<TextRendererProps>()
/* endregion */

/* region Styles */
const textRendererStyles = scv({
  slots: { root: "whitespace-pre-wrap break-words" }
})

const styles = textRendererStyles()
/* endregion */

/* region Logic */
type ComponentIs = string | object

const getTag = (item: InlineContent): ComponentIs => {
  switch (item.type) {
    case "text":
      return TextNode
    case "link":
      return LinkNode
    case "mention":
      return PageMention
    default:
      return TextNode
  }
}

const getProps = (item: InlineContent): Record<string, any> => {
  switch (item.type) {
    case "text": {
      const textProps = item.props as InlineText["props"]
      return { content: textProps.content }
    }
    case "link": {
      const linkProps = item.props as InlineLink["props"]
      return {
        href: linkProps.href,
        target: linkProps.target || undefined,
        content: linkProps.content
      }
    }
    case "mention": {
      const mentionProps = item.props as InlineMention["props"]
      return { pageId: mentionProps.pageId }
    }
    default:
      return {}
  }
}
/* endregion */

defineOptions({ name: "TextRenderer" })
</script>

<template>
  <div :class="styles.root">
    <template v-for="item in content" :key="item.id">
      <component :is="getTag(item)" v-bind="getProps(item)" />
    </template>
  </div>
</template>

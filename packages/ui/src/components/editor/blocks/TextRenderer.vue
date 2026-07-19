<script setup lang="ts">
import { useI18n } from "../utils/editorHelpers"
import { getLocalizedContent } from "../utils/page"
import TextNode from "./nodes/TextNode.vue"
import LinkNode from "./nodes/LinkNode.vue"
import PageMention from "../PageMention.vue"

export interface TextRendererProps {
  content: any
}

defineProps<TextRendererProps>()
const { locale } = useI18n()
defineOptions({ name: "TextRenderer" })
</script>

<template>
  <span v-if="Array.isArray(content)">
    <template v-for="(item, index) in content" :key="item.id || index">
      <TextNode v-if="item.type === 'text'" :node="item" />
      <LinkNode v-else-if="item.type === 'link'" :node="item" />
      <PageMention
        v-else-if="item.type === 'mention'"
        :page-id="item.props?.pageId || item.pageId"
      />
      <span v-else>{{ getLocalizedContent(item, locale) }}</span>
    </template>
  </span>
  <span v-else-if="typeof content === 'string'">{{ content }}</span>
  <span v-else-if="content">{{ getLocalizedContent(content, locale) }}</span>
</template>

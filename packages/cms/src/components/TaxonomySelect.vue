<script setup lang="ts">
import { onMounted, ref } from "vue"
import TreeSelect from "@/components/TreeSelect.vue"
import { flattenTree, type TreeItem } from "@/components/tree-utils"

interface Props {
  name: string
  value?: string
  taxonomySlug: string
}

const props = defineProps<Props>()

const items = ref<TreeItem[]>([])

onMounted(() => {
  fetch(
    `/api/cms/taxonomies?where=${encodeURIComponent(JSON.stringify({ slug: props.taxonomySlug }))}&status=any`
  )
    .then((res) => (res.ok ? res.json() : { docs: [] }))
    .then((result: unknown) => {
      const data = result as { docs?: any[] } | any[]
      const doc = Array.isArray(data) ? data[0] : (data.docs?.[0] ?? null)
      if (!doc?.terms) return
      const parsed =
        typeof doc.terms === "string" ? (JSON.parse(doc.terms) as unknown) : (doc.terms as unknown)
      if (Array.isArray(parsed)) {
        items.value = flattenTree(
          parsed as unknown as { id: string; name: string; slug: string; children?: any[] }[],
          (t) => t.slug,
          (t) => t.name
        )
      }
    })
    .catch(() => {})
})
</script>

<template>
  <TreeSelect
    :name="name"
    :value="value"
    :placeholder="`Search ${taxonomySlug}...`"
    search-placeholder="Search terms..."
    empty-message="No terms found."
    :items="items"
  />
</template>

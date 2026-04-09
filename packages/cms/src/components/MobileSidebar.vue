<script setup lang="ts">
import { ref } from "vue"
import { Menu } from "lucide-vue-next"
import { Button } from "@/components/ui/button.vue"
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet.vue"

const open = ref(false)
</script>

<template>
  <Button variant="ghost" size="icon-sm" @click="open = true">
    <Menu class="size-5" />
    <span class="sr-only">Open menu</span>
  </Button>

  <Sheet v-model:open="open">
    <SheetContent side="left" class="p-0 w-68" :show-close-button="false">
      <SheetTitle class="sr-only">Navigation</SheetTitle>
      <div class="flex flex-col h-full" @click="open = false">
        <slot />
      </div>
    </SheetContent>
  </Sheet>
</template>

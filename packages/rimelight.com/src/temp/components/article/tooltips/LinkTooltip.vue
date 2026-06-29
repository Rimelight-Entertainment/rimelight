<script setup lang="ts">
import { ref, onMounted } from 'vue';
import Label from '@/components/base/Label.vue';
import Button from '@/components/base/Button.vue';
import Input from '@/components/base/Input.vue';

interface LinkTooltipProps {
  editedUrl: string;
  editedText: string;
}

const props = defineProps<LinkTooltipProps>();

const emit = defineEmits<{
  'update:editedUrl': [url: string];
  'update:editedText': [text: string];
  'inputConfirm': [e: KeyboardEvent];
  'unlink': [];
  'cancel': [];
  'save': [];
}>();

const urlInputRef = ref<HTMLInputElement | null>(null);
const textInputRef = ref<HTMLInputElement | null>(null);

onMounted(() => {
  urlInputRef.value?.focus();
});

// Handlers for emitting events
const handleUrlChange = (event: Event) => {
  emit('update:editedUrl', (event.target as HTMLInputElement).value);
};

const handleTextChange = (event: Event) => {
  emit('update:editedText', (event.target as HTMLInputElement).value);
};

const handleInputConfirm = (event: KeyboardEvent) => {
  emit('inputConfirm', event);
};

const handleUnlink = () => {
  emit('unlink');
};

const handleCancel = () => {
  emit('cancel');
};

const handleSave = () => {
  emit('save');
};
</script>

<template>
  <div class="flex w-64 flex-col gap-md p-md">
    <div class="flex flex-col gap-sm">
      <Label
          html-for="url-input"
          text="URL"
          tooltip="The link's web address."
          :required="true"
      />
      <Input
          id="url-input"
          ref="urlInputRef"
          type="text"
          :value="props.editedUrl"
          @input="handleUrlChange"
          @keydown="handleInputConfirm"
          placeholder="https://"
      />
    </div>
    <div class="flex flex-col gap-sm">
      <Label
          html-for="text-input"
          text="Text"
          tooltip="The text that is displayed in place of the URL."
          :required="true"
      />
      <Input
          id="text-input"
          ref="textInputRef"
          type="text"
          :value="props.editedText"
          @input="handleTextChange"
          @keydown="handleInputConfirm"
          placeholder="Link Text"
      />
    </div>
    <div class="flex items-center justify-between">
      <Button @click="handleUnlink" variant="danger" size="xs" text="Unlink" />
      <div class="flex gap-sm">
        <Button
            @click="handleCancel"
            variant="danger"
            size="xs"
            text="Cancel"
        />
        <Button @click="handleSave" variant="primary" size="xs" text="Save" />
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
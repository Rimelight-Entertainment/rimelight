<script setup lang="ts">
import { z } from "astro/zod";
import { ref, reactive, computed } from "vue";
import { scv, cx } from "css-variants";
import RLVForm from "@rimelight/ui/components/vue/RLVForm.vue";
import RLVFormField from "@rimelight/ui/components/vue/RLVFormField.vue";
import RLVInput from "@rimelight/ui/components/vue/RLVInput.vue";
import RLVButton from "@rimelight/ui/components/vue/RLVButton.vue";
import { useRC, useToast } from "@/composables";

/* region Props */
export interface AddModalProps {
  rc?: {
    root?: string;
    form?: string;
    actions?: string;
  };
}

const { rc: rcProp } = defineProps<AddModalProps>();
const { rc } = useRC("AddModal", rcProp);
/* endregion */

/* region Emits */
export interface AddModalEmits {}
defineEmits<AddModalEmits>();
/* endregion */

/* region Slots */
export interface AddModalSlots {}
defineSlots<AddModalSlots>();
/* endregion */

/* region Styles */
const addModalStyles = scv({
  slots: ["root", "form", "actions"],
  base: {
    root: "",
    form: "space-y-4",
    actions: "flex justify-end gap-2 mt-6"
  }
});

const styles = computed(() => {
  const resolved = addModalStyles();
  const result: Record<string, string> = {};
  for (const [slot, value] of Object.entries(resolved)) {
    result[slot] = cx(value, (rc.value as Record<string, string>)[slot]);
  }
  return result;
});
/* endregion */

/* region State */
const open = ref(false);
const toast = useToast();

const schema = z.object({
  name: z.string().min(2, "Too short"),
  email: z.string().email("Invalid email")
});
type Schema = z.infer<typeof schema>;

const state = reactive<Partial<Schema>>({
  name: "",
  email: ""
});
/* endregion */

/* region Logic */
async function onSubmit(event: { data: Schema }) {
  toast.add({
    title: "Success",
    description: `New customer ${event.data.name} added`,
    color: "success"
  });
  open.value = false;
  state.name = "";
  state.email = "";
}
/* endregion */

defineOptions({ name: "AddModal" });
</script>

<template>
  <div :class="styles.root">
    <!-- Trigger Button -->
    <RLVButton
      label="New customer"
      icon="i-lucide-plus"
      color="primary"
      @click="open = true"
    />

    <!-- Teleported Modal -->
    <teleport to="body">
      <div
        v-if="open"
        class="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
      >
        <!-- Backdrop -->
        <div
          class="fixed inset-0 bg-neutral-900/60 backdrop-blur-sm transition-opacity duration-300"
          @click="open = false"
        />

        <!-- Card content -->
        <div
          class="bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-200 dark:border-neutral-800 shadow-2xl p-6 w-full max-w-md relative z-10 transition-transform duration-300"
        >
          <div class="flex justify-between items-start mb-4">
            <div>
              <h3 class="text-lg font-semibold text-neutral-900 dark:text-white">
                New customer
              </h3>
              <p class="text-xs text-neutral-500 mt-1">
                Add a new customer to the database
              </p>
            </div>
            <RLVButton
              color="neutral"
              variant="link"
              square
              icon="i-lucide-x"
              class="rounded-full"
              @click="open = false"
            />
          </div>

          <!-- RLVForm -->
          <RLVForm
            :schema="schema"
            :state="state"
            :class="styles.form"
            @submit="onSubmit"
          >
            <RLVFormField label="Name" name="name" required>
              <RLVInput
                v-model="state.name"
                placeholder="John Doe"
                class="w-full"
              />
            </RLVFormField>

            <RLVFormField label="Email" name="email" required>
              <RLVInput
                v-model="state.email"
                placeholder="john.doe@example.com"
                class="w-full"
              />
            </RLVFormField>

            <div :class="styles.actions">
              <RLVButton
                label="Cancel"
                color="neutral"
                variant="ghost"
                @click="open = false"
              />
              <RLVButton
                label="Create"
                color="primary"
                variant="solid"
                type="submit"
              />
            </div>
          </RLVForm>
        </div>
      </div>
    </teleport>
  </div>
</template>
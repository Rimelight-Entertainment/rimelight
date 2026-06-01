<script lang="ts" setup>
import { computed, ref, watch } from "vue";
import { useRC, useToast } from "~/composables";
import { useI18n } from "~/composables/app/useI18n";
import { scv, cx } from "css-variants";
import type { PageVersion } from "~/types/pages";
import RLVButton from "@rimelight/ui/components/vue/RLVButton.vue";

/* region Props */
export interface PageVersionSelectorProps {
  pageId: string;
  isAdmin?: boolean;
  rc?: {
    root?: string;
    button?: string;
    popover?: string;
    versionItem?: string;
  };
}

const { pageId, isAdmin = false, rc: rcProp } = defineProps<PageVersionSelectorProps>();

const { rc } = useRC("PageVersionSelector", rcProp);
/* endregion */

/* region Emits */
export interface PageVersionSelectorEmits {
  "version-selected": [version: PageVersion];
  "version-approved": [version: PageVersion];
  "version-rejected": [version: PageVersion];
  "version-reverted": [version: PageVersion];
}

const emit = defineEmits<PageVersionSelectorEmits>();
/* endregion */

/* region Styles */
const pageVersionSelectorStyles = scv({
  slots: {
    root: "relative inline-block text-left",
    buttonClass: "",
    popoverClass: "absolute right-0 mt-2 w-80 bg-popover text-popover-foreground border border-default rounded-xl shadow-lg z-50 overflow-hidden p-2 bg-white dark:bg-neutral-900",
    versionItemClass: "px-3 py-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer rounded transition-colors",
    popoverHeader: "px-3 py-2 border-b border-default mb-1",
    popoverTitle: "text-sm font-semibold",
    popoverSubtitle: "text-xs text-dimmed mt-1",
    versionsList: "max-h-96 overflow-y-auto flex flex-col gap-1",
    liveVersionItem: "flex items-center justify-between",
    liveBadgeWrapper: "flex items-center gap-2",
    liveVersionTitle: "text-sm font-medium",
    liveVersionSubtitle: "text-xs text-dimmed mt-1",
    loadingWrapper: "px-3 py-4 text-center text-xs text-dimmed",
    emptyWrapper: "px-3 py-4 text-center text-sm text-dimmed",
    versionEntries: "divide-y divide-default flex flex-col gap-1",
    versionEntryWrapper: "flex items-start justify-between gap-2",
    versionEntryContent: "flex-1 min-w-0",
    versionEntryHeader: "flex items-center gap-2 mb-1",
    versionEntryTime: "text-xs text-dimmed",
    versionEntryTitle: "text-xs text-default truncate font-medium",
    versionEntryApproval: "text-xs text-dimmed mt-1",
    versionEntryActions: "shrink-0 flex items-center gap-1",
    pendingFooter: "px-3 py-2 border-t border-default mt-2",
    pendingText: "text-xs text-dimmed",
  },
});

const styles = computed(() => {
  const resolved = pageVersionSelectorStyles();
  const result: Record<string, string> = {};
  for (const [slot, value] of Object.entries(resolved)) {
    result[slot] = cx(value, (rc.value as Record<string, string>)[slot]);
  }
  return result as Record<string, string>;
});
/* endregion */

/* region State */
const selectedVersionId = defineModel<string | null>("currentVersionId", {
  default: null,
});

const versions = ref<PageVersion[]>([]);
const isLoading = ref(false);
const isApproving = ref<string | null>(null);
const isRejecting = ref<string | null>(null);
const isReverting = ref<string | null>(null);
const isOpen = ref(false);

const toast = useToast();
const { t } = useI18n();

const pendingVersions = computed(() => {
  return versions.value.filter((v) => v.status === "pending");
});

const currentVersionStatus = computed(() => {
  if (!selectedVersionId.value) return "approved";
  const v = versions.value.find((v) => v.id === selectedVersionId.value);
  return v?.status || "pending";
});

const currentVersion = computed(() => versions.value.find((v) => v.id === selectedVersionId.value));
/* endregion */

/* region Lifecycle */
watch(
  () => pageId,
  () => {
    if (pageId) fetchVersions();
  },
  { immediate: true },
);
/* endregion */

/* region Logic */
async function fetchVersions() {
  if (!pageId) return;

  isLoading.value = true;
  try {
    const res = await fetch(`/api/pages/id/${pageId}/versions`);
    if (!res.ok) throw new Error("Failed to load versions");
    versions.value = await res.json();
  } catch (error) {
    console.error("Failed to fetch versions:", error);
    try {
      toast.add({ color: "error", title: t("page_version.failed_to_load", "Failed to load versions") });
    } catch (e) {}
  } finally {
    isLoading.value = false;
  }
}

function selectVersion(version: PageVersion) {
  selectedVersionId.value = version.id;
  emit("version-selected", version);
  isOpen.value = false;
}

async function approveVersion(version: PageVersion) {
  if (!isAdmin) return;

  isApproving.value = version.id;
  try {
    const res = await fetch(`/api/pages/versions/${version.id}/approve`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to approve");
    const result = await res.json();

    try {
      toast.add({
        color: "success",
        title: t("page_version.approved_successfully", "Approved successfully"),
        description: result?.message || "The page has been updated with the approved version",
      });
    } catch (e) {}

    emit("version-approved", version);
    await fetchVersions();

    if (selectedVersionId.value === version.id) {
      selectedVersionId.value = null;
    }
  } catch (error: any) {
    console.error("Failed to approve version:", error);
    try {
      toast.add({
        color: "error",
        title: t("page_version.failed_to_approve", "Failed to approve version"),
        description: error.message || "An error occurred",
      });
    } catch (e) {}
  } finally {
    isApproving.value = null;
  }
}

async function rejectVersion(version: PageVersion) {
  if (!isAdmin) return;

  isRejecting.value = version.id;
  try {
    const res = await fetch(`/api/pages/versions/${version.id}/reject`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to reject");
    const result = await res.json();

    try {
      toast.add({
        color: "success",
        title: t("page_version.rejected_successfully", "Version rejected"),
        description: result?.message || "The version has been rejected",
      });
    } catch (e) {}

    emit("version-rejected", version);
    await fetchVersions();
  } catch (error: any) {
    console.error("Failed to reject version:", error);
    try {
      toast.add({
        color: "error",
        title: t("page_version.failed_to_reject", "Failed to reject version"),
        description: error.message || "An error occurred",
      });
    } catch (e) {}
  } finally {
    isRejecting.value = null;
  }
}

async function revertVersion(version: PageVersion) {
  if (!isAdmin) return;

  isReverting.value = version.id;
  try {
    const res = await fetch(`/api/pages/versions/${version.id}/revert`, {
      method: "POST",
    });
    if (!res.ok) throw new Error("Failed to revert");
    const result = await res.json();

    try {
      toast.add({
        color: "success",
        title: t("page_version.reverted_successfully", "Reverted successfully"),
        description: result?.message || "The page has been reverted to this version.",
      });
    } catch (e) {}

    emit("version-reverted", version);
    await fetchVersions();
    selectedVersionId.value = null;
  } catch (error: any) {
    console.error("Failed to revert version:", error);
    try {
      toast.add({
        color: "error",
        title: t("page_version.failed_to_revert", "Failed to revert version"),
        description: error.message || "An error occurred",
      });
    } catch (e) {}
  } finally {
    isReverting.value = null;
  }
}

function selectLiveVersion() {
  selectedVersionId.value = null;
  isOpen.value = false;
}

function formatDate(date: Date | string | null | undefined) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  return `${diffDay}d ago`;
}

function getStatusColor(status: string) {
  switch (status) {
    case "approved":
      return "text-green-600 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800";
    case "pending":
      return "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30 border border-yellow-200 dark:border-yellow-800";
    case "rejected":
      return "text-red-600 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800";
    default:
      return "text-neutral-600 bg-neutral-50 dark:bg-neutral-950/30 border border-neutral-200 dark:border-neutral-800";
  }
}

defineExpose({
  approveVersion,
  rejectVersion,
  revertVersion,
  fetchVersions,
  currentVersionStatus,
  currentVersion,
});
/* endregion */

/* region Meta */
defineOptions({
  name: "PageVersionSelector",
});
/* endregion */
</script>

<template>
  <div :class="styles.root">
    <RLVButton
      :loading="isLoading"
      color="neutral"
      leading-icon="i-lucide-git-branch"
      :label="t('common.versions', 'Versions')"
      size="xs"
      variant="ghost"
      :class="styles.buttonClass"
      @click="isOpen = !isOpen"
    />

    <div v-if="isOpen" :class="styles.popoverClass">
      <div :class="styles.popoverHeader">
        <h3 :class="styles.popoverTitle">Page Versions</h3>
        <p :class="styles.popoverSubtitle">View and manage page versions</p>
      </div>

      <div :class="styles.versionsList">
        <div
          :class="[
            styles.versionItemClass,
            { 'bg-primary-50 dark:bg-primary-900/20 border-l-2 border-primary-500': !selectedVersionId },
          ]"
          @click="selectLiveVersion"
        >
          <div :class="styles.liveVersionItem">
            <div class="flex-1">
              <div :class="styles.liveBadgeWrapper">
                <span class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider text-green-600 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800">
                  Live
                </span>
                <span :class="styles.liveVersionTitle">Current Version</span>
              </div>
              <p :class="styles.liveVersionSubtitle">The published version of this page</p>
            </div>
          </div>
        </div>

        <div v-if="isLoading" :class="styles.loadingWrapper">
          <div class="animate-pulse flex flex-col gap-2">
            <div class="h-4 w-full rounded bg-neutral-200 dark:bg-neutral-800"></div>
            <div class="h-3 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800"></div>
          </div>
        </div>

        <div v-else-if="versions.length === 0" :class="styles.emptyWrapper">
          No versions yet
        </div>

        <div v-else :class="styles.versionEntries">
          <div
            v-for="version in versions"
            :key="version.id"
            :class="[
              styles.versionItemClass,
              { 'bg-primary-50 dark:bg-primary-900/20 border-l-2 border-primary-500': selectedVersionId === version.id },
            ]"
            @click="selectVersion(version)"
          >
            <div :class="styles.versionEntryWrapper">
              <div :class="styles.versionEntryContent()">
                <div :class="styles.versionEntryHeader">
                  <span class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider" :class="getStatusColor(version.status)">
                    {{ version.status }}
                  </span>
                  <span :class="styles.versionEntryTime">
                    {{ formatDate(version.createdAt) }}
                  </span>
                </div>
                <p :class="styles.versionEntryTitle">
                  {{ version.title?.en || version.title || "Untitled" }}
                </p>
                <p
                  v-if="version.approvedBy && version.approvedAt"
                  :class="styles.versionEntryApproval"
                >
                  Approved {{ formatDate(version.approvedAt) }}
                </p>
              </div>

              <div
                v-if="selectedVersionId === version.id && isAdmin"
                :class="styles.versionEntryActions"
              >
                <RLVButton
                  :loading="isReverting === version.id"
                  color="warning"
                  leading-icon="i-lucide-rotate-ccw"
                  size="xs"
                  title="Revert to this version"
                  variant="ghost"
                  @click.stop="revertVersion(version)"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="pendingVersions.length > 0 && isAdmin" :class="styles.pendingFooter">
        <p :class="styles.pendingText">
          {{ pendingVersions.length }} pending version{{
            pendingVersions.length !== 1 ? "s" : ""
          }}
          awaiting approval
        </p>
      </div>
    </div>
  </div>
</template>

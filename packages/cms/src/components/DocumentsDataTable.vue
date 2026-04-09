<script setup lang="ts">
import { ref, computed, watch } from "vue"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Loader2,
  MoreHorizontal,
  Search
} from "lucide-vue-next"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle
} from "@/components/ui/alert-dialog.vue"
import { Badge, StatusBadge } from "@/components/ui/badge.vue"
import { Button } from "@/components/ui/button.vue"
import { Checkbox } from "@/components/ui/checkbox.vue"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu.vue"
import { Input } from "@/components/ui/input.vue"
import { cn } from "@/lib/utils"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table.vue"

type DataTableColumn = {
  key: string
  label: string
}

type DataTableRow = {
  id: string
  editHref: string
  status?: string
  locales: string[]
  searchText: string
  values: Record<string, string>
}

type ServerPaginationConfig = {
  totalDocs: number
  totalPages: number
  currentPage: number
  pageSize: number
  currentSort: { field: string; direction: "asc" | "desc" }
  currentSearch: string
}

interface Props {
  collectionSlug: string
  draftsEnabled?: boolean
  defaultLocale?: string | undefined
  labelField?: string
  newHref?: string
  title: string
  searchPlaceholder?: string
  columns: DataTableColumn[]
  data: DataTableRow[]
  serverPagination?: ServerPaginationConfig
}

const props = withDefaults(defineProps<Props>(), {
  draftsEnabled: false,
  searchPlaceholder: "Filter documents..."
})

const isServerMode = !!props.serverPagination

const actionError = ref<string | null>(null)
const sorting = ref<Array<{ id: string; desc: boolean }>>([])
const rowSelection = ref<Record<string, boolean>>({})
const deleteConfirm = ref<DataTableRow[] | null>(null)
const deleteRefWarning = ref<string | null>(null)

// Server-side pagination state
const serverData = ref<DataTableRow[]>(props.data)
const serverTotalDocs = ref(props.serverPagination?.totalDocs ?? 0)
const serverTotalPages = ref(props.serverPagination?.totalPages ?? 1)
const serverPage = ref(props.serverPagination?.currentPage ?? 1)
const serverSort = ref<{ field: string; direction: "asc" | "desc" } | null>(
  props.serverPagination?.currentSort ?? null
)
const serverSearch = ref(props.serverPagination?.currentSearch ?? "")
const searchInput = ref(props.serverPagination?.currentSearch ?? "")
const isLoading = ref(false)
const pageSize = props.serverPagination?.pageSize ?? 20

const primaryColumnKey =
  props.columns.find((column) => !column.key.startsWith("_"))?.key ?? props.columns[0]?.key

const displayedTotal = isServerMode ? serverTotalDocs.value : props.data.length

async function fetchPage(
  page: number,
  sort: { field: string; direction: "asc" | "desc" } | null,
  search: string
) {
  if (!isServerMode) return
  isLoading.value = true
  rowSelection.value = {}
  try {
    const params = new URLSearchParams()
    params.set("status", "any")
    params.set("limit", String(pageSize))
    params.set("offset", String((page - 1) * pageSize))
    if (sort) {
      params.set("sort", JSON.stringify(sort))
    }
    if (search) {
      params.set("search", search)
    }

    const response = await fetch(`/api/cms/${props.collectionSlug}?${params}`)
    if (!response.ok) throw new Error("Failed to fetch")
    const result = await response.json()

    serverData.value = result.docs.map((entry: Record<string, unknown>) => ({
      id: String(entry._id ?? ""),
      editHref: `/${props.defaultLocale || "en"}/admin/${props.collectionSlug}/${String(entry._id ?? "")}`,
      status: getVisualStatus(entry),
      locales: [
        ...(props.defaultLocale ? [props.defaultLocale] : []),
        ...(Array.isArray(entry._availableLocales)
          ? (entry._availableLocales as string[]).filter((l) => l !== props.defaultLocale)
          : [])
      ],
      searchText: String(entry[props.labelField] ?? entry.slug ?? entry._id ?? ""),
      values: Object.fromEntries(
        props.columns.map((column) => [
          column.key,
          column.key === "_status"
            ? getVisualStatus(entry)
            : column.key === "_updatedAt" || column.key === "_createdAt"
              ? formatDateClient(entry[column.key])
              : typeof entry[column.key] === "string"
                ? (entry[column.key] as string)
                : String((entry[column.key] as string | number | boolean) ?? "\u2014")
        ])
      )
    }))
    serverTotalDocs.value = result.totalDocs
    serverTotalPages.value = result.totalPages
    serverPage.value = page
  } catch (error) {
    console.error("Failed to fetch page:", error)
  } finally {
    isLoading.value = false
  }
}

function getVisualStatus(d: Record<string, unknown>): string {
  const status = typeof d._status === "string" ? d._status : "draft"
  if (status === "scheduled") return "scheduled"
  if (status === "published" && d._published) return "changed"
  return status
}

function formatDateClient(value: unknown): string {
  if (!value) return "\u2014"
  const str = typeof value === "string" ? value : String(value)
  const date = new Date(str)
  if (isNaN(date.getTime())) return str
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
}

function handleSearchChange(value: string) {
  searchInput.value = value
  if (!isServerMode) return
  serverSearch.value = value
  void fetchPage(1, serverSort.value, value)
}

function handleSort(column: DataTableColumn) {
  if (!isServerMode) return
  const currentSort = sorting.value.find((s) => s.id === column.key)
  const direction = currentSort?.desc
    ? ("asc" as const)
    : currentSort
      ? ("desc" as const)
      : ("asc" as const)

  sorting.value = [{ id: column.key, desc: direction === "desc" }]
  serverSort.value = { field: column.key, direction }
  void fetchPage(1, serverSort.value, serverSearch.value)
}

const selectedRows = computed(() => {
  return props.data.filter((row, index) => rowSelection.value[row.id])
})

async function runAction(action: "publish" | "unpublish" | "delete", rows: DataTableRow[]) {
  if (!rows.length) return

  actionError.value = null

  try {
    await Promise.all(
      rows.map(async (row) => {
        const rowCollection = row.editHref.split("/")[2] ?? props.collectionSlug
        const endpoint =
          action === "delete"
            ? `/api/cms/${rowCollection}/${row.id}`
            : `/api/cms/${rowCollection}/${row.id}/${action}`

        const response = await fetch(endpoint, {
          method: action === "delete" ? "DELETE" : "POST",
          headers: {
            Accept: "application/json"
          }
        })

        if (!response.ok) {
          throw new Error(`Failed to ${action} document.`)
        }
      })
    )

    if (isServerMode) {
      await fetchPage(serverPage.value, serverSort.value, serverSearch.value)
      return
    }

    const count = rows.length
    const label = count === 1 ? "document" : "documents"
    const pastTense =
      action === "publish" ? "published" : action === "unpublish" ? "unpublished" : "deleted"
    const msg = `${count} ${label} ${pastTense}`
    const url = new URL(window.location.href)
    url.searchParams.set("_toast", "success")
    url.searchParams.set("_msg", msg)
    window.location.assign(url.pathname + url.search)
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Action failed"
    if (isServerMode) {
      actionError.value = msg
      return
    }
    const url = new URL(window.location.href)
    url.searchParams.set("_toast", "error")
    url.searchParams.set("_msg", msg)
    window.location.assign(url.pathname + url.search)
  }
}
</script>

<template>
  <div class="space-y-4">
    <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div class="flex gap-4 items-center">
        <div class="w-full relative sm:w-80">
          <Search
            class="text-muted-foreground size-4 pointer-events-none left-3 top-1/2 absolute -translate-y-1/2"
          />
          <Input
            :placeholder="searchPlaceholder"
            :value="isServerMode ? searchInput : ''"
            @input="(e: any) => handleSearchChange(e.target.value)"
            class="text-sm pl-9"
          />
        </div>
        <div class="text-sm text-muted-foreground hidden md:block">
          <Loader2 v-if="isLoading" class="size-4 animate-spin" />
          <span v-else>{{ displayedTotal }} {{ title.toLowerCase() }}</span>
        </div>
      </div>

      <div class="flex flex-wrap gap-2 items-center">
        <DropdownMenu v-if="selectedRows.length > 0">
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              {{ selectedRows.length }} selected
              <ChevronDown class="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" class="w-52">
            <DropdownMenuLabel>Selected actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              v-if="selectedRows.length === 1"
              @click="window.location.assign(selectedRows[0].editHref)"
            >
              Edit document
            </DropdownMenuItem>
            <DropdownMenuItem v-if="draftsEnabled" @click="runAction('publish', selectedRows)">
              Publish selected
            </DropdownMenuItem>
            <DropdownMenuItem v-if="draftsEnabled" @click="runAction('unpublish', selectedRows)">
              Unpublish selected
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem variant="destructive" @click="deleteConfirm = selectedRows">
              Delete selected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>

    <div
      v-if="actionError"
      class="text-sm text-destructive px-4 py-3 border border-destructive/30 rounded-md bg-destructive/5"
    >
      {{ actionError }}
    </div>

    <div :class="cn('rounded-lg border', isLoading && 'opacity-60')">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead class="w-10">
              <Checkbox />
            </TableHead>
            <TableHead
              v-for="column in columns"
              :key="column.key"
              @click="handleSort(column)"
              class="cursor-pointer"
            >
              <div class="flex items-center gap-1">
                <span>{{ column.label }}</span>
                <ArrowUpDown class="text-muted-foreground size-4" />
              </div>
            </TableHead>
            <TableHead>Locales</TableHead>
            <TableHead class="w-10" />
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="row in isServerMode ? serverData : data" :key="row.id">
            <TableCell>
              <Checkbox v-model="rowSelection[row.id]" />
            </TableCell>
            <TableCell v-for="column in columns" :key="column.key">
              <template v-if="column.key === '_status'">
                <StatusBadge
                  :status="row.status ?? row.values[column.key]"
                  class="text-sm text-muted-foreground font-normal"
                />
              </template>
              <template v-else-if="column.key === primaryColumnKey">
                <a
                  :href="row.editHref"
                  class="text-foreground font-medium underline-offset-2 hover:underline"
                >
                  {{ row.values[column.key] }}
                </a>
              </template>
              <template v-else>
                <div class="text-muted-foreground">{{ row.values[column.key] ?? "—" }}</div>
              </template>
            </TableCell>
            <TableCell>
              <div class="flex flex-wrap gap-1.5">
                <a
                  v-for="locale in row.locales"
                  :key="locale"
                  :href="`${row.editHref}?locale=${locale}`"
                >
                  <Badge
                    variant="outline"
                    class="text-muted-foreground uppercase transition-colors hover:text-foreground hover:border-foreground/50"
                  >
                    {{ locale }}
                  </Badge>
                </a>
              </div>
            </TableCell>
            <TableCell>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon-sm" class="rounded-md">
                    <MoreHorizontal />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" class="w-44">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem @click="window.location.assign(row.editHref)">
                    Edit document
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem variant="destructive" @click="deleteConfirm = [row]">
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination -->
    <div v-if="isServerMode && serverTotalPages > 1" class="flex items-center justify-between">
      <div class="text-sm text-muted-foreground">
        Page {{ serverPage }} of {{ serverTotalPages }}
      </div>
      <div class="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="serverPage <= 1"
          @click="fetchPage(serverPage - 1, serverSort, serverSearch)"
        >
          <ChevronLeft class="size-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="serverPage >= serverTotalPages"
          @click="fetchPage(serverPage + 1, serverSort, serverSearch)"
        >
          Next
          <ChevronRight class="size-4" />
        </Button>
      </div>
    </div>

    <!-- Delete confirmation dialog -->
    <AlertDialog v-model:open="deleteConfirm">
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete documents</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete {{ deleteConfirm?.length }} document{{
              deleteConfirm && deleteConfirm.length > 1 ? "s" : ""
            }}? This action cannot be undone.
            <span v-if="deleteRefWarning" class="block mt-2 text-destructive">{{
              deleteRefWarning
            }}</span>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <Button variant="outline" @click="deleteConfirm = null"> Cancel </Button>
          <Button variant="destructive" @click="runAction('delete', deleteConfirm || [])">
            Delete
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  </div>
</template>

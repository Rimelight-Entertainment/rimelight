import {
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
  onSettled,
  type Component,
} from "solid-js";
import { useDashboard } from "../context";
import { resolveLabel } from "../../core/collections/define";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { RLInput } from "@rimelight/ui/components/input/RLInput.tsx";
import { RLSelect } from "@rimelight/ui/components/select/RLSelect.tsx";
import { RLImage } from "@rimelight/ui/components/image/RLImage.tsx";
import { RLFileUpload } from "@rimelight/ui/components/file-upload/RLFileUpload.tsx";
import { RLTabs } from "@rimelight/ui/components/tabs/RLTabs.tsx";
import { RLTable } from "@rimelight/ui/components/table/RLTable.tsx";
import type { TableColumn, TableRow } from "@rimelight/ui/components/table/table.types.ts";
import { RLCheckbox } from "@rimelight/ui/components/checkbox/RLCheckbox.tsx";
import { RLBreadcrumb } from "@rimelight/ui/components/breadcrumb/RLBreadcrumb.tsx";
import { RLTree } from "@rimelight/ui/components/tree/RLTree.tsx";
import type { TreeItem } from "@rimelight/ui/components/tree/tree.types.ts";
import { Empty, Loading, Modal, PageHeader } from "../ui";
import { cmsT } from "../../locale";
import type { MediaAssetRecord, MediaFolderRecord, MediaUsageRecord } from "../api";

type View = "grid" | "table";
type Selection = { kind: "file"; id: string } | { kind: "folder"; id: string };
type Dialog =
  | { kind: "newFolder" }
  | { kind: "upload" }
  | { kind: "move"; items: Selection[] }
  | { kind: "delete"; items: Selection[] }
  | { kind: "detail"; asset: MediaAssetRecord }
  | { kind: "crop"; asset: MediaAssetRecord };

/** A table row: a folder or a file, keyed the same way as a selection. */
interface MediaRow {
  kind: "file" | "folder";
  id: string;
  folder?: MediaFolderRecord;
  asset?: MediaAssetRecord;
}

const DRAG_TYPE = "application/x-rimelight-media";
const ROOT_ID = "root";
const kb = (n: number) =>
  n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.ceil(n / 1e3))} KB`;
const sel = (s: Selection) => `${s.kind}:${s.id}`;
const parseSel = (key: string): Selection => {
  const [kind, ...rest] = key.split(":");
  return { kind: kind === "folder" ? "folder" : "file", id: rest.join(":") };
};

/** Immediate children of a folder (null = top level), sorted by name. */
const childrenOf = (folders: MediaFolderRecord[], parentId: string | null) =>
  folders
    .filter((f) => (f.parentId ?? null) === parentId)
    .sort((a, b) => a.name.localeCompare(b.name));

/** Ancestors from the top level down to `folderId`. */
const pathTo = (folders: MediaFolderRecord[], folderId: string | null): MediaFolderRecord[] => {
  const out: MediaFolderRecord[] = [];
  let cur = folderId ? folders.find((f) => f.id === folderId) : undefined;
  while (cur) {
    out.unshift(cur);
    const parentId: string | null = cur.parentId;
    cur = parentId ? folders.find((f) => f.id === parentId) : undefined;
  }
  return out;
};

/** Folder ids that `folderId` contains (itself included). Used to block dropping a folder into itself. */
const subtreeOf = (folders: MediaFolderRecord[], folderId: string): Set<string> => {
  const out = new Set<string>([folderId]);
  let grew = true;
  while (grew) {
    grew = false;
    for (const f of folders) {
      if (f.parentId && out.has(f.parentId) && !out.has(f.id)) {
        out.add(f.id);
        grew = true;
      }
    }
  }
  return out;
};

/** The folder list as a tree, for RLTree. */
const toTreeItems = (folders: MediaFolderRecord[], parentId: string | null): TreeItem[] =>
  childrenOf(folders, parentId).map((f) => ({
    id: f.id,
    label: f.name,
    icon: "folder",
    children: toTreeItems(folders, f.id),
  }));

const readImageSize = async (file: File): Promise<{ width: number; height: number } | null> => {
  if (!file.type.startsWith("image/") || typeof createImageBitmap !== "function") return null;
  try {
    const bitmap = await createImageBitmap(file);
    const size = { width: bitmap.width, height: bitmap.height };
    bitmap.close();
    return size;
  } catch {
    return null;
  }
};

/**
 * Folder tree: RLTree with the folders as items. The root item is the library itself. Folders
 * accept drops of files and folders (to move them in) when `dropTarget` is given.
 */
type CropRect = { x: number; y: number; w: number; h: number };
type CropDrag =
  | { mode: "move"; startX: number; startY: number; start: CropRect }
  | {
      mode: "resize";
      edges: { l: boolean; r: boolean; t: boolean; b: boolean };
      startX: number;
      startY: number;
      start: CropRect;
    };
const MIN_CROP = 0.05;
const clamp = (v: number, lo: number, hi: number) => Math.min(Math.max(v, lo), hi);

const FolderTree: Component<{
  folders: MediaFolderRecord[];
  selected: string | null;
  hover?: string | null;
  onSelect: (id: string | null) => void;
  dropTarget?: {
    over: (e: DragEvent, id: string | null) => void;
    drop: (e: DragEvent, id: string | null) => void;
    leave: () => void;
  };
}> = (props) => {
  const items = createMemo<TreeItem[]>(() => [
    {
      id: ROOT_ID,
      label: cmsT("text.media") || "Media",
      icon: "image",
      children: toTreeItems(props.folders, null),
    },
  ]);
  const idOf = (id: string) => (id === ROOT_ID ? null : id);
  return (
    <RLTree
      items={items()}
      selected={props.selected ?? ROOT_ID}
      defaultExpanded={[ROOT_ID]}
      onSelect={(item: TreeItem) => props.onSelect(idOf(item.id))}
      itemClass={(item: TreeItem) =>
        props.dropTarget && props.hover === item.id ? "ring-2 ring-primary" : undefined
      }
      itemAttrs={(item: TreeItem) =>
        props.dropTarget
          ? {
              onDragOver: (e: DragEvent) => props.dropTarget!.over(e, idOf(item.id)),
              onDragLeave: () => props.dropTarget!.leave(),
              onDrop: (e: DragEvent) => props.dropTarget!.drop(e, idOf(item.id)),
            }
          : {}
      }
    />
  );
};

/**
 * Media library: folder tree, grid or table, search and type filters, drag and drop moves,
 * multi-select batch actions, upload, and a detail dialog with per-locale alt text and captions,
 * focal point, replace, and crop (saved as a copy). Used as the page and inside the picker.
 */
const MediaManager: Component<{ onPick?: (asset: MediaAssetRecord) => void }> = (props) => {
  const { api, toast, locales } = useDashboard();
  const [view, setView] = createSignal<View>("grid");
  const [folders, setFolders] = createSignal<MediaFolderRecord[]>([]);
  const [folderId, setFolderId] = createSignal<string | null>(null);
  const [search, setSearch] = createSignal("");
  const [type, setType] = createSignal("all");
  const [query, setQuery] = createSignal("");
  const [selected, setSelected] = createSignal<Selection[]>([]);
  const [dialog, setDialog] = createSignal<Dialog | null>(null);
  const [hover, setHover] = createSignal<string | null>(null);
  const [newName, setNewName] = createSignal("");
  const [moveTarget, setMoveTarget] = createSignal<string | null>(null);
  const [uploadFiles, setUploadFiles] = createSignal<File[]>([]);
  const [uploadProgress, setUploadProgress] = createSignal<string | null>(null);

  const searching = () => search().trim() !== "" || type() !== "all";
  const crumbs = createMemo(() => pathTo(folders(), folderId()));
  const subfolders = createMemo(() => (searching() ? [] : childrenOf(folders(), folderId())));
  const isSelected = (s: Selection) => selected().some((x) => sel(x) === sel(s));
  const toggle = (s: Selection) =>
    setSelected((prev) =>
      prev.some((x) => sel(x) === sel(s)) ? prev.filter((x) => sel(x) !== sel(s)) : [...prev, s],
    );
  const folderName = (id: string | null) =>
    id === null ? cmsT("text.media") || "Media" : (folders().find((f) => f.id === id)?.name ?? "");

  /**
   * The file list currently on screen, tagged with the request it answers. Loads are explicit: the
   * caller passes the folder, search and type, so nothing depends on when a memo happens to run.
   * Only the newest load may write, so an older response can never replace the current list.
   */
  const [listing, setListing] = createSignal<{
    folder: string | null;
    assets: MediaAssetRecord[];
    error: string | null;
  } | null>(null);
  let loadSeq = 0;
  const loadAssets = async (
    folder: string | null = folderId(),
    q: string = query(),
    t: string = type(),
  ) => {
    const id = ++loadSeq;
    try {
      const res = await api.media.list({ folderId: folder, search: q, type: t });
      if (id === loadSeq) setListing({ folder, assets: res.data.assets, error: null });
    } catch (err) {
      if (id === loadSeq) setListing({ folder, assets: [], error: (err as Error).message });
    }
  };
  const assets = () => listing()?.assets ?? [];
  const loadError = () => listing()?.error ?? null;

  /** Rows for the table: folders first, then files. */
  const rows = createMemo<MediaRow[]>(() => [
    ...subfolders().map((f) => ({ kind: "folder" as const, id: f.id, folder: f })),
    ...assets().map((a) => ({ kind: "file" as const, id: a.id, asset: a })),
  ]);

  const loadFolders = async () => {
    try {
      const res = await api.media.folders();
      setFolders(res.data.folders);
    } catch (err) {
      toast((err as Error).message, "error");
    }
  };

  const refresh = async () => {
    await loadFolders();
    await loadAssets();
  };

  const navigate = (id: string | null) => {
    setFolderId(id);
    setSelected([]);
    void loadAssets(id);
  };

  onSettled(() => void refresh());

  /** Moves files and folders into `target` (null = top level). Skips no-ops and cycles. */
  const moveItems = async (items: Selection[], target: string | null) => {
    const tree = folders();
    const work = items.filter((s) => {
      // Files are always sent: the server knows their real folder, the list on screen may not.
      if (s.kind === "file") return true;
      if (s.id === target) return false;
      return !(target && subtreeOf(tree, s.id).has(target));
    });
    if (work.length === 0) {
      toast("Nothing to move", "error");
      return;
    }
    const results = await Promise.allSettled(
      work.map((s) =>
        s.kind === "file"
          ? api.media.update(s.id, { folderId: target })
          : api.media.updateFolder(s.id, { parentId: target }),
      ),
    );
    const failed = results.filter((r) => r.status === "rejected").length;
    toast(
      failed ? `${failed} of ${work.length} could not be moved` : `Moved ${work.length} item(s)`,
      failed ? "error" : "success",
    );
    setSelected([]);
    await refresh();
  };

  const dragStart = (e: DragEvent, s: Selection) => {
    const items = isSelected(s) ? selected() : [s];
    e.dataTransfer?.setData(DRAG_TYPE, JSON.stringify(items));
    if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
  };
  const isInternal = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes(DRAG_TYPE);
  const dragOver = (e: DragEvent, id: string | null) => {
    if (!isInternal(e)) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    setHover(id ?? ROOT_ID);
  };
  const dragLeave = () => setHover(null);
  const drop = (e: DragEvent, id: string | null) => {
    if (!isInternal(e)) return;
    e.preventDefault();
    e.stopPropagation();
    setHover(null);
    const items = JSON.parse(e.dataTransfer?.getData(DRAG_TYPE) || "[]") as Selection[];
    void moveItems(items, id);
  };
  const dropTarget = { over: dragOver, drop, leave: dragLeave };

  const createFolder = async () => {
    const name = newName().trim();
    if (!name) return;
    try {
      await api.media.createFolder(name, folderId());
      toast("Folder created", "success");
      setNewName("");
      setDialog(null);
      await refresh();
    } catch (err) {
      toast((err as Error).message, "error");
    }
  };

  const deleteSelection = async (items: Selection[]) => {
    const results = await Promise.allSettled(
      items.map((s) => (s.kind === "file" ? api.media.remove(s.id) : api.media.removeFolder(s.id))),
    );
    const failed = results.filter((r) => r.status === "rejected").length;
    toast(
      failed
        ? `${failed} of ${items.length} could not be deleted`
        : `Deleted ${items.length} item(s)`,
      failed ? "error" : "success",
    );
    setSelected([]);
    await refresh();
  };

  const runUpload = async () => {
    const files = uploadFiles();
    if (!files.length) return;
    let done = 0;
    let failed = 0;
    for (const file of files) {
      setUploadProgress(`${done + failed + 1} / ${files.length}`);
      try {
        const size = await readImageSize(file);
        await api.media.upload(file, { folderId: folderId(), ...size }, (fraction) =>
          setUploadProgress(
            `${done + failed + 1} / ${files.length} (${Math.floor(fraction * 100)}%)`,
          ),
        );
        done += 1;
      } catch (err) {
        failed += 1;
        toast(`${file.name}: ${(err as Error).message}`, "error");
      }
    }
    setUploadProgress(null);
    setUploadFiles([]);
    setDialog(null);
    toast(
      `Uploaded ${done} file(s)${failed ? `, ${failed} failed` : ""}`,
      failed ? "error" : "success",
    );
    await refresh();
  };

  const openDetail = (asset: MediaAssetRecord) => setDialog({ kind: "detail", asset });
  const thumb = (asset: MediaAssetRecord) => asset.previewUrl ?? asset.url;
  const closeDialog = () => setDialog(null);
  const altOf = (asset: MediaAssetRecord) =>
    resolveLabel(asset.alt as any, locales[0] ?? "en") || asset.filename;
  const selectionOf = (row: MediaRow): Selection => ({ kind: row.kind, id: row.id });

  /** Row selection for RLTable, keyed by the same ids as selections. */
  const rowSelection = createMemo(() => Object.fromEntries(selected().map((s) => [sel(s), true])));

  const columns: TableColumn<MediaRow>[] = [
    {
      id: "select",
      header: () => (
        <RLCheckbox
          aria-label="Select all"
          checked={rows().length > 0 && selected().length === rows().length}
          onChange={() =>
            setSelected(selected().length === rows().length ? [] : rows().map(selectionOf))
          }
        />
      ),
      cell: ({ row }) => (
        <RLCheckbox
          aria-label={`Select ${row.original.kind === "folder" ? row.original.folder?.name : row.original.asset?.filename}`}
          checked={isSelected(selectionOf(row.original))}
          onChange={() => toggle(selectionOf(row.original))}
        />
      ),
    },
    {
      id: "preview",
      header: "",
      cell: ({ row }) => {
        const a = row.original.asset;
        if (!a) return <span class="i-lucide-folder size-5 text-primary" />;
        return (
          <Show
            when={a.mimeType.startsWith("image/")}
            fallback={<span class="i-lucide-file size-5 text-muted" />}
          >
            <div class="size-10 overflow-hidden rounded bg-elevated">
              <RLImage
                src={thumb(a)}
                alt={altOf(a)}
                lightbox={false}
                class="size-full object-cover"
              />
            </div>
          </Show>
        );
      },
    },
    {
      id: "name",
      header: "Name",
      cell: ({ row }) => (
        <span class="font-medium text-highlighted">
          {row.original.kind === "folder"
            ? row.original.folder?.name
            : row.original.asset?.filename}
        </span>
      ),
    },
    {
      id: "type",
      header: "Type",
      cell: ({ row }) => <span class="text-muted">{row.original.asset?.mimeType ?? "Folder"}</span>,
    },
    {
      id: "size",
      header: "Size",
      cell: ({ row }) => (
        <span class="text-muted">{row.original.asset ? kb(row.original.asset.size) : "—"}</span>
      ),
    },
    {
      id: "dimensions",
      header: "Dimensions",
      cell: ({ row }) => {
        const a = row.original.asset;
        return (
          <span class="text-muted">{a?.width && a?.height ? `${a.width} × ${a.height}` : "—"}</span>
        );
      },
    },
    {
      id: "uploaded",
      header: "Uploaded",
      cell: ({ row }) => (
        <span class="text-muted">
          {row.original.asset ? new Date(row.original.asset.createdAt).toLocaleDateString() : "—"}
        </span>
      ),
    },
  ];

  const onRowClick = (row: MediaRow) => {
    if (row.kind === "folder") {
      navigate(row.id);
      return;
    }
    const a = row.asset;
    if (!a) return;
    if (props.onPick) props.onPick(a);
    else openDetail(a);
  };

  const onTileClick = (e: MouseEvent, asset: MediaAssetRecord) => {
    if (e.ctrlKey || e.metaKey || selected().length > 0) {
      toggle({ kind: "file", id: asset.id });
      return;
    }
    if (props.onPick) props.onPick(asset);
    else openDetail(asset);
  };

  /** Breadcrumb: the library root, then each ancestor folder. Ids line up with the item index. */
  const crumbIds = createMemo<(string | null)[]>(() => [null, ...crumbs().map((c) => c.id)]);
  const breadcrumbItems = createMemo(() => [
    { label: folderName(null), onSelect: () => navigate(null) },
    ...crumbs().map((c) => ({ label: c.name, onSelect: () => navigate(c.id) })),
  ]);

  return (
    <div class="flex min-h-[60vh] flex-col gap-4 md:flex-row">
      <aside class="max-h-56 w-full overflow-y-auto rounded-lg border border-default p-2 md:max-h-none md:w-56 md:shrink-0">
        <FolderTree
          folders={folders()}
          selected={folderId() ?? ROOT_ID}
          hover={hover()}
          onSelect={navigate}
          dropTarget={dropTarget}
        />
      </aside>

      <div
        class="flex min-w-0 flex-1 flex-col gap-3"
        onDragOver={(e) => {
          if (!isInternal(e)) e.preventDefault();
        }}
        onDrop={(e) => {
          if (isInternal(e)) return;
          e.preventDefault();
          const files = Array.from(e.dataTransfer?.files ?? []);
          if (files.length) {
            setUploadFiles(files);
            setDialog({ kind: "upload" });
          }
        }}
      >
        {/* Row 1: search, and the two actions on the right. */}
        <div class="flex flex-wrap items-center gap-2">
          <RLInput
            class="min-w-0 w-full md:max-w-md md:flex-1"
            placeholder={cmsT("text.search-files")}
            value={search()}
            onInput={(e) => setSearch(e.currentTarget.value)}
            onChange={() => {
              setQuery(search());
              void loadAssets(folderId(), search(), type());
            }}
          />
          <div class="ml-auto flex shrink-0 items-center gap-2">
            <RLButton
              class="whitespace-nowrap"
              color="neutral"
              variant="outline"
              leadingIcon="i-lucide-folder-plus"
              disabled={searching()}
              onClick={() => setDialog({ kind: "newFolder" })}
            >
              Create Folder
            </RLButton>
            <RLButton
              class="whitespace-nowrap"
              color="primary"
              leadingIcon="i-lucide-upload"
              onClick={() => setDialog({ kind: "upload" })}
            >
              Upload Files
            </RLButton>
          </div>
        </div>

        {/* Row 2: type filter on the left, view switch on the right. */}
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="w-40 md:w-48">
            <RLSelect
              class="w-full"
              value={type()}
              items={[
                { label: "All types", value: "all" },
                { label: "Images", value: "images" },
                { label: "Videos", value: "videos" },
                { label: "Audio", value: "audio" },
                { label: "Documents", value: "documents" },
              ]}
              onChange={(e) => {
                setType(e.currentTarget.value);
                void loadAssets(folderId(), query(), e.currentTarget.value);
              }}
            />
          </div>
          <div class="flex shrink-0 items-center">
            <RLTabs
              size="xs"
              items={[
                { value: "grid", label: "Grid", icon: "i-lucide-layout-grid" },
                { value: "table", label: "Table", icon: "i-lucide-table" },
              ]}
              value={view()}
              onValueChange={(v: string) => setView(v === "table" ? "table" : "grid")}
            />
          </div>
        </div>

        {/* Row 3: the location (breadcrumb). */}
        <div class="flex min-w-0 items-center overflow-x-auto">
          <Show
            when={!searching()}
            fallback={<p class="text-sm text-muted">Showing matches from every folder.</p>}
          >
            <RLBreadcrumb
              class="w-fit max-w-full"
              items={breadcrumbItems()}
              itemAttrs={(_item: unknown, index: number) => {
                const id = crumbIds()[index] ?? null;
                return {
                  onDragOver: (e: DragEvent) => dragOver(e, id),
                  onDragLeave: dragLeave,
                  onDrop: (e: DragEvent) => drop(e, id),
                };
              }}
            />
          </Show>
        </div>

        <Show when={selected().length > 0}>
          <div class="flex flex-wrap items-center gap-2 rounded-lg border border-primary/40 bg-primary/5 px-3 py-2 text-sm">
            <span class="font-medium text-highlighted">{selected().length} selected</span>
            <RLButton
              size="xs"
              color="neutral"
              variant="outline"
              leadingIcon="i-lucide-move"
              onClick={() => {
                setMoveTarget(folderId());
                setDialog({ kind: "move", items: selected() });
              }}
            >
              Move
            </RLButton>
            <RLButton
              size="xs"
              color="error"
              variant="outline"
              leadingIcon="i-lucide-trash-2"
              onClick={() => setDialog({ kind: "delete", items: selected() })}
            >
              Delete
            </RLButton>
            <RLButton
              size="xs"
              variant="ghost"
              color="neutral"
              class="ml-auto"
              onClick={() => setSelected([])}
            >
              Clear
            </RLButton>
          </div>
        </Show>

        <Show
          when={!loadError()}
          fallback={
            <Empty
              icon="i-lucide-hard-drive"
              title={cmsT("text.storage-isn-t-available")}
              description={loadError() ?? ""}
            />
          }
        >
          <Loading when={false}>
            <Show
              when={rows().length}
              fallback={
                <Empty
                  icon="i-lucide-image"
                  title={cmsT("text.no-files")}
                  description="Drop files here, upload, or create a folder."
                />
              }
            >
              <Show
                when={view() === "table"}
                fallback={
                  <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                    <For each={subfolders()}>
                      {(f) => {
                        const s: Selection = { kind: "folder", id: f.id };
                        return (
                          <div
                            class={`group relative flex flex-col overflow-hidden rounded-lg border border-default ${
                              hover() === f.id || isSelected(s) ? "ring-2 ring-primary" : ""
                            }`}
                            onDragOver={(e) => dragOver(e, f.id)}
                            onDragLeave={dragLeave}
                            onDrop={(e) => drop(e, f.id)}
                          >
                            <div class="absolute left-2 top-2 z-10">
                              <RLCheckbox
                                aria-label={`Select ${f.name}`}
                                checked={isSelected(s)}
                                onChange={() => toggle(s)}
                              />
                            </div>
                            <RLButton
                              variant="ghost"
                              color="neutral"
                              class="flex aspect-[4/3] w-full items-center justify-center rounded-none bg-elevated"
                              draggable="true"
                              onDragStart={(e: DragEvent) => dragStart(e, s)}
                              onClick={() => navigate(f.id)}
                            >
                              <span class="i-lucide-folder size-12 text-primary" />
                            </RLButton>
                            <div
                              class="truncate px-2 py-1.5 text-[11px] text-highlighted"
                              title={f.name}
                            >
                              {f.name}
                            </div>
                          </div>
                        );
                      }}
                    </For>
                    <For each={assets()}>
                      {(a) => {
                        const s: Selection = { kind: "file", id: a.id };
                        return (
                          <div
                            class={`group relative flex flex-col overflow-hidden rounded-lg border border-default ${
                              isSelected(s) ? "ring-2 ring-primary" : ""
                            }`}
                          >
                            <div class="absolute left-2 top-2 z-10">
                              <RLCheckbox
                                aria-label={`Select ${a.filename}`}
                                checked={isSelected(s)}
                                onChange={() => toggle(s)}
                              />
                            </div>
                            <RLButton
                              variant="ghost"
                              color="neutral"
                              class="flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-none bg-elevated"
                              draggable="true"
                              onDragStart={(e: DragEvent) => dragStart(e, s)}
                              onClick={(e: MouseEvent) => onTileClick(e, a)}
                            >
                              <Show
                                when={a.mimeType.startsWith("image/")}
                                fallback={<span class="i-lucide-file size-10 text-muted" />}
                              >
                                <RLImage
                                  src={thumb(a)}
                                  alt={altOf(a)}
                                  lightbox={false}
                                  class="size-full object-cover"
                                />
                              </Show>
                            </RLButton>
                            <div class="flex items-center gap-1 px-2 py-1.5 text-[11px]">
                              <span
                                class="min-w-0 flex-1 truncate text-highlighted"
                                title={a.filename}
                              >
                                {a.filename}
                              </span>
                              <span class="text-muted">{kb(a.size)}</span>
                            </div>
                          </div>
                        );
                      }}
                    </For>
                  </div>
                }
              >
                <div class="overflow-x-auto">
                  <RLTable
                    data={rows()}
                    columns={columns}
                    getRowId={(row: MediaRow) => `${row.kind}:${row.id}`}
                    rowSelection={rowSelection()}
                    onRowSelectionChange={(state: Record<string, boolean>) =>
                      setSelected(
                        Object.keys(state)
                          .filter((k) => state[k])
                          .map(parseSel),
                      )
                    }
                    onSelect={(_e: Event, row: TableRow<MediaRow>) => onRowClick(row.original)}
                    rowDraggable={() => true}
                    rowClass={(row: TableRow<MediaRow>) =>
                      row.original.kind === "folder" && hover() === row.original.id
                        ? "ring-2 ring-inset ring-primary"
                        : undefined
                    }
                    onRowDragStart={(e: DragEvent, row: TableRow<MediaRow>) =>
                      dragStart(e, selectionOf(row.original))
                    }
                    onRowDragOver={(e: DragEvent, row: TableRow<MediaRow>) =>
                      row.original.kind === "folder" ? dragOver(e, row.original.id) : undefined
                    }
                    onRowDragLeave={dragLeave}
                    onRowDrop={(e: DragEvent, row: TableRow<MediaRow>) =>
                      row.original.kind === "folder" ? drop(e, row.original.id) : undefined
                    }
                    hoverable
                    striped
                    bordered
                  />
                </div>
              </Show>
            </Show>
          </Loading>
        </Show>
      </div>

      {/* New folder */}
      <Modal
        open={dialog()?.kind === "newFolder"}
        title="New folder"
        onClose={closeDialog}
        footer={
          <>
            <RLButton variant="ghost" color="neutral" onClick={closeDialog}>
              Cancel
            </RLButton>
            <RLButton color="primary" onClick={() => void createFolder()}>
              Create
            </RLButton>
          </>
        }
      >
        <div class="flex flex-col gap-2">
          <p class="text-sm text-muted">Creates a folder in {folderName(folderId())}.</p>
          <RLInput
            placeholder="Folder name"
            value={newName()}
            onInput={(e) => setNewName(e.currentTarget.value)}
          />
        </div>
      </Modal>

      {/* Upload */}
      <Modal
        open={dialog()?.kind === "upload"}
        title="Upload files"
        onClose={closeDialog}
        wide
        footer={
          <>
            <RLButton variant="outline" color="error" onClick={closeDialog}>
              Cancel
            </RLButton>
            <span class="flex-1" />
            <RLButton
              color="primary"
              disabled={uploadFiles().length === 0 || uploadProgress() !== null}
              loading={uploadProgress() !== null}
              onClick={() => void runUpload()}
            >
              {uploadProgress()
                ? `Uploading ${uploadProgress()}`
                : `Upload ${uploadFiles().length} file(s)`}
            </RLButton>
          </>
        }
      >
        <div class="flex flex-col gap-3">
          <p class="text-sm text-muted">
            Uploads into {folderName(folderId())}. You can add alt text and captions afterwards.
          </p>
          <RLFileUpload
            multiple
            title="Drop files here"
            description="or click to browse"
            onValueChange={(files: File[]) => setUploadFiles(files)}
          />
          <Show when={uploadFiles().length}>
            <ul class="max-h-40 overflow-y-auto text-sm">
              <For each={uploadFiles()}>
                {(f) => (
                  <li class="flex justify-between gap-2 border-b border-default py-1">
                    <span class="truncate">{f.name}</span>
                    <span class="text-muted">{kb(f.size)}</span>
                  </li>
                )}
              </For>
            </ul>
          </Show>
        </div>
      </Modal>

      {/* Move */}
      <Modal
        open={dialog()?.kind === "move"}
        title={`Move ${selected().length} item(s)`}
        onClose={closeDialog}
        wide
        footer={
          <>
            <RLButton variant="ghost" color="neutral" onClick={closeDialog}>
              Cancel
            </RLButton>
            <RLButton
              color="primary"
              onClick={() => {
                const d = dialog();
                closeDialog();
                if (d && d.kind === "move") void moveItems(d.items, moveTarget());
              }}
            >
              Move here
            </RLButton>
          </>
        }
      >
        <div class="flex flex-col gap-2">
          <p class="text-sm text-muted">Pick a destination folder.</p>
          <div class="max-h-[50vh] overflow-y-auto rounded-lg border border-default p-2">
            <FolderTree folders={folders()} selected={moveTarget()} onSelect={setMoveTarget} />
          </div>
          <p class="text-xs text-muted">Destination: {folderName(moveTarget())}</p>
        </div>
      </Modal>

      {/* Delete */}
      <Modal
        open={dialog()?.kind === "delete"}
        title="Delete"
        onClose={closeDialog}
        footer={
          <>
            <RLButton variant="ghost" color="neutral" onClick={closeDialog}>
              Cancel
            </RLButton>
            <RLButton
              color="error"
              onClick={() => {
                const d = dialog();
                closeDialog();
                if (d && d.kind === "delete") void deleteSelection(d.items);
              }}
            >
              Delete
            </RLButton>
          </>
        }
      >
        <p class="text-sm">
          Delete {selected().length} item(s)? Folders are deleted with everything in them, and their
          files are removed from storage. Content that uses a deleted file will show a broken image.
        </p>
      </Modal>

      {/* Detail */}
      <Show
        when={
          dialog()?.kind === "detail" ? (dialog() as Extract<Dialog, { kind: "detail" }>) : null
        }
      >
        {(d) => (
          <AssetDetail
            asset={d().asset}
            folders={folders()}
            locales={locales}
            onClose={closeDialog}
            onChanged={async () => {
              await refresh();
            }}
            onDelete={(asset) =>
              setDialog({ kind: "delete", items: [{ kind: "file", id: asset.id }] })
            }
            onMove={(asset) => {
              setMoveTarget(asset.folderId);
              setSelected([{ kind: "file", id: asset.id }]);
              setDialog({ kind: "move", items: [{ kind: "file", id: asset.id }] });
            }}
          />
        )}
      </Show>
    </div>
  );
};

type DetailTab = "details" | "edit" | "used";
type EditMode = "crop" | "focal";
type CropApi = { save: (mode: "copy" | "replace") => Promise<void>; busy: () => boolean };

/** Detail dialog: details, per-locale alt and captions, edit image (crop and focal point), usage. */
const AssetDetail: Component<{
  asset: MediaAssetRecord;
  folders: MediaFolderRecord[];
  locales: string[];
  onClose: () => void;
  onChanged: () => Promise<void>;
  onMove: (asset: MediaAssetRecord) => void;
  onDelete: (asset: MediaAssetRecord) => void;
}> = (props) => {
  const { api, toast } = useDashboard();
  const [tab, setTab] = createSignal<DetailTab>("details");
  const [editMode, setEditMode] = createSignal<EditMode>("crop");
  const [current, setCurrent] = createSignal<MediaAssetRecord>(props.asset);
  const [filename, setFilename] = createSignal(props.asset.filename);
  const [alt, setAlt] = createSignal<Record<string, string>>({ ...props.asset.alt });
  const [caption, setCaption] = createSignal<Record<string, string>>({
    ...props.asset.caption,
  });
  const [folderId, setFolderId] = createSignal<string | null>(props.asset.folderId);
  const [saving, setSaving] = createSignal(false);
  let fileInput: HTMLInputElement | undefined;
  let cropApi: CropApi | undefined;
  const isImage = () => current().mimeType.startsWith("image/");
  const locales = () => (props.locales.length ? props.locales : ["en"]);
  const kbOf = (n: number) =>
    n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.ceil(n / 1e3))} KB`;

  const save = async () => {
    setSaving(true);
    try {
      await api.media.update(current().id, {
        filename: filename(),
        alt: alt(),
        caption: caption(),
        folderId: folderId(),
      });
      toast("Saved", "success");
      await props.onChanged();
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  const replaceWith = async (file: File) => {
    try {
      const size = isImage() ? await readImageSize(file) : null;
      const updated = await api.media.replace(current().id, file, size ?? {});
      setCurrent({ ...current(), ...updated });
      toast("Replaced. The URL stays the same.", "success");
      await props.onChanged();
    } catch (err) {
      toast((err as Error).message, "error");
    }
  };

  const setFocal = async (x: number, y: number) => {
    try {
      await api.media.update(current().id, { focalX: x, focalY: y });
      setCurrent({ ...current(), focalX: x, focalY: y });
      await props.onChanged();
    } catch (err) {
      toast((err as Error).message, "error");
    }
  };

  const clearFocal = async () => {
    try {
      await api.media.update(current().id, { focalX: null, focalY: null });
      setCurrent({ ...current(), focalX: null, focalY: null });
      await props.onChanged();
    } catch (err) {
      toast((err as Error).message, "error");
    }
  };

  // Assets synced from the bucket have no size stored. Read it from the image once, and save it.
  if (isImage() && (current().width == null || current().height == null)) {
    const probe = new Image();
    probe.onload = () => {
      if (!probe.naturalWidth) return;
      const id = current().id;
      void api.media
        .update(id, { width: probe.naturalWidth, height: probe.naturalHeight })
        .then(() =>
          setCurrent({ ...current(), width: probe.naturalWidth, height: probe.naturalHeight }),
        )
        .catch(() => undefined);
    };
    probe.src = current().previewUrl ?? current().url;
  }

  const folderItems = () => [
    { label: "Top level", value: "" },
    ...props.folders
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((f) => ({ label: f.name, value: f.id })),
  ];

  const footer = () => {
    if (tab() === "edit") {
      return (
        <>
          <RLButton variant="outline" color="neutral" onClick={props.onClose}>
            Cancel
          </RLButton>
          <RLButton
            variant="outline"
            color="neutral"
            disabled={cropApi?.busy() ?? false}
            onClick={() => void cropApi?.save("replace")}
          >
            Replace original
          </RLButton>
          <RLButton
            color="primary"
            loading={cropApi?.busy() ?? false}
            onClick={() => void cropApi?.save("copy")}
          >
            Create cropped copy
          </RLButton>
        </>
      );
    }
    if (tab() === "used") {
      return (
        <>
          <RLButton
            color="error"
            leadingIcon="i-lucide-trash-2"
            onClick={() => props.onDelete(current())}
          >
            Delete
          </RLButton>
          <span class="flex-1" />
          <RLButton variant="outline" color="neutral" onClick={props.onClose}>
            Close
          </RLButton>
        </>
      );
    }
    return (
      <>
        <RLButton
          color="error"
          leadingIcon="i-lucide-trash-2"
          onClick={() => props.onDelete(current())}
        >
          Delete
        </RLButton>
        <RLButton
          variant="outline"
          color="neutral"
          leadingIcon="i-lucide-replace"
          onClick={() => fileInput?.click()}
        >
          Replace image
        </RLButton>
        <input
          ref={(el) => (fileInput = el)}
          type="file"
          class="hidden"
          accept={isImage() ? "image/*" : undefined}
          onChange={(e) => {
            const file = e.currentTarget.files?.[0];
            if (file) void replaceWith(file);
            e.currentTarget.value = "";
          }}
        />
        <span class="flex-1" />
        <RLButton variant="outline" color="neutral" onClick={props.onClose}>
          Cancel
        </RLButton>
        <RLButton color="primary" loading={saving()} onClick={() => void save()}>
          Save
        </RLButton>
      </>
    );
  };

  return (
    <Modal
      open={true}
      title="Media details"
      description={current().filename}
      onClose={props.onClose}
      wide="xl"
      footer={footer}
    >
      <div class="flex flex-col gap-5">
        <RLTabs
          items={[
            { value: "details", label: "Details" },
            { value: "edit", label: "Edit image" },
            { value: "used", label: "Used in" },
          ]}
          value={tab()}
          onValueChange={(v: string) => setTab(v as DetailTab)}
        />

        <Show when={tab() === "details"}>
          <div class="grid gap-6 md:grid-cols-2">
            <div class="flex flex-col gap-4">
              <div class="flex min-h-56 items-center justify-center overflow-hidden rounded-lg border border-default bg-elevated p-3">
                <Show when={isImage()} fallback={<span class="i-lucide-file size-16 text-muted" />}>
                  <RLImage
                    src={current().previewUrl ?? current().url}
                    alt={filename()}
                    lightbox={false}
                    class="max-h-[50vh] w-auto object-contain"
                  />
                </Show>
              </div>
              <dl class="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                <dt class="text-muted">Size</dt>
                <dd>{kbOf(current().size)}</dd>
                <dt class="text-muted">Dimensions</dt>
                <dd>
                  {current().width && current().height
                    ? `${current().width} × ${current().height}`
                    : "—"}
                </dd>
                <dt class="text-muted">Uploaded</dt>
                <dd>{new Date(current().createdAt).toLocaleString()}</dd>
                <dt class="text-muted">Format</dt>
                <dd>{current().mimeType}</dd>
              </dl>
              <div class="flex flex-col gap-1 text-sm">
                <span class="font-medium text-toned">URL</span>
                <div class="flex items-center gap-2">
                  <RLInput
                    class="min-w-0 flex-1 font-mono text-xs"
                    readonly
                    value={current().url}
                  />
                  <RLButton
                    variant="outline"
                    color="neutral"
                    icon="i-lucide-copy"
                    aria-label="Copy URL"
                    onClick={() => {
                      void navigator.clipboard.writeText(current().url);
                      toast("URL copied");
                    }}
                  />
                </div>
              </div>
            </div>

            <div class="flex flex-col gap-4">
              <label class="flex flex-col gap-1 text-sm">
                <span class="font-medium text-toned">Filename</span>
                <RLInput value={filename()} onInput={(e) => setFilename(e.currentTarget.value)} />
              </label>
              <label class="flex flex-col gap-1 text-sm">
                <span class="font-medium text-toned">Location</span>
                <RLSelect
                  value={folderId() ?? ""}
                  items={folderItems()}
                  onChange={(e) => setFolderId(e.currentTarget.value || null)}
                />
              </label>
              <Show when={isImage()}>
                <For each={locales()}>
                  {(loc) => (
                    <label class="flex flex-col gap-1 text-sm">
                      <span class="font-medium text-toned">Alt text ({loc})</span>
                      <RLInput
                        placeholder="Describe this image for screen readers"
                        value={alt()[loc] ?? ""}
                        onInput={(e) => setAlt({ ...alt(), [loc]: e.currentTarget.value })}
                      />
                    </label>
                  )}
                </For>
              </Show>
              <For each={locales()}>
                {(loc) => (
                  <label class="flex flex-col gap-1 text-sm">
                    <span class="font-medium text-toned">Caption ({loc})</span>
                    <RLInput
                      placeholder="Optional caption"
                      value={caption()[loc] ?? ""}
                      onInput={(e) => setCaption({ ...caption(), [loc]: e.currentTarget.value })}
                    />
                  </label>
                )}
              </For>
            </div>
          </div>
        </Show>

        <Show when={tab() === "edit"}>
          <Show
            when={isImage()}
            fallback={<p class="text-sm text-muted">Only images can be edited.</p>}
          >
            <EditImagePanel
              asset={current()}
              mode={editMode()}
              onMode={setEditMode}
              onFocal={(x, y) => void setFocal(x, y)}
              onClearFocal={() => void clearFocal()}
              apiRef={(api) => (cropApi = api)}
              onCreated={async () => {
                toast("Cropped copy saved", "success");
                await props.onChanged();
              }}
              onReplaced={async (updated) => {
                setCurrent({ ...current(), ...updated });
                toast("Replaced. The URL stays the same.", "success");
                await props.onChanged();
              }}
            />
          </Show>
        </Show>

        <Show when={tab() === "used"}>
          <UsedIn assetId={current().id} />
        </Show>
      </div>
    </Modal>
  );
};

/** Pages and drafts that use a file, loaded when the Used-in tab opens. */
const UsedIn: Component<{ assetId: string }> = (props) => {
  const { api, locales } = useDashboard();
  const [usage, setUsage] = createSignal<MediaUsageRecord[] | null>(null);
  const [error, setError] = createSignal<string | null>(null);
  createEffect(
    () => props.assetId,
    (id: string) => {
      setUsage(null);
      api.media
        .usage(id)
        .then((res) => setUsage(res.data.usage))
        .catch((err) => setError((err as Error).message));
    },
  );
  const titleOf = (u: MediaUsageRecord) =>
    resolveLabel(u.title as any, locales[0] ?? "en") || u.slug;
  return (
    <div class="flex flex-col gap-3 text-sm">
      <div>
        <p class="font-semibold text-highlighted">Used in</p>
        <p class="text-muted">See where this file is used.</p>
      </div>
      <Show when={!error()} fallback={<p class="text-error-500">{error()}</p>}>
        <Show when={usage()} fallback={<p class="text-muted">Checking where this file is used…</p>}>
          {(list) => (
            <Show
              when={list().length}
              fallback={<p class="text-muted">Not used by any page yet.</p>}
            >
              <ul class="flex flex-col gap-2">
                <For each={list()}>
                  {(u) => (
                    <li class="flex items-center gap-3 rounded-lg border border-default px-3 py-2">
                      <span class="i-lucide-file-text size-5 shrink-0 text-muted" />
                      <div class="min-w-0 flex-1">
                        <p class="truncate font-medium text-highlighted">{titleOf(u)}</p>
                        <p class="text-xs text-muted">
                          {u.type} · {u.status === "draft" ? "Draft" : "Published"}
                        </p>
                      </div>
                      <span class="shrink-0 text-xs text-muted">Open ↗</span>
                    </li>
                  )}
                </For>
              </ul>
            </Show>
          )}
        </Show>
      </Show>
    </div>
  );
};

/**
 * Edit image: crop with handles (aspect-locked), saved as a copy or as a replacement of the original;
 * or set the focal point by clicking the image. The footer buttons call back through `apiRef`.
 */
const EditImagePanel: Component<{
  asset: MediaAssetRecord;
  mode: EditMode;
  onMode: (mode: EditMode) => void;
  onFocal: (x: number, y: number) => void;
  onClearFocal: () => void;
  apiRef: (api: CropApi) => void;
  onCreated: () => Promise<void>;
  onReplaced: (updated: MediaAssetRecord) => Promise<void>;
}> = (props) => {
  const { api, toast } = useDashboard();
  const [aspect, setAspect] = createSignal<string>("free");
  const [rect, setRect] = createSignal<CropRect>({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
  const [natural, setNatural] = createSignal<{ w: number; h: number }>({
    w: props.asset.width ?? 1,
    h: props.asset.height ?? 1,
  });
  const [busy, setBusy] = createSignal(false);
  let wrap: HTMLDivElement | undefined;
  let img: HTMLImageElement | undefined;
  let drag: CropDrag | null = null;

  const ratio = () => {
    const v = aspect();
    if (v === "free") return null;
    const [w, h] = v.split(":").map(Number);
    return w && h ? w / h : null;
  };

  const lockAspect = (
    r: CropRect,
    anchor: { x: "l" | "r" | "c"; y: "t" | "b" | "c" },
  ): CropRect => {
    const want = ratio();
    if (!want) return r;
    const { w: iw, h: ih } = natural();
    const pxW = r.w * iw;
    const pxH = pxW / want;
    let h = pxH / ih;
    let w = r.w;
    if (h > r.h + 1e-9) {
      h = r.h;
      w = (h * ih * want) / iw;
    }
    const x = anchor.x === "l" ? r.x : anchor.x === "r" ? r.x + r.w - w : r.x + (r.w - w) / 2;
    const y = anchor.y === "t" ? r.y : anchor.y === "b" ? r.y + r.h - h : r.y + (r.h - h) / 2;
    return { x: clamp(x, 0, 1 - w), y: clamp(y, 0, 1 - h), w, h };
  };

  const onPointerMove = (e: PointerEvent) => {
    if (!drag || !wrap) return;
    const box = wrap.getBoundingClientRect();
    const dx = (e.clientX - drag.startX) / box.width;
    const dy = (e.clientY - drag.startY) / box.height;
    const s = drag.start;
    if (drag.mode === "move") {
      setRect({ ...s, x: clamp(s.x + dx, 0, 1 - s.w), y: clamp(s.y + dy, 0, 1 - s.h) });
      return;
    }
    const { l, r, t, b } = drag.edges;
    let x0 = s.x;
    let x1 = s.x + s.w;
    let y0 = s.y;
    let y1 = s.y + s.h;
    if (l) x0 = clamp(s.x + dx, 0, x1 - MIN_CROP);
    if (r) x1 = clamp(s.x + s.w + dx, x0 + MIN_CROP, 1);
    if (t) y0 = clamp(s.y + dy, 0, y1 - MIN_CROP);
    if (b) y1 = clamp(s.y + s.h + dy, y0 + MIN_CROP, 1);
    const next: CropRect = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
    setRect(
      lockAspect(next, {
        x: l ? "r" : r ? "l" : "c",
        y: t ? "b" : b ? "t" : "c",
      }),
    );
  };

  const onPointerUp = () => {
    drag = null;
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerup", onPointerUp);
  };

  const startDrag = (e: PointerEvent, next: CropDrag) => {
    e.preventDefault();
    e.stopPropagation();
    drag = next;
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const onImageLoad = () => {
    if (!img) return;
    setNatural({ w: img.naturalWidth || 1, h: img.naturalHeight || 1 });
    if (ratio()) setRect(lockAspect({ x: 0, y: 0, w: 1, h: 1 }, { x: "c", y: "c" }));
  };

  const setAspectTo = (v: string) => {
    setAspect(v);
    if (ratio()) setRect(lockAspect(rect(), { x: "c", y: "c" }));
    else setRect({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
  };

  const cropBlob = async (): Promise<File | null> => {
    if (!img) return null;
    const r = rect();
    const { w: iw, h: ih } = natural();
    const sx = Math.round(r.x * iw);
    const sy = Math.round(r.y * ih);
    const sw = Math.max(1, Math.round(r.w * iw));
    const sh = Math.max(1, Math.round(r.h * ih));
    const scale = Math.min(1, 1600 / Math.max(sw, sh));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(sw * scale));
    canvas.height = Math.max(1, Math.round(sh * scale));
    canvas.getContext("2d")?.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/webp", 0.9),
    );
    if (!blob) return null;
    const base = props.asset.filename.replace(/\.[^.]+$/, "");
    return new File([blob], `${base}-crop.webp`, { type: "image/webp" });
  };

  props.apiRef({
    busy,
    save: async (mode) => {
      setBusy(true);
      try {
        const file = await cropBlob();
        if (!file) throw new Error("Could not create the cropped image.");
        if (mode === "copy") {
          await api.media.upload(file, {
            folderId: props.asset.folderId,
            width: Math.round(rect().w * natural().w),
            height: Math.round(rect().h * natural().h),
          });
          await props.onCreated();
        } else {
          const updated = await api.media.replace(props.asset.id, file, {
            width: Math.round(rect().w * natural().w),
            height: Math.round(rect().h * natural().h),
          });
          await props.onReplaced(updated);
        }
      } catch (err) {
        toast((err as Error).message, "error");
      } finally {
        setBusy(false);
      }
    },
  });

  const handles: {
    name: string;
    cls: string;
    edges: { l: boolean; r: boolean; t: boolean; b: boolean };
  }[] = [
    {
      name: "nw",
      cls: "-left-1.5 -top-1.5 cursor-nwse-resize",
      edges: { l: true, r: false, t: true, b: false },
    },
    {
      name: "n",
      cls: "left-1/2 -top-1.5 -translate-x-1/2 cursor-ns-resize",
      edges: { l: false, r: false, t: true, b: false },
    },
    {
      name: "ne",
      cls: "-right-1.5 -top-1.5 cursor-nesw-resize",
      edges: { l: false, r: true, t: true, b: false },
    },
    {
      name: "e",
      cls: "-right-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize",
      edges: { l: false, r: true, t: false, b: false },
    },
    {
      name: "se",
      cls: "-right-1.5 -bottom-1.5 cursor-nwse-resize",
      edges: { l: false, r: true, t: false, b: true },
    },
    {
      name: "s",
      cls: "left-1/2 -bottom-1.5 -translate-x-1/2 cursor-ns-resize",
      edges: { l: false, r: false, t: false, b: true },
    },
    {
      name: "sw",
      cls: "-left-1.5 -bottom-1.5 cursor-nesw-resize",
      edges: { l: true, r: false, t: false, b: true },
    },
    {
      name: "w",
      cls: "-left-1.5 top-1/2 -translate-y-1/2 cursor-ew-resize",
      edges: { l: true, r: false, t: false, b: false },
    },
  ];

  const outputSize = () =>
    `${Math.round(rect().w * natural().w)} × ${Math.round(rect().h * natural().h)}`;

  return (
    <div class="grid gap-6 md:grid-cols-[1fr_260px]">
      <div class="flex items-center justify-center rounded-lg bg-elevated p-3">
        <div ref={(el) => (wrap = el)} class="relative inline-block select-none touch-none">
          <img
            ref={(el) => {
              img = el;
              if (el.complete && el.naturalWidth) onImageLoad();
            }}
            src={props.asset.previewUrl ?? props.asset.url}
            alt=""
            draggable={false}
            class="block max-h-[55vh] max-w-full"
            onLoad={onImageLoad}
            onClick={(e: MouseEvent) => {
              if (props.mode !== "focal" || !wrap) return;
              const box = wrap.getBoundingClientRect();
              props.onFocal(
                clamp((e.clientX - box.left) / box.width, 0, 1),
                clamp((e.clientY - box.top) / box.height, 0, 1),
              );
            }}
          />
          <Show when={props.mode === "crop"}>
            <div
              class="absolute cursor-move border border-primary"
              style={{
                left: `${rect().x * 100}%`,
                top: `${rect().y * 100}%`,
                width: `${rect().w * 100}%`,
                height: `${rect().h * 100}%`,
                "box-shadow": "0 0 0 9999px rgba(0,0,0,0.55)",
              }}
              onPointerDown={(e: PointerEvent) =>
                startDrag(e, { mode: "move", startX: e.clientX, startY: e.clientY, start: rect() })
              }
            >
              <For each={handles}>
                {(h) => (
                  <span
                    class={`absolute size-3 rounded-sm border border-white bg-primary ${h.cls}`}
                    aria-label={`Resize ${h.name}`}
                    onPointerDown={(e: PointerEvent) =>
                      startDrag(e, {
                        mode: "resize",
                        edges: h.edges,
                        startX: e.clientX,
                        startY: e.clientY,
                        start: rect(),
                      })
                    }
                  />
                )}
              </For>
            </div>
          </Show>
          <Show
            when={
              props.mode === "focal" && props.asset.focalX !== null && props.asset.focalY !== null
            }
          >
            <span
              class="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-primary shadow"
              style={{
                left: `${(props.asset.focalX ?? 0.5) * 100}%`,
                top: `${(props.asset.focalY ?? 0.5) * 100}%`,
              }}
            />
          </Show>
        </div>
      </div>

      <div class="flex flex-col gap-4">
        <RLTabs
          items={[
            { value: "crop", label: "Crop" },
            { value: "focal", label: "Focal point" },
          ]}
          value={props.mode}
          onValueChange={(v: string) => props.onMode(v === "focal" ? "focal" : "crop")}
        />
        <Show when={props.mode === "crop"}>
          <div class="flex flex-col gap-3 text-sm">
            <div class="flex items-center gap-2">
              <RLSelect
                class="min-w-0 flex-1"
                value={aspect()}
                items={[
                  { label: "Original", value: "free" },
                  { label: "Square (1:1)", value: "1:1" },
                  { label: "4:3", value: "4:3" },
                  { label: "16:9", value: "16:9" },
                  { label: "3:2", value: "3:2" },
                ]}
                onChange={(e) => setAspectTo(e.currentTarget.value)}
              />
              <RLButton
                variant="outline"
                color="neutral"
                leadingIcon="i-lucide-rotate-ccw"
                onClick={() => setAspectTo(aspect())}
              >
                Reset
              </RLButton>
            </div>
            <div class="flex items-center justify-between rounded-md border border-default px-3 py-2">
              <span class="text-muted">Output size</span>
              <span class="font-medium text-highlighted">{outputSize()}</span>
            </div>
          </div>
        </Show>
        <Show when={props.mode === "focal"}>
          <div class="flex flex-col gap-3 text-sm">
            <p class="text-muted">
              Click the image to set the focal point. It decides what stays in view when the image
              is cropped by the page.
            </p>
            <RLButton variant="outline" color="neutral" onClick={props.onClearFocal}>
              Clear focal point
            </RLButton>
          </div>
        </Show>
      </div>
    </div>
  );
};

export const MediaLibrary: Component = () => (
  <div>
    <PageHeader
      icon="i-lucide-image"
      title={cmsT("text.media")}
      description="Images and files stored in your bucket. Drag files anywhere on this page to upload."
    />
    <div class="p-4 md:p-6">
      <MediaManager />
    </div>
  </div>
);

export const MediaPicker: Component<{
  open: boolean;
  onClose: () => void;
  onPick: (asset: MediaAssetRecord) => void;
}> = (props) => (
  <Modal open={props.open} title={cmsT("text.choose-media")} onClose={props.onClose} wide>
    <Show when={props.open}>
      <MediaManager onPick={props.onPick} />
    </Show>
  </Modal>
);

import {
  For,
  Show,
  createEffect,
  createMemo,
  createSignal,
  onSettled,
  type Component,
} from "solid-js";
import { resolveLabel } from "../../core/collections/define";
import { useDashboard } from "../context";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { RLInput } from "@rimelight/ui/components/input/RLInput.tsx";
import { RLSelect } from "@rimelight/ui/components/select/RLSelect.tsx";
import { RLImage } from "@rimelight/ui/components/image/RLImage.tsx";
import { RLFileUpload } from "@rimelight/ui/components/file-upload/RLFileUpload.tsx";
import { RLTabs } from "@rimelight/ui/components/tabs/RLTabs.tsx";
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

const DRAG_TYPE = "application/x-rimelight-media";
const kb = (n: number) =>
  n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.max(1, Math.ceil(n / 1e3))} KB`;
const sel = (s: Selection) => `${s.kind}:${s.id}`;

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

/** Folder tree. Clicking selects; folders and files can be dropped onto it. */
const FolderTree: Component<{
  folders: MediaFolderRecord[];
  current: string | null;
  hover: string | null;
  onSelect: (id: string | null) => void;
  onDragOver: (e: DragEvent, id: string | null) => void;
  onDrop: (e: DragEvent, id: string | null) => void;
  onDragLeave: () => void;
}> = (props) => {
  const Node: Component<{ id: string | null; name: string; depth: number }> = (node) => {
    const kids = () => childrenOf(props.folders, node.id);
    const [open, setOpen] = createSignal(
      node.depth === 0 || pathTo(props.folders, props.current).some((f) => f.id === node.id),
    );
    return (
      <div>
        <div
          class={`flex cursor-pointer items-center gap-1 rounded py-1 pr-2 text-sm ${
            props.current === node.id ? "bg-primary/10 text-primary" : "text-highlighted"
          } ${props.hover === (node.id ?? "root") ? "ring-2 ring-primary" : ""}`}
          style={{ "padding-left": `${node.depth * 12 + 4}px` }}
          onClick={() => props.onSelect(node.id)}
          onDragOver={(e) => props.onDragOver(e, node.id)}
          onDragLeave={() => props.onDragLeave()}
          onDrop={(e) => props.onDrop(e, node.id)}
        >
          <button
            type="button"
            class="flex size-4 shrink-0 items-center justify-center text-muted"
            disabled={kids().length === 0}
            onClick={(e) => {
              e.stopPropagation();
              setOpen(!open());
            }}
          >
            <Show when={kids().length > 0}>
              <span
                class={open() ? "i-lucide-chevron-down size-3" : "i-lucide-chevron-right size-3"}
              />
            </Show>
          </button>
          <span
            class={`${open() ? "i-lucide-folder-open" : "i-lucide-folder"} size-4 text-primary`}
          />
          <span class="min-w-0 truncate">{node.name}</span>
        </div>
        <Show when={open()}>
          <For each={kids()}>
            {(child) => <Node id={child.id} name={child.name} depth={node.depth + 1} />}
          </For>
        </Show>
      </div>
    );
  };
  return <Node id={null} name={cmsT("text.media") || "All files"} depth={0} />;
};

/**
 * Media library: folder tree, grid or table, search and type filters, drag and drop moves,
 * multi-select batch actions, upload, and a detail dialog with per-locale alt text and captions,
 * focal point, replace, and crop (saved as a copy). Used as the page and inside the picker.
 */
const MediaManager: Component<{ onPick?: (asset: MediaAssetRecord) => void }> = (props) => {
  const { api, toast, locales } = useDashboard();
  const [folders, setFolders] = createSignal<MediaFolderRecord[]>([]);
  const [assets, setAssets] = createSignal<MediaAssetRecord[]>([]);
  const [folderId, setFolderId] = createSignal<string | null>(null);
  const [search, setSearch] = createSignal("");
  const [type, setType] = createSignal("all");
  const [view, setView] = createSignal<View>("grid");
  const [loading, setLoading] = createSignal(false);
  const [loadError, setLoadError] = createSignal<string | null>(null);
  const [selected, setSelected] = createSignal<Selection[]>([]);
  const [dialog, setDialog] = createSignal<Dialog | null>(null);
  const [hover, setHover] = createSignal<string | null>(null);
  const [newName, setNewName] = createSignal("");
  const [moveTarget, setMoveTarget] = createSignal<string | null>(null);
  const [uploadFiles, setUploadFiles] = createSignal<File[]>([]);
  const [uploadProgress, setUploadProgress] = createSignal<string | null>(null);
  let seq = 0;

  const searching = () => search().trim() !== "" || type() !== "all";
  const crumbs = createMemo(() => pathTo(folders(), folderId()));
  const subfolders = createMemo(() => (searching() ? [] : childrenOf(folders(), folderId())));
  const isSelected = (s: Selection) => selected().some((x) => sel(x) === sel(s));
  const toggle = (s: Selection) =>
    setSelected((prev) =>
      prev.some((x) => sel(x) === sel(s)) ? prev.filter((x) => sel(x) !== sel(s)) : [...prev, s],
    );
  const folderName = (id: string | null) =>
    id === null
      ? cmsT("text.media") || "All files"
      : (folders().find((f) => f.id === id)?.name ?? "");

  const loadFolders = async () => {
    try {
      const res = await api.media.folders();
      setFolders(res.data.folders);
    } catch (err) {
      toast((err as Error).message, "error");
    }
  };

  const loadAssets = async () => {
    const id = ++seq;
    setLoading(true);
    try {
      const res = await api.media.list({
        folderId: folderId(),
        search: search(),
        type: type(),
      });
      if (id === seq) {
        setAssets(res.data.assets);
        setLoadError(null);
      }
    } catch (err) {
      if (id === seq) setLoadError((err as Error).message);
    } finally {
      if (id === seq) setLoading(false);
    }
  };

  const refresh = async () => {
    await Promise.all([loadFolders(), loadAssets()]);
  };

  const navigate = (id: string | null) => {
    setFolderId(id);
    setSelected([]);
    void loadAssets();
  };

  onSettled(() => void refresh());

  /** Moves files and folders into `target` (null = top level). Skips no-ops and cycles. */
  const moveItems = async (items: Selection[], target: string | null) => {
    const tree = folders();
    const work = items.filter((s) => {
      if (s.kind === "file") {
        const current = assets().find((a) => a.id === s.id)?.folderId ?? null;
        return current !== target;
      }
      if (s.id === target) return false;
      return !(target && subtreeOf(tree, s.id).has(target));
    });
    if (work.length === 0) return;
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

  const onItemDragStart = (e: DragEvent, s: Selection) => {
    const items = isSelected(s) ? selected() : [s];
    e.dataTransfer?.setData(DRAG_TYPE, JSON.stringify(items));
    if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
  };
  const isInternal = (e: DragEvent) => Array.from(e.dataTransfer?.types ?? []).includes(DRAG_TYPE);
  const onTargetOver = (e: DragEvent, id: string | null) => {
    if (!isInternal(e)) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    setHover(id ?? "root");
  };
  const onTargetDrop = (e: DragEvent, id: string | null) => {
    if (!isInternal(e)) return;
    e.preventDefault();
    e.stopPropagation();
    setHover(null);
    const items = JSON.parse(e.dataTransfer?.getData(DRAG_TYPE) || "[]") as Selection[];
    void moveItems(items, id);
  };

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
        await api.media.upload(file, {
          folderId: folderId(),
          ...size,
        });
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

  const onTileClick = (e: MouseEvent, asset: MediaAssetRecord) => {
    if (e.ctrlKey || e.metaKey || selected().length > 0) {
      toggle({ kind: "file", id: asset.id });
      return;
    }
    if (props.onPick) props.onPick(asset);
    else openDetail(asset);
  };

  const thumb = (asset: MediaAssetRecord) => asset.previewUrl ?? asset.url;
  const closeDialog = () => setDialog(null);

  return (
    <div class="flex min-h-[60vh] gap-4">
      <aside class="w-56 shrink-0 overflow-y-auto rounded-lg border border-default p-2">
        <FolderTree
          folders={folders()}
          current={folderId()}
          hover={hover()}
          onSelect={navigate}
          onDragOver={onTargetOver}
          onDrop={onTargetDrop}
          onDragLeave={() => setHover(null)}
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
        <div class="flex flex-wrap items-center gap-2">
          <RLInput
            class="max-w-xs"
            placeholder={cmsT("text.search-files")}
            value={search()}
            onInput={(e) => setSearch(e.currentTarget.value)}
            onChange={() => void loadAssets()}
          />
          <RLSelect
            class="w-36"
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
              void loadAssets();
            }}
          />
          <div class="ml-auto flex items-center gap-2">
            <div class="flex rounded-md border border-default p-0.5">
              <button
                type="button"
                class={`rounded px-2 py-1 text-sm ${view() === "grid" ? "bg-primary/10 text-primary" : "text-muted"}`}
                aria-pressed={view() === "grid" ? "true" : "false"}
                onClick={() => {
                  setView("grid");
                }}
              >
                <span class="i-lucide-layout-grid size-4" />
              </button>
              <button
                type="button"
                class={`rounded px-2 py-1 text-sm ${view() === "table" ? "bg-primary/10 text-primary" : "text-muted"}`}
                aria-pressed={view() === "table" ? "true" : "false"}
                onClick={() => {
                  setView("table");
                }}
              >
                <span class="i-lucide-table size-4" />
              </button>
            </div>
            <RLButton
              color="neutral"
              variant="outline"
              leadingIcon="i-lucide-folder-plus"
              disabled={searching()}
              onClick={() => setDialog({ kind: "newFolder" })}
            >
              New folder
            </RLButton>
            <RLButton
              color="primary"
              leadingIcon="i-lucide-upload"
              onClick={() => setDialog({ kind: "upload" })}
            >
              Upload
            </RLButton>
          </div>
        </div>

        <Show
          when={!searching()}
          fallback={<p class="text-sm text-muted">Showing matches from every folder.</p>}
        >
          <nav class="flex flex-wrap items-center gap-1 text-sm">
            <button
              type="button"
              class={`rounded px-1.5 py-0.5 text-primary hover:underline ${hover() === "root" ? "ring-2 ring-primary" : ""}`}
              onClick={() => navigate(null)}
              onDragOver={(e) => onTargetOver(e, null)}
              onDragLeave={() => setHover(null)}
              onDrop={(e) => onTargetDrop(e, null)}
            >
              {folderName(null)}
            </button>
            <For each={crumbs()}>
              {(c) => (
                <>
                  <span class="text-muted">/</span>
                  <button
                    type="button"
                    class={`rounded px-1.5 py-0.5 text-primary hover:underline ${hover() === c.id ? "ring-2 ring-primary" : ""}`}
                    onClick={() => navigate(c.id)}
                    onDragOver={(e) => onTargetOver(e, c.id)}
                    onDragLeave={() => setHover(null)}
                    onDrop={(e) => onTargetDrop(e, c.id)}
                  >
                    {c.name}
                  </button>
                </>
              )}
            </For>
          </nav>
        </Show>

        <Show when={selected().length > 0}>
          <div class="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/5 px-3 py-2 text-sm">
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
            <button
              type="button"
              class="ml-auto text-muted hover:text-highlighted"
              onClick={() => setSelected([])}
            >
              Clear
            </button>
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
          <Loading when={loading() && assets().length === 0 && subfolders().length === 0}>
            <Show
              when={subfolders().length || assets().length}
              fallback={
                <Empty
                  icon="i-lucide-image"
                  title={cmsT("text.no-files")}
                  description="Drop files here, upload, or create a folder."
                />
              }
            >
              <Show
                when={view() === "grid"}
                fallback={
                  <div class="overflow-x-auto rounded-lg border border-default">
                    <table class="w-full text-left text-sm">
                      <thead class="bg-elevated text-xs uppercase text-muted">
                        <tr>
                          <th class="w-8 px-2 py-2" />
                          <th class="w-14 px-2 py-2" />
                          <th class="px-2 py-2">Name</th>
                          <th class="px-2 py-2">Type</th>
                          <th class="px-2 py-2">Size</th>
                          <th class="px-2 py-2">Dimensions</th>
                          <th class="px-2 py-2">Uploaded</th>
                        </tr>
                      </thead>
                      <tbody>
                        <For each={subfolders()}>
                          {(f) => {
                            const s: Selection = { kind: "folder", id: f.id };
                            return (
                              <tr
                                class="cursor-pointer border-t border-default hover:bg-elevated"
                                draggable="true"
                                onDragStart={(e) => onItemDragStart(e, s)}
                                onDragOver={(e) => onTargetOver(e, f.id)}
                                onDragLeave={() => setHover(null)}
                                onDrop={(e) => onTargetDrop(e, f.id)}
                                onClick={() => navigate(f.id)}
                              >
                                <td class="px-2 py-2" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="checkbox"
                                    checked={isSelected(s)}
                                    onChange={() => toggle(s)}
                                    aria-label={`Select ${f.name}`}
                                  />
                                </td>
                                <td class="px-2 py-2">
                                  <span class="i-lucide-folder size-5 text-primary" />
                                </td>
                                <td class="px-2 py-2 font-medium text-highlighted">{f.name}</td>
                                <td class="px-2 py-2 text-muted">Folder</td>
                                <td />
                                <td />
                                <td />
                              </tr>
                            );
                          }}
                        </For>
                        <For each={assets()}>
                          {(a) => {
                            const s: Selection = { kind: "file", id: a.id };
                            return (
                              <tr
                                class="cursor-pointer border-t border-default hover:bg-elevated"
                                draggable="true"
                                onDragStart={(e) => onItemDragStart(e, s)}
                                onClick={(e) => onTileClick(e, a)}
                              >
                                <td class="px-2 py-2" onClick={(e) => e.stopPropagation()}>
                                  <input
                                    type="checkbox"
                                    checked={isSelected(s)}
                                    onChange={() => toggle(s)}
                                    aria-label={`Select ${a.filename}`}
                                  />
                                </td>
                                <td class="px-2 py-2">
                                  <Show
                                    when={a.mimeType.startsWith("image/")}
                                    fallback={<span class="i-lucide-file size-5 text-muted" />}
                                  >
                                    <div class="size-10 overflow-hidden rounded bg-elevated">
                                      <RLImage
                                        src={thumb(a)}
                                        alt={a.alt?.[locales[0] ?? "en"] ?? a.filename}
                                        lightbox={false}
                                        class="size-full object-cover"
                                      />
                                    </div>
                                  </Show>
                                </td>
                                <td class="px-2 py-2 font-medium text-highlighted">{a.filename}</td>
                                <td class="px-2 py-2 text-muted">{a.mimeType}</td>
                                <td class="px-2 py-2 text-muted">{kb(a.size)}</td>
                                <td class="px-2 py-2 text-muted">
                                  {a.width && a.height ? `${a.width} × ${a.height}` : "—"}
                                </td>
                                <td class="px-2 py-2 text-muted">
                                  {new Date(a.createdAt).toLocaleDateString()}
                                </td>
                              </tr>
                            );
                          }}
                        </For>
                      </tbody>
                    </table>
                  </div>
                }
              >
                <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                  <For each={subfolders()}>
                    {(f) => {
                      const s: Selection = { kind: "folder", id: f.id };
                      return (
                        <div
                          class={`group relative flex flex-col overflow-hidden rounded-lg border border-default ${
                            hover() === f.id || isSelected(s) ? "ring-2 ring-primary" : ""
                          }`}
                          draggable="true"
                          onDragStart={(e) => onItemDragStart(e, s)}
                          onDragOver={(e) => onTargetOver(e, f.id)}
                          onDragLeave={() => setHover(null)}
                          onDrop={(e) => onTargetDrop(e, f.id)}
                        >
                          <input
                            type="checkbox"
                            class="absolute left-2 top-2 z-10 size-4 accent-primary"
                            checked={isSelected(s)}
                            aria-label={`Select ${f.name}`}
                            onChange={() => toggle(s)}
                          />
                          <button
                            type="button"
                            class="flex aspect-[4/3] items-center justify-center bg-elevated"
                            onClick={() => navigate(f.id)}
                          >
                            <span class="i-lucide-folder size-12 text-primary" />
                          </button>
                          <div
                            class="px-2 py-1.5 text-[11px] text-highlighted truncate"
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
                          draggable="true"
                          onDragStart={(e) => onItemDragStart(e, s)}
                        >
                          <input
                            type="checkbox"
                            class="absolute left-2 top-2 z-10 size-4 accent-primary"
                            checked={isSelected(s)}
                            aria-label={`Select ${a.filename}`}
                            onChange={() => toggle(s)}
                          />
                          <button
                            type="button"
                            class="flex aspect-[4/3] items-center justify-center overflow-hidden bg-elevated"
                            onClick={(e) => onTileClick(e, a)}
                          >
                            <Show
                              when={a.mimeType.startsWith("image/")}
                              fallback={<span class="i-lucide-file size-10 text-muted" />}
                            >
                              <RLImage
                                src={thumb(a)}
                                alt={a.alt?.[locales[0] ?? "en"] ?? a.filename}
                                lightbox={false}
                                class="size-full object-cover"
                              />
                            </Show>
                          </button>
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
            <RLButton variant="ghost" color="neutral" onClick={closeDialog}>
              Cancel
            </RLButton>
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
            <FolderTree
              folders={folders()}
              current={moveTarget()}
              hover={null}
              onSelect={setMoveTarget}
              onDragOver={() => {}}
              onDrop={() => {}}
              onDragLeave={() => {}}
            />
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
            onCrop={(asset) => setDialog({ kind: "crop", asset })}
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

      {/* Crop */}
      <Show
        when={dialog()?.kind === "crop" ? (dialog() as Extract<Dialog, { kind: "crop" }>) : null}
      >
        {(d) => (
          <CropDialog
            asset={d().asset}
            onClose={() => setDialog({ kind: "detail", asset: d().asset })}
            onSaved={async () => {
              setDialog(null);
              await refresh();
            }}
          />
        )}
      </Show>
    </div>
  );
};

/** Detail dialog: details, editing (per-locale alt and caption, focal point, replace), usage. */
const AssetDetail: Component<{
  asset: MediaAssetRecord;
  folders: MediaFolderRecord[];
  locales: string[];
  onClose: () => void;
  onChanged: () => Promise<void>;
  onCrop: (asset: MediaAssetRecord) => void;
  onDelete: (asset: MediaAssetRecord) => void;
  onMove: (asset: MediaAssetRecord) => void;
}> = (props) => {
  const { api, toast } = useDashboard();
  const [tab, setTab] = createSignal("details");
  const [filename, setFilename] = createSignal(props.asset.filename);
  const [alt, setAlt] = createSignal<Record<string, string>>({ ...props.asset.alt });
  const [caption, setCaption] = createSignal<Record<string, string>>({
    ...props.asset.caption,
  });
  const [focal, setFocal] = createSignal<{ x: number | null; y: number | null }>({
    x: props.asset.focalX,
    y: props.asset.focalY,
  });
  const [current, setCurrent] = createSignal<MediaAssetRecord>(props.asset);
  const [saving, setSaving] = createSignal(false);
  let imageWrap: HTMLDivElement | undefined;
  const isImage = () => current().mimeType.startsWith("image/");
  const locales = () => (props.locales.length ? props.locales : ["en"]);

  const save = async () => {
    setSaving(true);
    try {
      await api.media.update(current().id, {
        filename: filename(),
        alt: alt(),
        caption: caption(),
        focalX: focal().x,
        focalY: focal().y,
      });
      toast("Saved", "success");
      await props.onChanged();
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setSaving(false);
    }
  };

  const setFocalFromClick = (e: MouseEvent) => {
    if (!imageWrap) return;
    const rect = imageWrap.getBoundingClientRect();
    const x = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
    const y = Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1);
    setFocal({ x: Number(x.toFixed(3)), y: Number(y.toFixed(3)) });
  };

  const replace = async (file: File) => {
    try {
      const size = isImage() ? await readImageSize(file) : null;
      const updated = await api.media.replace(current().id, file, size ?? {});
      setCurrent({ ...current(), ...updated });
      toast("Replaced. The file has a new URL.", "success");
      await props.onChanged();
    } catch (err) {
      toast((err as Error).message, "error");
    }
  };

  const folderItems = () => [
    { label: "All files", value: "" },
    ...props.folders
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((f) => ({ label: f.name, value: f.id })),
  ];

  return (
    <Modal open={true} title={current().filename} onClose={props.onClose} wide>
      <div class="grid gap-4 md:grid-cols-[1fr_1fr]">
        <div class="flex flex-col gap-3">
          <div
            ref={(el) => (imageWrap = el)}
            class="relative flex min-h-48 items-center justify-center overflow-hidden rounded-lg bg-elevated"
            onClick={(e) => {
              if (tab() === "edit" && isImage()) setFocalFromClick(e);
            }}
          >
            <Show when={isImage()} fallback={<span class="i-lucide-file size-16 text-muted" />}>
              <RLImage
                src={current().previewUrl ?? current().url}
                alt={alt()[locales()[0]!] ?? current().filename}
                lightbox={false}
                class="max-h-[50vh] w-auto object-contain"
              />
            </Show>
            <Show when={focal().x !== null && focal().y !== null && isImage()}>
              <span
                class="pointer-events-none absolute size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-primary shadow"
                style={{
                  left: `${(focal().x ?? 0.5) * 100}%`,
                  top: `${(focal().y ?? 0.5) * 100}%`,
                }}
              />
            </Show>
          </div>
          <Show when={tab() === "edit" && isImage()}>
            <p class="text-xs text-muted">Click the image to set the focal point.</p>
          </Show>
        </div>

        <div class="flex flex-col gap-3">
          <RLTabs
            items={[
              { label: "Details", value: "details" },
              { label: "Edit", value: "edit" },
              { label: "Used in", value: "used" },
            ]}
            value={tab()}
            onValueChange={(v: string) => setTab(v)}
          />

          <Show when={tab() === "details"}>
            <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
              <dt class="text-muted">Type</dt>
              <dd>{current().mimeType}</dd>
              <dt class="text-muted">Size</dt>
              <dd>{kb(current().size)}</dd>
              <dt class="text-muted">Dimensions</dt>
              <dd>
                {current().width && current().height
                  ? `${current().width} × ${current().height}`
                  : "—"}
              </dd>
              <dt class="text-muted">Uploaded</dt>
              <dd>{new Date(current().createdAt).toLocaleString()}</dd>
              <dt class="text-muted">URL</dt>
              <dd class="break-all">
                <button
                  type="button"
                  class="text-left text-primary hover:underline"
                  onClick={() => {
                    void navigator.clipboard.writeText(current().url);
                    toast("URL copied");
                  }}
                >
                  {current().url}
                </button>
              </dd>
            </dl>
            <div class="flex flex-wrap gap-2">
              <RLButton
                variant="outline"
                color="neutral"
                leadingIcon="i-lucide-move"
                onClick={() => props.onMove(current())}
              >
                Move
              </RLButton>
              <RLButton
                variant="outline"
                color="error"
                leadingIcon="i-lucide-trash-2"
                onClick={() => props.onDelete(current())}
              >
                Delete
              </RLButton>
            </div>
          </Show>

          <Show when={tab() === "edit"}>
            <div class="flex flex-col gap-3">
              <label class="flex flex-col gap-1 text-sm">
                <span class="font-medium text-toned">Filename</span>
                <RLInput value={filename()} onInput={(e) => setFilename(e.currentTarget.value)} />
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
              <label class="flex flex-col gap-1 text-sm">
                <span class="font-medium text-toned">Folder</span>
                <RLSelect
                  value={current().folderId ?? ""}
                  items={folderItems()}
                  onChange={async (e) => {
                    const next = e.currentTarget.value || null;
                    try {
                      await api.media.update(current().id, { folderId: next });
                      setCurrent({ ...current(), folderId: next });
                      await props.onChanged();
                    } catch (err) {
                      toast((err as Error).message, "error");
                    }
                  }}
                />
              </label>
              <div class="flex flex-wrap gap-2">
                <Show when={isImage()}>
                  <RLButton
                    variant="outline"
                    color="neutral"
                    leadingIcon="i-lucide-crop"
                    onClick={() => props.onCrop(current())}
                  >
                    Crop (save as copy)
                  </RLButton>
                  <Show when={focal().x !== null}>
                    <RLButton
                      variant="ghost"
                      color="neutral"
                      onClick={() => setFocal({ x: null, y: null })}
                    >
                      Clear focal point
                    </RLButton>
                  </Show>
                </Show>
                <label class="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-default px-3 py-1.5 text-sm hover:bg-elevated">
                  <span class="i-lucide-replace size-4" />
                  Replace file
                  <input
                    type="file"
                    class="hidden"
                    accept={isImage() ? "image/*" : undefined}
                    onChange={(e) => {
                      const file = e.currentTarget.files?.[0];
                      if (file) void replace(file);
                      e.currentTarget.value = "";
                    }}
                  />
                </label>
              </div>
              <RLButton color="primary" loading={saving()} onClick={() => void save()}>
                Save
              </RLButton>
            </div>
          </Show>

          <Show when={tab() === "used"}>
            <UsedIn assetId={current().id} />
          </Show>
        </div>
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
    <div class="flex flex-col gap-2 text-sm">
      <Show when={!error()} fallback={<p class="text-error-500">{error()}</p>}>
        <Show when={usage()} fallback={<p class="text-muted">Checking where this file is used…</p>}>
          {(list) => (
            <Show
              when={list().length}
              fallback={<p class="text-muted">Not used by any page yet.</p>}
            >
              <p class="text-xs text-muted">
                Used by {list().length} {list().length === 1 ? "page" : "pages"}. Deleting it breaks
                these images.
              </p>
              <ul class="flex flex-col divide-y divide-default rounded-md border border-default">
                <For each={list()}>
                  {(u) => (
                    <li class="flex items-center justify-between gap-2 px-3 py-2">
                      <span class="min-w-0 truncate text-highlighted">{titleOf(u)}</span>
                      <span class="shrink-0 text-xs text-muted">
                        {u.type} · {u.status === "draft" ? "draft only" : "published"}
                      </span>
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

/**
 * Crop with drag handles: drag the box to move it, the corners and edges to resize. An aspect ratio
 * locks the shape. The crop is saved as a new file; the original stays untouched.
 */
const CropDialog: Component<{
  asset: MediaAssetRecord;
  onClose: () => void;
  onSaved: () => Promise<void>;
}> = (props) => {
  const { api, toast } = useDashboard();
  const [aspect, setAspect] = createSignal<string>("free");
  const [rect, setRect] = createSignal<CropRect>({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
  const [busy, setBusy] = createSignal(false);
  const [natural, setNatural] = createSignal<{ w: number; h: number }>({
    w: props.asset.width ?? 1,
    h: props.asset.height ?? 1,
  });
  let wrap: HTMLDivElement | undefined;
  let img: HTMLImageElement | undefined;
  let drag: CropDrag | null = null;

  /** Aspect as width/height in image pixels, or null when free. */
  const ratio = () => {
    const v = aspect();
    if (v === "free") return null;
    const [w, h] = v.split(":").map(Number);
    return w && h ? w / h : null;
  };

  /** Applies the aspect lock to a rect, keeping the anchored corner or edge fixed. */
  const lockAspect = (
    r: CropRect,
    anchor: { x: "l" | "r" | "c"; y: "t" | "b" | "c" },
  ): CropRect => {
    const want = ratio();
    if (!want) return r;
    const { w: iw, h: ih } = natural();
    // Work in pixels so the ratio is the real image ratio, not the fractional one.
    const pxW = r.w * iw;
    const pxH = pxW / want;
    let h = pxH / ih;
    let w = r.w;
    if (h > r.h + 1e-9) {
      // Height is the limiting side: grow width instead.
      h = r.h;
      w = (h * ih * want) / iw;
    }
    const x = anchor.x === "l" ? r.x : anchor.x === "r" ? r.x + r.w - w : r.x + (r.w - w) / 2;
    const y = anchor.y === "t" ? r.y : anchor.y === "b" ? r.y + r.h - h : r.y + (r.h - h) / 2;
    return {
      x: clamp(x, 0, 1 - w),
      y: clamp(y, 0, 1 - h),
      w,
      h,
    };
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
    const anchor = {
      x: l ? ("r" as const) : r ? ("l" as const) : ("c" as const),
      y: t ? ("b" as const) : b ? ("t" as const) : ("c" as const),
    };
    setRect(lockAspect(next, anchor));
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

  const onHandleDown = (
    e: PointerEvent,
    edges: { l: boolean; r: boolean; t: boolean; b: boolean },
  ) => startDrag(e, { mode: "resize", edges, startX: e.clientX, startY: e.clientY, start: rect() });

  const onBoxDown = (e: PointerEvent) =>
    startDrag(e, { mode: "move", startX: e.clientX, startY: e.clientY, start: rect() });

  const setAspectTo = (v: string) => {
    setAspect(v);
    const r = ratio();
    if (r) setRect(lockAspect(rect(), { x: "c", y: "c" }));
  };

  const onImageLoad = () => {
    if (!img) return;
    setNatural({ w: img.naturalWidth || 1, h: img.naturalHeight || 1 });
    // Start with the largest centred box in the chosen shape.
    setRect(lockAspect({ x: 0, y: 0, w: 1, h: 1 }, { x: "c", y: "c" }));
    const want = ratio();
    if (!want) setRect({ x: 0.1, y: 0.1, w: 0.8, h: 0.8 });
  };

  const save = async () => {
    if (!img) return;
    const r = rect();
    const { w: iw, h: ih } = natural();
    const sx = Math.round(r.x * iw);
    const sy = Math.round(r.y * ih);
    const sw = Math.max(1, Math.round(r.w * iw));
    const sh = Math.max(1, Math.round(r.h * ih));
    const maxSide = 1600;
    const scale = Math.min(1, maxSide / Math.max(sw, sh));
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(sw * scale));
    canvas.height = Math.max(1, Math.round(sh * scale));
    canvas.getContext("2d")?.drawImage(img, sx, sy, sw, sh, 0, 0, canvas.width, canvas.height);
    setBusy(true);
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/webp", 0.9),
      );
      if (!blob) throw new Error("Could not create the cropped image.");
      const base = props.asset.filename.replace(/\.[^.]+$/, "");
      const file = new File([blob], `${base}-crop.webp`, { type: "image/webp" });
      await api.media.upload(file, {
        folderId: props.asset.folderId,
        width: canvas.width,
        height: canvas.height,
      });
      toast("Cropped copy saved", "success");
      await props.onSaved();
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setBusy(false);
    }
  };

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

  return (
    <Modal
      open={true}
      title="Crop"
      onClose={props.onClose}
      wide
      footer={
        <>
          <RLButton variant="ghost" color="neutral" onClick={props.onClose}>
            Back
          </RLButton>
          <RLButton color="primary" loading={busy()} onClick={() => void save()}>
            Save as copy
          </RLButton>
        </>
      }
    >
      <div class="flex flex-col gap-3">
        <RLSelect
          class="w-48"
          value={aspect()}
          items={[
            { label: "Free", value: "free" },
            { label: "Square (1:1)", value: "1:1" },
            { label: "4:3", value: "4:3" },
            { label: "16:9", value: "16:9" },
            { label: "3:2", value: "3:2" },
          ]}
          onChange={(e) => setAspectTo(e.currentTarget.value)}
        />
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
              class="block max-h-[60vh] max-w-full"
              onLoad={onImageLoad}
            />
            <div
              class="absolute cursor-move border-2 border-white"
              style={{
                left: `${rect().x * 100}%`,
                top: `${rect().y * 100}%`,
                width: `${rect().w * 100}%`,
                height: `${rect().h * 100}%`,
                "box-shadow": "0 0 0 9999px rgba(0,0,0,0.55)",
              }}
              onPointerDown={onBoxDown}
            >
              <For each={handles}>
                {(h) => (
                  <span
                    class={`absolute size-3 rounded-sm border border-white bg-primary ${h.cls}`}
                    aria-label={`Resize ${h.name}`}
                    onPointerDown={(e) => onHandleDown(e, h.edges)}
                  />
                )}
              </For>
            </div>
          </div>
        </div>
        <p class="text-xs text-muted">
          Drag the box to move it, or the handles to resize. The original file is not changed.
        </p>
      </div>
    </Modal>
  );
};

export const MediaLibrary: Component = () => (
  <div>
    <PageHeader
      icon="i-lucide-image"
      title={cmsT("text.media")}
      description="Images and files stored in your bucket. Drag files anywhere on this page to upload."
    />
    <div class="p-6">
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

import { For, Show, createMemo, createSignal, onSettled, type Component } from "solid-js";
import { useDashboard } from "../context";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { RLInput } from "@rimelight/ui/components/input/RLInput.tsx";
import { RLSelect } from "@rimelight/ui/components/select/RLSelect.tsx";
import { RLImage } from "@rimelight/ui/components/image/RLImage.tsx";
import { Empty, Loading, Modal, PageHeader } from "../ui";
import { cmsT } from "../../locale";

interface MediaFile {
  key: string;
  /** Key relative to the storage base prefix (what folders are made of). */
  path: string;
  name: string;
  /** Public URL (CDN), for copying into content. */
  url: string;
  /** Same-origin URL for previews. */
  previewUrl?: string | undefined;
  mimeType: string;
  size: number;
  uploadedAt: string;
}

interface Listing {
  base: string;
  files: MediaFile[];
  /** Every folder in the bucket, relative to the base, e.g. `images/`, `images/projects/`. */
  folders: string[];
}

/** Something the user can select, drag or act on. */
type Item = { kind: "file"; key: string; path: string } | { kind: "folder"; path: string };

type Dialog =
  | { kind: "newFolder" }
  | { kind: "move"; items: Item[] }
  | { kind: "delete"; items: Item[] }
  | { kind: "preview"; file: MediaFile };

const DRAG_TYPE = "application/x-rimelight-media";

const kb = (n: number) => (n > 1e6 ? `${(n / 1e6).toFixed(1)} MB` : `${Math.ceil(n / 1e3)} KB`);
const folderName = (path: string) => path.replace(/\/$/, "").split("/").pop() ?? path;
/** Directory of a relative file path, with trailing slash ("" for the root). */
const dirOf = (rel: string) => (rel.includes("/") ? rel.slice(0, rel.lastIndexOf("/") + 1) : "");
const itemId = (i: Item) => (i.kind === "file" ? `f:${i.key}` : `d:${i.path}`);
const isChildFolder = (parent: string, folder: string) =>
  folder !== parent &&
  folder.startsWith(parent) &&
  folder.slice(parent.length).split("/").filter(Boolean).length === 1;

const matchesType = (f: MediaFile, type: string) => {
  if (type === "all") return true;
  if (type === "images") return f.mimeType.startsWith("image/");
  if (type === "videos") return f.mimeType.startsWith("video/");
  if (type === "audio") return f.mimeType.startsWith("audio/");
  return (
    f.mimeType.includes("pdf") || f.mimeType.includes("text") || f.mimeType.includes("document")
  );
};

/** Folder tree on the left. Clicking selects; folders are drop targets for drag and drop. */
const FolderTree: Component<{
  folders: string[];
  current: string;
  hover: string | null;
  onSelect: (path: string) => void;
  onDragOver: (e: DragEvent, path: string) => void;
  onDrop: (e: DragEvent, path: string) => void;
  onDragLeave: () => void;
}> = (props) => {
  const TreeNode: Component<{ path: string; depth: number }> = (node) => {
    const kids = () => props.folders.filter((f) => isChildFolder(node.path, f));
    const [open, setOpen] = createSignal(node.depth === 0 || props.current.startsWith(node.path));
    return (
      <div>
        <div
          class={`flex cursor-pointer items-center gap-1 rounded py-1 pr-2 text-sm ${
            props.current === node.path ? "bg-primary/10 text-primary" : "text-highlighted"
          } ${props.hover === node.path ? "ring-2 ring-primary" : ""}`}
          style={{ "padding-left": `${node.depth * 12 + 4}px` }}
          onClick={() => props.onSelect(node.path)}
          onDragOver={(e) => props.onDragOver(e, node.path)}
          onDragLeave={() => props.onDragLeave()}
          onDrop={(e) => props.onDrop(e, node.path)}
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
            class={
              open()
                ? "i-lucide-folder-open size-4 text-primary"
                : "i-lucide-folder size-4 text-primary"
            }
          />
          <span class="min-w-0 truncate">
            {node.path === "" ? "All files" : folderName(node.path)}
          </span>
        </div>
        <Show when={open()}>
          <For each={kids()}>{(child) => <TreeNode path={child} depth={node.depth + 1} />}</For>
        </Show>
      </div>
    );
  };
  return <TreeNode path="" depth={0} />;
};

/**
 * File manager: folder tree, breadcrumbs, drag and drop moves, multi-select batch actions,
 * previews and uploads. The whole bucket is loaded once; browsing, search and the tree run locally.
 * Used as the page and inside the picker (where clicking a file picks it).
 */
const MediaGrid: Component<{ onPick?: (file: MediaFile) => void }> = (props) => {
  const { api, toast } = useDashboard();
  const [listing, setListing] = createSignal<Listing | null>(null);
  const [loading, setLoading] = createSignal(false);
  const [loadError, setLoadError] = createSignal<string | null>(null);
  const [current, setCurrent] = createSignal(""); // "a/b/" form, "" = root
  const [search, setSearch] = createSignal("");
  const [type, setType] = createSignal("all");
  const [selected, setSelected] = createSignal<Item[]>([]);
  const [dialog, setDialog] = createSignal<Dialog | null>(null);
  const [moveTarget, setMoveTarget] = createSignal("");
  const [newName, setNewName] = createSignal("");
  const [uploading, setUploading] = createSignal(false);
  const [hover, setHover] = createSignal<string | null>(null);
  let fileInput: HTMLInputElement | undefined;
  let seq = 0;

  const load = async () => {
    const id = ++seq;
    setLoading(true);
    try {
      const res = await api.media.list({ all: true });
      if (id === seq) {
        setListing(res.data as Listing);
        setLoadError(null);
      }
    } catch (err) {
      if (id === seq) setLoadError((err as Error).message);
    } finally {
      if (id === seq) setLoading(false);
    }
  };
  onSettled(() => void load());

  const filtering = () => search().trim() !== "" || type() !== "all";
  const folders = () => listing()?.folders ?? [];

  const subfolders = createMemo(() =>
    filtering() ? [] : folders().filter((f) => isChildFolder(current(), f)),
  );
  const files = createMemo(() => {
    const all = listing()?.files ?? [];
    if (filtering()) {
      const q = search().trim().toLowerCase();
      return all.filter(
        (f) =>
          matchesType(f, type()) &&
          (q === "" || f.name.toLowerCase().includes(q) || f.path.toLowerCase().includes(q)),
      );
    }
    return all.filter((f) => dirOf(f.path) === current());
  });
  const crumbs = createMemo(() => {
    const parts = current().split("/").filter(Boolean);
    return parts.map((name, i) => ({ name, path: `${parts.slice(0, i + 1).join("/")}/` }));
  });

  const navigate = (path: string) => setCurrent(path);
  const isSelected = (i: Item) => selected().some((s) => itemId(s) === itemId(i));
  const toggle = (i: Item) =>
    setSelected((prev) =>
      prev.some((s) => itemId(s) === itemId(i))
        ? prev.filter((s) => itemId(s) !== itemId(i))
        : [...prev, i],
    );
  const fileItem = (f: MediaFile): Item => ({ kind: "file", key: f.key, path: f.path });
  const folderItem = (path: string): Item => ({ kind: "folder", path });

  /** Dragging a selected item drags the whole selection; otherwise just that item. */
  const dragItems = (i: Item) => (isSelected(i) ? selected() : [i]);
  const isInternalDrag = (e: DragEvent) =>
    Array.from(e.dataTransfer?.types ?? []).includes(DRAG_TYPE);

  const onItemDragStart = (e: DragEvent, i: Item) => {
    e.dataTransfer?.setData(DRAG_TYPE, JSON.stringify(dragItems(i)));
    if (e.dataTransfer) e.dataTransfer.effectAllowed = "move";
  };
  const onFolderDragOver = (e: DragEvent, target: string) => {
    if (!isInternalDrag(e)) return;
    e.preventDefault();
    if (e.dataTransfer) e.dataTransfer.dropEffect = "move";
    setHover(target);
  };
  const onFolderDrop = (e: DragEvent, target: string) => {
    if (!isInternalDrag(e)) return;
    e.preventDefault();
    e.stopPropagation();
    setHover(null);
    const items = JSON.parse(e.dataTransfer?.getData(DRAG_TYPE) || "[]") as Item[];
    void moveItems(items, target);
  };

  /** Moves items into `target` (a folder path, "" = root). Skips no-ops and folders into themselves. */
  const moveItems = async (items: Item[], target: string) => {
    const valid = items.filter((i) =>
      i.kind === "file"
        ? dirOf(i.path) !== target
        : target !== i.path && !target.startsWith(i.path) && parentOf(i.path) !== target,
    );
    if (valid.length === 0) return;
    const results = await Promise.allSettled(
      valid.map((i) =>
        api.media.move(
          i.kind === "file"
            ? { kind: "file", key: i.key, folder: target }
            : { kind: "folder", path: i.path, folder: target },
        ),
      ),
    );
    const failed = results.filter((r) => r.status === "rejected");
    if (failed.length) {
      toast(`${failed.length} of ${valid.length} could not be moved`, "error");
    } else {
      toast(`Moved ${valid.length} item(s)`, "success");
    }
    setSelected([]);
    await load();
  };

  const deleteItems = async (items: Item[]) => {
    const results = await Promise.allSettled(
      items.map((i) =>
        i.kind === "file" ? api.media.remove(i.key) : api.media.removeFolder(i.path),
      ),
    );
    const failed = results.filter((r) => r.status === "rejected").length;
    toast(
      failed
        ? `${failed} of ${items.length} could not be deleted`
        : `Deleted ${items.length} item(s)`,
      failed ? "error" : "success",
    );
    setSelected([]);
    await load();
  };

  const upload = async (list: FileList | null) => {
    if (!list?.length) return;
    setUploading(true);
    try {
      for (const file of Array.from(list)) await api.media.upload(file, current());
      toast(`Uploaded ${list.length} file(s)`, "success");
      await load();
    } catch (err) {
      toast((err as Error).message, "error");
    } finally {
      setUploading(false);
    }
  };

  const createFolder = async () => {
    const name = newName().trim();
    if (!name) return;
    try {
      await api.media.createFolder(`${current()}${name}`);
      toast("Folder created", "success");
      setDialog(null);
      setNewName("");
      await load();
    } catch (err) {
      toast((err as Error).message, "error");
    }
  };

  const openMove = (items: Item[]) => {
    setMoveTarget(current());
    setDialog({ kind: "move", items });
  };

  const selectedCount = () => selected().length;
  const dialogFile = () => {
    const d = dialog();
    return d && d.kind === "preview" ? d.file : null;
  };
  const dialogItems = () => {
    const d = dialog();
    return d && (d.kind === "move" || d.kind === "delete") ? d.items : [];
  };
  const close = () => setDialog(null);

  return (
    <div class="flex min-h-[60vh] gap-4">
      <aside class="w-56 shrink-0 overflow-y-auto rounded-lg border border-default p-2">
        <Show
          when={listing()}
          fallback={
            <Loading when={loading()}>
              <span />
            </Loading>
          }
        >
          <FolderTree
            folders={folders()}
            current={current()}
            hover={hover()}
            onSelect={navigate}
            onDragOver={onFolderDragOver}
            onDrop={onFolderDrop}
            onDragLeave={() => setHover(null)}
          />
        </Show>
      </aside>

      <div
        class="flex min-w-0 flex-1 flex-col gap-3"
        onDragOver={(e) => {
          if (!isInternalDrag(e)) e.preventDefault();
        }}
        onDrop={(e) => {
          if (isInternalDrag(e)) return;
          e.preventDefault();
          void upload(e.dataTransfer?.files ?? null);
        }}
      >
        <div class="flex flex-wrap items-center gap-2">
          <RLInput
            class="max-w-xs"
            placeholder={cmsT("text.search-files")}
            value={search()}
            onInput={(e) => setSearch(e.currentTarget.value)}
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
            onChange={(e) => setType(e.currentTarget.value)}
          />
          <div class="ml-auto flex items-center gap-2">
            <RLButton
              color="neutral"
              variant="outline"
              leadingIcon="i-lucide-folder-plus"
              disabled={filtering()}
              onClick={() => setDialog({ kind: "newFolder" })}
            >
              New folder
            </RLButton>
            <RLButton
              color="primary"
              leadingIcon={uploading() ? "i-lucide-loader-circle" : "i-lucide-upload"}
              loading={uploading()}
              onClick={() => fileInput?.click()}
            >
              Upload
            </RLButton>
            <input
              ref={(el) => (fileInput = el)}
              type="file"
              multiple
              class="hidden"
              onChange={(e) => void upload(e.currentTarget.files)}
            />
          </div>
        </div>

        <Show
          when={!filtering()}
          fallback={<p class="text-sm text-muted">Showing matches from every folder.</p>}
        >
          <nav class="flex flex-wrap items-center gap-1 text-sm">
            <button
              type="button"
              class={`rounded px-1.5 py-0.5 hover:underline ${hover() === "" ? "ring-2 ring-primary" : ""} text-primary`}
              onClick={() => navigate("")}
              onDragOver={(e) => onFolderDragOver(e, "")}
              onDragLeave={() => setHover(null)}
              onDrop={(e) => onFolderDrop(e, "")}
            >
              All files
            </button>
            <For each={crumbs()}>
              {(c) => (
                <>
                  <span class="text-muted">/</span>
                  <button
                    type="button"
                    class={`rounded px-1.5 py-0.5 text-primary hover:underline ${hover() === c.path ? "ring-2 ring-primary" : ""}`}
                    onClick={() => navigate(c.path)}
                    onDragOver={(e) => onFolderDragOver(e, c.path)}
                    onDragLeave={() => setHover(null)}
                    onDrop={(e) => onFolderDrop(e, c.path)}
                  >
                    {c.name}
                  </button>
                </>
              )}
            </For>
          </nav>
        </Show>

        <Show when={selectedCount() > 0}>
          <div class="flex items-center gap-2 rounded-lg border border-primary/40 bg-primary/5 px-3 py-2 text-sm">
            <span class="font-medium text-highlighted">{selectedCount()} selected</span>
            <RLButton
              size="xs"
              color="neutral"
              variant="outline"
              leadingIcon="i-lucide-move"
              onClick={() => openMove(selected())}
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
          <Loading when={loading() && !listing()}>
            <Show
              when={subfolders().length || files().length}
              fallback={
                <Empty
                  icon="i-lucide-image"
                  title={cmsT("text.no-files")}
                  description="Drop files here, upload, or create a folder."
                />
              }
            >
              <div class="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
                <For each={subfolders()}>
                  {(path) => {
                    const item = folderItem(path);
                    return (
                      <div
                        class={`group relative flex flex-col overflow-hidden rounded-lg border border-default ${hover() === path ? "ring-2 ring-primary" : ""} ${isSelected(item) ? "ring-2 ring-primary" : ""}`}
                        draggable="true"
                        onDragStart={(e) => onItemDragStart(e, item)}
                        onDragOver={(e) => onFolderDragOver(e, path)}
                        onDragLeave={() => setHover(null)}
                        onDrop={(e) => onFolderDrop(e, path)}
                      >
                        <input
                          type="checkbox"
                          class="absolute left-2 top-2 z-10 size-4 accent-primary"
                          checked={isSelected(item)}
                          aria-label={`Select ${folderName(path)}`}
                          onChange={() => toggle(item)}
                        />
                        <button
                          type="button"
                          class="flex aspect-[4/3] items-center justify-center bg-elevated"
                          onClick={() => navigate(path)}
                        >
                          <span class="i-lucide-folder size-12 text-primary" />
                        </button>
                        <div class="flex items-center gap-1 px-2 py-1.5 text-[11px]">
                          <span class="min-w-0 flex-1 truncate text-highlighted" title={path}>
                            {folderName(path)}
                          </span>
                        </div>
                      </div>
                    );
                  }}
                </For>
                <For each={files()}>
                  {(f) => {
                    const item = fileItem(f);
                    return (
                      <div
                        class={`group relative flex flex-col overflow-hidden rounded-lg border border-default ${isSelected(item) ? "ring-2 ring-primary" : ""}`}
                        draggable="true"
                        onDragStart={(e) => onItemDragStart(e, item)}
                      >
                        <input
                          type="checkbox"
                          class="absolute left-2 top-2 z-10 size-4 accent-primary"
                          checked={isSelected(item)}
                          aria-label={`Select ${f.name}`}
                          onChange={() => toggle(item)}
                        />
                        <button
                          type="button"
                          class="flex aspect-[4/3] items-center justify-center overflow-hidden bg-elevated"
                          onClick={(e) => {
                            if (e.ctrlKey || e.metaKey || selectedCount() > 0) {
                              toggle(item);
                              return;
                            }
                            if (props.onPick) props.onPick(f);
                            else setDialog({ kind: "preview", file: f });
                          }}
                        >
                          <Show
                            when={f.mimeType.startsWith("image/")}
                            fallback={<span class="i-lucide-file size-10 text-muted" />}
                          >
                            <RLImage
                              src={f.previewUrl ?? f.url}
                              alt={f.name}
                              lightbox={false}
                              class="size-full object-cover"
                            />
                          </Show>
                        </button>
                        <div class="flex items-center gap-1 px-2 py-1.5 text-[11px]">
                          <span class="min-w-0 flex-1 truncate text-highlighted" title={f.path}>
                            {f.name}
                          </span>
                          <span class="text-muted">{kb(f.size)}</span>
                        </div>
                      </div>
                    );
                  }}
                </For>
              </div>
            </Show>
          </Loading>
        </Show>
      </div>

      <Modal
        open={dialog()?.kind === "newFolder"}
        title="New folder"
        onClose={close}
        footer={
          <>
            <RLButton variant="ghost" color="neutral" onClick={close}>
              Cancel
            </RLButton>
            <RLButton color="primary" onClick={() => void createFolder()}>
              Create
            </RLButton>
          </>
        }
      >
        <div class="flex flex-col gap-2">
          <p class="text-sm text-muted">
            Creates a folder inside {current() ? `"${folderName(current())}"` : "the root"}.
          </p>
          <RLInput
            placeholder="Folder name"
            value={newName()}
            onInput={(e) => setNewName(e.currentTarget.value)}
          />
        </div>
      </Modal>

      <Modal
        open={dialog()?.kind === "move"}
        title={`Move ${dialogItems().length} item(s)`}
        onClose={close}
        wide
        footer={
          <>
            <RLButton variant="ghost" color="neutral" onClick={close}>
              Cancel
            </RLButton>
            <RLButton
              color="primary"
              onClick={() => {
                const items = dialogItems();
                close();
                void moveItems(items, moveTarget());
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
          <p class="text-xs text-muted">
            Destination: {moveTarget() ? `/${moveTarget()}` : "root"}
          </p>
        </div>
      </Modal>

      <Modal
        open={dialog()?.kind === "delete"}
        title="Delete"
        onClose={close}
        footer={
          <>
            <RLButton variant="ghost" color="neutral" onClick={close}>
              Cancel
            </RLButton>
            <RLButton
              color="error"
              onClick={() => {
                const items = dialogItems();
                close();
                void deleteItems(items);
              }}
            >
              Delete
            </RLButton>
          </>
        }
      >
        <p class="text-sm">
          Delete {dialogItems().length} item(s)? Folders are deleted with everything in them.
          Entries using a deleted file will show a broken image.
        </p>
      </Modal>

      <Modal
        open={dialog()?.kind === "preview"}
        title={dialogFile()?.name ?? ""}
        onClose={close}
        wide
        footer={
          <>
            <RLButton
              variant="ghost"
              color="neutral"
              leadingIcon="i-lucide-link"
              onClick={() => {
                const f = dialogFile();
                if (f) {
                  void navigator.clipboard.writeText(f.url);
                  toast("URL copied");
                }
              }}
            >
              Copy URL
            </RLButton>
            <RLButton
              variant="ghost"
              color="neutral"
              leadingIcon="i-lucide-move"
              onClick={() => {
                const f = dialogFile();
                close();
                if (f) openMove([fileItem(f)]);
              }}
            >
              Move
            </RLButton>
            <RLButton
              variant="ghost"
              color="error"
              leadingIcon="i-lucide-trash-2"
              onClick={() => {
                const f = dialogFile();
                close();
                if (f) setDialog({ kind: "delete", items: [fileItem(f)] });
              }}
            >
              Delete
            </RLButton>
          </>
        }
      >
        <Show when={dialogFile()}>
          {(f) => (
            <div class="flex flex-col gap-4">
              <div class="flex items-center justify-center rounded-lg bg-elevated p-4">
                <Show
                  when={f().mimeType.startsWith("image/")}
                  fallback={<span class="i-lucide-file size-16 text-muted" />}
                >
                  <RLImage
                    src={f().previewUrl ?? f().url}
                    alt={f().name}
                    lightbox={false}
                    class="max-h-[60vh] w-auto object-contain"
                  />
                </Show>
              </div>
              <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                <dt class="text-muted">Path</dt>
                <dd class="break-all">/{f().path}</dd>
                <dt class="text-muted">Type</dt>
                <dd>{f().mimeType}</dd>
                <dt class="text-muted">Size</dt>
                <dd>{kb(f().size)}</dd>
                <dt class="text-muted">URL</dt>
                <dd class="break-all">{f().url}</dd>
              </dl>
            </div>
          )}
        </Show>
      </Modal>
    </div>
  );
};

/** Parent folder of a folder path ("a/b/" → "a/", "a/" → ""). */
const parentOf = (path: string) => {
  const trimmed = path.replace(/\/$/, "");
  return trimmed.includes("/") ? trimmed.slice(0, trimmed.lastIndexOf("/") + 1) : "";
};

export const MediaLibrary: Component = () => (
  <div>
    <PageHeader
      icon="i-lucide-image"
      title={cmsT("text.media")}
      description="Images and files stored in your bucket. Drag files anywhere on this page to upload."
    />
    <div class="p-6">
      <MediaGrid />
    </div>
  </div>
);

export const MediaPicker: Component<{
  open: boolean;
  onClose: () => void;
  onPick: (file: MediaFile) => void;
}> = (props) => (
  <Modal open={props.open} title={cmsT("text.choose-media")} onClose={props.onClose} wide>
    <Show when={props.open}>
      <MediaGrid onPick={props.onPick} />
    </Show>
  </Modal>
);

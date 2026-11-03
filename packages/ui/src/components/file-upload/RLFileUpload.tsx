import type { RLFileUploadProps } from "./file-upload.types";
import { RLFileUploadTheme } from "./file-upload.theme";
import { createSignal, Show, type Component } from "solid-js";
import { RLIcon } from "../icon/RLIcon";
import { uiT } from "../../locale";

export const RLFileUpload: Component<RLFileUploadProps> = (props) => {
  const { Tag, classes, rest, children, slots, theme } = RLFileUploadTheme.setup(props, {
    omit: ["accept", "multiple", "title", "description", "icon", "onValueChange"] as const,
    slots: ["iconSlot"] as const,
  });

  const [dragging, setDragging] = createSignal(false);
  const [fileLabel, setFileLabel] = createSignal("");

  let inputRef: HTMLInputElement | undefined;

  const uploadTitle = () => props.title ?? uiT("file-upload.title");

  const openPicker = () => {
    if (props.disabled) return;
    inputRef?.click();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (props.disabled) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      inputRef?.click();
    }
  };

  const showFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setFileLabel(
      files.length === 1 ? files[0]!.name : `${files.length} ${uiT("file-upload.files-selected")}`,
    );
  };

  const handleInputChange = (e: Event & { currentTarget: HTMLInputElement }) => {
    showFiles(e.currentTarget.files);
    props.onValueChange?.(Array.from(e.currentTarget.files ?? []));
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const dt = e.dataTransfer;
    if (!dt) return;
    try {
      const transfer = new DataTransfer();
      Array.from(dt.files).forEach((f) => transfer.items.add(f));
      if (inputRef) inputRef.files = transfer.files;
    } catch (err) {
      void err;
    }
    showFiles(dt.files);
    props.onValueChange?.(Array.from(dt.files));
  };

  return (
    <Tag
      data-slot="root"
      data-theme={theme()}
      class={classes().root + (dragging() ? " border-primary bg-primary/5" : "")}
      data-fileUpload
      data-disabled={props.disabled ? "true" : undefined}
      role="button"
      tabindex={props.disabled ? -1 : 0}
      aria-label={uploadTitle()}
      onClick={openPicker}
      onKeyDown={handleKeyDown}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      {...rest}
      onChange={undefined}
    >
      <input
        type="file"
        class={classes().input}
        accept={props.accept}
        multiple={props.multiple}
        disabled={props.disabled}
        data-fileUpload-input
        aria-hidden="true"
        tabindex={-1}
        ref={(el) => (inputRef = el)}
        onChange={handleInputChange}
      />

      <div class={classes().content} data-slot="content">
        {slots.iconSlot() ? (
          slots.iconSlot()
        ) : (
          <RLIcon name={props.icon ?? "cloud-upload"} class={classes().icon} aria-hidden="true" />
        )}

        <Show
          when={children()}
          fallback={
            <>
              <p class={classes().title} data-slot="title">
                {uploadTitle()}
              </p>
              <Show when={props.description}>
                <p class={classes().description} data-slot="description">
                  {props.description}
                </p>
              </Show>
              <Show when={props.accept}>
                <p class="mt-1 text-[10px] text-muted/70">
                  {uiT("file-upload.accepted")} <span class="font-mono">{props.accept}</span>
                </p>
              </Show>
            </>
          }
        >
          {children()}
        </Show>

        <div
          class={`mt-3 text-xs text-muted ${fileLabel() ? "" : "hidden"}`}
          data-fileUpload-filelist
          aria-live="polite"
        >
          {fileLabel() || "\u00a0"}
        </div>
      </div>
    </Tag>
  );
};

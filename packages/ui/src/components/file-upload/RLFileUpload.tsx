import { createMemo, createSignal, omit, type Component } from "solid-js";
import type { RLFileUploadProps } from "./file-upload";
import { fileUploadTheme } from "./file-upload.theme";
import { RLIcon } from "../icon/RLIcon";

export const RLFileUpload: Component<RLFileUploadProps> = (allProps) => {
  const props = allProps;
  const rest = omit(
    allProps,
    "accept",
    "multiple",
    "disabled",
    "title",
    "description",
    "icon",
    "color",
    "ui",
    "class",
    "onChange",
    "children",
    "iconSlot",
  );

  const resolvedClasses = createMemo(() =>
    fileUploadTheme({
      color: props.color,
      disabled: !!props.disabled,
      ui: props.ui,
      class: props.class,
    }),
  );

  const [dragging, setDragging] = createSignal(false);
  const [fileLabel, setFileLabel] = createSignal("");

  let inputRef: HTMLInputElement | undefined;

  const uploadTitle = () => props.title ?? "Drop files here or click to upload";

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
    setFileLabel(files.length === 1 ? files[0]!.name : `${files.length} files selected`);
  };

  const handleInputChange = (e: Event & { currentTarget: HTMLInputElement }) => {
    showFiles(e.currentTarget.files);
    props.onChange?.(e);
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
  };

  return (
    <div
      class={resolvedClasses().root + (dragging() ? " border-primary bg-primary/5" : "")}
      data-slot="root"
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
    >
      <input
        type="file"
        class={resolvedClasses().input}
        accept={props.accept}
        multiple={props.multiple}
        disabled={props.disabled}
        data-fileUpload-input
        aria-hidden="true"
        tabindex={-1}
        ref={(el) => (inputRef = el)}
        onChange={handleInputChange}
      />

      <div class={resolvedClasses().content} data-slot="content">
        {props.iconSlot ? (
          props.iconSlot
        ) : (
          <RLIcon
            name={props.icon ?? "uploadCloud"}
            class={resolvedClasses().icon}
            aria-hidden="true"
          />
        )}

        {props.children ? (
          props.children
        ) : (
          <>
            <p class={resolvedClasses().title} data-slot="title">
              {uploadTitle()}
            </p>
            {props.description ? (
              <p class={resolvedClasses().description} data-slot="description">
                {props.description}
              </p>
            ) : null}
            {props.accept ? (
              <p class="mt-1 text-[10px] text-muted/70">
                Accepted: <span class="font-mono">{props.accept}</span>
              </p>
            ) : null}
          </>
        )}

        <div
          class={`mt-3 text-xs text-muted ${fileLabel() ? "" : "hidden"}`}
          data-fileUpload-filelist
          aria-live="polite"
        >
          {fileLabel() || "\u00a0"}
        </div>
      </div>
    </div>
  );
};

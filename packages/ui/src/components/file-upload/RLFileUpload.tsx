import type { RLFileUploadProps } from "./file-upload.types";
import { RLFileUploadTheme } from "./file-upload.theme";
import { createSignal, Show, type Component } from "solid-js";
import { RLIcon } from "../icon/RLIcon";
import { uiT } from "../../locale";
import { renderSlot } from "../../slot";

export const RLFileUpload: Component<RLFileUploadProps> = (props) => {
  const [dragging, setDragging] = createSignal(false);

  const { Tag, classes, rest, children, slots, theme } = RLFileUploadTheme.setup(props, {
    omit: ["accept", "multiple", "title", "description", "icon", "onValueChange"] as const,
    slots: ["iconSlot"] as const,
    variants: () => ({ dragging: dragging() }),
  });

  const [fileLabel, setFileLabel] = createSignal("");

  let inputRef: HTMLInputElement | undefined;

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
    const first = files[0];
    setFileLabel(
      files.length === 1 && first
        ? first.name
        : `${files.length} ${uiT("file-upload.files-selected")}`,
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
      class={classes().root}
      data-file-upload=""
      data-disabled={props.disabled ? "" : undefined}
      role="button"
      tabindex={props.disabled ? -1 : 0}
      aria-label={props.title ?? uiT("file-upload.title")}
      onClick={openPicker}
      onKeyDown={handleKeyDown}
      onDragOver={handleDragOver}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      {...rest}
    >
      <input
        type="file"
        class={classes().input}
        accept={props.accept}
        multiple={props.multiple}
        disabled={props.disabled}
        data-file-upload-input=""
        aria-hidden="true"
        tabindex={-1}
        ref={(el) => (inputRef = el)}
        onChange={handleInputChange}
      />

      <div class={classes().content} data-slot="content">
        <Show
          when={slots.iconSlot()}
          fallback={
            <RLIcon name={props.icon ?? "cloud-upload"} class={classes().icon} aria-hidden="true" />
          }
        >
          {renderSlot(slots.iconSlot())}
        </Show>

        <Show
          when={children()}
          fallback={
            <>
              <p class={classes().title} data-slot="title">
                {props.title ?? uiT("file-upload.title")}
              </p>
              <Show when={props.description}>
                <p class={classes().description} data-slot="description">
                  {props.description}
                </p>
              </Show>
              <Show when={props.accept}>
                <p class={classes().accepted}>
                  {uiT("file-upload.accepted")}{" "}
                  <span class={classes().acceptedValue}>{props.accept}</span>
                </p>
              </Show>
            </>
          }
        >
          {children()}
        </Show>

        <div class={classes().filelist} data-file-upload-filelist="" aria-live="polite">
          {fileLabel()}
        </div>
      </div>
    </Tag>
  );
};

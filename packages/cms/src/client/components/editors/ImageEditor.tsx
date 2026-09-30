import { type Component } from "solid-js";
import { RLInput } from "@rimelight/ui/components/input/RLInput.tsx";

export interface ImageEditorProps {
  props: Record<string, any>;
  onPropsChange: (newProps: Record<string, any>) => void;
}

export const ImageEditor: Component<ImageEditorProps> = (componentProps) => {
  const saveProps = (src?: string, alt?: string, caption?: string) => {
    componentProps.onPropsChange({
      ...componentProps.props,
      src: src !== undefined ? src : componentProps.props["src"] || "",
      alt: alt !== undefined ? alt : componentProps.props["alt"] || "",
      caption: caption !== undefined ? caption : componentProps.props["caption"] || "",
    });
  };

  return (
    <div class="w-full flex flex-col gap-3 p-2">
      <div class="flex flex-col gap-1">
        <span class="text-xs font-bold text-muted uppercase">Image URL</span>
        <RLInput
          id="image-src-input"
          type="text"
          value={componentProps.props["src"] || ""}
          onBlur={(e) => saveProps(e.currentTarget.value)}
          placeholder="https://..."
          leadingIcon="image"
        />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold text-muted uppercase">Alt Text</span>
          <RLInput
            id="image-alt-input"
            type="text"
            value={componentProps.props["alt"] || ""}
            onBlur={(e) => saveProps(undefined, e.currentTarget.value)}
            placeholder="Alt description"
            size="sm"
          />
        </div>

        <div class="flex flex-col gap-1">
          <span class="text-xs font-bold text-muted uppercase">Caption</span>
          <RLInput
            id="image-caption-input"
            type="text"
            value={componentProps.props["caption"] || ""}
            onBlur={(e) => saveProps(undefined, undefined, e.currentTarget.value)}
            placeholder="Image caption"
            size="sm"
          />
        </div>
      </div>

      {componentProps.props["src"] && (
        <div class="mt-2 flex justify-center p-2 rounded-lg border border-default">
          <img
            src={componentProps.props["src"]}
            alt={componentProps.props["alt"] || "Image preview"}
            class="max-h-48 object-cover rounded shadow-sm"
          />
        </div>
      )}
    </div>
  );
};

import type { InferThemeProps } from "../../resolver";
import type { SlotRenderer } from "../../types";
import type { RLFileUploadTheme } from "./file-upload.theme";

export type RLFileUploadProps = Omit<
  InferThemeProps<typeof RLFileUploadTheme>,
  "title" | "onChange"
> & {
  /**
   * Accepted file types (e.g. 'image/*', 'application/pdf').
   * @default undefined
   */
  accept?: string | undefined;
  /**
   * Allows selecting multiple files.
   * @default false
   */
  multiple?: boolean | undefined;
  /**
   * Heading text inside the drop area. Falls back to a localized default.
   * @default uiT("file-upload.title")
   */
  title?: string | undefined;
  /**
   * Helper text shown under the title.
   * @default undefined
   */
  description?: string | undefined;
  /**
   * Icon name rendered inside the drop area. Ignored when `iconSlot` is set.
   * @default "cloud-upload"
   */
  icon?: string | undefined;
  /**
   * Called with the selected or dropped files whenever the selection changes.
   */
  onValueChange?: (files: File[]) => void;
  /**
   * Replaces the default icon.
   */
  iconSlot?: SlotRenderer;
};

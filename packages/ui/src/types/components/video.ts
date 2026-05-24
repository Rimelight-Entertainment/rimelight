export interface VideoProps {
  /**
   * The URL of the YouTube video to embed.
   */
  src: string
  /**
   * The title of the video to display.
   *
   * @default "YouTube Video Player"
   */
  title?: string
  /**
   * The name of the icon to display in the play trigger overlay.
   *
   * @default "i-lucide-play"
   */
  icon?: string
  /**
   * Slot-specific CSS class overrides.
   */
  ui?: any
  /**
   * Additional CSS classes to apply to the root element.
   */
  class?: any
  [key: string]: unknown
}

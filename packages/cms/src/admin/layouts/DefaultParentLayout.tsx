import { type Component } from "solid-js"
import type { JSX } from "@solidjs/web"
import { RLMain } from "@rimelight/ui/components/main/RLMain.tsx"
import { RLToaster } from "@rimelight/ui/components/toaster/RLToaster.tsx"
import "../../client/styles/cms-editor.css"

export interface DefaultParentLayoutProps {
  title?: string | undefined
  description?: string | undefined
  children?: JSX.Element | undefined
}

/**
 * Standalone CMS shell. Use as the outer layout when the host app does not provide its own
 * (`parentLayout`). Host apps with their own AppLayout should render `CMSDashboardLayout` directly
 * instead.
 */
export const DefaultParentLayout: Component<DefaultParentLayoutProps> = (props) => {
  return (
    <RLMain id="main-content" class="dashboard-viewport-area flex flex-col min-w-0">
      {props.children}
      <RLToaster />
    </RLMain>
  )
}

export default DefaultParentLayout

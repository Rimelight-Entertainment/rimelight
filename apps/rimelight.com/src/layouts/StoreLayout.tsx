import type { Component, ParentProps } from "solid-js"
import { useParams } from "@solidjs/router"
import AppLayout from "./AppLayout"
import StoreSidebar from "#components/store/StoreSidebar"
import { currentLocale } from "@rimelight/i18n"

export interface StoreLayoutProps extends ParentProps {
  title?: string | undefined
  description?: string | undefined
}

export const StoreLayout: Component<StoreLayoutProps> = (props) => {
  const params = useParams<{ locale?: string }>()
  if (params.locale && ["en", "pt", "es"].includes(params.locale)) {
    currentLocale.set(params.locale)
  }

  return (
    <AppLayout
      title={props.title || "Store"}
      description={props.description || "Official Rimelight Store"}
    >
      <div class="bg-white min-h-screen flex flex-col">
        <div class="max-w-7xl mx-auto w-full flex flex-1">
          <aside class="hidden lg:block w-64 shrink-0 border-r border-black bg-white">
            <StoreSidebar />
          </aside>
          <main class="flex-1 min-w-0">{props.children}</main>
        </div>
      </div>
    </AppLayout>
  )
}

export default StoreLayout

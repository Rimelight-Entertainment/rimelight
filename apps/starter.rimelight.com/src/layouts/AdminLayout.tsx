import { type Component, Show } from "solid-js";
import type { JSX } from "@solidjs/web";
import { Title, Meta } from "@solidjs/meta";
import AppHeader from "#components/app/AppHeader";
import AppFooter from "#components/app/AppFooter";
import {
  RLBanner,
  RLMain,
  RLScrollToTop,
  RLShortcuts,
  RLLayoutGrid,
  RLToaster
} from "@rimelight/ui";

export interface AdminLayoutProps {
  title?: string;
  description?: string;
  children?: JSX.Element;
  session?: any;
}

export const AdminLayout: Component<AdminLayoutProps> = (props) => {
  return (
    <>
      <Show when={props.title}>
        <Title>{props.title}</Title>
      </Show>
      <Show when={props.description}>
        <Meta name="description" content={props.description} />
      </Show>

      <div class="isolate flex flex-col min-h-screen">
        <div id="dashboard-header-wrapper">
          <RLBanner
            contain={false}
            dismissable={true}
            dismissId="v2-announcement"
            class="bg-primary text-neutral-50 font-medium"
            actions={[
              { label: "Learn more", href: "/docs", variant: "solid" },
              { label: "What's new", href: "/changelog", variant: "outline" }
            ]}
          >
            New: Rimelight v2 is out
          </RLBanner>
          <AppHeader session={props.session} />
        </div>

        <RLMain id="main-content" class="dashboard-viewport-area flex flex-col min-w-0 flex-1">
          {props.children}
        </RLMain>

        <AppFooter />

        <RLScrollToTop showProgress={true} />
        <RLShortcuts />
        <RLLayoutGrid />
        <RLToaster />
      </div>
    </>
  );
};

export default AdminLayout;

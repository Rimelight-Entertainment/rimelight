import { type Component } from "solid-js";
import { type JSX, useHead } from "@solidjs/web";
import { createSeoHead } from "@rimelight/seo/head";
import AppHeader from "#components/app/AppHeader";
import AppFooter from "#components/app/AppFooter";
import {
  RLBanner,
  RLMain,
  RLScrollToTop,
  RLShortcuts,
  RLLayoutGrid,
  RLToaster,
} from "@rimelight/ui";

export interface DashboardLayoutProps {
  title?: string;
  description?: string;
  children?: JSX.Element;
  session?: any;
}

export const DashboardLayout: Component<DashboardLayoutProps> = (props) => {
  useHead(() => createSeoHead({ title: props.title, description: props.description }));
  return (
    <>
      <div class="isolate flex flex-col min-h-screen">
        <div id="dashboard-header-wrapper">
          <RLBanner
            id="v2-announcement"
            contain={false}
            close={true}
            class="bg-primary text-neutral-50 font-medium"
            actions={[
              { label: "Learn more", href: "/docs", variant: "solid" },
              { label: "What's new", href: "/changelog", variant: "outline" },
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

export default DashboardLayout;

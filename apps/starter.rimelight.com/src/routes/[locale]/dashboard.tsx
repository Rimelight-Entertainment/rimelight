import { type Component, createSignal, For, Show } from "solid-js";
import DashboardLayout from "#layouts/DashboardLayout";
import { RLDashboardGroup } from "@rimelight/ui/components/dashboard-group/RLDashboardGroup.tsx";
import { RLDashboardSidebar } from "@rimelight/ui/components/dashboard-sidebar/RLDashboardSidebar.tsx";
import { RLDashboardNavbar } from "@rimelight/ui/components/dashboard-navbar/RLDashboardNavbar.tsx";
import { RLDashboardPanel } from "@rimelight/ui/components/dashboard-panel/RLDashboardPanel.tsx";
import { RLDashboardToolbar } from "@rimelight/ui/components/dashboard-toolbar/RLDashboardToolbar.tsx";
import { RLDashboardSidebarCollapse } from "@rimelight/ui/components/dashboard-sidebar-collapse/RLDashboardSidebarCollapse.tsx";
import { RLSearch } from "@rimelight/ui/components/search/RLSearch.tsx";
import { RLIcon } from "@rimelight/ui/components/icon/RLIcon.tsx";
import { RLAvatar } from "@rimelight/ui/components/avatar/RLAvatar.tsx";
import { RLButton } from "@rimelight/ui/components/button/RLButton.tsx";
import { RLBadge } from "@rimelight/ui/components/badge/RLBadge.tsx";
import { RLSelect } from "@rimelight/ui/components/select/RLSelect.tsx";
import { t } from "@rimelight/i18n";

const navItems = [
  { icon: "i-lucide-layout-dashboard", label: () => t("dashboard.nav_overview"), id: "overview" },
  { icon: "i-lucide-users", label: () => t("dashboard.nav_users"), id: "users" },
  { icon: "i-lucide-shopping-cart", label: () => t("dashboard.nav_orders"), id: "orders" },
  { icon: "i-lucide-package", label: () => t("dashboard.nav_products"), id: "products" },
  { icon: "i-lucide-bar-chart-3", label: () => t("dashboard.nav_analytics"), id: "analytics" }
];

const settingsNavItem = {
  icon: "i-lucide-settings",
  label: () => t("dashboard.nav_settings"),
  id: "settings"
};

const overviewStats = [
  {
    label: () => t("dashboard.overview_stats_total_revenue"),
    value: "$45,231",
    change: "+20.1%",
    icon: "i-lucide-circle-dollar-sign",
    changeColor: "text-success"
  },
  {
    label: () => t("dashboard.overview_stats_active_users"),
    value: "+2,350",
    change: "+18%",
    icon: "i-lucide-users",
    changeColor: "text-success"
  },
  {
    label: () => t("dashboard.overview_stats_conversion_rate"),
    value: "+12.3%",
    change: "+2.1%",
    icon: "i-lucide-trending-up",
    changeColor: "text-success"
  },
  {
    label: () => t("dashboard.overview_stats_avg_order"),
    value: "$48.00",
    change: "+$5.00",
    icon: "i-lucide-shopping-bag",
    changeColor: "text-success"
  }
];

const overviewRecentOrders = [
  {
    id: "#001234",
    customer: "John Doe",
    email: "john@example.com",
    status: "Completed",
    amount: "$99.00",
    statusColor: "success" as const
  },
  {
    id: "#001235",
    customer: "Jane Smith",
    email: "jane@example.com",
    status: "Processing",
    amount: "$149.00",
    statusColor: "warning" as const
  },
  {
    id: "#001236",
    customer: "Bob Johnson",
    email: "bob@example.com",
    status: "Pending",
    amount: "$75.00",
    statusColor: "info" as const
  },
  {
    id: "#001237",
    customer: "Alice Brown",
    email: "alice@example.com",
    status: "Cancelled",
    amount: "$200.00",
    statusColor: "error" as const
  },
  {
    id: "#001238",
    customer: "Charlie Wilson",
    email: "charlie@example.com",
    status: "Completed",
    amount: "$150.00",
    statusColor: "success" as const
  }
];

const overviewMessages = [
  {
    user: "Sarah Miller",
    message: "Need access to admin dashboard",
    time: "5 min ago",
    avatar: "https://i.pravatar.cc/100?u=sarah"
  },
  {
    user: "Mike Johnson",
    message: "Server maintenance scheduled",
    time: "1 hour ago",
    avatar: "https://i.pravatar.cc/100?u=mike"
  },
  {
    user: "Emily Davis",
    message: "New feature request submitted",
    time: "2 hours ago",
    avatar: "https://i.pravatar.cc/100?u=emily"
  }
];

const overviewRecentActivity = [
  { action: "Password reset requested", time: "5 min ago", icon: "i-lucide-key", type: "warning" },
  {
    action: "API rate limit exceeded",
    time: "1 hour ago",
    icon: "i-lucide-alert-triangle",
    type: "error"
  },
  {
    action: "Database backup completed",
    time: "3 hours ago",
    icon: "i-lucide-database",
    type: "success"
  },
  { action: "System update installed", time: "6 hours ago", icon: "i-lucide-server", type: "info" }
];

const usersList = [
  {
    name: "John Doe",
    email: "john@example.com",
    role: "Admin",
    status: "Active",
    joined: "Jan 15, 2023"
  },
  {
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Editor",
    status: "Active",
    joined: "Feb 3, 2023"
  },
  {
    name: "Bob Johnson",
    email: "bob@example.com",
    role: "Viewer",
    status: "Pending",
    joined: "Mar 10, 2023"
  },
  {
    name: "Alice Brown",
    email: "alice@example.com",
    role: "Admin",
    status: "Suspended",
    joined: "Apr 5, 2023"
  },
  {
    name: "Charlie Wilson",
    email: "charlie@example.com",
    role: "Editor",
    status: "Active",
    joined: "May 12, 2023"
  }
];

const ordersList = [
  {
    id: "#001234",
    customer: "John Doe",
    email: "john@example.com",
    date: "Dec 15, 2023",
    total: "$99.00",
    status: "Completed",
    method: "Credit Card"
  },
  {
    id: "#001235",
    customer: "Jane Smith",
    email: "jane@example.com",
    date: "Dec 14, 2023",
    total: "$149.00",
    status: "Processing",
    method: "PayPal"
  },
  {
    id: "#001236",
    customer: "Bob Johnson",
    email: "bob@example.com",
    date: "Dec 13, 2023",
    total: "$75.00",
    status: "Shipped",
    method: "Credit Card"
  },
  {
    id: "#001237",
    customer: "Alice Brown",
    email: "alice@example.com",
    date: "Dec 12, 2023",
    total: "$200.00",
    status: "Cancelled",
    method: "Credit Card"
  }
];

const productsList = [
  { name: "Basic Plan", price: "$9.99", sales: 45, status: "Active", category: "Subscription" },
  { name: "Pro Plan", price: "$29.99", sales: 23, status: "Active", category: "Subscription" },
  {
    name: "Enterprise Plan",
    price: "$99.99",
    sales: 8,
    status: "Limited",
    category: "Subscription"
  },
  { name: "Starter Pack", price: "$0.00", sales: 156, status: "Active", category: "Free" }
];

const analyticsData = {
  revenue: "$45,231",
  growth: "+20.1%",
  users: "+2,350",
  conversion: "+12.3%"
};

export const DashboardPage: Component = () => {
  const [activeSection, setActiveSection] = createSignal("overview");

  const navTitles: Record<string, () => string> = {
    overview: () => t("dashboard.navbar_title_overview"),
    users: () => "User Management",
    orders: () => "Order History",
    products: () => "Product Catalog",
    analytics: () => "Analytics & Reports",
    settings: () => "Application Settings"
  };

  const currentTitle = () => navTitles[activeSection()]?.() || "Dashboard";

  return (
    <DashboardLayout
      title={t("dashboard.meta_title")}
      description={t("dashboard.meta_description")}
    >
      <RLDashboardGroup>
        <RLDashboardSidebar
          side="left"
          collapsible
          header={
            <>
              <RLIcon
                name="i-lucide-layers"
                class="size-6 text-primary shrink-0 group-data-[collapsed=true]:hidden"
              />
              <span class="font-semibold text-highlighted truncate flex-1 transition-opacity duration-200 group-data-[collapsed=true]:hidden">
                {t("dashboard.navbar_app_name")}
              </span>
              <RLDashboardSidebarCollapse
                side="left"
                class="shrink-0 group-data-[collapsed=true]:mx-auto"
              />
            </>
          }
          footer={
            <div class="w-full">
              <button
                type="button"
                onClick={() => setActiveSection(settingsNavItem.id)}
                class={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors w-full group-data-[collapsed=true]:justify-center group-data-[collapsed=true]:px-0 cursor-pointer ${
                  activeSection() === settingsNavItem.id
                    ? "bg-muted text-highlighted"
                    : "text-default hover:text-highlighted hover:bg-muted"
                }`}
              >
                <RLIcon name={settingsNavItem.icon} class="size-5 shrink-0" />
                <span class="truncate flex-1 group-data-[collapsed=true]:hidden text-left">
                  {settingsNavItem.label()}
                </span>
              </button>
            </div>
          }
        >
          <nav class="flex flex-col gap-1">
            <For each={navItems}>
              {(item) => (
                <button
                  type="button"
                  onClick={() => setActiveSection(item.id)}
                  class={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors group-data-[collapsed=true]:justify-center group-data-[collapsed=true]:px-0 cursor-pointer ${
                    activeSection() === item.id
                      ? "bg-muted text-highlighted"
                      : "text-default hover:text-highlighted hover:bg-muted"
                  }`}
                >
                  <RLIcon name={item.icon} class="size-5 shrink-0" />
                  <span class="truncate flex-1 group-data-[collapsed=true]:hidden text-left">
                    {item.label()}
                  </span>
                </button>
              )}
            </For>
          </nav>
        </RLDashboardSidebar>

        <RLDashboardPanel
          header={
            <RLDashboardNavbar
              title={currentTitle()}
              icon="i-lucide-layout-dashboard"
              left={<h1 class="text-xl font-semibold text-highlighted">{currentTitle()}</h1>}
              right={
                <>
                  <RLSearch />
                  <RLButton
                    variant="ghost"
                    color="neutral"
                    square
                    leadingIcon="i-lucide-bell"
                    aria-label="Notifications"
                  />
                  <RLAvatar
                    src="https://i.pravatar.cc/40?u=admin"
                    size="sm"
                    class="cursor-pointer"
                  />
                </>
              }
            />
          }
        >
          <div class="flex flex-col gap-6">
            <RLDashboardToolbar
              left={
                <>
                  <RLButton
                    variant="ghost"
                    color="neutral"
                    size="sm"
                    leadingIcon="i-lucide-calendar"
                  >
                    {t("dashboard.toolbar_last_30_days")}
                  </RLButton>
                  <RLSelect defaultValue="all">
                    <option value="all">{t("dashboard.toolbar_all_time")}</option>
                    <option value="month">{t("dashboard.toolbar_this_month")}</option>
                    <option value="week">{t("dashboard.toolbar_this_week")}</option>
                  </RLSelect>
                </>
              }
              right={
                <>
                  <RLButton
                    variant="outline"
                    color="neutral"
                    size="sm"
                    leadingIcon="i-lucide-download"
                  >
                    {t("dashboard.toolbar_export_report")}
                  </RLButton>
                  <RLButton variant="outline" color="neutral" size="sm" leadingIcon="i-lucide-plus">
                    {t("dashboard.toolbar_add_item")}
                  </RLButton>
                </>
              }
            />

            {/* Overview Section */}
            <Show when={activeSection() === "overview"}>
              <div class="flex flex-col gap-6">
                <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <For each={overviewStats}>
                    {(stat) => (
                      <div class="rounded-lg border border-default bg-default p-4 sm:p-6">
                        <div class="flex items-center justify-between">
                          <p class="text-sm font-medium text-toned">{stat.label()}</p>
                          <RLIcon name={stat.icon} class="size-5 text-toned" />
                        </div>
                        <p class="text-2xl font-bold text-highlighted mt-2">{stat.value}</p>
                        <p class={`text-sm mt-1 flex items-center gap-1 ${stat.changeColor}`}>
                          <RLIcon name="i-lucide-trending-up" class="size-3" /> {stat.change} from
                          last month
                        </p>
                      </div>
                    )}
                  </For>
                </div>

                <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div class="rounded-lg border border-default bg-default p-6 lg:col-span-2">
                    <h3 class="font-semibold text-highlighted mb-4">Recent Orders</h3>
                    <div class="overflow-x-auto">
                      <table class="w-full text-sm">
                        <thead>
                          <tr class="border-b border-default text-toned">
                            <th class="text-start px-6 py-3 font-medium">Order ID</th>
                            <th class="text-start px-6 py-3 font-medium">Customer</th>
                            <th class="text-start px-6 py-3 font-medium">Status</th>
                            <th class="text-end px-6 py-3 font-medium">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          <For each={overviewRecentOrders}>
                            {(order) => (
                              <tr class="border-b border-default/50 hover:bg-muted/50 transition-colors">
                                <td class="px-6 py-4 font-medium text-highlighted">{order.id}</td>
                                <td class="px-6 py-4">
                                  <div class="font-medium text-default">{order.customer}</div>
                                  <div class="text-xs text-toned">{order.email}</div>
                                </td>
                                <td class="px-6 py-4">
                                  <RLBadge variant="soft" color={order.statusColor} size="xs">
                                    {order.status}
                                  </RLBadge>
                                </td>
                                <td class="px-6 py-4 text-end text-default font-medium">
                                  {order.amount}
                                </td>
                              </tr>
                            )}
                          </For>
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div class="rounded-lg border border-default bg-default p-6">
                    <h3 class="font-semibold text-highlighted mb-4">Team Messages</h3>
                    <div class="flex flex-col gap-4">
                      <For each={overviewMessages}>
                        {(msg) => (
                          <div class="flex items-start gap-3">
                            <RLAvatar src={msg.avatar} size="xs" class="shrink-0" />
                            <div class="flex-1 min-w-0">
                              <div class="flex items-center justify-between">
                                <p class="font-medium text-default truncate">{msg.user}</p>
                                <p class="text-xs text-toned ml-2">{msg.time}</p>
                              </div>
                              <p class="text-sm text-toned truncate mt-0.5">{msg.message}</p>
                            </div>
                          </div>
                        )}
                      </For>
                    </div>
                  </div>
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div class="rounded-lg border border-default bg-default p-6">
                    <h3 class="font-semibold text-highlighted mb-4">Revenue Analytics</h3>
                    <div class="h-64 flex items-center justify-center border-2 border-dashed border-default rounded-lg">
                      <div class="text-center">
                        <RLIcon
                          name="i-lucide-bar-chart-2"
                          class="size-12 text-toned mx-auto mb-2"
                        />
                        <p class="text-toned font-medium">Revenue chart visualization</p>
                        <p class="text-xs text-toned mt-1">Chart would display here</p>
                      </div>
                    </div>
                  </div>

                  <div class="rounded-lg border border-default bg-default p-6">
                    <h3 class="font-semibold text-highlighted mb-4">Recent Activity Log</h3>
                    <div class="space-y-3">
                      <For each={overviewRecentActivity}>
                        {(activity) => (
                          <div class="flex items-start gap-3">
                            <div
                              class={`size-8 rounded-full flex items-center justify-center shrink-0 ${
                                activity.type === "success"
                                  ? "bg-success/10"
                                  : activity.type === "warning"
                                    ? "bg-warning/10"
                                    : activity.type === "error"
                                      ? "bg-error/10"
                                      : "bg-info/10"
                              }`}
                            >
                              <RLIcon
                                name={activity.icon}
                                class={`size-4 ${
                                  activity.type === "success"
                                    ? "text-success"
                                    : activity.type === "warning"
                                      ? "text-warning"
                                      : activity.type === "error"
                                        ? "text-error"
                                        : "text-info"
                                }`}
                              />
                            </div>
                            <div class="flex-1 min-w-0">
                              <p class="text-sm text-default">{activity.action}</p>
                              <p class="text-xs text-toned">{activity.time}</p>
                            </div>
                          </div>
                        )}
                      </For>
                    </div>
                  </div>
                </div>
              </div>
            </Show>

            {/* Users Section */}
            <Show when={activeSection() === "users"}>
              <div class="rounded-lg border border-default bg-default p-6">
                <div class="flex items-center justify-between mb-6">
                  <h3 class="font-semibold text-highlighted">Users Management</h3>
                  <RLButton variant="solid" color="primary" leadingIcon="i-lucide-user-plus">
                    Add User
                  </RLButton>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead>
                      <tr class="border-b border-default text-muted">
                        <th class="text-start px-6 py-3 font-medium">Name</th>
                        <th class="text-start px-6 py-3 font-medium">Email</th>
                        <th class="text-start px-6 py-3 font-medium">Role</th>
                        <th class="text-start px-6 py-3 font-medium">Status</th>
                        <th class="text-start px-6 py-3 font-medium">Joined</th>
                      </tr>
                    </thead>
                    <tbody>
                      <For each={usersList}>
                        {(user) => (
                          <tr class="border-b border-default/50 hover:bg-muted/50 transition-colors">
                            <td class="px-6 py-4">
                              <div class="font-medium text-highlighted">{user.name}</div>
                            </td>
                            <td class="px-6 py-4 text-default">{user.email}</td>
                            <td class="px-6 py-4">
                              <RLBadge variant="soft" color="primary" size="xs">
                                {user.role}
                              </RLBadge>
                            </td>
                            <td class="px-6 py-4">
                              <RLBadge
                                variant="soft"
                                color={
                                  user.status === "Active"
                                    ? "success"
                                    : user.status === "Pending"
                                      ? "warning"
                                      : user.status === "Suspended"
                                        ? "error"
                                        : "info"
                                }
                                size="xs"
                              >
                                {user.status}
                              </RLBadge>
                            </td>
                            <td class="px-6 py-4 text-default">{user.joined}</td>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                </div>
              </div>
            </Show>

            {/* Orders Section */}
            <Show when={activeSection() === "orders"}>
              <div class="rounded-lg border border-default bg-default p-6">
                <div class="flex items-center justify-between mb-6">
                  <h3 class="font-semibold text-highlighted">Order History</h3>
                  <RLSelect defaultValue="all" class="w-40">
                    <option value="all">All Orders</option>
                    <option value="completed">Completed</option>
                    <option value="processing">Processing</option>
                    <option value="cancelled">Cancelled</option>
                  </RLSelect>
                </div>
                <div class="overflow-x-auto">
                  <table class="w-full text-sm">
                    <thead>
                      <tr class="border-b border-default text-muted">
                        <th class="text-start px-6 py-3 font-medium">Order ID</th>
                        <th class="text-start px-6 py-3 font-medium">Customer</th>
                        <th class="text-start px-6 py-3 font-medium">Date</th>
                        <th class="text-start px-6 py-3 font-medium">Payment Method</th>
                        <th class="text-end px-6 py-3 font-medium">Total</th>
                        <th class="text-start px-6 py-3 font-medium">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <For each={ordersList}>
                        {(order) => (
                          <tr class="border-b border-default/50 hover:bg-muted/50 transition-colors">
                            <td class="px-6 py-4 font-medium text-highlighted">{order.id}</td>
                            <td class="px-6 py-4">
                              <div class="font-medium text-default">{order.customer}</div>
                              <div class="text-xs text-muted">{order.email}</div>
                            </td>
                            <td class="px-6 py-4 text-default">{order.date}</td>
                            <td class="px-6 py-4 text-default">{order.method}</td>
                            <td class="px-6 py-4 text-end font-medium text-highlighted">
                              {order.total}
                            </td>
                            <td class="px-6 py-4">
                              <RLBadge
                                variant="soft"
                                color={
                                  order.status === "Completed"
                                    ? "success"
                                    : order.status === "Processing"
                                      ? "warning"
                                      : order.status === "Shipped"
                                        ? "info"
                                        : order.status === "Cancelled"
                                          ? "error"
                                          : "neutral"
                                }
                                size="xs"
                              >
                                {order.status}
                              </RLBadge>
                            </td>
                          </tr>
                        )}
                      </For>
                    </tbody>
                  </table>
                </div>
              </div>
            </Show>

            {/* Products Section */}
            <Show when={activeSection() === "products"}>
              <div class="rounded-lg border border-default bg-default p-6">
                <div class="flex items-center justify-between mb-6">
                  <h3 class="font-semibold text-highlighted">Product Catalog</h3>
                  <RLButton variant="solid" color="primary" leadingIcon="i-lucide-plus-circle">
                    Add Product
                  </RLButton>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <For each={productsList}>
                    {(product) => (
                      <div class="border border-default rounded-lg p-4 hover:bg-muted/50 transition-colors">
                        <div class="size-12 rounded bg-muted flex items-center justify-center mb-3">
                          <RLIcon name="i-lucide-package" class="size-6 text-muted" />
                        </div>
                        <h4 class="font-medium text-highlighted mb-1">{product.name}</h4>
                        <p class="text-sm text-muted mb-3">{product.category}</p>
                        <div class="flex items-center justify-between">
                          <span class="text-lg font-semibold text-highlighted">
                            {product.price}
                          </span>
                          <RLBadge
                            variant="soft"
                            color={
                              product.status === "Active"
                                ? "success"
                                : product.status === "Limited"
                                  ? "warning"
                                  : "neutral"
                            }
                            size="xs"
                          >
                            {product.status}
                          </RLBadge>
                        </div>
                        <div class="mt-2 text-xs text-muted">Sales: {product.sales}</div>
                      </div>
                    )}
                  </For>
                </div>
              </div>
            </Show>

            {/* Analytics Section */}
            <Show when={activeSection() === "analytics"}>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div class="rounded-lg border border-default bg-default p-6">
                  <h3 class="font-semibold text-highlighted mb-4">Revenue Metrics</h3>
                  <div class="space-y-4">
                    <div class="flex items-center justify-between py-2 border-b border-default/50">
                      <span class="text-default">Total Revenue</span>
                      <span class="font-semibold text-highlighted">{analyticsData.revenue}</span>
                    </div>
                    <div class="flex items-center justify-between py-2 border-b border-default/50">
                      <span class="text-default">Monthly Growth</span>
                      <span class="font-semibold text-success">{analyticsData.growth}</span>
                    </div>
                    <div class="flex items-center justify-between py-2 border-b border-default/50">
                      <span class="text-default">Active Users</span>
                      <span class="font-semibold text-highlighted">{analyticsData.users}</span>
                    </div>
                    <div class="flex items-center justify-between py-2">
                      <span class="text-default">Conversion Rate</span>
                      <span class="font-semibold text-success">{analyticsData.conversion}</span>
                    </div>
                  </div>
                </div>

                <div class="rounded-lg border border-default bg-default p-6">
                  <h3 class="font-semibold text-highlighted mb-4">Performance Indicators</h3>
                  <div class="h-64 flex items-center justify-center border-2 border-dashed border-default rounded-lg">
                    <div class="text-center">
                      <RLIcon name="i-lucide-trending-up" class="size-12 text-muted mx-auto mb-2" />
                      <p class="text-muted">Analytics chart placeholder</p>
                      <p class="text-xs text-muted mt-1">Visual charts would display here</p>
                    </div>
                  </div>
                </div>
              </div>
            </Show>

            {/* Settings Section */}
            <Show when={activeSection() === "settings"}>
              <div class="rounded-lg border border-default bg-default p-6">
                <h3 class="font-semibold text-highlighted mb-6">Application Settings</h3>
                <div class="space-y-6">
                  <div class="border border-default rounded-lg">
                    <div class="flex items-center gap-3 px-4 py-3 bg-muted/30 border-b border-default rounded-t-lg">
                      <RLIcon name="i-lucide-settings" class="size-5 text-muted" />
                      <h4 class="font-medium text-highlighted">
                        {t("dashboard.settings_general")}
                      </h4>
                    </div>
                    <div class="p-4">
                      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <For
                          each={[
                            t("dashboard.settings_site_name"),
                            t("dashboard.settings_site_description"),
                            t("dashboard.settings_time_zone")
                          ]}
                        >
                          {(item) => (
                            <div class="flex items-center justify-between py-2">
                              <span class="text-sm text-default">{item}</span>
                              <RLButton variant="ghost" size="sm">
                                Configure
                              </RLButton>
                            </div>
                          )}
                        </For>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </Show>
          </div>
        </RLDashboardPanel>
      </RLDashboardGroup>
    </DashboardLayout>
  );
};

export default DashboardPage;

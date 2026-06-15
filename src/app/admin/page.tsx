import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { formatPrice, formatDateTime } from "@/lib/utils";
import {
  Package,
  ShoppingCart,
  Users,
  MessageSquare,
  AlertTriangle,
  DollarSign,
  Clock,
  Mail,
  Star,
  Activity,
} from "lucide-react";
import Link from "next/link";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { RecentOrders } from "@/components/admin/RecentOrders";
import { LowStockAlert } from "@/components/admin/LowStockAlert";

async function getDashboardStats() {
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

  const [
    totalProducts,
    totalOrders,
    totalCustomers,
    newInquiriesCount,
    paidOrders,
    lowStockProducts,
    recentOrders,
    newInquiries,
    revenueAgg,
    pendingOrders,
    processingOrders,
    subscriberCount,
    thisMonthOrders,
    lastMonthOrders,
    pendingReviews,
    recentActivity,
  ] = await Promise.all([
    prisma.product.count({ where: { isActive: true } }),
    prisma.order.count(),
    prisma.user.count({ where: { role: { in: ["CUSTOMER", "B2B_PARTNER"] } } }),
    prisma.inquiry.count({ where: { status: "NEW" } }),
    prisma.order.findMany({
      where: { paymentStatus: "PAID" },
      select: { total: true, createdAt: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { isActive: true, stock: { lte: 10 } },
      orderBy: { stock: "asc" },
      take: 5,
    }),
    prisma.order.findMany({
      include: { user: true, items: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.inquiry.findMany({
      where: { status: "NEW" },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.order.aggregate({ _sum: { total: true }, where: { paymentStatus: "PAID" } }),
    prisma.order.count({ where: { status: "PENDING" } }),
    prisma.order.count({ where: { status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED"] } } }),
    prisma.subscriber.count({ where: { isActive: true } }),
    prisma.order.findMany({
      where: { createdAt: { gte: thisMonthStart }, paymentStatus: "PAID" },
      select: { total: true },
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd }, paymentStatus: "PAID" },
      select: { total: true },
    }),
    prisma.review.count({ where: { isApproved: false } }),
    prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 6 }),
  ]);

  const monthlyRevenue: Record<string, number> = {};
  paidOrders.forEach((o) => {
    const key = new Date(o.createdAt).toLocaleString("en", { month: "short", year: "2-digit" });
    monthlyRevenue[key] = (monthlyRevenue[key] || 0) + o.total;
  });

  const thisMonthRevenue = thisMonthOrders.reduce((s, o) => s + o.total, 0);
  const lastMonthRevenue = lastMonthOrders.reduce((s, o) => s + o.total, 0);
  const revenueChange = lastMonthRevenue > 0
    ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
    : thisMonthRevenue > 0 ? 100 : 0;

  const avgOrderValue = paidOrders.length > 0
    ? paidOrders.reduce((s, o) => s + o.total, 0) / paidOrders.length
    : 0;

  return {
    totalProducts,
    totalOrders,
    totalCustomers,
    newInquiriesCount,
    totalRevenue: revenueAgg._sum.total || 0,
    pendingOrders,
    processingOrders,
    subscriberCount,
    lowStockProducts,
    recentOrders,
    newInquiries,
    thisMonthRevenue,
    revenueChange,
    avgOrderValue,
    monthlyRevenue: Object.entries(monthlyRevenue).map(([month, revenue]) => ({ month, revenue })),
    pendingReviews,
    recentActivity,
  };
}

export default async function AdminDashboard() {
  await requireAdmin();
  const stats = await getDashboardStats();

  const statCards = [
    {
      label: "Total Revenue",
      value: formatPrice(stats.totalRevenue),
      sub: `₹${stats.thisMonthRevenue.toLocaleString("en-IN")} this month`,
      icon: DollarSign,
      color: "bg-emerald-600",
      badge: stats.revenueChange !== 0 ? `${stats.revenueChange > 0 ? "+" : ""}${stats.revenueChange}% vs last month` : "No prior month data",
      badgeColor: stats.revenueChange >= 0 ? "text-emerald-600 bg-emerald-50" : "text-red-600 bg-red-50",
    },
    {
      label: "Total Orders",
      value: stats.totalOrders.toString(),
      sub: `${stats.pendingOrders} pending · ${stats.processingOrders} in progress`,
      icon: ShoppingCart,
      color: "bg-blue-600",
      badge: stats.pendingOrders > 0 ? `${stats.pendingOrders} need action` : "All caught up",
      badgeColor: stats.pendingOrders > 0 ? "text-amber-600 bg-amber-50" : "text-gray-600 bg-gray-100",
    },
    {
      label: "Active Products",
      value: stats.totalProducts.toString(),
      sub: `${stats.lowStockProducts.length} below stock threshold`,
      icon: Package,
      color: "bg-violet-600",
      badge: stats.lowStockProducts.length > 0 ? "Restock needed" : "Stock healthy",
      badgeColor: stats.lowStockProducts.length > 0 ? "text-orange-600 bg-orange-50" : "text-emerald-600 bg-emerald-50",
    },
    {
      label: "B2B Customers",
      value: stats.totalCustomers.toString(),
      sub: `Avg order ${formatPrice(stats.avgOrderValue)}`,
      icon: Users,
      color: "bg-orange-600",
      badge: "Registered accounts",
      badgeColor: "text-gray-600 bg-gray-100",
    },
    {
      label: "New Inquiries",
      value: stats.newInquiriesCount.toString(),
      sub: "Awaiting response",
      icon: MessageSquare,
      color: "bg-rose-600",
      badge: stats.newInquiriesCount > 0 ? "Respond soon" : "Inbox clear",
      badgeColor: stats.newInquiriesCount > 0 ? "text-rose-600 bg-rose-50" : "text-emerald-600 bg-emerald-50",
    },
    {
      label: "Subscribers",
      value: stats.subscriberCount.toString(),
      sub: "Newsletter list",
      icon: Mail,
      color: "bg-brand-600",
      badge: "Active emails",
      badgeColor: "text-gray-600 bg-gray-100",
    },
    {
      label: "Pending Reviews",
      value: stats.pendingReviews.toString(),
      sub: "Awaiting moderation",
      icon: Star,
      color: "bg-yellow-600",
      badge: stats.pendingReviews > 0 ? "Moderate now" : "All clear",
      badgeColor: stats.pendingReviews > 0 ? "text-yellow-700 bg-yellow-50" : "text-emerald-600 bg-emerald-50",
    },
  ];

  const quickActions = [
    { href: "/admin/products/new", label: "Add Product", desc: "New SKU listing" },
    { href: "/admin/users", label: "User Management", desc: "View & export users" },
    { href: "/admin/website", label: "Website Content", desc: "FAQ, testimonials, sections" },
    { href: "/admin/orders", label: "Manage Orders", desc: "Update status & tracking" },
    { href: "/admin/inquiries", label: "Inquiries", desc: "Bulk quotes & repairs" },
    { href: "/admin/categories/new", label: "Add Category", desc: "New product group" },
    { href: "/admin/coupons/new", label: "Create Coupon", desc: "Discount codes" },
    { href: "/admin/reviews", label: "Moderate Reviews", desc: "Approve customer reviews" },
    { href: "/admin/reports", label: "View Reports", desc: "Inventory & sales" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Overview</h1>
          <p className="text-gray-500 text-sm">Live data from your Lohiya Suppliers store</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          {new Date().toLocaleDateString("en-IN", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-lg transition-all hover:border-brand-100">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 ${card.color} rounded-lg flex items-center justify-center`}>
                <card.icon className="w-5 h-5 text-white" />
              </div>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${card.badgeColor}`}>
                {card.badge}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
            <div className="text-sm font-medium text-gray-700 mt-0.5">{card.label}</div>
            <div className="text-xs text-gray-500 mt-1">{card.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Revenue by Month</h2>
            <Link href="/admin/analytics" className="text-xs text-brand-600 hover:underline">Full analytics →</Link>
          </div>
          <RevenueChart data={stats.monthlyRevenue} />
        </div>
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" /> Low Stock Alert
            </h2>
            <Link href="/admin/products" className="text-xs text-brand-600 hover:underline">Manage</Link>
          </div>
          <LowStockAlert products={stats.lowStockProducts} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Recent Orders</h2>
            <Link href="/admin/orders" className="text-sm text-brand-600 hover:underline">View all</Link>
          </div>
          <RecentOrders orders={stats.recentOrders} />
        </div>
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">New Inquiries</h2>
            <Link href="/admin/inquiries" className="text-sm text-brand-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {stats.newInquiries.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-6">No pending inquiries</p>
            ) : (
              stats.newInquiries.map((inq) => (
                <Link key={inq.id} href="/admin/inquiries" className="flex items-start justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div>
                    <div className="font-medium text-sm text-gray-900">{inq.name}</div>
                    <div className="text-xs text-gray-500">{inq.subject}</div>
                    {inq.company && <div className="text-xs text-gray-400">{inq.company}</div>}
                  </div>
                  <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full shrink-0">{inq.type}</span>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>

      {stats.recentActivity.length > 0 && (
        <div className="bg-white rounded-xl border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-600" /> Recent Activity
            </h2>
            <Link href="/admin/activity" className="text-xs text-brand-600 hover:underline">View all →</Link>
          </div>
          <div className="space-y-2">
            {stats.recentActivity.map((log) => (
              <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                <div>
                  <span className="font-medium text-gray-900">{log.action}</span>
                  <span className="text-gray-500"> · {log.entity}</span>
                  {log.details && <span className="text-gray-400 text-xs block">{log.details}</span>}
                </div>
                <span className="text-xs text-gray-400 shrink-0">{formatDateTime(log.createdAt)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="font-bold text-gray-900 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action) => (
            <Link key={action.href} href={action.href}
              className="bg-white rounded-xl border p-4 hover:shadow-md hover:border-brand-200 transition-all group">
              <div className="text-sm font-semibold text-gray-900 group-hover:text-brand-700">{action.label}</div>
              <div className="text-xs text-gray-500 mt-1">{action.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import Link from "next/link";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { Package, FileText, Building2, ArrowRight } from "lucide-react";

export const metadata = { title: "My Account" };

export default async function AccountPage() {
  const session = await requireAuth();
  const userId = session.user.id;

  const [user, orders, verifiedOrders] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: { select: { name: true } } } } },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.order.count({ where: { userId, isVerified: true } }),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Dashboard</h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <AccountSidebar />

        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Orders", value: orders.length, icon: Package, href: "/account/orders" },
              { label: "Proforma Invoices", value: verifiedOrders, icon: FileText, href: "/account/invoices" },
              { label: "Company", value: user?.company || "—", icon: Building2, href: "/account/profile" },
            ].map((s) => (
              <Link key={s.label} href={s.href}
                className="bg-white rounded-xl border p-5 hover:shadow-md hover:border-brand-200 transition-all group">
                <s.icon className="w-5 h-5 text-brand-600 mb-2" />
                <div className="text-2xl font-bold text-gray-900 truncate">{s.value}</div>
                <div className="text-sm text-gray-500">{s.label}</div>
              </Link>
            ))}
          </div>

          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-bold text-gray-900 mb-4">Company Profile</h2>
            <div className="grid grid-cols-2 gap-3 text-sm">
              {[
                ["Company", user?.company], ["Company ID", user?.companyId], ["Phone", user?.phone],
                ["GST", user?.gstNumber], ["Address", user?.address],
                ["Location", `${user?.city || ""}, ${user?.state || ""}, ${user?.country || ""}`],
              ].map(([k, v]) => (
                <div key={k}><span className="text-gray-500">{k}:</span> <span className="font-medium">{v || "—"}</span></div>
              ))}
            </div>
            <Link href="/account/profile" className="inline-flex items-center gap-1 text-sm text-brand-600 mt-4 hover:underline">
              Edit profile <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          <div className="bg-white rounded-xl border">
            <div className="p-6 border-b flex justify-between items-center">
              <h2 className="font-bold text-gray-900">Recent Orders</h2>
              <Link href="/account/orders" className="text-sm text-brand-600 hover:underline">View all</Link>
            </div>
            {orders.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <p>No orders yet.</p>
                <Link href="/products" className="text-brand-600 text-sm mt-2 inline-block">Browse products →</Link>
              </div>
            ) : (
              <div className="divide-y">
                {orders.map((order) => (
                  <div key={order.id} className="p-5 flex justify-between items-center">
                    <div>
                      <div className="font-medium">{order.orderNumber}</div>
                      <div className="text-xs text-gray-500">{formatDate(order.createdAt)} · {formatPrice(order.total)}</div>
                    </div>
                    {order.isVerified ? (
                      <Link href={`/account/invoices/${order.id}`}
                        className="text-xs px-3 py-1.5 bg-green-50 text-green-700 rounded-lg font-medium hover:bg-green-100">
                        View Invoice
                      </Link>
                    ) : (
                      <span className="text-xs text-gray-400">Awaiting verification</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate, getStatusColor } from "@/lib/utils";
import Link from "next/link";
import { AccountSidebar } from "@/components/account/AccountSidebar";

export const metadata = { title: "My Orders" };

export default async function AccountOrdersPage() {
  const session = await requireAuth();
  const orders = await prisma.order.findMany({
    where: { userId: session.user.id },
    include: { items: { include: { product: { select: { name: true, sku: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <AccountSidebar />
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl border overflow-hidden">
            {orders.length === 0 ? (
              <p className="p-8 text-center text-gray-500">No orders placed yet.</p>
            ) : (
              <div className="divide-y">
                {orders.map((order) => (
                  <div key={order.id} className="p-6">
                    <div className="flex flex-wrap justify-between gap-3 mb-3">
                      <div>
                        <div className="font-bold text-gray-900">{order.orderNumber}</div>
                        <div className="text-xs text-gray-500">{formatDate(order.createdAt)} · {order.items.length} items</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-brand-900">{formatPrice(order.total)}</div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>{order.status}</span>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      {order.items.map((i) => `${i.product.name} ×${i.quantity}`).join(" · ")}
                    </div>
                    {order.isVerified && order.invoiceNumber ? (
                      <Link href={`/account/invoices/${order.id}`}
                        className="inline-flex items-center gap-1 text-sm text-brand-600 font-medium hover:underline">
                        View Proforma Invoice ({order.invoiceNumber}) →
                      </Link>
                    ) : (
                      <p className="text-xs text-amber-600">Proforma invoice will be available after admin verification</p>
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

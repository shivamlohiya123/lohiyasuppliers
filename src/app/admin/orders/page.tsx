import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate, getStatusColor } from "@/lib/utils";
import Link from "next/link";
import { OrderStatusUpdater } from "@/components/admin/OrderStatusUpdater";
import { CsvDownloadButton } from "@/components/admin/CsvDownloadButton";

export const metadata = { title: "Orders" };

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { user: true, items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  const statusCounts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
          <p className="text-gray-500 text-sm">{orders.length} total orders</p>
        </div>
        <CsvDownloadButton href="/api/admin/orders/export" label="Export Orders (CSV)" />
      </div>

      <div className="flex flex-wrap gap-3">
        {Object.entries(statusCounts).map(([status, count]) => (
          <div key={status} className={`px-4 py-2 rounded-lg text-sm ${getStatusColor(status)}`}>
            {status}: <strong>{count}</strong>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Order</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Items</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Total</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Payment</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {orders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-brand-700">
                  <Link href={`/admin/orders/${order.id}`}>{order.orderNumber}</Link>
                </td>
                <td className="px-4 py-3">
                  <div>{order.user?.name || order.guestName || "Guest"}</div>
                  <div className="text-xs text-gray-500">{order.user?.email || order.guestEmail}</div>
                </td>
                <td className="px-4 py-3 text-gray-600">{order.items.length} items</td>
                <td className="px-4 py-3 font-medium">{formatPrice(order.total)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(order.paymentStatus)}`}>
                    {order.paymentStatus}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <OrderStatusUpdater orderId={order.id} currentStatus={order.status} />
                </td>
                <td className="px-4 py-3 text-gray-500">{formatDate(order.createdAt)}</td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/orders/${order.id}`} className="text-brand-600 hover:underline text-xs">View</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

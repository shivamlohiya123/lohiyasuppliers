import { formatPrice, formatDate, getStatusColor } from "@/lib/utils";
import Link from "next/link";

interface Order {
  id: string;
  orderNumber: string;
  total: number;
  status: string;
  createdAt: Date;
  user: { name: string | null; email: string } | null;
  guestName: string | null;
}

export function RecentOrders({ orders }: { orders: Order[] }) {
  if (orders.length === 0) {
    return <p className="text-sm text-gray-500 text-center py-4">No orders yet</p>;
  }

  return (
    <div className="space-y-3">
      {orders.map((order) => (
        <Link
          key={order.id}
          href={`/admin/orders/${order.id}`}
          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div>
            <div className="font-medium text-sm text-gray-900">{order.orderNumber}</div>
            <div className="text-xs text-gray-500">
              {order.user?.name || order.guestName || "Guest"} · {formatDate(order.createdAt)}
            </div>
          </div>
          <div className="text-right">
            <div className="font-medium text-sm">{formatPrice(order.total)}</div>
            <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(order.status)}`}>
              {order.status}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

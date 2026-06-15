import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { formatPrice, formatDateTime, parseJSON, getStatusColor } from "@/lib/utils";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { OrderDetailActions } from "@/components/admin/OrderDetailActions";
import { ProformaInvoiceView } from "@/components/invoice/ProformaInvoiceView";
import type { ProformaInvoiceData } from "@/lib/invoice";
import { PrintInvoiceButton } from "@/components/invoice/PrintInvoiceButton";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: Props) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { user: true, items: { include: { product: true } } },
  });
  if (!order) notFound();

  const address = parseJSON<Record<string, string>>(order.shippingAddress, {});

  return (
    <div className="space-y-6">
      <Link href="/admin/orders" className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline">
        <ArrowLeft className="w-4 h-4" /> Back to Orders
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{order.orderNumber}</h1>
          <p className="text-gray-500 text-sm">Placed on {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.status)}`}>{order.status}</span>
          <span className={`px-3 py-1 rounded-full text-sm ${getStatusColor(order.paymentStatus)}`}>{order.paymentStatus}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-bold mb-4">Order Items</h2>
            <div className="divide-y">
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between py-3">
                  <div>
                    <div className="font-medium">{item.product.name}</div>
                    <div className="text-xs text-gray-500">SKU: {item.product.sku} × {item.quantity}</div>
                  </div>
                  <div className="font-medium">{formatPrice(item.total)}</div>
                </div>
              ))}
            </div>
            <div className="border-t mt-4 pt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{formatPrice(order.shipping)}</span></div>
              <div className="flex justify-between"><span>Tax</span><span>{formatPrice(order.tax)}</span></div>
              <div className="flex justify-between font-bold text-lg"><span>Total</span><span>{formatPrice(order.total)}</span></div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <OrderDetailActions
            orderId={order.id}
            status={order.status}
            paymentStatus={order.paymentStatus}
            trackingNumber={order.trackingNumber}
            isVerified={order.isVerified}
          />
          {order.user && (
            <div className="bg-white rounded-xl border p-6">
              <h2 className="font-bold mb-4">Company Details</h2>
              <div className="text-sm space-y-2">
                <div><span className="text-gray-500">Company:</span> {order.user.company || "—"}</div>
                <div><span className="text-gray-500">Company ID:</span> {order.user.companyId || "—"}</div>
                <div><span className="text-gray-500">GST:</span> {order.user.gstNumber || "—"}</div>
                <div><span className="text-gray-500">Address:</span> {order.user.address || "—"}</div>
                <div><span className="text-gray-500">City/State:</span> {order.user.city}, {order.user.state}, {order.user.country}</div>
                <div><span className="text-gray-500">Pincode:</span> {order.user.pincode || "—"}</div>
              </div>
            </div>
          )}
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-bold mb-4">Customer</h2>
            <div className="text-sm space-y-2">
              <div><span className="text-gray-500">Name:</span> {order.user?.name || order.guestName}</div>
              <div><span className="text-gray-500">Email:</span> {order.user?.email || order.guestEmail}</div>
              <div><span className="text-gray-500">Phone:</span> {order.user?.phone || order.guestPhone || "N/A"}</div>
              <div><span className="text-gray-500">Payment:</span> {order.paymentMethod}</div>
            </div>
          </div>
          <div className="bg-white rounded-xl border p-6">
            <h2 className="font-bold mb-4">Shipping Address</h2>
            <div className="text-sm text-gray-600 space-y-1">
              <div>{address.fullName}</div>
              <div>{address.address}</div>
              <div>{address.city}, {address.state} - {address.pincode}</div>
              <div>{address.phone}</div>
            </div>
          </div>
        </div>
      </div>

      {order.isVerified && order.invoiceSnapshot && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Proforma Invoice — {order.invoiceNumber}</h2>
            <PrintInvoiceButton />
          </div>
          <ProformaInvoiceView data={parseJSON<ProformaInvoiceData>(order.invoiceSnapshot, {} as ProformaInvoiceData)} />
        </div>
      )}
    </div>
  );
}

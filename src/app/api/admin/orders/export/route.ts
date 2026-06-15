import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-api";
import { formatDate } from "@/lib/utils";

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  const orders = await prisma.order.findMany({
    include: { user: true, items: { include: { product: true } } },
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "Order Number", "Customer", "Email", "Phone", "Status", "Payment",
    "Subtotal", "Tax", "Shipping", "Discount", "Total", "Items", "Date",
  ];

  const rows = orders.map((o) => [
    o.orderNumber,
    o.user?.name || o.guestName || "Guest",
    o.user?.email || o.guestEmail || "",
    o.user?.phone || o.guestPhone || "",
    o.status,
    o.paymentStatus,
    o.subtotal.toFixed(2),
    o.tax.toFixed(2),
    o.shipping.toFixed(2),
    o.discount.toFixed(2),
    o.total.toFixed(2),
    o.items.map((i) => `${i.product.name} x${i.quantity}`).join("; "),
    formatDate(o.createdAt),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="lohiya-orders-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

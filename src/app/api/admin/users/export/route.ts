import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-api";
import { formatDate, formatDateTime } from "@/lib/utils";

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  const users = await prisma.user.findMany({
    include: {
      _count: { select: { orders: true, reviews: true, inquiries: true, addresses: true } },
      orders: { select: { orderNumber: true, total: true, status: true, isVerified: true, invoiceNumber: true, createdAt: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "ID", "Name", "Email", "Phone", "Company", "Company ID", "Address", "City", "State", "Country", "Pincode",
    "GST Number", "Profile Complete", "Role", "Status", "Orders", "Total Spent", "Invoices", "Joined",
  ];

  const rows = users.map((u) => {
    const totalSpent = u.orders.reduce((s, o) => s + o.total, 0);
    const invoices = u.orders.filter((o) => o.isVerified).length;
    return [
      u.id, u.name || "", u.email, u.phone || "", u.company || "", u.companyId || "",
      u.address || "", u.city || "", u.state || "", u.country || "", u.pincode || "",
      u.gstNumber || "", u.profileComplete ? "Yes" : "No", u.role,
      u.isActive ? "Active" : "Inactive", u._count.orders, totalSpent.toFixed(2),
      invoices, formatDate(u.createdAt),
    ];
  });

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="lohiya-users-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

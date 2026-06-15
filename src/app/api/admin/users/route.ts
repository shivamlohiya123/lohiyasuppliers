import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-api";

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  const users = await prisma.user.findMany({
    include: {
      _count: { select: { orders: true, reviews: true, inquiries: true } },
      orders: { select: { total: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users.map((u) => ({
    ...u,
    password: undefined,
    totalSpent: u.orders.reduce((s, o) => s + o.total, 0),
  })));
}

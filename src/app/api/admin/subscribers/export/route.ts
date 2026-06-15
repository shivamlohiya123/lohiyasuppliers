import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-api";
import { formatDate } from "@/lib/utils";

export async function GET() {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  const subscribers = await prisma.subscriber.findMany({ orderBy: { createdAt: "desc" } });

  const headers = ["Email", "Status", "Subscribed Date"];
  const rows = subscribers.map((s) => [
    s.email,
    s.isActive ? "Active" : "Unsubscribed",
    formatDate(s.createdAt),
  ]);

  const csv = [headers, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="lohiya-subscribers-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}

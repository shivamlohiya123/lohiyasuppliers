import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-api";

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;
  const { id } = await params;
  await prisma.subscriber.update({ where: { id }, data: { isActive: false } });
  return NextResponse.json({ success: true });
}

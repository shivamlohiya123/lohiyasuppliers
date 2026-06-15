import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-api";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: { include: { items: { include: { product: true } } }, orderBy: { createdAt: "desc" } },
      inquiries: { orderBy: { createdAt: "desc" } },
      reviews: { include: { product: true } },
      addresses: true,
    },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { password: _, ...safeUser } = user;
  return NextResponse.json(safeUser);
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;
  const { id } = await params;
  const data = await req.json();

  const allowed = ["name", "email", "phone", "company", "companyId", "address", "city", "state", "country", "pincode", "gstNumber", "role", "isActive", "profileComplete"];
  const update: Record<string, unknown> = {};
  for (const key of allowed) {
    if (data[key] !== undefined) update[key] = data[key];
  }

  const user = await prisma.user.update({ where: { id }, data: update });
  const { password: _, ...safe } = user;
  return NextResponse.json(safe);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;
  const { id } = await params;

  if (auth.session.user.id === id) {
    return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
  }

  await prisma.user.delete({ where: { id } });
  return NextResponse.json({ success: true });
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdminApi } from "@/lib/admin-api";
import { logActivity } from "@/lib/activity-log";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  const { id } = await params;
  const body = await req.json();
  const { isApproved } = body;

  const review = await prisma.review.update({
    where: { id },
    data: { isApproved: Boolean(isApproved) },
    include: { product: { select: { name: true } }, user: { select: { email: true } } },
  });

  await logActivity(
    isApproved ? "APPROVED" : "REJECTED",
    "Review",
    id,
    `${review.product.name} by ${review.user.email}`,
    (auth.session.user as { id: string }).id
  );

  return NextResponse.json(review);
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAdminApi();
  if (!auth.authorized) return auth.response;

  const { id } = await params;
  await prisma.review.delete({ where: { id } });

  await logActivity("DELETED", "Review", id, undefined, auth.session.user.id);

  return NextResponse.json({ success: true });
}

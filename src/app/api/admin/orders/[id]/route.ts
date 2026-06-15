import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { buildProformaSnapshot, generateInvoiceNumber } from "@/lib/invoice";
import { logActivity } from "@/lib/activity-log";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as { role: string }).role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const body = await req.json();

  if (body.verify === true) {
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        user: true,
        items: { include: { product: { select: { name: true, sku: true } } } },
      },
    });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    if (order.isVerified) return NextResponse.json({ error: "Order already verified" }, { status: 400 });

    const settings = await getSettings();
    const invoiceNumber = generateInvoiceNumber();
    const snapshot = buildProformaSnapshot(order, invoiceNumber, {
      name: settings.siteName,
      address: settings.contactAddress,
      phone: settings.contactPhone,
      email: settings.contactEmail,
      gstNumber: settings.gstNumber,
    });

    const updated = await prisma.order.update({
      where: { id },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
        invoiceNumber,
        invoiceSnapshot: JSON.stringify(snapshot),
        status: order.status === "PENDING" ? "CONFIRMED" : order.status,
      },
    });

    await logActivity("VERIFIED", "Order", id, `Proforma ${invoiceNumber} generated`, (session.user as { id: string }).id);

    return NextResponse.json(updated);
  }

  const { status, paymentStatus, trackingNumber } = body;
  const order = await prisma.order.update({
    where: { id },
    data: { status, paymentStatus, trackingNumber },
  });
  return NextResponse.json(order);
}

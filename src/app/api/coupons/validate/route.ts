import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { code, subtotal } = await req.json();
  if (!code) return NextResponse.json({ error: "Coupon code required" }, { status: 400 });

  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } });
  if (!coupon || !coupon.isActive) return NextResponse.json({ error: "Invalid coupon code" }, { status: 400 });
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return NextResponse.json({ error: "Coupon expired" }, { status: 400 });
  if (coupon.maxUses && coupon.usedCount >= coupon.maxUses) return NextResponse.json({ error: "Coupon usage limit reached" }, { status: 400 });
  if (subtotal < coupon.minOrder) return NextResponse.json({ error: `Minimum order ₹${coupon.minOrder} required` }, { status: 400 });

  const discount = coupon.discountType === "PERCENTAGE"
    ? subtotal * (coupon.discountValue / 100)
    : coupon.discountValue;

  return NextResponse.json({
    code: coupon.code,
    discount: Math.min(discount, subtotal),
    description: coupon.description,
  });
}

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { CouponForm } from "@/components/admin/CouponForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditCouponPage({ params }: Props) {
  const { id } = await params;
  const coupon = await prisma.coupon.findUnique({ where: { id } });
  if (!coupon) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Edit Coupon</h1>
      <CouponForm initial={coupon} />
    </div>
  );
}

import { CouponForm } from "@/components/admin/CouponForm";

export const metadata = { title: "Create Coupon" };

export default function NewCouponPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Create Coupon</h1>
      <CouponForm />
    </div>
  );
}

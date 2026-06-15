import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";
import { CouponActions } from "@/components/admin/CouponActions";

export const metadata = { title: "Coupons" };

export default async function AdminCouponsPage() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Coupons & Discounts</h1>
          <p className="text-gray-500 text-sm">{coupons.filter((c) => c.isActive).length} active codes</p>
        </div>
        <Link href="/admin/coupons/new" className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">
          <Plus className="w-4 h-4" /> Create Coupon
        </Link>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Code</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Description</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Discount</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Min Order</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Usage</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {coupons.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-mono font-bold text-brand-700">{c.code}</td>
                <td className="px-4 py-3 text-gray-600">{c.description}</td>
                <td className="px-4 py-3 font-medium">
                  {c.discountType === "PERCENTAGE" ? `${c.discountValue}%` : `₹${c.discountValue}`}
                </td>
                <td className="px-4 py-3">₹{c.minOrder}</td>
                <td className="px-4 py-3">{c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ""}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${c.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {c.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Link href={`/admin/coupons/${c.id}/edit`} className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
                      <Edit className="w-4 h-4" />
                    </Link>
                    <CouponActions couponId={c.id} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

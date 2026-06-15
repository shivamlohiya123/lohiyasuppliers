import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatDate, formatPrice } from "@/lib/utils";
import { Eye, UserCog } from "lucide-react";
import { UserRoleBadge } from "@/components/admin/UserRoleBadge";
import { CsvDownloadButton } from "@/components/admin/CsvDownloadButton";

export const metadata = { title: "User Management" };

export default async function UserManagementPage() {
  const users = await prisma.user.findMany({
    include: {
      _count: { select: { orders: true, reviews: true, inquiries: true } },
      orders: { select: { total: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const stats = {
    total: users.length,
    active: users.filter((u) => u.isActive).length,
    customers: users.filter((u) => u.role === "CUSTOMER" || u.role === "B2B_PARTNER").length,
    admins: users.filter((u) => u.role === "ADMIN").length,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <UserCog className="w-7 h-7 text-brand-600" />
            User Management
          </h1>
          <p className="text-gray-500 text-sm">View, edit, and export all user accounts</p>
        </div>
        <CsvDownloadButton
          href="/api/admin/users/export"
          label="Download All Users (CSV)"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Users", value: stats.total },
          { label: "Active", value: stats.active },
          { label: "Customers", value: stats.customers },
          { label: "Admins", value: stats.admins },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-xl border p-4">
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">User</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Company / GST</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Role</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Orders</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Spent</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Joined</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map((u) => {
              const totalSpent = u.orders.reduce((s, o) => s + o.total, 0);
              return (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{u.name || "—"}</div>
                    <div className="text-xs text-gray-500">{u.email}</div>
                    <div className="text-xs text-gray-400">{u.phone || "—"}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-gray-600">{u.company || "—"}</div>
                    <div className="text-xs text-gray-400">{u.companyId || ""}</div>
                    <div className="text-xs font-mono text-gray-400">{u.gstNumber || ""}</div>
                  </td>
                  <td className="px-4 py-3"><UserRoleBadge role={u.role} /></td>
                  <td className="px-4 py-3">{u._count.orders}</td>
                  <td className="px-4 py-3 font-medium">{formatPrice(totalSpent)}</td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${u.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                      {u.isActive ? "Active" : "Inactive"}
                    </span>
                    {!u.profileComplete && u.role !== "ADMIN" && (
                      <span className="block mt-1 text-xs text-amber-600">Profile incomplete</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/users/${u.id}`} className="inline-flex items-center gap-1 text-brand-600 hover:underline text-xs font-medium">
                      <Eye className="w-3.5 h-3.5" /> View Details
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

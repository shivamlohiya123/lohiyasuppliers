import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";
import Link from "next/link";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { FileText } from "lucide-react";

export const metadata = { title: "Proforma Invoices" };

export default async function AccountInvoicesPage() {
  const session = await requireAuth();
  const invoices = await prisma.order.findMany({
    where: { userId: session.user.id, isVerified: true },
    orderBy: { verifiedAt: "desc" },
    select: {
      id: true, orderNumber: true, invoiceNumber: true, total: true,
      createdAt: true, verifiedAt: true,
    },
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Proforma Invoices</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <AccountSidebar />
        <div className="lg:col-span-3">
          {invoices.length === 0 ? (
            <div className="bg-white rounded-xl border p-12 text-center text-gray-500">
              <FileText className="w-12 h-12 mx-auto text-gray-300 mb-3" />
              <p>No proforma invoices yet.</p>
              <p className="text-sm mt-1">Invoices are generated after admin verifies your orders.</p>
            </div>
          ) : (
            <div className="bg-white rounded-xl border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Invoice No.</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Order</th>
                    <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Amount</th>
                    <th className="text-right px-4 py-3 font-medium text-gray-600">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-mono font-medium text-brand-700">{inv.invoiceNumber}</td>
                      <td className="px-4 py-3">{inv.orderNumber}</td>
                      <td className="px-4 py-3 text-gray-500">{formatDate(inv.verifiedAt || inv.createdAt)}</td>
                      <td className="px-4 py-3 text-right font-bold">{formatPrice(inv.total)}</td>
                      <td className="px-4 py-3 text-right">
                        <Link href={`/account/invoices/${inv.id}`} className="text-brand-600 hover:underline font-medium">
                          View / Download
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { formatPrice, formatDate } from "@/lib/utils";

export const metadata = { title: "Reports" };

export default async function AdminReportsPage() {
  const [orders, products, lowStock, inquiries] = await Promise.all([
    prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: "desc" } }),
    prisma.product.findMany({ where: { isActive: true } }),
    prisma.product.findMany({ where: { stock: { lte: 10 }, isActive: true } }),
    prisma.inquiry.groupBy({ by: ["type"], _count: true }),
  ]);

  const revenueByStatus = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + o.total;
    return acc;
  }, {} as Record<string, number>);

  const inventoryValue = products.reduce((sum, p) => sum + p.price * p.stock, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reports</h1>
        <p className="text-gray-500 text-sm">Generated on {formatDate(new Date())}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-bold text-gray-900 mb-2">Inventory Value</h3>
          <div className="text-3xl font-bold text-brand-700">{formatPrice(inventoryValue)}</div>
          <p className="text-sm text-gray-500 mt-1">{products.length} active products</p>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-bold text-gray-900 mb-2">Low Stock Items</h3>
          <div className="text-3xl font-bold text-orange-600">{lowStock.length}</div>
          <p className="text-sm text-gray-500 mt-1">Need restocking</p>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <h3 className="font-bold text-gray-900 mb-2">Total Orders</h3>
          <div className="text-3xl font-bold text-gray-900">{orders.length}</div>
          <p className="text-sm text-gray-500 mt-1">All time</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-bold mb-4">Revenue by Order Status</h2>
          <div className="space-y-2">
            {Object.entries(revenueByStatus).map(([status, revenue]) => (
              <div key={status} className="flex justify-between p-3 bg-gray-50 rounded-lg text-sm">
                <span>{status}</span>
                <span className="font-medium">{formatPrice(revenue)}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-bold mb-4">Inquiries by Type</h2>
          <div className="space-y-2">
            {inquiries.map((inq) => (
              <div key={inq.type} className="flex justify-between p-3 bg-gray-50 rounded-lg text-sm">
                <span>{inq.type}</span>
                <span className="font-medium">{inq._count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {lowStock.length > 0 && (
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-bold mb-4 text-orange-700">⚠️ Low Stock Report</h2>
          <table className="w-full text-sm">
            <thead><tr className="text-gray-500">
              <th className="text-left py-2">Product</th><th className="text-left py-2">SKU</th><th className="text-right py-2">Stock</th>
            </tr></thead>
            <tbody className="divide-y">
              {lowStock.map((p) => (
                <tr key={p.id}>
                  <td className="py-2">{p.name}</td>
                  <td className="py-2 font-mono text-xs">{p.sku}</td>
                  <td className="py-2 text-right text-orange-600 font-bold">{p.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

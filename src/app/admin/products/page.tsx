import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Plus } from "lucide-react";
import { ProductActions } from "@/components/admin/ProductActions";
import { AdminProductFilters } from "@/components/admin/AdminProductFilters";
import { Suspense } from "react";

export const metadata = { title: "Products" };

interface Props {
  searchParams: Promise<{ search?: string; category?: string }>;
}

export default async function AdminProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const where: Record<string, unknown> = {};

  if (params.category) where.category = { slug: params.category };
  if (params.search) {
    where.OR = [
      { name: { contains: params.search } },
      { sku: { contains: params.search } },
    ];
  }

  const [products, categories] = await Promise.all([
    prisma.product.findMany({ where, include: { category: true }, orderBy: { createdAt: "desc" } }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 text-sm">{products.length} products{params.search ? ` matching "${params.search}"` : ""}</p>
        </div>
        <Link href="/admin/products/new" className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">
          <Plus className="w-4 h-4" /> Add Product
        </Link>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <Suspense fallback={<div className="p-4 border-b h-14 animate-pulse bg-gray-50" />}>
          <AdminProductFilters categories={categories} />
        </Suspense>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left px-4 py-3 font-medium">Product</th>
                <th className="text-left px-4 py-3 font-medium">SKU</th>
                <th className="text-left px-4 py-3 font-medium">Category</th>
                <th className="text-left px-4 py-3 font-medium">Price</th>
                <th className="text-left px-4 py-3 font-medium">Stock</th>
                <th className="text-left px-4 py-3 font-medium">Status</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-lg shrink-0">
                        {product.category.icon || "⚙️"}
                      </div>
                      <div>
                        <Link href={`/products/${product.slug}`} className="font-medium text-gray-900 hover:text-brand-700">
                          {product.name}
                        </Link>
                        {product.isFeatured && <span className="block text-xs text-accent-600">Featured</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">{product.sku}</td>
                  <td className="px-4 py-3 text-gray-600">{product.category.name}</td>
                  <td className="px-4 py-3 font-medium">{formatPrice(product.price)}</td>
                  <td className="px-4 py-3">
                    <span className={product.stock <= product.lowStockAlert ? "text-orange-600 font-medium" : "text-gray-600"}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${product.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ProductActions productId={product.id} slug={product.slug} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && (
            <p className="text-center text-gray-500 py-8">No products found</p>
          )}
        </div>
      </div>
    </div>
  );
}

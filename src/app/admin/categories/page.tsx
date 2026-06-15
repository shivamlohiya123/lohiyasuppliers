import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit, Trash2 } from "lucide-react";
import { CategoryActions } from "@/components/admin/CategoryActions";

export const metadata = { title: "Categories" };

export default async function AdminCategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-500 text-sm">{categories.length} categories · Metal, Wood & Services</p>
        </div>
        <Link href="/admin/categories/new" className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">
          <Plus className="w-4 h-4" /> Add Category
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white rounded-xl border p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="text-3xl">{cat.icon || "📦"}</div>
              <div className="flex items-center gap-1">
                <Link href={`/admin/categories/${cat.id}/edit`} className="p-1.5 rounded hover:bg-gray-100 text-gray-500">
                  <Edit className="w-4 h-4" />
                </Link>
                <CategoryActions categoryId={cat.id} productCount={cat._count.products} />
              </div>
            </div>
            <h3 className="font-bold text-gray-900 mt-3">{cat.name}</h3>
            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{cat.description}</p>
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-gray-500">{cat._count.products} products</span>
              <span className={`px-2 py-0.5 rounded-full text-xs ${cat.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                {cat.isActive ? "Active" : "Inactive"}
              </span>
            </div>
            <div className="flex gap-2 mt-3">
              <span className="px-2 py-0.5 bg-brand-50 text-brand-700 rounded text-xs">{cat.industry}</span>
              <Link href={`/categories/${cat.slug}`} className="text-xs text-brand-600 hover:underline">View on store →</Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

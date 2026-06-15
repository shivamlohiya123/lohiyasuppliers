import { prisma } from "@/lib/prisma";
import { ProductCard } from "@/components/products/ProductCard";
import { ProductFilters } from "@/components/products/ProductFilters";
import { Suspense } from "react";

export const metadata = { title: "All Products" };
export const revalidate = 60;

interface Props {
  searchParams: Promise<{ category?: string; search?: string; sort?: string }>;
}

export default async function ProductsPage({ searchParams }: Props) {
  const params = await searchParams;
  const where: Record<string, unknown> = { isActive: true };

  if (params.category) {
    where.category = { slug: params.category };
  }
  if (params.search) {
    where.OR = [
      { name: { contains: params.search } },
      { sku: { contains: params.search } },
      { description: { contains: params.search } },
    ];
  }

  let orderBy: Record<string, string> = { createdAt: "desc" };
  if (params.sort === "price-asc") orderBy = { price: "asc" };
  if (params.sort === "price-desc") orderBy = { price: "desc" };
  if (params.sort === "name") orderBy = { name: "asc" };

  const productSelect = {
    id: true,
    name: true,
    slug: true,
    shortDesc: true,
    price: true,
    comparePrice: true,
    sku: true,
    images: true,
    isFeatured: true,
    category: { select: { name: true, slug: true, icon: true } },
  } as const;

  const [products, categories] = await Promise.all([
    prisma.product.findMany({ where, select: productSelect, orderBy }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true },
    }),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">All Products</h1>
        <p className="text-gray-600 mt-2">
          Precision cutting & grinding solutions for every industry
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <Suspense fallback={<div className="lg:w-64 shrink-0 h-48 bg-white rounded-2xl border animate-pulse" />}>
          <ProductFilters categories={categories} currentCategory={params.category} currentSort={params.sort} />
        </Suspense>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500">{products.length} products found</p>
          </div>
          {products.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm mt-1">Try adjusting your filters or search terms</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

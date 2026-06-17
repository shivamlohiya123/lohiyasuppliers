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
      { description: { contains: params.search } },
    ];
  }

  let orderBy: Record<string, string> = { createdAt: "desc" };
  if (params.sort === "price-asc") orderBy = { defaultPricePaise: "asc" };
  if (params.sort === "price-desc") orderBy = { defaultPricePaise: "desc" };
  if (params.sort === "name") orderBy = { name: "asc" };

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        defaultPricePaise: true,
        images: true,
        category: { select: { name: true, slug: true, type: true } },
        variations: { where: { isActive: true }, select: { id: true } },
      },
      orderBy,
    }),
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
        <p className="text-gray-600 mt-2">B2B catalog with custom client pricing</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <Suspense
          fallback={
            <div className="lg:w-64 shrink-0 h-48 bg-white rounded-2xl border animate-pulse" />
          }
        >
          <ProductFilters
            categories={categories}
            currentCategory={params.category}
            currentSort={params.sort}
          />
        </Suspense>
        <div className="flex-1">
          <p className="text-sm text-gray-500 mb-6">{products.length} items found</p>
          {products.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <p className="text-lg font-medium">No products found</p>
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

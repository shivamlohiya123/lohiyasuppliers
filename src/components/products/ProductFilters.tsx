"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

interface ProductFiltersProps {
  categories: { id: string; name: string; slug: string }[];
  currentCategory?: string;
  currentSort?: string;
}

export function ProductFilters({ categories, currentCategory, currentSort }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function updateFilter(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`/products?${params.toString()}`);
  }

  return (
    <aside className="lg:w-64 shrink-0">
      <div className="bg-white rounded-2xl border border-gray-100 p-5 sticky top-24">
        <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>

        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Search</label>
          <input
            type="search"
            placeholder="Search products..."
            defaultValue={searchParams.get("search") || ""}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                updateFilter("search", (e.target as HTMLInputElement).value);
              }
            }}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div className="mb-6">
          <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
          <div className="space-y-1">
            <button
              onClick={() => updateFilter("category", "")}
              className={`block w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors ${
                !currentCategory ? "bg-brand-50 text-brand-700 font-medium" : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => updateFilter("category", cat.slug)}
                className={`block w-full text-left px-3 py-1.5 text-sm rounded-lg transition-colors ${
                  currentCategory === cat.slug
                    ? "bg-brand-50 text-brand-700 font-medium"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Sort By</label>
          <select
            value={currentSort || ""}
            onChange={(e) => updateFilter("sort", e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Newest</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      </div>
    </aside>
  );
}

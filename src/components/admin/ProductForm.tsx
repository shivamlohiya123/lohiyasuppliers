"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { slugify, parseJSON } from "@/lib/utils";
import { ImageUpload } from "./ImageUpload";

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  categories: Category[];
  initialData?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    hsnCode: string;
    gstRateBps: number;
    defaultPricePaise: number;
    categoryId: string;
    isActive: boolean;
    images: string;
  };
}

export function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>(
    parseJSON<string[]>(initialData?.images || "[]", [])
  );
  const [form, setForm] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    hsnCode: initialData?.hsnCode || "",
    gstPercent: initialData ? (initialData.gstRateBps / 100).toString() : "18",
    priceRupees: initialData ? (initialData.defaultPricePaise / 100).toString() : "",
    categoryId: initialData?.categoryId || categories[0]?.id || "",
    isActive: initialData?.isActive ?? true,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const url = initialData ? `/api/admin/products/${initialData.id}` : "/api/admin/products";
    const method = initialData ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.name,
        slug: form.slug,
        description: form.description,
        hsnCode: form.hsnCode,
        gstRateBps: Math.round(parseFloat(form.gstPercent) * 100),
        defaultPriceRupees: parseFloat(form.priceRupees),
        categoryId: form.categoryId,
        isActive: form.isActive,
        images: JSON.stringify(images),
      }),
    });
    if (res.ok) router.push("/admin/products");
    else alert((await res.json()).error || "Failed to save product");
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 max-w-3xl space-y-6">
      <ImageUpload images={images} onChange={setImages} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-sm font-medium block mb-1">Product Name *</label>
          <input
            required
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })
            }
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Slug</label>
          <input
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Category *</label>
          <select
            required
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          >
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">HSN Code *</label>
          <input
            required
            value={form.hsnCode}
            onChange={(e) => setForm({ ...form, hsnCode: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm font-mono"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">GST Rate (%) *</label>
          <input
            required
            type="number"
            step="0.01"
            value={form.gstPercent}
            onChange={(e) => setForm({ ...form, gstPercent: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Default Price (₹) *</label>
          <input
            required
            type="number"
            step="0.01"
            value={form.priceRupees}
            onChange={(e) => setForm({ ...form, priceRupees: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium block mb-1">Description *</label>
          <textarea
            required
            rows={4}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm"
          />
        </div>
        <label className="flex items-center gap-2 text-sm sm:col-span-2">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
          />
          Active
        </label>
      </div>
      <div className="flex gap-3">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? "Saving..." : initialData ? "Update Product" : "Create Product"}
        </button>
        <button type="button" onClick={() => router.back()} className="px-6 py-2 border rounded-lg text-sm">
          Cancel
        </button>
      </div>
    </form>
  );
}

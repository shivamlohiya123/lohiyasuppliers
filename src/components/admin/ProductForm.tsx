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
    shortDesc: string | null;
    sku: string;
    price: number;
    comparePrice: number | null;
    costPrice: number | null;
    stock: number;
    lowStockAlert: number;
    categoryId: string;
    isFeatured: boolean;
    isActive: boolean;
    specifications: string;
    tags: string;
    images: string;
  };
}

export function ProductForm({ categories, initialData }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>(parseJSON<string[]>(initialData?.images || "[]", []));
  const [form, setForm] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    shortDesc: initialData?.shortDesc || "",
    sku: initialData?.sku || "",
    price: initialData?.price?.toString() || "",
    comparePrice: initialData?.comparePrice?.toString() || "",
    costPrice: initialData?.costPrice?.toString() || "",
    stock: initialData?.stock?.toString() || "0",
    lowStockAlert: initialData?.lowStockAlert?.toString() || "10",
    categoryId: initialData?.categoryId || categories[0]?.id || "",
    isFeatured: initialData?.isFeatured || false,
    isActive: initialData?.isActive ?? true,
    specifications: initialData?.specifications || "{}",
    tags: initialData?.tags || "[]",
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
        ...form,
        images: JSON.stringify(images),
        price: parseFloat(form.price),
        comparePrice: form.comparePrice ? parseFloat(form.comparePrice) : null,
        costPrice: form.costPrice ? parseFloat(form.costPrice) : null,
        stock: parseInt(form.stock),
        lowStockAlert: parseInt(form.lowStockAlert),
      }),
    });
    if (res.ok) router.push("/admin/products");
    else alert("Failed to save product");
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 max-w-3xl space-y-6">
      <ImageUpload images={images} onChange={setImages} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label className="text-sm font-medium block mb-1">Product Name *</label>
          <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })}
            className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Slug</label>
          <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">SKU *</label>
          <input required value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm font-mono" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Category *</label>
          <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm">
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Price (₹) *</label>
          <input required type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Compare Price</label>
          <input type="number" step="0.01" value={form.comparePrice} onChange={(e) => setForm({ ...form, comparePrice: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Cost Price</label>
          <input type="number" step="0.01" value={form.costPrice} onChange={(e) => setForm({ ...form, costPrice: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Stock</label>
          <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium block mb-1">Short Description</label>
          <input value={form.shortDesc} onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium block mb-1">Description *</label>
          <textarea required rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-medium block mb-1">Specifications (JSON)</label>
          <textarea rows={3} value={form.specifications} onChange={(e) => setForm({ ...form, specifications: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm font-mono" />
        </div>
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
            Featured Product
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            Active
          </label>
        </div>
      </div>
      <div className="flex gap-3">
        <button type="submit" disabled={loading} className="px-6 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700 disabled:opacity-50">
          {loading ? "Saving..." : initialData ? "Update Product" : "Create Product"}
        </button>
        <button type="button" onClick={() => router.back()} className="px-6 py-2 border rounded-lg text-sm">Cancel</button>
      </div>
    </form>
  );
}

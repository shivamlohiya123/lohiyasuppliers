"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";
import { CategoryType } from "@prisma/client";

interface CategoryFormProps {
  initial?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    type: CategoryType;
    imageUrl: string | null;
    sortOrder: number;
    isActive: boolean;
  };
}

export function CategoryForm({ initial }: CategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: initial?.name || "",
    slug: initial?.slug || "",
    description: initial?.description || "",
    type: initial?.type || CategoryType.PRODUCT,
    imageUrl: initial?.imageUrl || "",
    sortOrder: initial?.sortOrder?.toString() || "0",
    isActive: initial?.isActive ?? true,
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const url = initial ? `/api/admin/categories/${initial.id}` : "/api/admin/categories";
    const method = initial ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        sortOrder: parseInt(form.sortOrder),
        imageUrl: form.imageUrl || null,
      }),
    });
    if (res.ok) router.push("/admin/categories");
    else alert((await res.json()).error || "Failed to save");
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 max-w-xl space-y-4">
      <div>
        <label className="text-sm font-medium block mb-1">Name *</label>
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
        <label className="text-sm font-medium block mb-1">Description</label>
        <textarea
          rows={3}
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1">Type *</label>
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value as CategoryType })}
          className="w-full px-3 py-2 border rounded-lg text-sm"
        >
          <option value={CategoryType.PRODUCT}>Product</option>
          <option value={CategoryType.SERVICE}>Service</option>
        </select>
      </div>
      <div>
        <label className="text-sm font-medium block mb-1">Image URL (optional)</label>
        <input
          value={form.imageUrl}
          onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg text-sm"
        />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1">Sort Order</label>
        <input
          type="number"
          value={form.sortOrder}
          onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg text-sm"
        />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={form.isActive}
          onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
        />
        Active
      </label>
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium disabled:opacity-50"
      >
        {loading ? "Saving..." : initial ? "Update Category" : "Create Category"}
      </button>
    </form>
  );
}

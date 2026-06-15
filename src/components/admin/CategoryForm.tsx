"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { slugify } from "@/lib/utils";

interface CategoryFormProps {
  initial?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    industry: string;
    icon: string | null;
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
    industry: initial?.industry || "METAL",
    icon: initial?.icon || "📦",
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
      body: JSON.stringify({ ...form, sortOrder: parseInt(form.sortOrder) }),
    });
    if (res.ok) router.push("/admin/categories");
    else alert((await res.json()).error || "Failed to save");
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 max-w-xl space-y-4">
      <div>
        <label className="text-sm font-medium block mb-1">Name *</label>
        <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) })}
          className="w-full px-3 py-2 border rounded-lg text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1">Slug</label>
        <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg text-sm" />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1">Description</label>
        <textarea rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg text-sm" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium block mb-1">Industry</label>
          <select value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm">
            <option value="METAL">Metal</option>
            <option value="WOOD">Wood</option>
            <option value="SERVICES">Services</option>
          </select>
        </div>
        <div>
          <label className="text-sm font-medium block mb-1">Icon (emoji)</label>
          <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
            className="w-full px-3 py-2 border rounded-lg text-sm" />
        </div>
      </div>
      <div>
        <label className="text-sm font-medium block mb-1">Sort Order</label>
        <input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })}
          className="w-full px-3 py-2 border rounded-lg text-sm" />
      </div>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
        Active
      </label>
      <button type="submit" disabled={loading} className="px-6 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium disabled:opacity-50">
        {loading ? "Saving..." : initial ? "Update Category" : "Create Category"}
      </button>
    </form>
  );
}

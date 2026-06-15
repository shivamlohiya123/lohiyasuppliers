"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

export function CategoryActions({ categoryId, productCount }: { categoryId: string; productCount: number }) {
  const router = useRouter();

  async function handleDelete() {
    if (productCount > 0) {
      alert(`Cannot delete: ${productCount} products in this category.`);
      return;
    }
    if (!confirm("Delete this category?")) return;
    const res = await fetch(`/api/admin/categories/${categoryId}`, { method: "DELETE" });
    if (res.ok) router.refresh();
    else alert((await res.json()).error || "Delete failed");
  }

  return (
    <button onClick={handleDelete} className="p-1.5 rounded hover:bg-red-50 text-gray-500 hover:text-red-600">
      <Trash2 className="w-4 h-4" />
    </button>
  );
}

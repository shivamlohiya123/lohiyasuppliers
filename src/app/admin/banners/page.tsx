import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit } from "lucide-react";
import { BannerActions } from "@/components/admin/BannerActions";

export const metadata = { title: "Banners" };

export default async function AdminBannersPage() {
  const banners = await prisma.banner.findMany({ orderBy: [{ position: "asc" }, { sortOrder: "asc" }] });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Banners & Promotions</h1>
          <p className="text-gray-500 text-sm">Homepage hero and industry section banners</p>
        </div>
        <Link href="/admin/banners/new" className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-medium hover:bg-brand-700">
          <Plus className="w-4 h-4" /> Add Banner
        </Link>
      </div>

      <div className="space-y-4">
        {banners.map((banner) => (
          <div key={banner.id} className="bg-white rounded-xl border p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-gray-900">{banner.title}</h3>
                  <span className="px-2 py-0.5 bg-brand-50 text-brand-700 rounded text-xs">{banner.position}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${banner.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {banner.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
                {banner.subtitle && <p className="text-sm text-gray-500 mt-1">{banner.subtitle}</p>}
                {banner.link && <p className="text-xs text-brand-600 mt-1">→ {banner.link}</p>}
                <p className="text-xs text-gray-400 mt-1">Sort order: {banner.sortOrder}</p>
              </div>
              <div className="flex items-center gap-1 ml-4">
                <Link href={`/admin/banners/${banner.id}/edit`} className="p-2 rounded hover:bg-gray-100 text-gray-500">
                  <Edit className="w-4 h-4" />
                </Link>
                <BannerActions bannerId={banner.id} />
              </div>
            </div>
          </div>
        ))}
        {banners.length === 0 && (
          <p className="text-center text-gray-500 py-8">No banners yet. Create your first promotional banner.</p>
        )}
      </div>
    </div>
  );
}

import { prisma } from "@/lib/prisma";
import { SectionEditor } from "@/components/admin/SectionEditor";
import Link from "next/link";
import { Globe, Settings } from "lucide-react";

export const metadata = { title: "Website Content" };

export default async function WebsiteContentPage() {
  const sections = await prisma.pageSection.findMany({ orderBy: { sortOrder: "asc" } });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Globe className="w-7 h-7 text-brand-600" />
            Website Content Manager
          </h1>
          <p className="text-gray-500 text-sm">Control homepage sections, testimonials, FAQ, and more</p>
        </div>
        <Link href="/admin/settings" className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">
          <Settings className="w-4 h-4" /> Site Settings
        </Link>
      </div>

      <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 text-sm text-brand-800">
        Changes here update the live website immediately. Manage banners, products, and categories from their respective admin tabs.
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <SectionEditor key={section.id} section={section} />
        ))}
        {sections.length === 0 && (
          <p className="text-center text-gray-500 py-8">No sections yet. Run database seed to create default sections.</p>
        )}
      </div>
    </div>
  );
}

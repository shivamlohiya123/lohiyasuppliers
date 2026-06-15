import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { BannerForm } from "@/components/admin/BannerForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function EditBannerPage({ params }: Props) {
  const { id } = await params;
  const banner = await prisma.banner.findUnique({ where: { id } });
  if (!banner) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Edit Banner</h1>
      <BannerForm initial={banner} />
    </div>
  );
}

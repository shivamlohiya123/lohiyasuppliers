import { BannerForm } from "@/components/admin/BannerForm";

export const metadata = { title: "Add Banner" };

export default function NewBannerPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Add Banner</h1>
      <BannerForm />
    </div>
  );
}

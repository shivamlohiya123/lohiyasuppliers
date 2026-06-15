import { CategoryForm } from "@/components/admin/CategoryForm";

export const metadata = { title: "Add Category" };

export default function NewCategoryPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Add Category</h1>
      <CategoryForm />
    </div>
  );
}

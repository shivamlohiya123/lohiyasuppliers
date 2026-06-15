import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Star, MessageSquareQuote } from "lucide-react";
import Link from "next/link";
import { ReviewActions } from "@/components/admin/ReviewActions";

export const metadata = { title: "Review Moderation" };

export default async function AdminReviewsPage() {
  const reviews = await prisma.review.findMany({
    include: {
      product: { select: { name: true, slug: true } },
      user: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const pending = reviews.filter((r) => !r.isApproved);
  const approved = reviews.filter((r) => r.isApproved);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquareQuote className="w-7 h-7 text-brand-600" />
          Review Moderation
        </h1>
        <p className="text-gray-500 text-sm">
          {pending.length} pending · {approved.length} approved · {reviews.length} total
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: "Pending Approval", value: pending.length, color: "border-amber-200 bg-amber-50" },
          { label: "Approved & Live", value: approved.length, color: "border-green-200 bg-green-50" },
          { label: "Total Reviews", value: reviews.length, color: "border-brand-200 bg-brand-50" },
        ].map((s) => (
          <div key={s.label} className={`rounded-xl border p-4 ${s.color}`}>
            <div className="text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-600">{s.label}</div>
          </div>
        ))}
      </div>

      <ReviewTable title="Pending Reviews" reviews={pending} empty="No reviews awaiting approval" />
      <ReviewTable title="Approved Reviews" reviews={approved} empty="No approved reviews yet" />
    </div>
  );
}

function ReviewTable({
  title,
  reviews,
  empty,
}: {
  title: string;
  reviews: {
    id: string;
    rating: number;
    comment: string | null;
    isApproved: boolean;
    createdAt: Date;
    product: { name: string; slug: string };
    user: { name: string | null; email: string };
  }[];
  empty: string;
}) {
  return (
    <div className="bg-white rounded-xl border overflow-hidden">
      <div className="px-4 py-3 border-b bg-gray-50 font-semibold text-gray-900">{title}</div>
      {reviews.length === 0 ? (
        <p className="text-center text-gray-500 py-8 text-sm">{empty}</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Customer</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Rating</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Comment</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Date</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {reviews.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/products/${r.product.slug}`} className="text-brand-600 hover:underline font-medium">
                    {r.product.name}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <div>{r.user.name || "—"}</div>
                  <div className="text-xs text-gray-500">{r.user.email}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
                      />
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-600 max-w-xs truncate">{r.comment || "—"}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(r.createdAt)}</td>
                <td className="px-4 py-3">
                  <ReviewActions reviewId={r.id} isApproved={r.isApproved} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

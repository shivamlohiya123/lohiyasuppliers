import { prisma } from "@/lib/prisma";
import { formatDate, getStatusColor } from "@/lib/utils";
import { InquiryStatusUpdater } from "@/components/admin/InquiryStatusUpdater";

export const metadata = { title: "Inquiries" };

export default async function AdminInquiriesPage() {
  const inquiries = await prisma.inquiry.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Inquiries</h1>
        <p className="text-gray-500 text-sm">{inquiries.filter((i) => i.status === "NEW").length} new inquiries</p>
      </div>

      <div className="space-y-4">
        {inquiries.map((inq) => (
          <div key={inq.id} className="bg-white rounded-xl border p-6">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{inq.subject}</h3>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(inq.type)}`}>{inq.type}</span>
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  {inq.name} · {inq.email} {inq.phone && `· ${inq.phone}`}
                  {inq.company && ` · ${inq.company}`}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <InquiryStatusUpdater inquiryId={inq.id} currentStatus={inq.status} />
                <span className="text-xs text-gray-400">{formatDate(inq.createdAt)}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-4">{inq.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

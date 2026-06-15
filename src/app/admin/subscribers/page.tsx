import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { SubscriberActions } from "@/components/admin/SubscriberActions";
import { CsvDownloadButton } from "@/components/admin/CsvDownloadButton";

export const metadata = { title: "Subscribers" };

export default async function AdminSubscribersPage() {
  const subscribers = await prisma.subscriber.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Newsletter Subscribers</h1>
          <p className="text-gray-500 text-sm">{subscribers.filter((s) => s.isActive).length} active subscribers</p>
        </div>
        <CsvDownloadButton href="/api/admin/subscribers/export" label="Export Subscribers (CSV)" />
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Email</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Subscribed</th>
              <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
              <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {subscribers.map((s) => (
              <tr key={s.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{s.email}</td>
                <td className="px-4 py-3 text-gray-500">{formatDate(s.createdAt)}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${s.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {s.isActive ? "Active" : "Unsubscribed"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {s.isActive && <SubscriberActions subscriberId={s.id} email={s.email} />}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {subscribers.length === 0 && (
          <p className="text-center text-gray-500 py-8">No subscribers yet. They will appear when customers subscribe via the footer.</p>
        )}
      </div>
    </div>
  );
}

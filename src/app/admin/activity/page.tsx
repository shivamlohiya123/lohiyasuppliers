import { prisma } from "@/lib/prisma";
import { formatDateTime } from "@/lib/utils";
import { Activity, Package, ShoppingCart, UserCog, MessageSquareQuote, Settings } from "lucide-react";

export const metadata = { title: "Activity Log" };

const entityIcons: Record<string, React.ElementType> = {
  Product: Package,
  Order: ShoppingCart,
  User: UserCog,
  Review: MessageSquareQuote,
  Setting: Settings,
};

const actionColors: Record<string, string> = {
  CREATED: "bg-green-100 text-green-700",
  UPDATED: "bg-blue-100 text-blue-700",
  DELETED: "bg-red-100 text-red-700",
  APPROVED: "bg-emerald-100 text-emerald-700",
  REJECTED: "bg-amber-100 text-amber-700",
};

export default async function AdminActivityPage() {
  const logs = await prisma.activityLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Activity className="w-7 h-7 text-brand-600" />
          Activity Log
        </h1>
        <p className="text-gray-500 text-sm">Recent admin actions across your store</p>
      </div>

      <div className="bg-white rounded-xl border overflow-hidden">
        {logs.length === 0 ? (
          <p className="text-center text-gray-500 py-12 text-sm">
            No activity recorded yet. Actions like product edits, order updates, and review approvals will appear here.
          </p>
        ) : (
          <div className="divide-y">
            {logs.map((log) => {
              const Icon = entityIcons[log.entity] || Activity;
              return (
                <div key={log.id} className="flex items-start gap-4 px-5 py-4 hover:bg-gray-50 transition-colors">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-brand-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${actionColors[log.action] || "bg-gray-100 text-gray-700"}`}>
                        {log.action}
                      </span>
                      <span className="text-sm font-medium text-gray-900">{log.entity}</span>
                    </div>
                    {log.details && (
                      <p className="text-sm text-gray-600 mt-1">{log.details}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{formatDateTime(log.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

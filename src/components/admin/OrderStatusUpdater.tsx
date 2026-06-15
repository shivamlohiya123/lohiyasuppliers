"use client";

import { useRouter } from "next/navigation";
import { ORDER_STATUSES } from "@/lib/utils";

export function OrderStatusUpdater({ orderId, currentStatus }: { orderId: string; currentStatus: string }) {
  const router = useRouter();

  async function updateStatus(status: string) {
    await fetch(`/api/admin/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    router.refresh();
  }

  return (
    <select
      value={currentStatus}
      onChange={(e) => updateStatus(e.target.value)}
      className="text-xs border rounded-lg px-2 py-1 bg-white"
    >
      {ORDER_STATUSES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}

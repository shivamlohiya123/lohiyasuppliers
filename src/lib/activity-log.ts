import { prisma } from "@/lib/prisma";

export async function logActivity(
  action: string,
  entity: string,
  entityId?: string,
  details?: string,
  userId?: string
) {
  try {
    await prisma.activityLog.create({
      data: { action, entity, entityId, details, userId },
    });
  } catch {
    // Non-blocking audit logging
  }
}

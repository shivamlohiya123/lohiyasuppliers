import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const session = await requireAuth();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { profileComplete: true, role: true },
  });

  if (user && !user.profileComplete && user.role !== "ADMIN") {
    redirect("/onboarding");
  }

  return <>{children}</>;
}

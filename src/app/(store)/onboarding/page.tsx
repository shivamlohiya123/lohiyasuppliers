import { requireAuth } from "@/lib/session";
import { ProfileSetupForm } from "@/components/account/ProfileSetupForm";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Complete Your Profile" };

export default async function OnboardingPage() {
  const session = await requireAuth();
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, profileComplete: true, role: true },
  });

  if (user?.profileComplete || user?.role === "ADMIN") redirect("/account");

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12 bg-gradient-mesh">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Complete Your Business Profile</h1>
          <p className="text-gray-500 mt-1">Required for B2B orders and GST proforma invoices</p>
        </div>
        <ProfileSetupForm userName={user?.name || "User"} />
      </div>
    </div>
  );
}

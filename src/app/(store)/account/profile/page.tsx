import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { ProfileEditForm } from "@/components/account/ProfileEditForm";

export const metadata = { title: "Company Profile" };

export default async function AccountProfilePage() {
  const session = await requireAuth();
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return null;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Company Profile</h1>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <AccountSidebar />
        <div className="lg:col-span-3">
          <ProfileEditForm
            initial={{
              name: user.name || "",
              email: user.email,
              company: user.company || "",
              companyId: user.companyId || "",
              phone: user.phone || "",
              address: user.address || "",
              city: user.city || "",
              state: user.state || "",
              country: user.country || "India",
              pincode: user.pincode || "",
              gstNumber: user.gstNumber || "",
            }}
          />
        </div>
      </div>
    </div>
  );
}

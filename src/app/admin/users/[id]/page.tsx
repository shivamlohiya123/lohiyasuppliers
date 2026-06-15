import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { UserDetailPanel } from "@/components/admin/UserDetailPanel";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function UserDetailPage({ params }: Props) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      orders: { include: { items: { include: { product: true } } }, orderBy: { createdAt: "desc" } },
      inquiries: { orderBy: { createdAt: "desc" } },
      reviews: { include: { product: true } },
      addresses: true,
    },
  });

  if (!user) notFound();

  const { password: _, ...safeUser } = user;

  return (
    <UserDetailPanel
      user={{
        ...safeUser,
        createdAt: safeUser.createdAt.toISOString(),
        updatedAt: safeUser.updatedAt.toISOString(),
        orders: safeUser.orders.map((o) => ({
          ...o,
          createdAt: o.createdAt.toISOString(),
        })),
        inquiries: safeUser.inquiries.map((i) => ({
          ...i,
          createdAt: i.createdAt.toISOString(),
        })),
      }}
    />
  );
}

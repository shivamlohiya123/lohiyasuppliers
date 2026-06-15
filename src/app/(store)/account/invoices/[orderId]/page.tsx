import { requireAuth } from "@/lib/session";
import { prisma } from "@/lib/prisma";
import { parseJSON } from "@/lib/utils";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import { ProformaInvoiceView } from "@/components/invoice/ProformaInvoiceView";
import type { ProformaInvoiceData } from "@/lib/invoice";
import { PrintInvoiceButton } from "@/components/invoice/PrintInvoiceButton";

interface Props {
  params: Promise<{ orderId: string }>;
}

export default async function InvoiceDetailPage({ params }: Props) {
  const session = await requireAuth();
  const { orderId } = await params;

  const order = await prisma.order.findFirst({
    where: { id: orderId, userId: session.user.id, isVerified: true },
    select: { invoiceSnapshot: true, invoiceNumber: true, orderNumber: true },
  });

  if (!order?.invoiceSnapshot) notFound();

  const data = parseJSON<ProformaInvoiceData>(order.invoiceSnapshot, null as unknown as ProformaInvoiceData);
  if (!data) notFound();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <Link href="/account/invoices" className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Invoices
        </Link>
        <PrintInvoiceButton />
      </div>
      <ProformaInvoiceView data={data} />
    </div>
  );
}

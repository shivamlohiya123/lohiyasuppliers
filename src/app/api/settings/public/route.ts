import { NextResponse } from "next/server";
import { getSettings } from "@/lib/settings";

export async function GET() {
  const settings = await getSettings();
  return NextResponse.json({
    shippingRate: settings.shippingRate,
    freeShippingThreshold: settings.freeShippingThreshold,
    taxRate: settings.taxRate,
    currencySymbol: settings.currencySymbol,
    contactPhone: settings.contactPhone,
    contactEmail: settings.contactEmail,
    contactAddress: settings.contactAddress,
    businessHours: settings.businessHours,
    gstNumber: settings.gstNumber,
  });
}

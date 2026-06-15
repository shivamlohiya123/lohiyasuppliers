import { prisma } from "./prisma";

export async function getSettings() {
  const rows = await prisma.setting.findMany();
  const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return {
    siteName: settings.site_name || "Lohiya Suppliers",
    siteTagline: settings.site_tagline || "",
    contactEmail: settings.contact_email || "info@lohiyasuppliers.com",
    contactPhone: settings.contact_phone || "",
    contactAddress: settings.contact_address || "",
    gstNumber: settings.gst_number || "",
    shippingRate: parseFloat(settings.shipping_flat_rate || "99"),
    freeShippingThreshold: parseFloat(settings.free_shipping_threshold || "2000"),
    taxRate: parseFloat(settings.tax_rate || "18") / 100,
    currencySymbol: settings.currency_symbol || "₹",
    businessHours: settings.business_hours || "Mon-Sat: 9AM - 6PM",
  };
}

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getCachedSettings, getCachedCategories } from "@/lib/cache";

const defaultSettings = {
  contactPhone: "+91 98765 43210",
  contactEmail: "info@lohiyasuppliers.com",
  contactAddress: "Industrial Area, Phase II, India",
  gstNumber: "",
  siteName: "Lohiya Suppliers",
  siteTagline: "B2B Industrial Abrasives & Tools",
};

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  let settings = defaultSettings;
  let categories: { href: string; label: string }[] = [];

  try {
    const [platformSettings, dbCategories] = await Promise.all([
      getCachedSettings(),
      getCachedCategories(),
    ]);
    settings = {
      siteName: platformSettings.businessName,
      siteTagline: defaultSettings.siteTagline,
      contactPhone: platformSettings.contactPhone,
      contactEmail: platformSettings.contactEmail,
      contactAddress: defaultSettings.contactAddress,
      gstNumber: platformSettings.businessGstin,
    };
    categories = dbCategories.map((c) => ({
      href: `/categories/${c.slug}`,
      label: c.name,
    }));
  } catch (error) {
    console.error("Failed to load site settings:", error);
  }

  return (
    <>
      <Header
        contactPhone={settings.contactPhone}
        contactEmail={settings.contactEmail}
        categories={categories}
      />
      <main className="min-h-screen">{children}</main>
      <Footer
        contactPhone={settings.contactPhone}
        contactEmail={settings.contactEmail}
        contactAddress={settings.contactAddress}
        gstNumber={settings.gstNumber}
        siteName={settings.siteName}
        siteTagline={settings.siteTagline}
        categories={categories}
      />
    </>
  );
}

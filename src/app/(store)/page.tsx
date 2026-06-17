import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { HeroCarousel } from "@/components/home/HeroCarousel";
import { formatPaise } from "@/lib/money";
import { ArrowRight, Shield, Truck, Award, CreditCard } from "lucide-react";
import { CategoryType } from "@prisma/client";

export const revalidate = 60;

async function getHomeData() {
  try {
    const [products, categories] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true },
        include: {
          category: { select: { name: true, slug: true, type: true } },
          variations: { where: { isActive: true }, take: 1 },
        },
        take: 8,
        orderBy: { createdAt: "desc" },
      }),
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        take: 8,
      }),
    ]);
    return { products, categories };
  } catch (error) {
    console.error("Failed to load home page data:", error);
    return { products: [], categories: [] };
  }
}

const features = [
  { icon: Truck, title: "B2B Fulfillment", desc: "Prepaid & postpaid orders with admin approval" },
  { icon: Award, title: "Custom Pricing", desc: "Per-client prices on every product & variation" },
  { icon: Shield, title: "GST Invoices", desc: "CGST/SGST/IGST compliant billing" },
  { icon: CreditCard, title: "Cashback & Vouchers", desc: "Per-client rewards managed by admin" },
];

export default async function HomePage() {
  const { products, categories } = await getHomeData();

  return (
    <>
      <HeroCarousel banners={[]} />

      <section className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((f) => (
              <div key={f.title} className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center shrink-0">
                  <f.icon className="w-6 h-6 text-brand-600" />
                </div>
                <div>
                  <div className="font-semibold text-sm text-gray-900">{f.title}</div>
                  <div className="text-xs text-gray-500 hidden sm:block">{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 gradient-mesh">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="section-heading text-center mb-10">Browse Categories</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md hover:border-brand-200 transition-all"
              >
                <span className="text-xs font-medium text-brand-600 uppercase">
                  {cat.type === CategoryType.SERVICE ? "Service" : "Product"}
                </span>
                <h3 className="font-semibold text-gray-900 mt-1">{cat.name}</h3>
                {cat.description && (
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{cat.description}</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-heading">Catalog</h2>
            <Link href="/products" className="inline-flex items-center gap-2 text-brand-600 font-medium">
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product.id}
                href={`/products/${product.slug}`}
                className="bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-lg transition-shadow"
              >
                <div className="aspect-square rounded-xl bg-gray-50 mb-3 flex items-center justify-center text-4xl">
                  {product.category.type === CategoryType.SERVICE ? "🔧" : "⚙️"}
                </div>
                <p className="text-xs text-brand-600">{product.category.name}</p>
                <h3 className="font-semibold text-gray-900 mt-1">{product.name}</h3>
                <p className="text-sm font-bold text-brand-900 mt-2">
                  from {formatPaise(product.defaultPricePaise)}
                </p>
                {product.variations.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">Multiple variations available</p>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-brand-950 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">B2B ordering with your custom prices</h2>
          <p className="text-brand-200 mb-6">
            Register as a client to place prepaid or postpaid orders. Admin sets your prices,
            cashback, and vouchers individually.
          </p>
          <Link
            href="/register"
            className="inline-flex px-8 py-3 bg-white text-brand-900 font-semibold rounded-xl hover:bg-brand-50"
          >
            Register as Client
          </Link>
        </div>
      </section>
    </>
  );
}

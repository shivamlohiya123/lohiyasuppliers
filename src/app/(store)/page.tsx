import dynamic from "next/dynamic";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowRight, Shield, Truck, Award, CreditCard, Wrench, TreePine, Cog } from "lucide-react";
import { ProductCard } from "@/components/products/ProductCard";
import { HeroCarousel } from "@/components/home/HeroCarousel";

const WhyChooseSection = dynamic(() =>
  import("@/components/home/WhyChooseSection").then((m) => ({ default: m.WhyChooseSection }))
);
const TestimonialsSection = dynamic(() =>
  import("@/components/home/TestimonialsSection").then((m) => ({ default: m.TestimonialsSection }))
);
const FAQSection = dynamic(() =>
  import("@/components/home/FAQSection").then((m) => ({ default: m.FAQSection }))
);

export const revalidate = 60;

async function getHomeData() {
  try {
    const [featuredProducts, categories, heroBanners, pageSections] = await Promise.all([
      prisma.product.findMany({
        where: { isActive: true, isFeatured: true },
        select: {
          id: true, name: true, slug: true, shortDesc: true, price: true,
          comparePrice: true, sku: true, images: true, isFeatured: true,
          category: { select: { name: true, slug: true, icon: true } },
        },
        take: 8,
        orderBy: { createdAt: "desc" },
      }),
      prisma.category.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
        take: 6,
      }),
      prisma.banner.findMany({
        where: { isActive: true, position: "HERO" },
        orderBy: { sortOrder: "asc" },
      }),
      prisma.pageSection.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    ]);
    const sectionMap = Object.fromEntries(pageSections.map((s) => [s.key, s]));
    return { featuredProducts, categories, heroBanners, sectionMap };
  } catch (error) {
    console.error("Failed to load home page data:", error);
    return {
      featuredProducts: [],
      categories: [],
      heroBanners: [],
      sectionMap: {} as Record<string, never>,
    };
  }
}

const features = [
  { icon: Truck, title: "Worldwide Shipping", desc: "Products delivered globally, safely and efficiently" },
  { icon: Award, title: "Best Quality", desc: "Superior materials, expert craftsmanship" },
  { icon: Shield, title: "Best Offers", desc: "Unbeatable deals for premium industrial abrasives" },
  { icon: CreditCard, title: "Secure Payments", desc: "Encrypted and trusted payment gateways" },
];

const industryIcons: Record<string, React.ElementType> = {
  METAL: Cog,
  WOOD: TreePine,
  SERVICES: Wrench,
};

export default async function HomePage() {
  const { featuredProducts, categories, heroBanners, sectionMap } = await getHomeData();

  return (
    <>
      <HeroCarousel banners={heroBanners} />

      {/* Features Bar */}
      <section className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div key={f.title} className="flex items-center gap-3 animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
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

      {/* Industry Categories */}
      <section className="py-20 gradient-mesh">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in-up">
            <h2 className="section-heading">Sourcing Partners</h2>
            <p className="section-subheading">
              Discover our comprehensive range of industrial abrasives tailored for your industry needs
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.slice(0, 3).map((cat, i) => {
              const Icon = industryIcons[cat.industry] || Cog;
              return (
                <Link
                  key={cat.id}
                  href={`/categories/${cat.slug}`}
                  className="group relative bg-white rounded-2xl p-8 border border-gray-100 hover:shadow-xl hover:border-brand-200 hover:-translate-y-1 transition-all duration-300 overflow-hidden animate-fade-in-up"
                  style={{ animationDelay: `${i * 120}ms` }}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-brand-50 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
                  <div className="relative">
                    <div className="w-14 h-14 rounded-2xl bg-brand-100 flex items-center justify-center mb-4 group-hover:bg-brand-600 transition-colors">
                      <Icon className="w-7 h-7 text-brand-700 group-hover:text-white transition-colors" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{cat.name}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">{cat.description}</p>
                    <span className="inline-flex items-center gap-1 text-brand-600 font-medium text-sm group-hover:gap-2 transition-all">
                      Shop Now <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="section-heading">Featured Products</h2>
              <p className="text-gray-600 mt-2">Quality abrasives, unbeatable performance</p>
            </div>
            <Link
              href="/products"
              className="hidden sm:inline-flex items-center gap-2 text-brand-600 font-medium hover:gap-3 transition-all"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-8 sm:hidden">
            <Link href="/products" className="inline-flex items-center gap-2 text-brand-600 font-medium">
              View All Products <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {sectionMap.why_choose_us && (
        <WhyChooseSection
          title={sectionMap.why_choose_us.title}
          subtitle={sectionMap.why_choose_us.subtitle}
          content={sectionMap.why_choose_us.content}
        />
      )}

      {sectionMap.testimonials && (
        <TestimonialsSection
          title={sectionMap.testimonials.title}
          subtitle={sectionMap.testimonials.subtitle}
          content={sectionMap.testimonials.content}
        />
      )}

      {/* CTA Banner */}
      <section className="py-20 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-10 left-1/4 w-64 h-64 bg-brand-400 rounded-full blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 text-center relative">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 tracking-tight">
            Need Bulk Orders or Custom Solutions?
          </h2>
          <p className="text-brand-200 mb-8 max-w-2xl mx-auto">
            We offer competitive B2B pricing, custom abrasive solutions, and expert repair services
            for bookbinding equipment. Get in touch for a personalized quote.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/contact?type=BULK_ORDER"
              className="px-8 py-3.5 bg-white text-brand-900 font-semibold rounded-xl hover:bg-brand-50 transition-colors"
            >
              Request Bulk Quote
            </Link>
            <Link
              href="/categories/book-repair-services"
              className="px-8 py-3.5 border-2 border-white/30 text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
            >
              Book Repair Service
            </Link>
          </div>
        </div>
      </section>

      {/* All Categories Grid */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-10">Browse Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/categories/${cat.slug}`}
                className="bg-white rounded-xl p-4 text-center border border-gray-100 hover:shadow-md hover:border-brand-200 transition-all group"
              >
                <div className="text-3xl mb-2">{cat.icon || "📦"}</div>
                <div className="text-sm font-medium text-gray-900 group-hover:text-brand-700 transition-colors">
                  {cat.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {sectionMap.faq && (
        <FAQSection
          title={sectionMap.faq.title}
          subtitle={sectionMap.faq.subtitle}
          content={sectionMap.faq.content}
        />
      )}
    </>
  );
}

import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatPrice, parseJSON } from "@/lib/utils";
import { AddToCartButton } from "@/components/products/AddToCartButton";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { Star, Package, Tag, ArrowLeft } from "lucide-react";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug } });
  return { title: product?.name || "Product" };
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: { category: true, reviews: { where: { isApproved: true }, include: { user: true }, take: 5 } },
  });

  if (!product) notFound();

  const specs = parseJSON<Record<string, string>>(product.specifications, {});
  const tags = parseJSON<string[]>(product.tags, []);
  const images = parseJSON<string[]>(product.images, []);
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  const avgRating = product.reviews.length > 0
    ? product.reviews.reduce((s, r) => s + r.rating, 0) / product.reviews.length
    : 0;

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, isActive: true, id: { not: product.id } },
    include: { category: true },
    take: 4,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Link href="/products" className="inline-flex items-center gap-1 text-sm text-brand-600 hover:underline mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Products
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="aspect-square bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100 relative overflow-hidden">
          {discount > 0 && (
            <span className="absolute top-4 left-4 px-3 py-1 bg-red-500 text-white text-sm font-bold rounded-full z-10">
              -{discount}% OFF
            </span>
          )}
          {images[0] ? (
            <OptimizedImage
              src={images[0]}
              alt={product.name}
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          ) : (
            <div className="text-8xl opacity-20">⚙️</div>
          )}
        </div>

        <div>
          <Link href={`/categories/${product.category.slug}`} className="text-sm text-brand-600 font-medium hover:underline">
            {product.category.name}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mt-2">{product.name}</h1>
          {product.reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <div className="flex">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className={`w-4 h-4 ${i <= Math.round(avgRating) ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                ))}
              </div>
              <span className="text-sm text-gray-500">{avgRating.toFixed(1)} ({product.reviews.length} review{product.reviews.length !== 1 ? "s" : ""})</span>
            </div>
          )}

          <div className="flex items-baseline gap-3 mt-6">
            <span className="text-4xl font-bold text-brand-900">{formatPrice(product.price)}</span>
            {product.comparePrice && (
              <span className="text-xl text-gray-400 line-through">{formatPrice(product.comparePrice)}</span>
            )}
          </div>

          <p className="text-gray-600 mt-4 leading-relaxed">{product.shortDesc || product.description}</p>

          <div className="flex items-center gap-4 mt-4 text-sm">
            <span className="flex items-center gap-1 text-gray-500">
              <Package className="w-4 h-4" /> SKU: {product.sku}
            </span>
            <span className={`font-medium ${product.stock > 0 ? "text-green-600" : "text-red-600"}`}>
              {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
            </span>
          </div>

          <div className="mt-6">
            <AddToCartButton
              product={{
                productId: product.id,
                name: product.name,
                slug: product.slug,
                price: product.price,
                sku: product.sku,
                image: images[0],
              }}
              className="max-w-xs"
            />
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  <Tag className="w-3 h-3" /> {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Description</h2>
          <p className="text-gray-600 leading-relaxed whitespace-pre-line">{product.description}</p>
        </div>
        {Object.keys(specs).length > 0 && (
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Specifications</h2>
            <div className="bg-white rounded-xl border border-gray-100 divide-y divide-gray-100">
              {Object.entries(specs).map(([key, value]) => (
                <div key={key} className="flex justify-between px-4 py-3 text-sm">
                  <span className="text-gray-500 capitalize">{key.replace(/_/g, " ")}</span>
                  <span className="font-medium text-gray-900">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {product.reviews.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Reviews</h2>
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl border p-4">
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className={`w-3 h-3 ${i <= review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-200"}`} />
                    ))}
                  </div>
                  <span className="text-sm font-medium text-gray-900">{review.user.name}</span>
                </div>
                {review.comment && <p className="text-sm text-gray-600">{review.comment}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {related.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Products</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {related.map((p) => (
              <Link key={p.id} href={`/products/${p.slug}`} className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow">
                <h3 className="font-medium text-gray-900">{p.name}</h3>
                <p className="text-brand-700 font-bold mt-1">{formatPrice(p.price)}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

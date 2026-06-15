import Link from "next/link";
import { formatPrice, parseJSON } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { AddToCartButton } from "./AddToCartButton";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    shortDesc: string | null;
    price: number;
    comparePrice: number | null;
    sku: string;
    images: string;
    isFeatured: boolean;
    category: { name: string; slug: string; icon?: string | null };
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const images = parseJSON<string[]>(product.images, []);
  const discount = product.comparePrice
    ? Math.round(((product.comparePrice - product.price) / product.comparePrice) * 100)
    : 0;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden card-hover">
      <Link href={`/products/${product.slug}`} className="block relative aspect-square bg-gradient-to-br from-gray-50 to-brand-50/30 overflow-hidden">
        {discount > 0 && (
          <span className="absolute top-3 left-3 z-10 px-2 py-1 bg-red-500 text-white text-xs font-bold rounded-full">
            -{discount}%
          </span>
        )}
        {product.isFeatured && (
          <span className="absolute top-3 right-3 z-10 px-2 py-1 bg-accent-500 text-white text-xs font-bold rounded-full">
            Featured
          </span>
        )}
        <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 group-hover:scale-105 transition-transform duration-300">
          {images[0] ? (
            <OptimizedImage
              src={images[0]}
              alt={product.name}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="text-6xl opacity-30">{product.category.icon || "⚙️"}</div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/categories/${product.category.slug}`} className="text-xs text-brand-600 font-medium hover:underline">
          {product.category.name}
        </Link>
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 mt-1 group-hover:text-brand-700 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        {product.shortDesc && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.shortDesc}</p>
        )}
        <p className="text-xs text-gray-400 mt-2 font-mono">SKU: {product.sku}</p>
        <div className="flex items-center justify-between mt-3">
          <div>
            <span className="text-lg font-bold text-brand-900">{formatPrice(product.price)}</span>
            {product.comparePrice && (
              <span className="text-sm text-gray-400 line-through ml-2">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>
        </div>
        <div className="mt-3">
          <AddToCartButton
            product={{
              productId: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              sku: product.sku,
              image: images[0],
            }}
          />
        </div>
      </div>
    </div>
  );
}

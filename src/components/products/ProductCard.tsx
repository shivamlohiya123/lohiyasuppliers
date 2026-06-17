import Link from "next/link";
import { formatPaise, parseJSON } from "@/lib/utils";
import { OptimizedImage } from "@/components/ui/OptimizedImage";
import { CategoryType } from "@prisma/client";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description?: string;
    defaultPricePaise: number;
    images: string;
    category: { name: string; slug: string; type?: CategoryType };
    variations?: { id: string }[];
  };
}

export function ProductCard({ product }: ProductCardProps) {
  const images = parseJSON<string[]>(product.images, []);
  const isService = product.category.type === CategoryType.SERVICE;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden card-hover">
      <Link
        href={`/products/${product.slug}`}
        className="block relative aspect-square bg-gradient-to-br from-gray-50 to-brand-50/30 overflow-hidden"
      >
        <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
          {images[0] ? (
            <OptimizedImage
              src={images[0]}
              alt={product.name}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="text-6xl opacity-30">{isService ? "🔧" : "⚙️"}</div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <Link
          href={`/categories/${product.category.slug}`}
          className="text-xs text-brand-600 font-medium hover:underline"
        >
          {product.category.name}
        </Link>
        <Link href={`/products/${product.slug}`}>
          <h3 className="font-semibold text-gray-900 mt-1 group-hover:text-brand-700 transition-colors line-clamp-2">
            {product.name}
          </h3>
        </Link>
        {product.description && (
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">{product.description}</p>
        )}
        <div className="mt-3">
          <span className="text-lg font-bold text-brand-900">
            from {formatPaise(product.defaultPricePaise)}
          </span>
          {(product.variations?.length ?? 0) > 0 && (
            <p className="text-xs text-gray-500 mt-1">{product.variations!.length} variations</p>
          )}
        </div>
      </div>
    </div>
  );
}

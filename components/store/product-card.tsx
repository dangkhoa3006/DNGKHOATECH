import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatCurrency, calcDiscountPercent } from "@/lib/format";
import type { SerializedProduct } from "@/lib/serializers";

type ProductCardProps = {
  product: SerializedProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  const discount = calcDiscountPercent(product.price, product.discountPrice ?? null);
  const displayPrice = product.discountPrice ?? product.price ?? 0;

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border bg-background shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
      <Link href={`/product/${product.slug}`} className="flex flex-1 flex-col">
        <div className="relative flex items-center justify-center bg-white p-6">
          {product.thumbnailUrl ? (
            <Image
              src={product.thumbnailUrl}
              alt={product.name}
              width={320}
              height={320}
              className="h-40 w-40 object-contain transition group-hover:scale-105"
              sizes="(max-width: 640px) 160px, 200px"
            />
          ) : (
            <div className="flex h-32 w-32 items-center justify-center rounded bg-muted text-muted-foreground">
              Không có ảnh
            </div>
          )}
          {discount ? (
            <span className="absolute right-4 top-4 rounded-full bg-red-500 px-2 py-1 text-xs font-semibold text-white shadow">
              Giảm {discount}%
            </span>
          ) : null}
        </div>
        <div className="flex flex-1 flex-col gap-2 px-5 pb-4 pt-2">
          <h3 className="line-clamp-2 text-sm font-semibold text-foreground transition group-hover:text-primary">
            {product.name}
          </h3>
          <div className="flex items-end gap-2">
            <span className="text-lg font-bold text-red-500">
              {formatCurrency(displayPrice)}
            </span>
            {product.discountPrice && product.price && product.discountPrice < product.price ? (
              <span className="text-sm text-muted-foreground line-through">
                {formatCurrency(product.price)}
              </span>
            ) : null}
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              {product.rating?.toFixed(1) ?? "0.0"}
            </span>
            <span>Đã bán {product.sold}</span>
          </div>
        </div>
      </Link>
      <div className="px-5 pb-4">
        <Button variant="secondary" className="w-full gap-2">
          <ShoppingCart className="h-4 w-4" />
          Thêm vào giỏ
        </Button>
      </div>
    </div>
  );
}


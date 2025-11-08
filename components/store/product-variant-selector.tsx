"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/format";

interface ProductVariant {
  id?: number;
  name: string;
  sku?: string | null;
  price?: number | null;
  stock: number;
  attributes?: Record<string, any> | null;
}

interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  basePrice: number;
  baseDiscountPrice?: number | null;
  onVariantChange?: (variant: ProductVariant | null) => void;
}

export function ProductVariantSelector({
  variants,
  basePrice,
  baseDiscountPrice,
  onVariantChange,
}: ProductVariantSelectorProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  const handleVariantSelect = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    onVariantChange?.(variant);
  };

  // Tính giá hiển thị
  const displayPrice = selectedVariant?.price
    ? selectedVariant.price
    : baseDiscountPrice ?? basePrice;
  
  const displayOriginalPrice = selectedVariant?.price
    ? null // Nếu variant có giá riêng thì không có giá gốc
    : baseDiscountPrice && baseDiscountPrice < basePrice
    ? basePrice
    : null;

  // Kiểm tra tồn kho
  const stock = selectedVariant?.stock ?? 0;
  const isOutOfStock = stock <= 0;

  return (
    <div className="space-y-4">
      {/* Hiển thị giá */}
      <div className="flex items-end gap-3">
        <span className="text-3xl font-bold text-red-500">
          {formatCurrency(displayPrice)}
        </span>
        {displayOriginalPrice && (
          <span className="text-sm text-muted-foreground line-through">
            {formatCurrency(displayOriginalPrice)}
          </span>
        )}
      </div>

      {/* Thông báo tồn kho */}
      {selectedVariant && (
        <div className={`text-sm ${isOutOfStock ? "text-destructive" : "text-muted-foreground"}`}>
          {isOutOfStock ? "Hết hàng" : `Còn ${stock} sản phẩm`}
        </div>
      )}

      {/* Chọn variant */}
      {variants.length > 0 && (
        <div className="space-y-4">
          {/* Tách riêng màu sắc nếu có */}
          {variants.some((v) => (v.attributes as any)?.color) && (
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Chọn màu sắc</h3>
              <div className="flex flex-wrap gap-2">
                {Array.from(
                  new Set(
                    variants
                      .map((v) => (v.attributes as any)?.color)
                      .filter(Boolean)
                  )
                ).map((color) => {
                  const colorVariants = variants.filter(
                    (v) => (v.attributes as any)?.color === color
                  );
                  const availableVariant = colorVariants.find((v) => (v.stock ?? 0) > 0);
                  const isSelected = selectedVariant && (selectedVariant.attributes as any)?.color === color;

                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        if (availableVariant) {
                          handleVariantSelect(availableVariant);
                        }
                      }}
                      disabled={!availableVariant}
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : !availableVariant
                          ? "border-muted bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                          : "border-primary/30 text-primary hover:border-primary hover:bg-primary/5"
                      }`}
                    >
                      {String(color)}
                      {!availableVariant && (
                        <span className="ml-1 text-destructive">(Hết hàng)</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Hiển thị các cấu hình khác */}
          {selectedVariant && (selectedVariant.attributes as any)?.color ? (
            // Nếu đã chọn màu, hiển thị các cấu hình còn lại
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Chọn cấu hình</h3>
              <div className="flex flex-wrap gap-2">
                {variants
                  .filter(
                    (v) =>
                      (v.attributes as any)?.color ===
                      (selectedVariant.attributes as any)?.color
                  )
                  .map((variant) => {
                    const isSelected = selectedVariant?.id === variant.id;
                    const variantStock = variant.stock ?? 0;
                    const isVariantOutOfStock = variantStock <= 0;
                    const configName = Object.entries(variant.attributes || {})
                      .filter(([k]) => k !== "color")
                      .map(([k, v]) => `${k}: ${v}`)
                      .join(", ") || variant.name;

                    return (
                      <button
                        key={variant.id}
                        type="button"
                        onClick={() => handleVariantSelect(variant)}
                        disabled={isVariantOutOfStock}
                        className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                          isSelected
                            ? "border-primary bg-primary/10 text-primary"
                            : isVariantOutOfStock
                            ? "border-muted bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                            : "border-primary/30 text-primary hover:border-primary hover:bg-primary/5"
                        }`}
                      >
                        {configName}
                        {variant.price && (
                          <span className="ml-1">
                            - {formatCurrency(variant.price)}
                          </span>
                        )}
                        {isVariantOutOfStock && (
                          <span className="ml-1 text-destructive">(Hết hàng)</span>
                        )}
                      </button>
                    );
                  })}
              </div>
            </div>
          ) : (
            // Nếu chưa chọn màu hoặc không có màu, hiển thị tất cả variants
            <div className="space-y-2">
              <h3 className="text-sm font-semibold">Lựa chọn cấu hình</h3>
              <div className="flex flex-wrap gap-2">
                {variants.map((variant) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  const variantStock = variant.stock ?? 0;
                  const isVariantOutOfStock = variantStock <= 0;

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => handleVariantSelect(variant)}
                      disabled={isVariantOutOfStock}
                      className={`rounded-lg border px-3 py-2 text-xs font-semibold transition-colors ${
                        isSelected
                          ? "border-primary bg-primary/10 text-primary"
                          : isVariantOutOfStock
                          ? "border-muted bg-muted text-muted-foreground cursor-not-allowed opacity-50"
                          : "border-primary/30 text-primary hover:border-primary hover:bg-primary/5"
                      }`}
                    >
                      {variant.name}
                      {variant.price && (
                        <span className="ml-1">
                          - {formatCurrency(variant.price)}
                        </span>
                      )}
                      {isVariantOutOfStock && (
                        <span className="ml-1 text-destructive">(Hết hàng)</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hiển thị thông tin variant đã chọn */}
      {selectedVariant && (
        <div className="rounded-lg border bg-muted/40 p-3 text-sm">
          <p className="font-medium">Đã chọn: {selectedVariant.name}</p>
          {selectedVariant.sku && (
            <p className="text-xs text-muted-foreground mt-1">SKU: {selectedVariant.sku}</p>
          )}
          {selectedVariant.attributes && (
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.entries(selectedVariant.attributes).map(([key, value]) => (
                <span
                  key={key}
                  className="rounded-full bg-primary/10 px-2 py-1 text-xs text-primary"
                >
                  {key}: {String(value)}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}


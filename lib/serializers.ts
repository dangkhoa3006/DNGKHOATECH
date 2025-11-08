import type { Prisma } from "./prisma";

type ProductPayload = Prisma.ProductGetPayload<{
  include: {
    images: true;
    variants: true;
    brand: true;
    category: true;
  };
}>;

type CategoryPayload = Prisma.CategoryGetPayload<{
  include?: {
    children: true;
  };
}>;

export function serializeDecimal(
  value: Prisma.Decimal | number | null | undefined,
  precision: number | null = null
): number | null {
  if (value === null || value === undefined) {
    return null;
  }

  const numeric = typeof value === "number" ? value : Number(value);

  if (Number.isNaN(numeric)) {
    return null;
  }

  if (precision !== null) {
    const factor = Math.pow(10, precision);
    return Math.round(numeric * factor) / factor;
  }

  return numeric;
}

export function serializeProduct(product: ProductPayload) {
  return {
    ...product,
    price: serializeDecimal(product.price),
    discountPrice: serializeDecimal(product.discountPrice),
    variants: product.variants.map((variant) => ({
      ...variant,
      price: serializeDecimal(variant.price),
    })),
  };
}

export function serializeCategory(category: CategoryPayload) {
  return {
    ...category,
  };
}

export type SerializedProduct = ReturnType<typeof serializeProduct>;
export type SerializedCategory = ReturnType<typeof serializeCategory>;


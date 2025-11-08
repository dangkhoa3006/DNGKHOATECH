export function formatCurrency(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "Liên hệ";
  }

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function calcDiscountPercent(price?: number | null, discountPrice?: number | null) {
  if (!price || !discountPrice || price <= discountPrice) {
    return null;
  }

  const percent = Math.round(((price - discountPrice) / price) * 100);
  return percent > 0 ? percent : null;
}


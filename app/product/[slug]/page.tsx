import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle, Truck, Shield, RefreshCcw } from "lucide-react";

import { prisma } from "@/lib/prisma";
import { formatCurrency } from "@/lib/format";
import { serializeProduct } from "@/lib/serializers";
import { SiteHeader } from "@/components/store/site-header";
import { SiteFooter } from "@/components/store/site-footer";
import { ProductCard } from "@/components/store/product-card";

type Props = {
  params: Promise<{ slug: string }>;
};

function formatSpecs(specs: unknown) {
  if (!specs || typeof specs !== "object") return [] as Array<[string, string]>;
  return Object.entries(specs as Record<string, unknown>).map(([key, value]) => [
    key,
    value === null || value === undefined ? "" : String(value),
  ]);
}

export default async function ProductDetailPage({ params }: Props) {
  const { slug } = await params;

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: {
        orderBy: { isPrimary: "desc" },
      },
      variants: true,
      brand: true,
      category: true,
    },
  });

  if (!product) {
    notFound();
  }

  const relatedProducts = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      NOT: { id: product.id },
    },
    take: 4,
    orderBy: { sold: "desc" },
    include: {
      images: true,
      variants: true,
      brand: true,
      category: true,
    },
  });

  const serialized = serializeProduct(product);
  const specs = formatSpecs(product.specs);

  const mainImage = product.images.find((image) => image.isPrimary) ?? product.images[0] ?? null;

  return (
    <div className="min-h-screen bg-muted/30">
      <SiteHeader />
      <main className="container mx-auto px-4 py-10">
        <nav className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">
            Trang chủ
          </Link>
          <span className="px-2">/</span>
          <Link href={`/category/${product.category.slug}`} className="hover:text-primary">
            {product.category.name}
          </Link>
          <span className="px-2">/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        <div className="mt-6 grid gap-8 lg:grid-cols-[1.3fr,1fr]">
          <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              {mainImage ? (
                <div className="flex justify-center">
                  <Image
                    src={mainImage.url}
                    alt={mainImage.alt ?? product.name}
                    width={600}
                    height={600}
                    className="h-80 w-full max-w-md object-contain"
                    sizes="(min-width: 1024px) 480px, 80vw"
                  />
                </div>
              ) : (
                <div className="flex h-80 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                  Chưa có hình sản phẩm
                </div>
              )}
              {product.images.length > 1 ? (
                <div className="mt-4 grid grid-cols-4 gap-3">
                  {product.images.map((image) => (
                    <Image
                      key={image.id}
                      src={image.url}
                      alt={image.alt ?? product.name}
                      width={160}
                      height={160}
                      className={`h-20 w-full rounded-lg border object-contain p-2 ${
                        image.id === mainImage?.id ? "border-primary" : "border-transparent"
                      }`}
                      sizes="120px"
                    />
                  ))}
                </div>
              ) : null}
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-xl font-semibold">Thông số kỹ thuật</h2>
              {specs.length ? (
                <dl className="mt-4 grid gap-3 sm:grid-cols-2">
                  {specs.map(([label, value]) => (
                    <div key={label} className="rounded-lg border bg-muted/40 p-3">
                      <dt className="text-xs uppercase text-muted-foreground">{label}</dt>
                      <dd className="mt-1 text-sm font-medium text-foreground">{value}</dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p className="mt-4 text-sm text-muted-foreground">Đang cập nhật thông số kỹ thuật.</p>
              )}
            </div>

            {product.description ? (
              <article className="prose prose-sm max-w-none rounded-2xl bg-white p-6 shadow-sm prose-headings:text-foreground">
                <h2>Đánh giá chi tiết</h2>
                <p>{product.description}</p>
              </article>
            ) : null}
          </div>

          <aside className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <span className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                {product.brand ? product.brand.name : "Sản phẩm chính hãng"}
              </span>
              <h1 className="mt-3 text-2xl font-bold text-foreground">{product.name}</h1>
              <div className="mt-3 flex items-end gap-3">
                <span className="text-3xl font-bold text-red-500">
                  {formatCurrency(serialized.discountPrice ?? serialized.price ?? 0)}
                </span>
                {serialized.discountPrice && serialized.price && serialized.discountPrice < serialized.price ? (
                  <span className="text-sm text-muted-foreground line-through">
                    {formatCurrency(serialized.price)}
                  </span>
                ) : null}
              </div>
              <p className="mt-1 text-sm text-muted-foreground">Đã bán {product.sold} sản phẩm • Đánh giá {product.rating.toFixed(1)}/5</p>

              {serialized.variants.length ? (
                <div className="mt-4 space-y-3">
                  <h3 className="text-sm font-semibold">Lựa chọn cấu hình</h3>
                  <div className="flex flex-wrap gap-2">
                    {serialized.variants.map((variant) => (
                      <button
                        key={variant.id}
                        type="button"
                        className="rounded-lg border border-primary/30 px-3 py-2 text-xs font-semibold text-primary hover:border-primary"
                      >
                        {variant.name}
                        {variant.price ? ` - ${formatCurrency(variant.price)}` : ""}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="mt-6 space-y-3">
                <button className="w-full rounded-xl bg-primary px-5 py-3 text-base font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90">
                  Mua ngay
                </button>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button className="rounded-xl border border-primary/40 px-5 py-3 text-sm font-semibold text-primary hover:border-primary">
                    Trả góp 0%
                  </button>
                  <button className="rounded-xl border border-primary/40 px-5 py-3 text-sm font-semibold text-primary hover:border-primary">
                    Thu cũ đổi mới
                  </button>
                </div>
              </div>

              <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                <li className="flex items-center gap-2">
                  <Truck className="h-4 w-4 text-primary" />
                  Giao hàng trong 2 giờ hoặc nhận tại cửa hàng gần nhất
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-primary" />
                  Bảo hành chính hãng 12 tháng, đổi trả trong 30 ngày
                </li>
                <li className="flex items-center gap-2">
                  <RefreshCcw className="h-4 w-4 text-primary" />
                  Hỗ trợ nâng cấp, thu cũ đổi mới trợ giá hấp dẫn
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-primary" />
                  Giá đã bao gồm VAT, xuất hóa đơn điện tử
                </li>
              </ul>
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Khuyến mãi hiện có</h2>
              <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
                <li className="rounded-lg bg-primary/5 px-3 py-2">
                  Giảm thêm 500.000đ khi thanh toán qua thẻ tín dụng TPBank.
                </li>
                <li className="rounded-lg bg-primary/5 px-3 py-2">
                  Tặng gói iCloud 50GB 3 tháng cho khách hàng mới.
                </li>
                <li className="rounded-lg bg-primary/5 px-3 py-2">
                  Giảm 20% phụ kiện khi mua kèm sản phẩm này.
                </li>
              </ul>
            </div>
          </aside>
        </div>

        {relatedProducts.length ? (
          <section className="mt-12 space-y-4">
            <header className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Sản phẩm liên quan</h2>
              <Link
                href={`/category/${product.category.slug}`}
                className="text-sm font-semibold text-primary"
              >
                Xem thêm {product.category.name}
              </Link>
            </header>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {relatedProducts.map((item) => (
                <ProductCard key={item.id} product={serializeProduct(item)} />
              ))}
            </div>
          </section>
        ) : null}
      </main>
      <SiteFooter />
    </div>
  );
}


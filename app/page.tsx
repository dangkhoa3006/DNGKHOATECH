import Image from "next/image";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { SiteHeader } from "@/components/store/site-header";
import { SiteFooter } from "@/components/store/site-footer";
import { CategoryGrid } from "@/components/store/category-grid";
import { ProductCard } from "@/components/store/product-card";
import { BannerSlider } from "@/components/store/banner-slider";
import { serializeProduct, serializeCategory } from "@/lib/serializers";

export default async function HomePage() {
  const [categories, heroBanners, featuredProducts, phoneHighlights, laptopHighlights, articles] =
    await Promise.all([
      prisma.category.findMany({
        where: { parentId: null },
        orderBy: { name: "asc" },
      }),
      prisma.banner.findMany({
        where: {
          position: "home-hero",
          isActive: true,
        },
        orderBy: [{ order: "asc" }, { createdAt: "desc" }],
        take: 4,
      }),
      prisma.product.findMany({
        where: { featured: true },
        orderBy: { sold: "desc" },
        take: 8,
        include: {
          images: true,
          variants: true,
          brand: true,
          category: true,
        },
      }),
      prisma.product.findMany({
        where: { category: { slug: "dien-thoai" } },
        orderBy: { sold: "desc" },
        take: 8,
        include: {
          images: true,
          variants: true,
          brand: true,
          category: true,
        },
      }),
      prisma.product.findMany({
        where: { category: { slug: "laptop" } },
        orderBy: { sold: "desc" },
        take: 8,
        include: {
          images: true,
          variants: true,
          brand: true,
          category: true,
        },
      }),
      prisma.article.findMany({
        orderBy: { publishedAt: "desc" },
        take: 4,
      }),
    ]);

  const secondaryBanners = heroBanners.slice(1, 4);

  return (
    <div className="min-h-screen bg-muted/30">
      <SiteHeader />
      <main className="container mx-auto space-y-12 px-4 py-10">
        <section className="grid gap-6 lg:grid-cols-[2fr,1fr]">
          {/* Banner Slider */}
          <BannerSlider
            banners={heroBanners}
            autoPlay={true}
            autoPlayInterval={5000}
            showDots={true}
            showArrows={true}
          />
          
          {/* Secondary Banners */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
            {secondaryBanners.map((banner) => (
              <Link
                key={banner.id}
                href={banner.link ?? "#"}
                className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="relative h-32 w-full">
                  <Image
                    src={banner.imageUrl}
                    alt={banner.title}
                    fill
                    className="object-cover transition group-hover:scale-105"
                    sizes="(min-width: 1024px) 32vw, 100vw"
                  />
                </div>
                <div className="space-y-1 px-5 py-3">
                  <h3 className="text-base font-semibold text-foreground group-hover:text-primary">
                    {banner.title}
                  </h3>
                  {banner.subtitle ? (
                    <p className="text-xs text-muted-foreground">{banner.subtitle}</p>
                  ) : null}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Danh mục nổi bật</h2>
            <Link href="/categories" className="text-sm font-semibold text-primary">
              Xem tất cả
            </Link>
          </div>
          <CategoryGrid categories={categories.map(serializeCategory)} />
        </section>

        <section className="space-y-6">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Freeship &amp; Flash Sale hôm nay</h2>
              <p className="text-sm text-muted-foreground">
                Đặt nhanh để nhận ưu đãi độc quyền và giao hàng miễn phí trong 2 giờ
              </p>
            </div>
            <Link href="/flash-sale" className="text-sm font-semibold text-primary">
              Xem tất cả
            </Link>
          </header>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={serializeProduct(product)} />
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Điện thoại bán chạy</h2>
              <p className="text-sm text-muted-foreground">Top lựa chọn công nghệ mới nhất, nhiều ưu đãi</p>
            </div>
            <Link href="/category/dien-thoai" className="text-sm font-semibold text-primary">
              Xem tất cả
            </Link>
          </header>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {phoneHighlights.map((product) => (
              <ProductCard key={product.id} product={serializeProduct(product)} />
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <header className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Laptop văn phòng &amp; học tập</h2>
              <p className="text-sm text-muted-foreground">Chọn ngay laptop mỏng nhẹ, pin trâu cho năng suất tối đa</p>
            </div>
            <Link href="/category/laptop" className="text-sm font-semibold text-primary">
              Xem tất cả
            </Link>
          </header>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {laptopHighlights.map((product) => (
              <ProductCard key={product.id} product={serializeProduct(product)} />
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-2xl font-bold">Tin công nghệ &amp; khuyến mãi</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/bai-viet/${article.slug}`}
                className="group flex overflow-hidden rounded-xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                {article.thumbnail ? (
                  <Image
                    src={article.thumbnail}
                    alt={article.title}
                    width={160}
                    height={160}
                    className="h-40 w-40 object-cover"
                    sizes="160px"
                  />
                ) : (
                  <div className="flex h-40 w-40 items-center justify-center bg-muted text-muted-foreground">
                    cập nhật
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-2 p-4">
                  <span className="text-xs font-semibold uppercase text-primary">
                    {article.category}
                  </span>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary">
                    {article.title}
                  </h3>
                  {article.excerpt ? (
                    <p className="text-sm text-muted-foreground">{article.excerpt}</p>
                  ) : null}
                  <span className="mt-auto text-xs text-muted-foreground">
                    {article.publishedAt
                      ? new Date(article.publishedAt).toLocaleDateString("vi-VN")
                      : "Tin mới"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="space-y-4 rounded-2xl bg-white p-6 shadow-sm">
          <h2 className="text-xl font-bold">Tại sao nên chọn TGDD Clone?</h2>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              {
                title: "Giao nhanh 2 giờ",
                description: "Đặt hàng online, nhận nhanh tại nhà hoặc nhận ở cửa hàng gần nhất.",
              },
              {
                title: "Chính hãng 100%",
                description: "Cam kết sản phẩm chính hãng, bảo hành toàn quốc theo tiêu chuẩn nhà sản xuất.",
              },
              {
                title: "Trả góp linh hoạt",
                description: "Hỗ trợ trả góp 0%, thủ tục nhanh chóng, duyệt hồ sơ online chỉ 5 phút.",
              },
              {
                title: "Ưu đãi thành viên",
                description: "Tích điểm đổi quà, hưởng ưu đãi sinh nhật và giảm giá độc quyền.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-xl border border-dashed border-primary/40 p-4">
                <h3 className="text-base font-semibold text-primary">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{item.description}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

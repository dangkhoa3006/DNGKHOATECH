import Link from "next/link";
import { ArrowUpRight, FileText, Package, Tag, Users } from "lucide-react";

import { CMSLayout } from "@/components/cms/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { formatCurrency, calcDiscountPercent } from "@/lib/format";
import { serializeProduct } from "@/lib/serializers";

export default async function Dashboard() {
  const [counts, latestArticles, latestProducts] = await Promise.all([
    Promise.all([
      prisma.product.count(),
      prisma.category.count(),
      prisma.article.count(),
      prisma.user.count(),
    ]),
    prisma.article.findMany({
      orderBy: { publishedAt: "desc" },
      take: 5,
    }),
    prisma.product.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        images: true,
        variants: true,
        brand: true,
        category: true,
      },
    }),
  ]);

  const [productCount, categoryCount, articleCount, userCount] = counts;

  const stats = [
    {
      title: "Sản phẩm",
      value: productCount,
      description: "Tổng số sản phẩm đang kinh doanh",
      icon: Package,
      href: "/cms/products",
    },
    {
      title: "Danh mục",
      value: categoryCount,
      description: "Danh mục sản phẩm đang hiển thị",
      icon: Tag,
      href: "/cms/categories",
    },
    {
      title: "Bài viết",
      value: articleCount,
      description: "Tin tức & khuyến mãi mới nhất",
      icon: FileText,
      href: "/cms/articles",
    },
    {
      title: "Người dùng",
      value: userCount,
      description: "Người dùng đã đăng ký hệ thống",
      icon: Users,
      href: "/cms/users",
    },
  ];

  return (
    <CMSLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Bảng điều khiển</h1>
            <p className="text-sm text-muted-foreground">
              Theo dõi kết quả kinh doanh và nội dung hiển thị trên website.
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                  <div>
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      {stat.title}
                    </CardTitle>
                    <div className="mt-2 text-2xl font-bold text-foreground">
                      {stat.value.toLocaleString("vi-VN")}
                    </div>
                  </div>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{stat.description}</span>
                  <Link href={stat.href} className="inline-flex items-center gap-1 font-medium text-primary">
                    Quản lý <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-4 xl:grid-cols-[2fr,1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Sản phẩm mới cập nhật</CardTitle>
              <CardDescription>Các sản phẩm vừa tạo hoặc chỉnh sửa gần đây</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {latestProducts.map((product) => {
                  const serialized = serializeProduct(product);
                  const discount = calcDiscountPercent(
                    serialized.price ?? null,
                    serialized.discountPrice ?? null
                  );

                  return (
                    <div
                      key={product.id}
                      className="flex items-center justify-between rounded-lg border bg-muted/40 p-4"
                    >
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {product.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {product.category?.name ?? "Không phân loại"}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <p className="font-semibold text-primary">
                          {formatCurrency(serialized.discountPrice ?? serialized.price ?? 0)}
                        </p>
                        {discount ? (
                          <p className="text-xs text-muted-foreground">
                            Giảm {discount}% so với giá gốc
                          </p>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bài viết mới</CardTitle>
              <CardDescription>Các bài viết hiển thị ngoài website</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                {latestArticles.map((article) => (
                  <div key={article.id} className="rounded-lg border bg-muted/40 p-3">
                    <p className="font-medium text-foreground">{article.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {article.publishedAt
                        ? new Date(article.publishedAt).toLocaleString("vi-VN")
                        : "Chưa xuất bản"}
                    </p>
                  </div>
                ))}
                {!latestArticles.length ? (
                  <p className="text-sm text-muted-foreground">
                    Chưa có bài viết nào. Hãy tạo bài viết đầu tiên!
                  </p>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Hành động nhanh</CardTitle>
            <CardDescription>Quản lý nội dung và danh mục sản phẩm</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                { label: "Thêm sản phẩm", href: "/cms/products/new" },
                { label: "Tạo danh mục", href: "/cms/categories/new" },
                { label: "Viết bài khuyến mãi", href: "/cms/articles/new" },
                { label: "Quản lý banner", href: "/cms/banners" },
                { label: "Xem đơn hàng", href: "/cms/orders" },
                { label: "Báo cáo doanh thu", href: "/cms/reports" },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="flex items-center justify-between rounded-lg border border-dashed px-4 py-3 text-sm font-semibold text-primary transition hover:border-primary"
                >
                  {action.label}
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </CMSLayout>
  );
}


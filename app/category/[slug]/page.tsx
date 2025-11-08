import Link from "next/link";
import { notFound } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serializers";
import { SiteHeader } from "@/components/store/site-header";
import { SiteFooter } from "@/components/store/site-footer";
import { ProductCard } from "@/components/store/product-card";

type Props = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    sort?: string;
  }>;
};

const SORT_OPTIONS = [
  { label: "Nổi bật", value: "featured" },
  { label: "Bán chạy", value: "popular" },
  { label: "Giá thấp đến cao", value: "price-asc" },
  { label: "Giá cao đến thấp", value: "price-desc" },
  { label: "Mới nhất", value: "newest" },
];

function buildOrderBy(sort?: string) {
  switch (sort) {
    case "price-asc":
      return { price: "asc" } as const;
    case "price-desc":
      return { price: "desc" } as const;
    case "popular":
      return { sold: "desc" } as const;
    case "newest":
      return { createdAt: "desc" } as const;
    default:
      return { featured: "desc" } as const;
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const [{ slug }, { sort = "featured" }] = await Promise.all([params, searchParams]);

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        orderBy: buildOrderBy(sort),
        include: {
          images: true,
          variants: true,
          brand: true,
          category: true,
        },
      },
    },
  });

  if (!category) {
    notFound();
  }

  const siblingCategories = await prisma.category.findMany({
    where:
      category.parentId !== null
        ? { parentId: category.parentId ?? undefined }
        : { parentId: null },
    orderBy: { name: "asc" },
  });

  return (
    <div className="min-h-screen bg-muted/30">
      <SiteHeader />
      <main className="container mx-auto px-4 py-10">
        <nav className="text-sm text-muted-foreground">
          <Link href="/" className="hover:text-primary">
            Trang chủ
          </Link>
          <span className="px-2">/</span>
          <span className="text-foreground">{category.name}</span>
        </nav>

        <header className="mt-4 flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">{category.name}</h1>
            {category.description ? (
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                {category.description}
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="text-muted-foreground">Sắp xếp:</span>
            <div className="flex flex-wrap gap-2">
              {SORT_OPTIONS.map((option) => (
                <Link
                  key={option.value}
                  href={`/category/${slug}?sort=${option.value}`}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                    sort === option.value
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-transparent bg-muted text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  {option.label}
                </Link>
              ))}
            </div>
          </div>
        </header>

        {siblingCategories.length ? (
          <div className="mt-6 flex flex-wrap gap-2">
            {siblingCategories.map((item) => (
              <Link
                key={item.slug}
                href={`/category/${item.slug}`}
                className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                  item.slug === slug
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-muted bg-white text-muted-foreground hover:border-primary/40"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>
        ) : null}

        <section className="mt-8">
          {category.products.length ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {category.products.map((product) => (
                <ProductCard key={product.id} product={serializeProduct(product)} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed bg-white p-12 text-center text-muted-foreground">
              Danh mục này đang được cập nhật sản phẩm, vui lòng quay lại sau.
            </div>
          )}
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}


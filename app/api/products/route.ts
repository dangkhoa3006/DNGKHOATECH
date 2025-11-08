import { NextResponse } from "next/server";

import { prisma, Prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serializers";

type ProductsQuery = {
  category?: string | null;
  brand?: string | null;
  featured?: string | null;
  search?: string | null;
  limit?: string | null;
  page?: string | null;
  sort?: string | null;
};

function parseProductsQuery(url: string): ProductsQuery {
  const { searchParams } = new URL(url);

  return {
    category: searchParams.get("category"),
    brand: searchParams.get("brand"),
    featured: searchParams.get("featured"),
    search: searchParams.get("search"),
    limit: searchParams.get("limit"),
    page: searchParams.get("page"),
    sort: searchParams.get("sort"),
  };
}

function normalizeBoolean(value: string | null | undefined) {
  if (value === null || value === undefined) return undefined;
  if (value === "true") return true;
  if (value === "false") return false;
  return undefined;
}

function buildOrderBy(sort?: string | null): Prisma.ProductOrderByWithRelationInput {
  switch (sort) {
    case "price-asc":
      return { price: "asc" };
    case "price-desc":
      return { price: "desc" };
    case "popular":
      return { sold: "desc" };
    case "rating":
      return { rating: "desc" };
    case "newest":
      return { createdAt: "desc" };
    default:
      return { featured: "desc" };
  }
}

export async function GET(request: Request) {
  try {
    const query = parseProductsQuery(request.url);

    const limit = Math.min(Math.max(Number(query.limit ?? "12"), 1), 48);
    const page = Math.max(Number(query.page ?? "1"), 1);
    const skip = (page - 1) * limit;
    const featuredFilter = normalizeBoolean(query.featured);

    const where: Prisma.ProductWhereInput = {};

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { shortDesc: { contains: query.search } },
      ];
    }

    if (featuredFilter !== undefined) {
      where.featured = featuredFilter;
    }

    if (query.category) {
      where.category = { slug: query.category };
    }

    if (query.brand) {
      where.brand = { slug: query.brand };
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        take: limit,
        skip,
        orderBy: buildOrderBy(query.sort),
        include: {
          images: { orderBy: { isPrimary: "desc" } },
          variants: true,
          brand: true,
          category: true,
        },
      }),
    ]);

    const data = products.map(serializeProduct);

    return NextResponse.json({
      data,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[API] products", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


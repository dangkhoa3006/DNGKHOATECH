import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma, Prisma } from "@/lib/prisma";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "dev_access_secret";

async function verifyAdmin() {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("access_token")?.value;

  if (!accessToken) {
    throw new Error("Unauthorized");
  }

  try {
    const payload = jwt.verify(accessToken, ACCESS_TOKEN_SECRET) as { sub: string; role: string };
    if (payload.role !== "ADMIN") {
      throw new Error("Forbidden");
    }
    return payload;
  } catch {
    throw new Error("Invalid token");
  }
}

export async function GET(request: Request) {
  try {
    await verifyAdmin();

    const { searchParams } = new URL(request.url);
    const page = Math.max(Number(searchParams.get("page") ?? "1"), 1);
    const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? "20"), 1), 100);
    const skip = (page - 1) * limit;
    const search = searchParams.get("search") || undefined;

    const where: Prisma.ProductWhereInput = {};

    if (search) {
      where.OR = [
        { name: { contains: search } },
        { slug: { contains: search } },
        { shortDesc: { contains: search } },
      ];
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          category: true,
          brand: true,
          images: { take: 1, orderBy: { isPrimary: "desc" } },
          _count: { select: { variants: true } },
        },
      }),
    ]);

    return NextResponse.json({
      data: products,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden" || error.message === "Invalid token") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("[CMS API] products GET", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await verifyAdmin();

    const body = await request.json();
    const { name, slug, shortDesc, description, price, discountPrice, stock, featured, categoryId, brandId, thumbnailUrl, specs } = body;

    if (!name || !slug || !price || !categoryId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Check if slug exists
    const existing = await prisma.product.findUnique({ where: { slug } });
    if (existing) {
      return NextResponse.json({ error: "Product with this slug already exists" }, { status: 409 });
    }

    // Check category exists
    const category = await prisma.category.findUnique({ where: { id: Number(categoryId) } });
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    // Check brand if provided
    if (brandId) {
      const brand = await prisma.brand.findUnique({ where: { id: Number(brandId) } });
      if (!brand) {
        return NextResponse.json({ error: "Brand not found" }, { status: 404 });
      }
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        shortDesc: shortDesc || null,
        description: description || null,
        price: Number(price),
        discountPrice: discountPrice ? Number(discountPrice) : null,
        stock: stock ? Number(stock) : 0,
        featured: featured === true || featured === "true",
        categoryId: Number(categoryId),
        brandId: brandId ? Number(brandId) : null,
        thumbnailUrl: thumbnailUrl || null,
        specs: specs ? (typeof specs === "string" ? JSON.parse(specs) : specs) : null,
      },
      include: {
        category: true,
        brand: true,
      },
    });

    return NextResponse.json({ data: product }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden" || error.message === "Invalid token") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("[CMS API] products POST", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


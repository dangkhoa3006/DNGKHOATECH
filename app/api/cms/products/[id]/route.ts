import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";

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

type Params = {
  params: Promise<{ id: string }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    await verifyAdmin();

    const { id } = await params;
    const productId = Number(id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: {
        category: true,
        brand: true,
        images: { orderBy: { isPrimary: "desc" } },
        variants: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ data: product });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden" || error.message === "Invalid token") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("[CMS API] product GET", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    await verifyAdmin();

    const { id } = await params;
    const productId = Number(id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const body = await request.json();
    const { name, slug, shortDesc, description, price, discountPrice, stock, featured, categoryId, brandId, thumbnailUrl, specs } = body;

    // Check if product exists
    const existing = await prisma.product.findUnique({ where: { id: productId } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Check slug uniqueness if changed
    if (slug && slug !== existing.slug) {
      const slugExists = await prisma.product.findUnique({ where: { slug } });
      if (slugExists) {
        return NextResponse.json({ error: "Product with this slug already exists" }, { status: 409 });
      }
    }

    // Check category if provided
    if (categoryId) {
      const category = await prisma.category.findUnique({ where: { id: Number(categoryId) } });
      if (!category) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
    }

    // Check brand if provided
    if (brandId !== undefined) {
      if (brandId === null) {
        // Allow removing brand
      } else {
        const brand = await prisma.brand.findUnique({ where: { id: Number(brandId) } });
        if (!brand) {
          return NextResponse.json({ error: "Brand not found" }, { status: 404 });
        }
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (slug !== undefined) updateData.slug = slug;
    if (shortDesc !== undefined) updateData.shortDesc = shortDesc || null;
    if (description !== undefined) updateData.description = description || null;
    if (price !== undefined) updateData.price = Number(price);
    if (discountPrice !== undefined) updateData.discountPrice = discountPrice ? Number(discountPrice) : null;
    if (stock !== undefined) updateData.stock = Number(stock);
    if (featured !== undefined) updateData.featured = featured === true || featured === "true";
    if (categoryId !== undefined) updateData.categoryId = Number(categoryId);
    if (brandId !== undefined) updateData.brandId = brandId ? Number(brandId) : null;
    if (thumbnailUrl !== undefined) updateData.thumbnailUrl = thumbnailUrl || null;
    if (specs !== undefined) updateData.specs = specs ? (typeof specs === "string" ? JSON.parse(specs) : specs) : null;

    const product = await prisma.product.update({
      where: { id: productId },
      data: updateData,
      include: {
        category: true,
        brand: true,
        images: { orderBy: { isPrimary: "desc" } },
        variants: true,
      },
    });

    return NextResponse.json({ data: product });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden" || error.message === "Invalid token") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("[CMS API] product PATCH", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    await verifyAdmin();

    const { id } = await params;
    const productId = Number(id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    await prisma.product.delete({ where: { id: productId } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden" || error.message === "Invalid token") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("[CMS API] product DELETE", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


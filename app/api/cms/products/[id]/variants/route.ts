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

    const variants = await prisma.productVariant.findMany({
      where: { productId },
      orderBy: { id: "asc" },
    });

    return NextResponse.json({ data: variants });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden" || error.message === "Invalid token") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("[CMS API] product variants GET", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: Params) {
  try {
    await verifyAdmin();

    const { id } = await params;
    const productId = Number(id);

    if (isNaN(productId)) {
      return NextResponse.json({ error: "Invalid product ID" }, { status: 400 });
    }

    const body = await request.json();
    const { name, sku, price, stock, attributes } = body;

    if (!name) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    // Check if SKU exists
    if (sku) {
      const existing = await prisma.productVariant.findUnique({ where: { sku } });
      if (existing) {
        return NextResponse.json({ error: "SKU already exists" }, { status: 409 });
      }
    }

    const variant = await prisma.productVariant.create({
      data: {
        name,
        sku: sku || null,
        price: price ? Number(price) : null,
        stock: stock ? Number(stock) : 0,
        attributes: attributes ? (typeof attributes === "string" ? JSON.parse(attributes) : attributes) : null,
        productId,
      },
    });

    return NextResponse.json({ data: variant }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden" || error.message === "Invalid token") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("[CMS API] product variants POST", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


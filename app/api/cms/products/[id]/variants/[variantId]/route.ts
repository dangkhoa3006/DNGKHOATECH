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
  params: Promise<{ id: string; variantId: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    await verifyAdmin();

    const { variantId } = await params;
    const variantIdNum = Number(variantId);

    if (isNaN(variantIdNum)) {
      return NextResponse.json({ error: "Invalid variant ID" }, { status: 400 });
    }

    const body = await request.json();
    const { name, sku, price, stock, attributes } = body;

    // Check if SKU exists (if changed)
    if (sku) {
      const existing = await prisma.productVariant.findUnique({ where: { sku } });
      if (existing && existing.id !== variantIdNum) {
        return NextResponse.json({ error: "SKU already exists" }, { status: 409 });
      }
    }

    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (sku !== undefined) updateData.sku = sku || null;
    if (price !== undefined) updateData.price = price ? Number(price) : null;
    if (stock !== undefined) updateData.stock = Number(stock);
    if (attributes !== undefined) {
      updateData.attributes = attributes ? (typeof attributes === "string" ? JSON.parse(attributes) : attributes) : null;
    }

    const variant = await prisma.productVariant.update({
      where: { id: variantIdNum },
      data: updateData,
    });

    return NextResponse.json({ data: variant });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden" || error.message === "Invalid token") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("[CMS API] product variant PATCH", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    await verifyAdmin();

    const { variantId } = await params;
    const variantIdNum = Number(variantId);

    if (isNaN(variantIdNum)) {
      return NextResponse.json({ error: "Invalid variant ID" }, { status: 400 });
    }

    await prisma.productVariant.delete({ where: { id: variantIdNum } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden" || error.message === "Invalid token") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("[CMS API] product variant DELETE", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


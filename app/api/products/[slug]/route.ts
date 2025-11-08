import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { serializeProduct } from "@/lib/serializers";

type Params = {
  params: Promise<{
    slug: string;
  }>;
};

export async function GET(_: Request, { params }: Params) {
  try {
    const { slug } = await params;

    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        images: {
          orderBy: {
            isPrimary: "desc",
          },
        },
        variants: true,
        brand: true,
        category: true,
      },
    });

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ data: serializeProduct(product) });
  } catch (error) {
    console.error("[API] product detail", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


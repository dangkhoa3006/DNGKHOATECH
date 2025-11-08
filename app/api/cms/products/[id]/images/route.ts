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

    const images = await prisma.productImage.findMany({
      where: { productId },
      orderBy: { isPrimary: "desc" },
    });

    return NextResponse.json({ data: images });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden" || error.message === "Invalid token") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("[CMS API] product images GET", error);
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
    const { url, alt, isPrimary } = body;

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    // If setting as primary, unset other primary images
    if (isPrimary) {
      await prisma.productImage.updateMany({
        where: { productId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const image = await prisma.productImage.create({
      data: {
        url,
        alt: alt || null,
        isPrimary: isPrimary || false,
        productId,
      },
    });

    return NextResponse.json({ data: image }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden" || error.message === "Invalid token") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("[CMS API] product images POST", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


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
  params: Promise<{ id: string; imageId: string }>;
};

export async function PATCH(request: Request, { params }: Params) {
  try {
    await verifyAdmin();

    const { id, imageId } = await params;
    const productId = Number(id);
    const imageIdNum = Number(imageId);

    if (isNaN(productId) || isNaN(imageIdNum)) {
      return NextResponse.json({ error: "Invalid IDs" }, { status: 400 });
    }

    const body = await request.json();
    const { url, alt, isPrimary } = body;

    // If setting as primary, unset other primary images
    if (isPrimary) {
      await prisma.productImage.updateMany({
        where: { productId, isPrimary: true },
        data: { isPrimary: false },
      });
    }

    const updateData: any = {};
    if (url !== undefined) updateData.url = url;
    if (alt !== undefined) updateData.alt = alt || null;
    if (isPrimary !== undefined) updateData.isPrimary = isPrimary;

    const image = await prisma.productImage.update({
      where: { id: imageIdNum },
      data: updateData,
    });

    return NextResponse.json({ data: image });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden" || error.message === "Invalid token") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("[CMS API] product image PATCH", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    await verifyAdmin();

    const { imageId } = await params;
    const imageIdNum = Number(imageId);

    if (isNaN(imageIdNum)) {
      return NextResponse.json({ error: "Invalid image ID" }, { status: 400 });
    }

    await prisma.productImage.delete({ where: { id: imageIdNum } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden" || error.message === "Invalid token") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("[CMS API] product image DELETE", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


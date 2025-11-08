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

export async function GET(request: Request) {
  try {
    await verifyAdmin();

    const { searchParams } = new URL(request.url);
    const position = searchParams.get("position");

    const where: any = {};
    if (position) {
      where.position = position;
    }

    const menuItems = await prisma.menuItem.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      include: {
        children: {
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        },
      },
    });

    return NextResponse.json({ data: menuItems });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden" || error.message === "Invalid token") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("[CMS API] menu GET", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await verifyAdmin();

    const body = await request.json();
    const { label, href, icon, order, parentId, position, isActive, target } = body;

    if (!label || !href || !position) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const menuItem = await prisma.menuItem.create({
      data: {
        label,
        href,
        icon: icon || null,
        order: order ? Number(order) : 0,
        parentId: parentId ? Number(parentId) : null,
        position,
        isActive: isActive !== false,
        target: target || "_self",
      },
      include: {
        children: true,
      },
    });

    return NextResponse.json({ data: menuItem }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden" || error.message === "Invalid token") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("[CMS API] menu POST", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


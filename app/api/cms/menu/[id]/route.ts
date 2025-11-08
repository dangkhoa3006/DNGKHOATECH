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
    const menuId = Number(id);

    if (isNaN(menuId)) {
      return NextResponse.json({ error: "Invalid menu ID" }, { status: 400 });
    }

    const menuItem = await prisma.menuItem.findUnique({
      where: { id: menuId },
      include: {
        children: {
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        },
      },
    });

    if (!menuItem) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    return NextResponse.json({ data: menuItem });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden" || error.message === "Invalid token") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("[CMS API] menu GET", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    await verifyAdmin();

    const { id } = await params;
    const menuId = Number(id);

    if (isNaN(menuId)) {
      return NextResponse.json({ error: "Invalid menu ID" }, { status: 400 });
    }

    const body = await request.json();
    const { label, href, icon, order, parentId, position, isActive, target } = body;

    const existing = await prisma.menuItem.findUnique({ where: { id: menuId } });
    if (!existing) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (label !== undefined) updateData.label = label;
    if (href !== undefined) updateData.href = href;
    if (icon !== undefined) updateData.icon = icon || null;
    if (order !== undefined) updateData.order = Number(order);
    if (parentId !== undefined) updateData.parentId = parentId ? Number(parentId) : null;
    if (position !== undefined) updateData.position = position;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (target !== undefined) updateData.target = target || "_self";

    const menuItem = await prisma.menuItem.update({
      where: { id: menuId },
      data: updateData,
      include: {
        children: {
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        },
      },
    });

    return NextResponse.json({ data: menuItem });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden" || error.message === "Invalid token") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("[CMS API] menu PATCH", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_: Request, { params }: Params) {
  try {
    await verifyAdmin();

    const { id } = await params;
    const menuId = Number(id);

    if (isNaN(menuId)) {
      return NextResponse.json({ error: "Invalid menu ID" }, { status: 400 });
    }

    const menuItem = await prisma.menuItem.findUnique({ where: { id: menuId } });
    if (!menuItem) {
      return NextResponse.json({ error: "Menu item not found" }, { status: 404 });
    }

    await prisma.menuItem.delete({ where: { id: menuId } });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden" || error.message === "Invalid token") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("[CMS API] menu DELETE", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


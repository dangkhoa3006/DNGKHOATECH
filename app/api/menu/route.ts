import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get("position");

    const where: any = {
      isActive: true,
      parentId: null, // Chỉ lấy menu items cấp 1
    };
    if (position) {
      where.position = position;
    }

    const menuItems = await prisma.menuItem.findMany({
      where,
      orderBy: [{ order: "asc" }, { createdAt: "asc" }],
      include: {
        children: {
          where: { isActive: true },
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        },
      },
    });

    return NextResponse.json({ data: menuItems });
  } catch (error) {
    console.error("[API] menu GET", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


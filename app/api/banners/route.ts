import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const position = searchParams.get("position");
    const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? "10"), 1), 50);

    const now = new Date();

    const banners = await prisma.banner.findMany({
      where: {
        isActive: true,
        ...(position ? { position } : {}),
        AND: [
          {
            OR: [
              { startsAt: null },
              { startsAt: { lte: now } },
            ],
          },
          {
            OR: [
              { endsAt: null },
              { endsAt: { gte: now } },
            ],
          },
        ],
      },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: limit,
    });

    return NextResponse.json({ data: banners });
  } catch (error) {
    console.error("[API] banners", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


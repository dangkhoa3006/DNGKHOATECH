import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? "8"), 1), 24);
    const page = Math.max(Number(searchParams.get("page") ?? "1"), 1);
    const skip = (page - 1) * limit;

    const where = {
      ...(category ? { category } : {}),
    };

    const [total, articles] = await Promise.all([
      prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        orderBy: { publishedAt: "desc" },
        take: limit,
        skip,
      }),
    ]);

    return NextResponse.json({
      data: articles,
      meta: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[API] articles", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


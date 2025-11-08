import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type CategoriesQuery = {
  parent?: string | null;
  tree?: string | null;
  withCounts?: string | null;
};

function parseQuery(url: string): CategoriesQuery {
  const { searchParams } = new URL(url);

  return {
    parent: searchParams.get("parent"),
    tree: searchParams.get("tree"),
    withCounts: searchParams.get("withCounts"),
  };
}

export async function GET(request: Request) {
  try {
    const query = parseQuery(request.url);

    const includeChildren = query.tree === "true";
    const includeCounts = query.withCounts === "true";

    let parentId: number | null = null;

    if (query.parent && query.parent !== "root") {
      const parentCategory = await prisma.category.findUnique({
        where: { slug: query.parent },
      });

      if (!parentCategory) {
        return NextResponse.json(
          { error: `Parent category '${query.parent}' not found` },
          { status: 404 }
        );
      }

      parentId = parentCategory.id;
    } else if (query.parent === "root") {
      parentId = null;
    }

    const categories = await prisma.category.findMany({
      where:
        parentId === null
          ? query.parent
            ? { parentId: null }
            : undefined
          : { parentId },
      include: {
        children: includeChildren
          ? {
              orderBy: { name: "asc" },
              include: includeCounts ? { _count: { select: { products: true } } } : undefined,
            }
          : false,
        _count: includeCounts ? { select: { products: true, children: true } } : false,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      data: categories,
      meta: {
        total: categories.length,
        includeChildren,
        includeCounts,
      },
    });
  } catch (error) {
    console.error("[API] categories", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


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
    const group = searchParams.get("group");

    const where: any = {};
    if (group) {
      where.group = group;
    }

    const settings = await prisma.siteSetting.findMany({
      where,
      orderBy: [{ group: "asc" }, { key: "asc" }],
    });

    return NextResponse.json({ data: settings });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden" || error.message === "Invalid token") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("[CMS API] settings GET", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await verifyAdmin();

    const body = await request.json();
    const { key, value, type, description, group } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const setting = await prisma.siteSetting.upsert({
      where: { key },
      update: {
        value,
        type: type || "string",
        description: description || null,
        group: group || "general",
      },
      create: {
        key,
        value,
        type: type || "string",
        description: description || null,
        group: group || "general",
      },
    });

    return NextResponse.json({ data: setting }, { status: 201 });
  } catch (error: any) {
    if (error.message === "Unauthorized" || error.message === "Forbidden" || error.message === "Invalid token") {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    console.error("[CMS API] settings POST", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


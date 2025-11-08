import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/jwt";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let payload: { sub: string; role: string };
    try {
      payload = verifyAccessToken(accessToken);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: Number(payload.sub) },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        gender: true,
        avatarUrl: true,
        emailVerifiedAt: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        lastLoginIp: true,
        lastLoginUa: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            otps: true,
            refreshTokens: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error("[AUTH] me", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


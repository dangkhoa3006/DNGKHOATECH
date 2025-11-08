import { cookies } from "next/headers";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { verifyRefreshToken, signAccessToken, signRefreshToken } from "@/lib/jwt";
import { setAuthCookies } from "@/lib/cookies";
import { sha256Hex } from "@/lib/crypto";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const refresh = cookieStore.get("refresh_token")?.value;
    if (!refresh) return NextResponse.json({ error: "Missing refresh token" }, { status: 401 });

    let payload: any;
    try {
      payload = verifyRefreshToken(refresh);
    } catch {
      return NextResponse.json({ error: "Invalid refresh token" }, { status: 401 });
    }

    const tokenHash = sha256Hex(refresh);
    const exist = await prisma.refreshToken.findUnique({ where: { tokenHash } });
    if (!exist || exist.revokedAt || exist.expiresAt < new Date()) {
      return NextResponse.json({ error: "Refresh token revoked or expired" }, { status: 401 });
    }

    // (Optional) rotate refresh token
    const newAccess = signAccessToken({ sub: payload.sub, role: payload.role }, 15);
    const newRefresh = signRefreshToken({ sub: payload.sub, role: payload.role }, 30);

    const res = NextResponse.json({ success: true });
    setAuthCookies(res, newAccess, newRefresh);

    // Revoke old, store new
    await prisma.$transaction([
      prisma.refreshToken.update({ where: { tokenHash }, data: { revokedAt: new Date() } }),
      prisma.refreshToken.create({
        data: {
          userId: Number(payload.sub),
          tokenHash: sha256Hex(newRefresh),
          userAgent: request.headers.get("user-agent") || undefined,
          ip: request.headers.get("x-forwarded-for") || undefined,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
      }),
    ]);

    return res;
  } catch (error) {
    console.error("[AUTH] refresh", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


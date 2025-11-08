import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/crypto";
import { sha256Hex } from "@/lib/crypto";
import { signAccessToken, signRefreshToken } from "@/lib/jwt";
import { setAuthCookies } from "@/lib/cookies";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, remember } = body ?? {};

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "Sai email hoặc mật khẩu" }, { status: 400 });
    if (!user.isActive) return NextResponse.json({ error: "Tài khoản đã bị khóa" }, { status: 403 });

    const ok = verifyPassword(String(password || ""), user.passwordHash);
    if (!ok) return NextResponse.json({ error: "Sai email hoặc mật khẩu" }, { status: 400 });

    const payload = { sub: String(user.id), role: user.role };
    const access = signAccessToken(payload, 15);
    const refresh = signRefreshToken(payload, remember ? 90 : 30);

    const res = NextResponse.json({ success: true, role: user.role });
    setAuthCookies(res, access, refresh);

    // Lưu refresh token hash vào DB
    const tokenHash = sha256Hex(refresh);
    const ua = request.headers.get("user-agent") || undefined;
    const ip = request.headers.get("x-forwarded-for") || undefined;
    const expiresAt = new Date(Date.now() + (remember ? 90 : 30) * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        userAgent: ua,
        ip,
        expiresAt,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date(), lastLoginIp: ip, lastLoginUa: ua },
    });

    return res;
  } catch (error) {
    console.error("[AUTH] login", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


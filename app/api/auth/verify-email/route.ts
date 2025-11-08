import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code } = body ?? {};

    if (!email || !code) {
      return NextResponse.json({ error: "Thiếu email hoặc mã OTP" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return NextResponse.json({ error: "Không tìm thấy người dùng" }, { status: 404 });

    const otp = await prisma.otp.findFirst({
      where: {
        userId: user.id,
        code: String(code),
        purpose: "VERIFY_EMAIL",
        usedAt: null,
        expiresAt: { gte: new Date() },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!otp) return NextResponse.json({ error: "Mã OTP không hợp lệ hoặc đã hết hạn" }, { status: 400 });

    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { emailVerifiedAt: new Date() } }),
      prisma.otp.update({ where: { id: otp.id }, data: { usedAt: new Date() } }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[AUTH] verify-email", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


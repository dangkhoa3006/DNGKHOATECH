import { NextResponse } from "next/server";

import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/crypto";
import { buildOtpEmail, sendMail } from "@/lib/mailer";
import { isValidEmail, isOnlyDigits, normalizePhone, requireNonEmpty } from "@/lib/validators";

function genOtp() {
  return (Math.floor(100000 + Math.random() * 900000)).toString();
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, phone, password, gender, avatarUrl } = body ?? {};

    console.log("[AUTH] register request:", { email, hasPassword: !!password, phone, name });

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: "Email không hợp lệ" }, { status: 400 });
    }
    if (!password || password.length < 6) {
      return NextResponse.json({ error: "Mật khẩu tối thiểu 6 ký tự" }, { status: 400 });
    }
    if (phone && !isOnlyDigits(normalizePhone(phone))) {
      return NextResponse.json({ error: "Số điện thoại chỉ được nhập số" }, { status: 400 });
    }

    console.log("[AUTH] checking existing user...");
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: "Email đã tồn tại" }, { status: 409 });
    }

    console.log("[AUTH] creating user...");
    const passwordHash = hashPassword(password);
    const normalizedGender = gender && gender.trim() ? (gender as "MALE" | "FEMALE" | "OTHER") : null;
    const user = await prisma.user.create({
      data: {
        email,
        name: requireNonEmpty(name || "") ? String(name).trim() : null,
        phone: phone ? normalizePhone(phone) : null,
        gender: normalizedGender,
        avatarUrl: avatarUrl ?? null,
        passwordHash,
        isActive: true,
        role: "USER",
      },
    });
    console.log("[AUTH] user created:", user.id);

    const code = genOtp();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
    console.log("[AUTH] creating OTP...");
    await prisma.otp.create({
      data: {
        userId: user.id,
        code,
        purpose: "VERIFY_EMAIL",
        expiresAt,
      },
    });
    console.log("[AUTH] OTP created");

    try {
      await sendMail(email, "Xác minh tài khoản", buildOtpEmail(user.name, code));
    } catch (mailError) {
      console.error("[AUTH] register mail", mailError);
    }

    return NextResponse.json({ success: true, userId: user.id });
  } catch (error: unknown) {
    console.error("[AUTH] register", error);
    if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
      const metaTarget = error.meta?.target;
      const target = Array.isArray(metaTarget) ? metaTarget.join(",") : String(metaTarget ?? "");
      if (target.includes("email")) {
        return NextResponse.json({ error: "Email đã tồn tại" }, { status: 409 });
      }
      if (target.includes("phone")) {
        return NextResponse.json({ error: "Số điện thoại đã được sử dụng" }, { status: 409 });
      }
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


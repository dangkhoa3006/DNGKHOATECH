import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { clearAuthCookies } from "@/lib/cookies";
import { sha256Hex } from "@/lib/crypto";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const refresh = cookieStore.get("refresh_token")?.value;
    const res = NextResponse.json({ success: true });
    clearAuthCookies(res);

    if (refresh) {
      const tokenHash = sha256Hex(refresh);
      await prisma.refreshToken.updateMany({
        where: { tokenHash },
        data: { revokedAt: new Date() },
      });
    }

    return res;
  } catch (error) {
    console.error("[AUTH] logout", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


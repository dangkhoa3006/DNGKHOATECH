import { NextResponse } from "next/server";
import { cookies } from "next/headers";

import { prisma } from "@/lib/prisma";
import { verifyAccessToken } from "@/lib/jwt";

export async function PATCH(request: Request) {
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

    const body = await request.json();
    const { avatarUrl } = body ?? {};

    if (!avatarUrl || typeof avatarUrl !== "string") {
      return NextResponse.json({ error: "Avatar URL không hợp lệ" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id: Number(payload.sub) },
      data: { avatarUrl },
      select: {
        id: true,
        avatarUrl: true,
      },
    });

    return NextResponse.json({ success: true, avatarUrl: user.avatarUrl });
  } catch (error) {
    console.error("[AUTH] update-avatar", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


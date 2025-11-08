import { NextResponse } from "next/server";

const ACCESS_COOKIE = "access_token";
const REFRESH_COOKIE = "refresh_token";

export function setAuthCookies(res: NextResponse, access: string, refresh: string) {
  const secure = process.env.NODE_ENV === "production";
  res.cookies.set(ACCESS_COOKIE, access, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/",
    maxAge: 60 * 15, // 15 phút
  });
  res.cookies.set(REFRESH_COOKIE, refresh, {
    httpOnly: true,
    sameSite: "lax",
    secure,
    path: "/api/auth",
    maxAge: 60 * 60 * 24 * 30, // 30 ngày
  });
}

export function clearAuthCookies(res: NextResponse) {
  res.cookies.set("access_token", "", { maxAge: 0, path: "/" });
  res.cookies.set("refresh_token", "", { maxAge: 0, path: "/api/auth" });
}

export { ACCESS_COOKIE, REFRESH_COOKIE };


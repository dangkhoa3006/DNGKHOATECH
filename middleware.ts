import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import jwt from "jsonwebtoken";

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || "dev_access_secret";

export function middleware(request: NextRequest) {
  const { nextUrl, cookies } = request;
  const pathname = nextUrl.pathname;

  const accessToken = cookies.get("access_token")?.value;
  const isAuthenticated = Boolean(accessToken);

  const isProtectedPath = pathname.startsWith("/account") || pathname.startsWith("/cms");
  const isAuthPage = pathname === "/login";
  const isCmsPath = pathname.startsWith("/cms");

  // Chặn trang cần đăng nhập
  if (!isAuthenticated && isProtectedPath) {
    const url = new URL(`/login?from=${encodeURIComponent(pathname)}` as string, request.url);
    return NextResponse.redirect(url);
  }

  // Kiểm tra quyền ADMIN cho CMS
  if (isCmsPath && isAuthenticated && accessToken) {
    try {
      const payload = jwt.verify(accessToken, ACCESS_TOKEN_SECRET) as { sub: string; role: string };
      if (payload.role !== "ADMIN") {
        const url = new URL("/", request.url);
        return NextResponse.redirect(url);
      }
    } catch (error) {
      // Token không hợp lệ, chuyển về login
      const url = new URL(`/login?from=${encodeURIComponent(pathname)}` as string, request.url);
      return NextResponse.redirect(url);
    }
  }

  // Nếu đã đăng nhập, chặn truy cập trang login
  if (isAuthenticated && isAuthPage) {
    const url = new URL("/account", request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Áp dụng cho mọi request trừ static assets và api
export const config = {
  matcher: [
    // Loại trừ API, static assets, image optimizer và dữ liệu RSC
    "/((?!api|_next/static|_next/image|favicon.ico|_next/data).*)",
  ],
};



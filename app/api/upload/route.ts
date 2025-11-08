import { NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import { cookies } from "next/headers";
import { verifyAccessToken } from "@/lib/jwt";

const UPLOAD_DIR = join(process.cwd(), "public", "uploads", "avatars");

export async function POST(request: Request) {
  try {
    // Kiểm tra authentication
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
      verifyAccessToken(accessToken);
    } catch {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "Không có file được gửi" }, { status: 400 });
    }

    // Kiểm tra loại file
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File phải là hình ảnh" }, { status: 400 });
    }

    // Kiểm tra kích thước (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File không được vượt quá 5MB" }, { status: 400 });
    }

    // Tạo thư mục nếu chưa tồn tại
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Tạo tên file unique
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 15);
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${timestamp}-${randomStr}.${ext}`;
    const filepath = join(UPLOAD_DIR, filename);

    // Lưu file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filepath, buffer);

    // Trả về URL
    const url = `/uploads/avatars/${filename}`;

    return NextResponse.json({ success: true, url });
  } catch (error) {
    console.error("[UPLOAD] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


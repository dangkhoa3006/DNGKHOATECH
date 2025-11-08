import "dotenv/config";
import { prisma } from "../lib/prisma";
import { hashPassword } from "../lib/crypto";

async function createAdmin() {
  try {
    const email = "admin@admin.com";
    const password = "password";

    // Kiểm tra xem admin đã tồn tại chưa
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log("Admin đã tồn tại!");
      console.log("Email:", existing.email);
      console.log("Role:", existing.role);
      return;
    }

    // Tạo admin mới
    const passwordHash = hashPassword(password);
    const admin = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: "Admin",
        role: "ADMIN",
        isActive: true,
        emailVerifiedAt: new Date(), // Đã xác minh email
      },
    });

    console.log("✅ Tạo admin thành công!");
    console.log("Email:", admin.email);
    console.log("Password:", password);
    console.log("Role:", admin.role);
  } catch (error) {
    console.error("❌ Lỗi khi tạo admin:", error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();


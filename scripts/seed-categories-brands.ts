import "dotenv/config";
import { PrismaClient } from "@/lib/generated/prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Bắt đầu seed categories và brands...");

  // Tạo Categories chính
  const mainCategories = [
    {
      name: "Điện thoại",
      slug: "dien-thoai",
      description: "Điện thoại thông minh các hãng",
    },
    {
      name: "Laptop",
      slug: "laptop",
      description: "Laptop văn phòng, gaming, đồ họa",
    },
    {
      name: "Máy tính bảng",
      slug: "may-tinh-bang",
      description: "Tablet, iPad các loại",
    },
    {
      name: "Phụ kiện",
      slug: "phu-kien",
      description: "Phụ kiện điện thoại, laptop",
    },
    {
      name: "Đồng hồ",
      slug: "dong-ho",
      description: "Đồng hồ thông minh, đồng hồ thời trang",
    },
  ];

  const createdCategories: Record<string, number> = {};

  for (const category of mainCategories) {
    const existing = await prisma.category.findUnique({
      where: { slug: category.slug },
    });

    if (!existing) {
      const created = await prisma.category.create({
        data: category,
      });
      createdCategories[category.slug] = created.id;
      console.log(`✅ Đã tạo category: ${category.name}`);
    } else {
      createdCategories[category.slug] = existing.id;
      console.log(`⏭️  Category đã tồn tại: ${category.name}`);
    }
  }

  // Tạo Sub-categories cho Điện thoại
  const phoneSubCategories = [
    {
      name: "iPhone",
      slug: "iphone",
      description: "Điện thoại iPhone của Apple",
      parentSlug: "dien-thoai",
    },
    {
      name: "Samsung",
      slug: "samsung",
      description: "Điện thoại Samsung",
      parentSlug: "dien-thoai",
    },
    {
      name: "Xiaomi",
      slug: "xiaomi",
      description: "Điện thoại Xiaomi",
      parentSlug: "dien-thoai",
    },
    {
      name: "OPPO",
      slug: "oppo",
      description: "Điện thoại OPPO",
      parentSlug: "dien-thoai",
    },
    {
      name: "Vivo",
      slug: "vivo",
      description: "Điện thoại Vivo",
      parentSlug: "dien-thoai",
    },
    {
      name: "Realme",
      slug: "realme",
      description: "Điện thoại Realme",
      parentSlug: "dien-thoai",
    },
    {
      name: "OnePlus",
      slug: "oneplus",
      description: "Điện thoại OnePlus",
      parentSlug: "dien-thoai",
    },
    {
      name: "Nokia",
      slug: "nokia",
      description: "Điện thoại Nokia",
      parentSlug: "dien-thoai",
    },
  ];

  for (const subCategory of phoneSubCategories) {
    const existing = await prisma.category.findUnique({
      where: { slug: subCategory.slug },
    });

    if (!existing) {
      const parentId = createdCategories[subCategory.parentSlug];
      if (parentId) {
        await prisma.category.create({
          data: {
            name: subCategory.name,
            slug: subCategory.slug,
            description: subCategory.description,
            parentId: parentId,
          },
        });
        console.log(`✅ Đã tạo sub-category: ${subCategory.name}`);
      }
    } else {
      console.log(`⏭️  Sub-category đã tồn tại: ${subCategory.name}`);
    }
  }

  // Tạo Brands
  const brands = [
    {
      name: "Apple",
      slug: "apple",
      logoUrl: "https://cdn.tgdd.vn/brand/1/logo-apple-220x48.png",
    },
    {
      name: "Samsung",
      slug: "samsung",
      logoUrl: "https://cdn.tgdd.vn/brand/1/logo-samsung-220x48.png",
    },
    {
      name: "Xiaomi",
      slug: "xiaomi",
      logoUrl: "https://cdn.tgdd.vn/brand/1/logo-xiaomi-220x48.png",
    },
    {
      name: "OPPO",
      slug: "oppo",
      logoUrl: "https://cdn.tgdd.vn/brand/1/logo-oppo-220x48.png",
    },
    {
      name: "Vivo",
      slug: "vivo",
      logoUrl: "https://cdn.tgdd.vn/brand/1/logo-vivo-220x48.png",
    },
    {
      name: "Realme",
      slug: "realme",
      logoUrl: "https://cdn.tgdd.vn/brand/1/logo-realme-220x48.png",
    },
    {
      name: "OnePlus",
      slug: "oneplus",
      logoUrl: "https://cdn.tgdd.vn/brand/1/logo-oneplus-220x48.png",
    },
    {
      name: "Nokia",
      slug: "nokia",
      logoUrl: "https://cdn.tgdd.vn/brand/1/logo-nokia-220x48.png",
    },
    {
      name: "ASUS",
      slug: "asus",
      logoUrl: "https://cdn.tgdd.vn/brand/1/logo-asus-220x48.png",
    },
    {
      name: "HP",
      slug: "hp",
      logoUrl: "https://cdn.tgdd.vn/brand/1/logo-hp-220x48.png",
    },
    {
      name: "Dell",
      slug: "dell",
      logoUrl: "https://cdn.tgdd.vn/brand/1/logo-dell-220x48.png",
    },
    {
      name: "Lenovo",
      slug: "lenovo",
      logoUrl: "https://cdn.tgdd.vn/brand/1/logo-lenovo-220x48.png",
    },
    {
      name: "Acer",
      slug: "acer",
      logoUrl: "https://cdn.tgdd.vn/brand/1/logo-acer-220x48.png",
    },
    {
      name: "MSI",
      slug: "msi",
      logoUrl: "https://cdn.tgdd.vn/brand/1/logo-msi-220x48.png",
    },
  ];

  for (const brand of brands) {
    const existing = await prisma.brand.findUnique({
      where: { slug: brand.slug },
    });

    if (!existing) {
      await prisma.brand.create({
        data: brand,
      });
      console.log(`✅ Đã tạo brand: ${brand.name}`);
    } else {
      console.log(`⏭️  Brand đã tồn tại: ${brand.name}`);
    }
  }

  console.log("✨ Hoàn thành seed categories và brands!");
}

main()
  .catch((e) => {
    console.error("❌ Lỗi khi seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


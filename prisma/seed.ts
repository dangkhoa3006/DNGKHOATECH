import "dotenv/config";
import { prisma } from "../lib/prisma";

async function main() {
  console.log("⏳ Seeding database...");

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.banner.deleteMany();
  await prisma.article.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();

  const categoriesData = [
    {
      name: "Điện thoại",
      slug: "dien-thoai",
      description: "Điện thoại di động, smartphone chính hãng",
    },
    {
      name: "Laptop",
      slug: "laptop",
      description: "Laptop, máy tính xách tay cho học tập và làm việc",
    },
    {
      name: "Máy tính bảng",
      slug: "may-tinh-bang",
      description: "Tablet, iPad phục vụ giải trí và công việc",
    },
    {
      name: "Phụ kiện",
      slug: "phu-kien",
      description: "Phụ kiện chính hãng cho điện thoại, laptop",
    },
    {
      name: "Đồng hồ",
      slug: "dong-ho",
      description: "Đồng hồ thông minh, đồng hồ thời trang",
    },
  ];

  const brandsData = [
    { name: "Apple", slug: "apple", logoUrl: "https://cdn.tgdd.vn/Brand/1/Apple-220x48.png" },
    { name: "Samsung", slug: "samsung", logoUrl: "https://cdn.tgdd.vn/Brand/1/Samsung-220x48.png" },
    { name: "Xiaomi", slug: "xiaomi", logoUrl: "https://cdn.tgdd.vn/Brand/1/Xiaomi-220x48.png" },
    { name: "Dell", slug: "dell", logoUrl: "https://cdn.tgdd.vn/Brand/1/Dell-220x48.png" },
  ];

  const [categories, brands] = await Promise.all([
    Promise.all(
      categoriesData.map((category) =>
        prisma.category.create({
          data: category,
        })
      )
    ),
    Promise.all(
      brandsData.map((brand) =>
        prisma.brand.create({
          data: brand,
        })
      )
    ),
  ]);

  const categoryMap = new Map(categories.map((category) => [category.slug, category.id] as const));
  const brandMap = new Map(brands.map((brand) => [brand.slug, brand.id] as const));

  const productsData = [
    {
      name: "iPhone 15 Pro Max 256GB",
      slug: "iphone-15-pro-max-256gb",
      shortDesc: "Chip A17 Pro, camera 48MP, thiết kế Titan",
      description:
        "iPhone 15 Pro Max với khung viền Titan bền bỉ, chip A17 Pro mạnh mẽ, camera 48MP sắc nét và cổng USB-C tiện lợi.",
      price: 34990000,
      discountPrice: 32990000,
      stock: 120,
      rating: 4.9,
      sold: 520,
      featured: true,
      specs: {
        screen: 'OLED 6.7" 120Hz',
        chip: "Apple A17 Pro",
        ram: "8 GB",
        storage: "256 GB",
        battery: "4422 mAh",
      },
      thumbnailUrl: "https://cdn.tgdd.vn/Products/Images/42/303829/iphone-15-pro-max-nhat-600x600.jpg",
      categorySlug: "dien-thoai",
      brandSlug: "apple",
      images: [
        {
          url: "https://cdn.tgdd.vn/Products/Images/42/303829/iphone-15-pro-max-den-1.jpg",
          alt: "iPhone 15 Pro Max - Mặt trước",
          isPrimary: true,
        },
        {
          url: "https://cdn.tgdd.vn/Products/Images/42/303829/iphone-15-pro-max-den-2.jpg",
          alt: "iPhone 15 Pro Max - Mặt sau",
        },
      ],
      variants: [
        {
          name: "256GB",
          sku: "IP15PM-256",
          price: 32990000,
          stock: 60,
        },
        {
          name: "512GB",
          sku: "IP15PM-512",
          price: 36990000,
          stock: 40,
          attributes: { color: "Titan Đen" },
        },
      ],
    },
    {
      name: "Samsung Galaxy S24 Ultra 5G",
      slug: "samsung-galaxy-s24-ultra-5g",
      shortDesc: "Snapdragon 8 Gen 3 for Galaxy, S Pen, camera 200MP",
      description:
        "Galaxy S24 Ultra với thiết kế mạnh mẽ, hỗ trợ S Pen, cấu hình Snapdragon 8 Gen 3 tối ưu, camera 200MP dẫn đầu xu hướng AI.",
      price: 29990000,
      discountPrice: 27990000,
      stock: 90,
      rating: 4.8,
      sold: 410,
      featured: true,
      specs: {
        screen: 'Dynamic AMOLED 2X 6.8" 120Hz',
        chip: "Snapdragon 8 Gen 3 for Galaxy",
        ram: "12 GB",
        storage: "256 GB",
        battery: "5000 mAh",
      },
      thumbnailUrl: "https://cdn.tgdd.vn/Products/Images/42/307703/samsung-galaxy-s24-ultra-600x600.jpg",
      categorySlug: "dien-thoai",
      brandSlug: "samsung",
      images: [
        {
          url: "https://cdn.tgdd.vn/Products/Images/42/307703/samsung-galaxy-s24-ultra-1.jpg",
          alt: "Galaxy S24 Ultra mặt trước",
          isPrimary: true,
        },
        {
          url: "https://cdn.tgdd.vn/Products/Images/42/307703/samsung-galaxy-s24-ultra-2.jpg",
          alt: "Galaxy S24 Ultra mặt sau",
        },
      ],
      variants: [
        {
          name: "256GB",
          sku: "S24U-256",
          price: 27990000,
          stock: 45,
        },
        {
          name: "512GB",
          sku: "S24U-512",
          price: 30990000,
          stock: 35,
          attributes: { color: "Titanium Gray" },
        },
      ],
    },
    {
      name: "MacBook Air 15 inch M3 2024",
      slug: "macbook-air-15-inch-m3-2024",
      shortDesc: "Chip Apple M3, 8GB RAM, 256GB SSD",
      description:
        "MacBook Air 15 inch M3 với thiết kế mỏng nhẹ, thời lượng pin 18 giờ, màn hình Liquid Retina sáng đẹp.",
      price: 33990000,
      discountPrice: 31990000,
      stock: 70,
      rating: 4.7,
      sold: 215,
      featured: true,
      specs: {
        screen: 'Liquid Retina 15.3"',
        chip: "Apple M3",
        ram: "8 GB",
        storage: "256 GB",
        battery: "52.6 Wh",
      },
      thumbnailUrl: "https://cdn.tgdd.vn/Products/Images/44/321622/macbook-air-m3-15-inch-600x600.jpg",
      categorySlug: "laptop",
      brandSlug: "apple",
      images: [
        {
          url: "https://cdn.tgdd.vn/Products/Images/44/321622/macbook-air-m3-15-inch-1.jpg",
          alt: "MacBook Air M3 15 inch",
          isPrimary: true,
        },
      ],
      variants: [
        {
          name: "8GB/256GB",
          sku: "MBA15M3-256",
          price: 31990000,
          stock: 40,
        },
        {
          name: "16GB/512GB",
          sku: "MBA15M3-512",
          price: 37990000,
          stock: 20,
        },
      ],
    },
    {
      name: "Xiaomi Pad 6",
      slug: "xiaomi-pad-6",
      shortDesc: 'Snapdragon 870, màn 11" 120Hz',
      description:
        "Xiaomi Pad 6 màn hình 11 inch 120Hz, cấu hình Snapdragon 870, pin 8840 mAh phù hợp giải trí và làm việc.",
      price: 8990000,
      discountPrice: 8490000,
      stock: 150,
      rating: 4.6,
      sold: 180,
      featured: false,
      specs: {
        screen: 'LCD 11" 120Hz',
        chip: "Snapdragon 870",
        ram: "8 GB",
        storage: "256 GB",
        battery: "8840 mAh",
      },
      thumbnailUrl: "https://cdn.tgdd.vn/Products/Images/522/306747/xiaomi-pad-6-600x600.jpg",
      categorySlug: "may-tinh-bang",
      brandSlug: "xiaomi",
      images: [
        {
          url: "https://cdn.tgdd.vn/Products/Images/522/306747/xiaomi-pad-6-1.jpg",
          alt: "Xiaomi Pad 6",
          isPrimary: true,
        },
      ],
      variants: [
        {
          name: "8GB/256GB",
          sku: "XP6-256",
          price: 8490000,
          stock: 80,
        },
      ],
    },
  ];

  for (const product of productsData) {
    const categoryId = categoryMap.get(product.categorySlug);
    const brandId = brandMap.get(product.brandSlug ?? "");

    if (!categoryId) {
      throw new Error(`Category not found for product ${product.slug}`);
    }

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        shortDesc: product.shortDesc,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice ?? undefined,
        stock: product.stock,
        rating: product.rating,
        sold: product.sold,
        featured: product.featured,
        specs: product.specs,
        thumbnailUrl: product.thumbnailUrl,
        categoryId,
        brandId,
      },
      create: {
        name: product.name,
        slug: product.slug,
        shortDesc: product.shortDesc,
        description: product.description,
        price: product.price,
        discountPrice: product.discountPrice ?? undefined,
        stock: product.stock,
        rating: product.rating,
        sold: product.sold,
        featured: product.featured,
        specs: product.specs,
        thumbnailUrl: product.thumbnailUrl,
        category: { connect: { id: categoryId } },
        brand: brandId ? { connect: { id: brandId } } : undefined,
        images: {
          create: product.images,
        },
        variants: {
          create: product.variants,
        },
      },
    });
  }

  const bannersData = [
    {
      title: "Ưu đãi iPhone 15 Pro Max",
      subtitle: "Giảm ngay 2 triệu, giao nhanh trong 2 giờ",
      imageUrl: "https://cdn.tgdd.vn/2024/09/banner/iphone-15-pro-max-1200x300.jpg",
      link: "/cms/products/iphone-15-pro-max-256gb",
      position: "home-hero",
      order: 1,
    },
    {
      title: "S24 Ultra AI",
      subtitle: "Thu cũ đổi mới trợ giá đến 4 triệu",
      imageUrl: "https://cdn.tgdd.vn/2024/03/banner/s24-ultra-1200x300.jpg",
      link: "/cms/products/samsung-galaxy-s24-ultra-5g",
      position: "home-hero",
      order: 2,
    },
    {
      title: "Laptop Workstation",
      subtitle: "Giảm đến 5 triệu cho MacBook, Dell",
      imageUrl: "https://cdn.tgdd.vn/2024/05/banner/laptop-sale-1200x120.jpg",
      link: "/cms/categories/laptop",
      position: "home-hot",
      order: 1,
    },
  ];

  await prisma.banner.createMany({ data: bannersData });

  const articlesData = [
    {
      title: "Top smartphone đáng mua trong tháng",
      slug: "top-smartphone-dang-mua",
      excerpt: "Danh sách điện thoại nổi bật với ưu đãi khủng tại TGDĐ.",
      content:
        "<p>Tổng hợp những mẫu smartphone đáng mua nhất tháng với nhiều ưu đãi hấp dẫn.</p>",
      thumbnail: "https://cdn.tgdd.vn/Files/2024/08/01/top-smartphone-800x450.jpg",
      publishedAt: new Date(),
      category: "news",
    },
    {
      title: "Kinh nghiệm chọn mua laptop cho sinh viên",
      slug: "kinh-nghiem-chon-laptop-sinh-vien",
      excerpt: "Gợi ý laptop phù hợp học tập, giá tốt, pin lâu.",
      content:
        "<p>Lựa chọn laptop sinh viên cần chú ý đến cấu hình, trọng lượng và thời lượng pin.</p>",
      thumbnail: "https://cdn.tgdd.vn/Files/2024/07/20/laptop-sinh-vien-800x450.jpg",
      publishedAt: new Date(),
      category: "tips",
    },
  ];

  await prisma.article.createMany({ data: articlesData });

  console.log("✅ Seed completed");
}

main()
  .catch((error) => {
    console.error("Seed failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


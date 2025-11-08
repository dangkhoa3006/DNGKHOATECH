import { prisma } from "@/lib/prisma";
import { SiteFooterClient } from "./site-footer-client";

export async function SiteFooter() {
  // Fetch menu items from database
  let footerColumn1 = [];
  let footerColumn2 = [];
  let footerColumn3 = [];
  let footerColumn4 = [];
  let footerBottom = [];
  let siteSettings = [];

  try {
    [footerColumn1, footerColumn2, footerColumn3, footerColumn4, footerBottom, siteSettings] =
      await Promise.all([
      prisma.menuItem.findMany({
        where: {
          position: "FOOTER_COLUMN_1",
          isActive: true,
          parentId: null,
        },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        include: {
          children: {
            where: { isActive: true },
            orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          },
        },
      }),
      prisma.menuItem.findMany({
        where: {
          position: "FOOTER_COLUMN_2",
          isActive: true,
          parentId: null,
        },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        include: {
          children: {
            where: { isActive: true },
            orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          },
        },
      }),
      prisma.menuItem.findMany({
        where: {
          position: "FOOTER_COLUMN_3",
          isActive: true,
          parentId: null,
        },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        include: {
          children: {
            where: { isActive: true },
            orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          },
        },
      }),
      prisma.menuItem.findMany({
        where: {
          position: "FOOTER_COLUMN_4",
          isActive: true,
          parentId: null,
        },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        include: {
          children: {
            where: { isActive: true },
            orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          },
        },
      }),
      prisma.menuItem.findMany({
        where: {
          position: "FOOTER_BOTTOM",
          isActive: true,
          parentId: null,
        },
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        include: {
          children: {
            where: { isActive: true },
            orderBy: [{ order: "asc" }, { createdAt: "asc" }],
          },
        },
      }),
      prisma.siteSetting.findMany({
        where: {
          group: { in: ["footer", "general"] },
        },
      }),
    ]);
  } catch (error) {
    console.error("[SiteFooter] Error fetching menu/settings:", error);
    // Fallback to empty arrays if there's an error
  }

  // Parse settings
  const settingsMap: Record<string, any> = {};
  siteSettings.forEach((setting) => {
    let value: any = setting.value;
    if (setting.type === "json") {
      try {
        value = JSON.parse(setting.value);
      } catch {
        value = setting.value;
      }
    } else if (setting.type === "number") {
      value = Number(setting.value);
    } else if (setting.type === "boolean") {
      value = setting.value === "true";
    }
    settingsMap[setting.key] = value;
  });

  return (
    <SiteFooterClient
      footerColumns={{
        column1: footerColumn1,
        column2: footerColumn2,
        column3: footerColumn3,
        column4: footerColumn4,
      }}
      footerBottomMenu={footerBottom}
      siteName={settingsMap.siteName || "TGDD Clone"}
      siteDescription={settingsMap.siteDescription || "Hệ thống bán lẻ thiết bị di động, laptop, phụ kiện, đồng hồ chính hãng. Giao nhanh trong 2 giờ, trải nghiệm tại hơn 3.000 cửa hàng trên toàn quốc."}
      copyrightText={settingsMap.copyrightText}
    />
  );
}


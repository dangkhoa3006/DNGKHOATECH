import { prisma } from "@/lib/prisma";
import { SiteHeaderClient } from "./site-header-client";

export async function SiteHeader() {
  // Fetch menu items from database
  let headerTopMenu = [];
  let headerNavMenu = [];
  let siteSettings = [];

  try {
    [headerTopMenu, headerNavMenu, siteSettings] = await Promise.all([
      prisma.menuItem.findMany({
        where: {
          position: "HEADER_TOP",
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
          position: "HEADER_NAV",
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
          group: { in: ["header", "general"] },
        },
      }),
    ]);
  } catch (error) {
    console.error("[SiteHeader] Error fetching menu/settings:", error);
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

  // Parse hot keywords
  let hotKeywords: string[] = [];
  if (settingsMap.hotKeywords) {
    if (Array.isArray(settingsMap.hotKeywords)) {
      hotKeywords = settingsMap.hotKeywords;
    } else if (typeof settingsMap.hotKeywords === "string") {
      try {
        hotKeywords = JSON.parse(settingsMap.hotKeywords);
      } catch {
        // Nếu không phải JSON, thử split bằng dấu phẩy
        hotKeywords = settingsMap.hotKeywords.split(",").map((k: string) => k.trim()).filter(Boolean);
      }
    }
  }

  return (
    <SiteHeaderClient
      headerTopMenu={headerTopMenu}
      headerNavMenu={headerNavMenu}
      siteName={settingsMap.siteName || "TGDD Clone"}
      topBannerText={settingsMap.topBannerText || "Mua hàng nhanh - Giao tận nơi"}
      phoneNumber={settingsMap.phoneNumber || "1800 1060"}
      storeLink={settingsMap.storeLink || "/he-thong-sieu-thi"}
      storeText={settingsMap.storeText || "Hệ thống 3.000+ cửa hàng"}
      hotKeywords={hotKeywords.length > 0 ? hotKeywords : undefined}
      searchPlaceholder={settingsMap.searchPlaceholder || "Bạn cần tìm gì hôm nay?"}
    />
  );
}


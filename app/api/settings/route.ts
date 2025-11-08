import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const group = searchParams.get("group");
    const key = searchParams.get("key");

    const where: any = {};
    if (group) {
      where.group = group;
    }
    if (key) {
      where.key = key;
    }

    if (key) {
      // Nếu có key, trả về single setting
      const setting = await prisma.siteSetting.findUnique({
        where: { key },
      });
      if (!setting) {
        return NextResponse.json({ data: null });
      }
      // Parse value theo type
      let parsedValue: any = setting.value;
      if (setting.type === "json") {
        try {
          parsedValue = JSON.parse(setting.value);
        } catch {
          parsedValue = setting.value;
        }
      } else if (setting.type === "number") {
        parsedValue = Number(setting.value);
      } else if (setting.type === "boolean") {
        parsedValue = setting.value === "true";
      }
      return NextResponse.json({ data: { key: setting.key, value: parsedValue } });
    }

    // Nếu không có key, trả về tất cả settings
    const settings = await prisma.siteSetting.findMany({
      where,
      orderBy: [{ group: "asc" }, { key: "asc" }],
    });

    // Parse values theo type
    const parsedSettings = settings.map((setting) => {
      let parsedValue: any = setting.value;
      if (setting.type === "json") {
        try {
          parsedValue = JSON.parse(setting.value);
        } catch {
          parsedValue = setting.value;
        }
      } else if (setting.type === "number") {
        parsedValue = Number(setting.value);
      } else if (setting.type === "boolean") {
        parsedValue = setting.value === "true";
      }
      return {
        key: setting.key,
        value: parsedValue,
        type: setting.type,
        group: setting.group,
      };
    });

    return NextResponse.json({ data: parsedSettings });
  } catch (error) {
    console.error("[API] settings GET", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}


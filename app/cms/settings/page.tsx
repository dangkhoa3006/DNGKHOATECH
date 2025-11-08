"use client";

import { useState, useEffect } from "react";
import { Save, Eye } from "lucide-react";
import Link from "next/link";
import { CMSLayout } from "@/components/cms/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { MapPin, Phone, ShoppingCart, User, Menu } from "lucide-react";

interface SiteSetting {
  key: string;
  value: any;
  type: string;
  group: string;
  description?: string | null;
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState<Record<string, SiteSetting>>({});
  const [showHeaderPreview, setShowHeaderPreview] = useState(false);
  const [showFooterPreview, setShowFooterPreview] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/cms/settings");
      const data = await response.json();
      if (data.data) {
        const settingsMap: Record<string, SiteSetting> = {};
        data.data.forEach((setting: any) => {
          let value: any = setting.value;
          // Parse value theo type
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
          settingsMap[setting.key] = {
            key: setting.key,
            value,
            type: setting.type,
            group: setting.group,
            description: setting.description,
          };
        });
        setSettings(settingsMap);
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (group: string) => {
    setIsSaving(true);
    try {
      // Map các settings theo group
      const groupSettingsMap: Record<string, { key: string; value: any; type: string; group: string }> = {
        general: {
          siteName: { key: "siteName", value: getSetting("siteName", ""), type: "string", group: "general" },
          siteDescription: { key: "siteDescription", value: getSetting("siteDescription", ""), type: "string", group: "general" },
        },
        header: {
          topBannerText: { key: "topBannerText", value: getSetting("topBannerText", ""), type: "string", group: "header" },
          phoneNumber: { key: "phoneNumber", value: getSetting("phoneNumber", ""), type: "string", group: "header" },
          storeLink: { key: "storeLink", value: getSetting("storeLink", ""), type: "string", group: "header" },
          storeText: { key: "storeText", value: getSetting("storeText", ""), type: "string", group: "header" },
          siteName: { key: "siteName", value: getSetting("siteName", ""), type: "string", group: "header" },
        },
        footer: {
          siteDescription: { key: "siteDescription", value: getSetting("siteDescription", ""), type: "string", group: "footer" },
          copyrightText: { key: "copyrightText", value: getSetting("copyrightText", ""), type: "string", group: "footer" },
          siteName: { key: "siteName", value: getSetting("siteName", ""), type: "string", group: "footer" },
        },
        seo: {
          metaTitle: { key: "metaTitle", value: getSetting("metaTitle", ""), type: "string", group: "seo" },
          metaDescription: { key: "metaDescription", value: getSetting("metaDescription", ""), type: "string", group: "seo" },
          metaKeywords: { key: "metaKeywords", value: getSetting("metaKeywords", ""), type: "string", group: "seo" },
        },
      };

      const settingsToSave = Object.values(groupSettingsMap[group] || {});
      
      await Promise.all(
        settingsToSave.map((setting) =>
          fetch("/api/cms/settings", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              key: setting.key,
              value: String(setting.value),
              type: setting.type,
              group: setting.group,
            }),
          })
        )
      );
      
      // Reload settings sau khi lưu
      await fetchSettings();
      alert("Đã lưu cài đặt thành công!");
    } catch (error) {
      console.error("Error saving settings:", error);
      alert("Đã xảy ra lỗi khi lưu cài đặt");
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({
      ...prev,
      [key]: {
        ...prev[key],
        value,
      },
    }));
  };

  const getSetting = (key: string, defaultValue: any = ""): any => {
    return settings[key]?.value ?? defaultValue;
  };

  if (isLoading) {
    return (
      <CMSLayout>
        <div className="flex items-center justify-center py-8">
          <p className="text-muted-foreground">Đang tải...</p>
        </div>
      </CMSLayout>
    );
  }

  return (
    <CMSLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cài đặt Website</h1>
          <p className="text-sm text-muted-foreground">Quản lý các cài đặt chung của website</p>
        </div>

        <Tabs defaultValue="general" className="space-y-4">
          <TabsList>
            <TabsTrigger value="general">Chung</TabsTrigger>
            <TabsTrigger value="header">Header</TabsTrigger>
            <TabsTrigger value="footer">Footer</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="general">
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt chung</CardTitle>
                <CardDescription>Các cài đặt chung của website</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">Tên website</Label>
                  <Input
                    id="siteName"
                    value={getSetting("siteName", "TGDD Clone")}
                    onChange={(e) => updateSetting("siteName", e.target.value)}
                    placeholder="TGDD Clone"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Mô tả website</Label>
                  <Textarea
                    id="siteDescription"
                    value={getSetting("siteDescription", "")}
                    onChange={(e) => updateSetting("siteDescription", e.target.value)}
                    placeholder="Mô tả website"
                    rows={3}
                  />
                </div>
                <Button onClick={() => handleSave("general")} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Đang lưu..." : "Lưu cài đặt"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="header">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Cài đặt Header</CardTitle>
                  <CardDescription>Các cài đặt cho phần header</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="topBannerText">Text banner trên cùng</Label>
                    <Input
                      id="topBannerText"
                      value={getSetting("topBannerText", "Mua hàng nhanh - Giao tận nơi")}
                      onChange={(e) => updateSetting("topBannerText", e.target.value)}
                      placeholder="Mua hàng nhanh - Giao tận nơi"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phoneNumber">Số điện thoại</Label>
                    <Input
                      id="phoneNumber"
                      value={getSetting("phoneNumber", "1800 1060")}
                      onChange={(e) => updateSetting("phoneNumber", e.target.value)}
                      placeholder="1800 1060"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storeLink">Link hệ thống cửa hàng</Label>
                    <Input
                      id="storeLink"
                      value={getSetting("storeLink", "/he-thong-sieu-thi")}
                      onChange={(e) => updateSetting("storeLink", e.target.value)}
                      placeholder="/he-thong-sieu-thi"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="storeText">Text hệ thống cửa hàng</Label>
                    <Input
                      id="storeText"
                      value={getSetting("storeText", "Hệ thống 3.000+ cửa hàng")}
                      onChange={(e) => updateSetting("storeText", e.target.value)}
                      placeholder="Hệ thống 3.000+ cửa hàng"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleSave("header")} disabled={isSaving}>
                      <Save className="mr-2 h-4 w-4" />
                      {isSaving ? "Đang lưu..." : "Lưu cài đặt"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowHeaderPreview(!showHeaderPreview)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {showHeaderPreview ? "Ẩn" : "Hiện"} Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {showHeaderPreview && (
                <Card>
                  <CardHeader>
                    <CardTitle>Preview Header</CardTitle>
                    <CardDescription>Xem trước giao diện header</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg overflow-hidden bg-white">
                      {/* Header Top Banner */}
                      <div className="bg-primary px-4 py-2 text-sm text-primary-foreground">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Menu className="h-4 w-4" />
                            <span>{getSetting("topBannerText", "Mua hàng nhanh - Giao tận nơi")}</span>
                          </div>
                          <div className="hidden items-center gap-6 md:flex">
                            <Link href={`tel:${getSetting("phoneNumber", "1800 1060")}`} className="flex items-center gap-2">
                              <Phone className="h-4 w-4" />
                              <span>Gọi mua: {getSetting("phoneNumber", "1800 1060")}</span>
                            </Link>
                            <Link href={getSetting("storeLink", "/he-thong-sieu-thi")} className="flex items-center gap-2">
                              <MapPin className="h-4 w-4" />
                              <span>{getSetting("storeText", "Hệ thống 3.000+ cửa hàng")}</span>
                            </Link>
                          </div>
                        </div>
                      </div>

                      {/* Header Main */}
                      <div className="flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center">
                        <div className="flex items-center gap-4">
                          <Link href="/" className="text-2xl font-black text-primary">
                            {getSetting("siteName", "TGDD Clone")}
                          </Link>
                          <div className="hidden items-center gap-3 text-xs font-medium text-muted-foreground lg:flex">
                            <span className="hover:text-primary">Điện thoại</span>
                            <span className="hover:text-primary">Laptop</span>
                            <span className="hover:text-primary">Tablet</span>
                          </div>
                        </div>
                        <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
                          <div className="relative flex-1">
                            <Input
                              placeholder="Bạn cần tìm gì hôm nay?"
                              className="h-12 rounded-lg border-2 border-primary/40 pr-24 text-sm"
                              readOnly
                            />
                            <Button type="button" className="absolute right-1 top-1 h-10 rounded-md px-5 text-sm" disabled>
                              Tìm kiếm
                            </Button>
                          </div>
                        </div>
                        <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
                          <Link href="/account" className="flex items-center gap-2 hover:text-primary">
                            <User className="h-5 w-5" />
                            <span>Tài khoản</span>
                          </Link>
                          <Link href="/cart" className="flex items-center gap-2 hover:text-primary">
                            <ShoppingCart className="h-5 w-5" />
                            <span>Giỏ hàng</span>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="footer">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Cài đặt Footer</CardTitle>
                  <CardDescription>Các cài đặt cho phần footer</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="footerSiteDescription">Mô tả footer</Label>
                    <Textarea
                      id="footerSiteDescription"
                      value={getSetting("siteDescription", "")}
                      onChange={(e) => updateSetting("siteDescription", e.target.value)}
                      placeholder="Mô tả footer"
                      rows={3}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="copyrightText">Text bản quyền</Label>
                    <Input
                      id="copyrightText"
                      value={getSetting("copyrightText", "")}
                      onChange={(e) => updateSetting("copyrightText", e.target.value)}
                      placeholder="© 2024 TGDD Clone. All rights reserved."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => handleSave("footer")} disabled={isSaving}>
                      <Save className="mr-2 h-4 w-4" />
                      {isSaving ? "Đang lưu..." : "Lưu cài đặt"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowFooterPreview(!showFooterPreview)}
                    >
                      <Eye className="mr-2 h-4 w-4" />
                      {showFooterPreview ? "Ẩn" : "Hiện"} Preview
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {showFooterPreview && (
                <Card>
                  <CardHeader>
                    <CardTitle>Preview Footer</CardTitle>
                    <CardDescription>Xem trước giao diện footer</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-lg overflow-hidden bg-white">
                      {/* Footer Main */}
                      <div className="grid gap-10 px-4 py-12 md:grid-cols-4">
                        <div>
                          <Link href="/" className="text-2xl font-black text-primary">
                            {getSetting("siteName", "TGDD Clone")}
                          </Link>
                          <p className="mt-3 text-sm text-muted-foreground">
                            {getSetting("siteDescription", "Hệ thống bán lẻ thiết bị di động, laptop, phụ kiện, đồng hồ chính hãng. Giao nhanh trong 2 giờ, trải nghiệm tại hơn 3.000 cửa hàng trên toàn quốc.")}
                          </p>
                        </div>
                        <div className="space-y-3 text-sm">
                          <h3 className="font-semibold uppercase text-foreground/80">Hỗ trợ khách hàng</h3>
                          <ul className="space-y-2">
                            <li>
                              <Link href="/ho-tro" className="text-muted-foreground hover:text-primary">
                                Trung tâm trợ giúp
                              </Link>
                            </li>
                            <li>
                              <Link href="/huong-dan-thanh-toan" className="text-muted-foreground hover:text-primary">
                                Thanh toán
                              </Link>
                            </li>
                          </ul>
                        </div>
                        <div className="space-y-3 text-sm">
                          <h3 className="font-semibold uppercase text-foreground/80">Về TGDD Clone</h3>
                          <ul className="space-y-2">
                            <li>
                              <Link href="/gioi-thieu" className="text-muted-foreground hover:text-primary">
                                Giới thiệu
                              </Link>
                            </li>
                            <li>
                              <Link href="/lien-he" className="text-muted-foreground hover:text-primary">
                                Liên hệ
                              </Link>
                            </li>
                          </ul>
                        </div>
                        <div className="space-y-3 text-sm">
                          <h3 className="font-semibold uppercase text-foreground/80">Hỗ trợ online</h3>
                          <ul className="space-y-2">
                            <li>
                              <Link href="tel:18001060" className="text-muted-foreground hover:text-primary">
                                Gọi mua hàng: 1800 1060
                              </Link>
                            </li>
                          </ul>
                        </div>
                      </div>

                      {/* Footer Bottom */}
                      <div className="bg-muted py-4">
                        <div className="flex flex-col items-center justify-between gap-2 px-4 text-xs text-muted-foreground md:flex-row">
                          <span>
                            {getSetting("copyrightText", `© ${new Date().getFullYear()} ${getSetting("siteName", "TGDD Clone")}. Dự án tham khảo giao diện Thế Giới Di Động, phục vụ mục đích học tập.`)}
                          </span>
                          <div className="flex gap-3">
                            <Link href="/chinh-sach-bao-mat" className="hover:text-primary">
                              Chính sách bảo mật
                            </Link>
                            <Link href="/dieu-khoan-su-dung" className="hover:text-primary">
                              Điều khoản sử dụng
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="seo">
            <Card>
              <CardHeader>
                <CardTitle>Cài đặt SEO</CardTitle>
                <CardDescription>Các cài đặt cho SEO</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="metaTitle">Meta Title</Label>
                  <Input
                    id="metaTitle"
                    value={getSetting("metaTitle", "")}
                    onChange={(e) => updateSetting("metaTitle", e.target.value)}
                    placeholder="Meta Title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaDescription">Meta Description</Label>
                  <Textarea
                    id="metaDescription"
                    value={getSetting("metaDescription", "")}
                    onChange={(e) => updateSetting("metaDescription", e.target.value)}
                    placeholder="Meta Description"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="metaKeywords">Meta Keywords</Label>
                  <Input
                    id="metaKeywords"
                    value={getSetting("metaKeywords", "")}
                    onChange={(e) => updateSetting("metaKeywords", e.target.value)}
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
                <Button onClick={() => handleSave("seo")} disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Đang lưu..." : "Lưu cài đặt"}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </CMSLayout>
  );
}

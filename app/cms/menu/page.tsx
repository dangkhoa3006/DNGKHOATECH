"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit, Trash2, ArrowUp, ArrowDown, Save, X } from "lucide-react";
import { CMSLayout } from "@/components/cms/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface MenuItem {
  id: number;
  label: string;
  href: string;
  icon?: string | null;
  order: number;
  parentId?: number | null;
  position: string;
  isActive: boolean;
  target?: string | null;
  children?: MenuItem[];
}

const MENU_POSITIONS = [
  { value: "HEADER_TOP", label: "Header Top" },
  { value: "HEADER_NAV", label: "Header Navigation" },
  { value: "FOOTER_COLUMN_1", label: "Footer Cột 1" },
  { value: "FOOTER_COLUMN_2", label: "Footer Cột 2" },
  { value: "FOOTER_COLUMN_3", label: "Footer Cột 3" },
  { value: "FOOTER_COLUMN_4", label: "Footer Cột 4" },
  { value: "FOOTER_BOTTOM", label: "Footer Bottom" },
];

export default function MenuManagementPage() {
  const router = useRouter();
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    label: "",
    href: "",
    icon: "",
    order: 0,
    parentId: "",
    position: "HEADER_NAV",
    isActive: true,
    target: "_self",
  });

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch("/api/cms/menu");
      const data = await response.json();
      if (data.data) {
        setMenuItems(data.data);
      }
    } catch (error) {
      console.error("Error fetching menu items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setFormData({
      label: item.label,
      href: item.href,
      icon: item.icon || "",
      order: item.order,
      parentId: item.parentId?.toString() || "",
      position: item.position,
      isActive: item.isActive,
      target: item.target || "_self",
    });
    setEditingId(item.id);
  };

  const handleCancel = () => {
    setFormData({
      label: "",
      href: "",
      icon: "",
      order: 0,
      parentId: "",
      position: "HEADER_NAV",
      isActive: true,
      target: "_self",
    });
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        order: Number(formData.order),
        parentId: formData.parentId ? Number(formData.parentId) : null,
      };

      if (editingId) {
        await fetch(`/api/cms/menu/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        await fetch("/api/cms/menu", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      handleCancel();
      fetchMenuItems();
    } catch (error) {
      console.error("Error saving menu item:", error);
      alert("Đã xảy ra lỗi khi lưu menu item");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa menu item này?")) return;

    try {
      await fetch(`/api/cms/menu/${id}`, { method: "DELETE" });
      fetchMenuItems();
    } catch (error) {
      console.error("Error deleting menu item:", error);
      alert("Đã xảy ra lỗi khi xóa menu item");
    }
  };

  const handleMoveOrder = async (id: number, direction: "up" | "down") => {
    const item = menuItems.find((m) => m.id === id);
    if (!item) return;

    const samePositionItems = menuItems.filter((m) => m.position === item.position && m.parentId === item.parentId);
    const currentIndex = samePositionItems.findIndex((m) => m.id === id);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

    if (targetIndex < 0 || targetIndex >= samePositionItems.length) return;

    const targetItem = samePositionItems[targetIndex];
    const newOrder = targetItem.order;
    const targetNewOrder = item.order;

    try {
      await Promise.all([
        fetch(`/api/cms/menu/${id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: newOrder }),
        }),
        fetch(`/api/cms/menu/${targetItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: targetNewOrder }),
        }),
      ]);
      fetchMenuItems();
    } catch (error) {
      console.error("Error moving menu item:", error);
      alert("Đã xảy ra lỗi khi di chuyển menu item");
    }
  };

  const groupedMenuItems = menuItems.reduce((acc, item) => {
    if (!acc[item.position]) {
      acc[item.position] = [];
    }
    acc[item.position].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quản lý Menu</h1>
            <p className="text-sm text-muted-foreground">Quản lý menu items cho header và footer</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{editingId ? "Chỉnh sửa Menu Item" : "Thêm Menu Item mới"}</CardTitle>
            <CardDescription>
              {editingId ? "Cập nhật thông tin menu item" : "Tạo menu item mới cho header hoặc footer"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="label">Nhãn *</Label>
                  <Input
                    id="label"
                    value={formData.label}
                    onChange={(e) => setFormData((prev) => ({ ...prev, label: e.target.value }))}
                    placeholder="Ví dụ: Điện thoại"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="href">URL *</Label>
                  <Input
                    id="href"
                    value={formData.href}
                    onChange={(e) => setFormData((prev) => ({ ...prev, href: e.target.value }))}
                    placeholder="/category/dien-thoai"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="position">Vị trí *</Label>
                  <Select value={formData.position} onValueChange={(value) => setFormData((prev) => ({ ...prev, position: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MENU_POSITIONS.map((pos) => (
                        <SelectItem key={pos.value} value={pos.value}>
                          {pos.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="order">Thứ tự</Label>
                  <Input
                    id="order"
                    type="number"
                    min="0"
                    value={formData.order}
                    onChange={(e) => setFormData((prev) => ({ ...prev, order: Number(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="icon">Icon (tùy chọn)</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData((prev) => ({ ...prev, icon: e.target.value }))}
                    placeholder="Tên icon từ lucide-react"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="target">Target</Label>
                  <Select value={formData.target} onValueChange={(value) => setFormData((prev) => ({ ...prev, target: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="_self">Same Tab</SelectItem>
                      <SelectItem value="_blank">New Tab</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.isActive}
                  onChange={(e) => setFormData((prev) => ({ ...prev, isActive: e.target.checked }))}
                  className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="isActive" className="cursor-pointer">
                  Kích hoạt
                </Label>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  {editingId ? "Cập nhật" : "Thêm mới"}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={handleCancel}>
                    <X className="mr-2 h-4 w-4" />
                    Hủy
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {MENU_POSITIONS.map((position) => {
          const items = groupedMenuItems[position.value] || [];
          if (items.length === 0 && !editingId) return null;

          return (
            <Card key={position.value}>
              <CardHeader>
                <CardTitle>{position.label}</CardTitle>
                <CardDescription>Menu items tại vị trí {position.label}</CardDescription>
              </CardHeader>
              <CardContent>
                {items.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Chưa có menu item nào</p>
                ) : (
                  <div className="space-y-2">
                    {items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-lg border bg-muted/40 p-3"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{item.label}</span>
                            {!item.isActive && (
                              <span className="rounded-full bg-muted px-2 py-1 text-xs text-muted-foreground">
                                Ẩn
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{item.href}</p>
                          {item.children && item.children.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {item.children.length} submenu(s)
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => handleMoveOrder(item.id, "up")}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => handleMoveOrder(item.id, "down")}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => handleEdit(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => handleDelete(item.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </CMSLayout>
  );
}


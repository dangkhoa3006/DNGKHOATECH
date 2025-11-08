"use client";

import { useState } from "react";
import { Plus, X, Edit, Palette, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProductVariant {
  id?: number;
  name: string;
  sku?: string | null;
  price?: number | null;
  stock: number;
  attributes?: Record<string, any> | null;
}

interface ProductVariantManagerProps {
  variants: ProductVariant[];
  onChange: (variants: ProductVariant[]) => void;
}

// Danh sách màu sắc phổ biến
const COMMON_COLORS = [
  "Đỏ", "Xanh dương", "Xanh lá", "Vàng", "Cam", "Tím", "Hồng",
  "Đen", "Trắng", "Xám", "Bạc", "Vàng đồng", "Xanh navy", "Nâu",
  "Be", "Kem", "Hồng pastel", "Xanh mint", "Vàng gold", "Bạc silver"
];

// Danh sách cấu hình phổ biến
const COMMON_CONFIGS = {
  "RAM": ["4GB", "6GB", "8GB", "12GB", "16GB", "32GB"],
  "ROM": ["64GB", "128GB", "256GB", "512GB", "1TB", "2TB"],
  "Kích thước": ["S", "M", "L", "XL", "XXL"],
  "Màn hình": ["13 inch", "14 inch", "15 inch", "16 inch", "17 inch"],
  "CPU": ["Intel i3", "Intel i5", "Intel i7", "Intel i9", "AMD Ryzen 5", "AMD Ryzen 7"],
};

export function ProductVariantManager({ variants, onChange }: ProductVariantManagerProps) {
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedConfigs, setSelectedConfigs] = useState<Record<string, string[]>>({});
  const [formData, setFormData] = useState<{
    name: string;
    sku: string;
    price: string;
    stock: number;
    attributes: { color?: string; [key: string]: any };
  }>({
    name: "",
    sku: "",
    price: "",
    stock: 0,
    attributes: {},
  });

  // Tạo variants từ màu sắc và cấu hình
  const handleQuickAdd = () => {
    const newVariants: ProductVariant[] = [];

    // Nếu không chọn gì, chỉ tạo variant mặc định
    if (selectedColors.length === 0 && Object.keys(selectedConfigs).every(k => selectedConfigs[k].length === 0)) {
      if (formData.name.trim()) {
        newVariants.push({
          name: formData.name,
          sku: formData.sku || null,
          price: formData.price ? Number(formData.price) : null,
          stock: formData.stock,
          attributes: formData.attributes,
        });
      }
    } else {
      // Tạo variants từ màu sắc
      const colors = selectedColors.length > 0 ? selectedColors : [""];
      
      // Tạo variants từ cấu hình
      const configKeys = Object.keys(selectedConfigs).filter(k => selectedConfigs[k].length > 0);
      const configValues = configKeys.map(k => selectedConfigs[k]);
      
      // Tạo tất cả các kết hợp
      const combinations: Array<{ color?: string; configs: Record<string, string> }> = [];
      
      for (const color of colors) {
        if (configKeys.length === 0) {
          // Chỉ có màu sắc
          combinations.push({ color: color || undefined, configs: {} });
        } else {
          // Có cấu hình, tạo tất cả kết hợp
          const generateCombinations = (keys: string[], values: string[][], index: number, current: Record<string, string>) => {
            if (index === keys.length) {
              combinations.push({ color: color || undefined, configs: { ...current } });
              return;
            }
            for (const value of values[index]) {
              current[keys[index]] = value;
              generateCombinations(keys, values, index + 1, current);
            }
          };
          generateCombinations(configKeys, configValues, 0, {});
        }
      }

      // Tạo variants từ các kết hợp
      for (const combo of combinations) {
        const variantName = [
          combo.color,
          ...Object.values(combo.configs)
        ].filter(Boolean).join(" - ");

        const attributes: Record<string, any> = { ...combo.configs };
        if (combo.color) {
          attributes.color = combo.color;
        }

        newVariants.push({
          name: variantName || formData.name || "Variant",
          sku: formData.sku ? `${formData.sku}-${newVariants.length + 1}` : null,
          price: formData.price ? Number(formData.price) : null,
          stock: formData.stock,
          attributes,
        });
      }
    }

    if (newVariants.length > 0) {
      onChange([...variants, ...newVariants]);
      // Reset
      setSelectedColors([]);
      setSelectedConfigs({});
      setFormData({
        name: "",
        sku: "",
        price: "",
        stock: 0,
        attributes: {},
      });
      setShowQuickAdd(false);
    }
  };

  const handleAdd = () => {
    if (!formData.name.trim()) {
      alert("Vui lòng nhập tên variant");
      return;
    }

    const newVariant: ProductVariant = {
      name: formData.name,
      sku: formData.sku || null,
      price: formData.price ? Number(formData.price) : null,
      stock: formData.stock,
      attributes: Object.keys(formData.attributes).length > 0 ? formData.attributes : null,
    };

    if (editingIndex !== null) {
      // Edit existing variant
      const newVariants = [...variants];
      newVariants[editingIndex] = newVariant;
      onChange(newVariants);
      setEditingIndex(null);
    } else {
      // Add new variant
      onChange([...variants, newVariant]);
    }

    // Reset form
    setFormData({
      name: "",
      sku: "",
      price: "",
      stock: 0,
      attributes: {},
    });
  };

  const handleEdit = (index: number) => {
    const variant = variants[index];
    const attrs = (variant.attributes as any) || {};
    setFormData({
      name: variant.name,
      sku: variant.sku || "",
      price: variant.price?.toString() || "",
      stock: variant.stock || 0,
      attributes: attrs,
    });
    setEditingIndex(index);
    setShowQuickAdd(false);
  };

  const handleRemove = (index: number) => {
    if (confirm("Bạn có chắc chắn muốn xóa variant này?")) {
      const newVariants = variants.filter((_, i) => i !== index);
      onChange(newVariants);
    }
  };

  const handleCancel = () => {
    setEditingIndex(null);
    setShowQuickAdd(false);
    setFormData({
      name: "",
      sku: "",
      price: "",
      stock: 0,
      attributes: {},
    });
    setSelectedColors([]);
    setSelectedConfigs({});
  };

  const toggleColor = (color: string) => {
    setSelectedColors((prev) =>
      prev.includes(color) ? prev.filter((c) => c !== color) : [...prev, color]
    );
  };

  const toggleConfig = (key: string, value: string) => {
    setSelectedConfigs((prev) => {
      const current = prev[key] || [];
      const updated = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      return { ...prev, [key]: updated };
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Quản lý Variants (Màu sắc, Cấu hình)</Label>
        <div className="flex gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setShowQuickAdd(true);
              setEditingIndex(null);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm nhanh
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => {
              setShowQuickAdd(false);
              setEditingIndex(null);
              setFormData({
                name: "",
                sku: "",
                price: "",
                stock: 0,
                attributes: {},
              });
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Thêm thủ công
          </Button>
        </div>
      </div>

      {/* Form thêm nhanh (từ màu sắc và cấu hình) */}
      {showQuickAdd && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Thêm nhanh từ màu sắc và cấu hình
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Chọn màu sắc</Label>
              <div className="flex flex-wrap gap-2">
                {COMMON_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => toggleColor(color)}
                    className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                      selectedColors.includes(color)
                        ? "bg-primary text-primary-foreground border-primary"
                        : "bg-background border-input hover:bg-accent"
                    }`}
                  >
                    {color}
                  </button>
                ))}
              </div>
              {selectedColors.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  Đã chọn: {selectedColors.join(", ")}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Label>Chọn cấu hình</Label>
              {Object.entries(COMMON_CONFIGS).map(([key, values]) => (
                <div key={key} className="space-y-2">
                  <Label className="text-sm font-medium">{key}</Label>
                  <div className="flex flex-wrap gap-2">
                    {values.map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => toggleConfig(key, value)}
                        className={`px-3 py-1.5 rounded-md text-sm border transition-colors ${
                          selectedConfigs[key]?.includes(value)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-background border-input hover:bg-accent"
                        }`}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="quick-sku">SKU prefix (tùy chọn)</Label>
                <Input
                  id="quick-sku"
                  value={formData.sku}
                  onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
                  placeholder="Ví dụ: IPHONE15"
                />
                <p className="text-xs text-muted-foreground">SKU sẽ tự động thêm số thứ tự</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quick-price">Giá mặc định (VND)</Label>
                <Input
                  id="quick-price"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quick-stock">Tồn kho mặc định</Label>
              <Input
                id="quick-stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) => setFormData((prev) => ({ ...prev, stock: Number(e.target.value) }))}
                placeholder="0"
              />
            </div>

            <div className="flex gap-2">
              <Button type="button" onClick={handleQuickAdd} className="flex-1">
                Tạo {selectedColors.length > 0 || Object.keys(selectedConfigs).some(k => selectedConfigs[k].length > 0)
                  ? `${selectedColors.length > 0 ? selectedColors.length : 1} variant(s)`
                  : "variant"}
              </Button>
              <Button type="button" variant="outline" onClick={handleCancel}>
                Hủy
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form thêm/sửa variant thủ công */}
      {!showQuickAdd && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">
              {editingIndex !== null ? "Chỉnh sửa variant" : "Thêm variant thủ công"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="variant-name">Tên variant *</Label>
                <Input
                  id="variant-name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Ví dụ: Đỏ - 128GB"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="variant-sku">SKU</Label>
                <Input
                  id="variant-sku"
                  value={formData.sku}
                  onChange={(e) => setFormData((prev) => ({ ...prev, sku: e.target.value }))}
                  placeholder="Mã SKU (tùy chọn)"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="variant-price">Giá (VND)</Label>
                <Input
                  id="variant-price"
                  type="number"
                  min="0"
                  step="1000"
                  value={formData.price}
                  onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                  placeholder="0"
                />
                <p className="text-xs text-muted-foreground">Để trống nếu dùng giá sản phẩm</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="variant-stock">Tồn kho</Label>
                <Input
                  id="variant-stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData((prev) => ({ ...prev, stock: Number(e.target.value) }))}
                  placeholder="0"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Màu sắc
              </Label>
              <Input
                value={formData.attributes?.color || ""}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    attributes: { ...prev.attributes, color: e.target.value },
                  }))
                }
                placeholder="Ví dụ: Đỏ, Xanh, Vàng"
              />
            </div>

            <div className="space-y-2">
              <Label>Thuộc tính khác (JSON)</Label>
              <textarea
                value={JSON.stringify(formData.attributes || {}, null, 2)}
                onChange={(e) => {
                  try {
                    const parsed = JSON.parse(e.target.value);
                    setFormData((prev) => ({ ...prev, attributes: parsed }));
                  } catch {
                    // Invalid JSON, ignore
                  }
                }}
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm font-mono text-xs"
                placeholder='{"size": "128GB", "ram": "8GB"}'
              />
              <p className="text-xs text-muted-foreground">
                Nhập JSON để thêm các thuộc tính tùy chỉnh
              </p>
            </div>

            <div className="flex gap-2">
              <Button type="button" onClick={handleAdd} className="flex-1">
                {editingIndex !== null ? "Cập nhật" : "Thêm"}
              </Button>
              {editingIndex !== null && (
                <Button type="button" variant="outline" onClick={handleCancel}>
                  Hủy
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Danh sách variants */}
      {variants.length > 0 && (
        <div className="space-y-2">
          <Label>Danh sách variants ({variants.length})</Label>
          <div className="space-y-2">
            {variants.map((variant, index) => (
              <Card key={index}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium">{variant.name}</p>
                      <div className="mt-1 flex flex-wrap gap-2 text-sm text-muted-foreground">
                        {variant.sku && <span>SKU: {variant.sku}</span>}
                        {variant.price && (
                          <span>Giá: {variant.price.toLocaleString("vi-VN")} VND</span>
                        )}
                        <span>Tồn kho: {variant.stock}</span>
                        {variant.attributes && (
                          <>
                            {(variant.attributes as any).color && (
                              <span className="flex items-center gap-1">
                                <Palette className="h-3 w-3" />
                                Màu: {(variant.attributes as any).color}
                              </span>
                            )}
                            {Object.entries(variant.attributes as any)
                              .filter(([k]) => k !== "color")
                              .map(([key, value]) => (
                                <span key={key}>
                                  {key}: {String(value)}
                                </span>
                              ))}
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => handleEdit(index)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemove(index)}
                        className="text-destructive hover:text-destructive"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

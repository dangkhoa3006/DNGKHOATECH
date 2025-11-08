"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";
import { CMSLayout } from "@/components/cms/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductImageManager } from "@/components/cms/product-image-manager";
import { ProductVariantManager } from "@/components/cms/product-variant-manager";

interface Category {
  id: number;
  name: string;
}

interface Brand {
  id: number;
  name: string;
}

interface ProductImage {
  id?: number;
  url: string;
  alt?: string | null;
  isPrimary?: boolean;
}

interface ProductVariant {
  id?: number;
  name: string;
  sku?: string | null;
  price?: number | null;
  stock: number;
  attributes?: Record<string, any> | null;
}

export default function NewProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    shortDesc: "",
    description: "",
    price: "",
    discountPrice: "",
    stock: "0",
    featured: false,
    categoryId: "",
    brandId: "",
    thumbnailUrl: "",
  });

  useEffect(() => {
    // Fetch categories and brands
    Promise.all([
      fetch("/api/cms/categories").then((r) => r.json()),
      fetch("/api/cms/brands").then((r) => r.json()),
    ]).then(([categoriesData, brandsData]) => {
      if (categoriesData.data) setCategories(categoriesData.data);
      if (brandsData.data) setBrands(brandsData.data);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Create product
      const response = await fetch("/api/cms/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: Number(formData.price),
          discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
          stock: Number(formData.stock),
          categoryId: Number(formData.categoryId),
          brandId: formData.brandId ? Number(formData.brandId) : null,
          thumbnailUrl: images[0]?.url || formData.thumbnailUrl || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Không thể tạo sản phẩm");
        setIsLoading(false);
        return;
      }

      const productId = data.data.id;

      // Upload images
      if (images.length > 0) {
        await Promise.all(
          images.map((image, index) =>
            fetch(`/api/cms/products/${productId}/images`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                url: image.url,
                alt: image.alt || null,
                isPrimary: index === 0 || image.isPrimary,
              }),
            })
          )
        );
      }

      // Create variants
      if (variants.length > 0) {
        await Promise.all(
          variants.map((variant) =>
            fetch(`/api/cms/products/${productId}/variants`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: variant.name,
                sku: variant.sku || null,
                price: variant.price || null,
                stock: variant.stock,
                attributes: variant.attributes || null,
              }),
            })
          )
        );
      }

      router.push("/cms/products");
    } catch (error) {
      console.error("Error creating product:", error);
      alert("Đã xảy ra lỗi khi tạo sản phẩm");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-generate slug from name
  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: prev.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    }));
  };

  return (
    <CMSLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Thêm sản phẩm mới</h1>
            <p className="text-sm text-muted-foreground">Tạo sản phẩm mới trong hệ thống</p>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin cơ bản</CardTitle>
                  <CardDescription>Thông tin chính của sản phẩm</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Tên sản phẩm *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Ví dụ: iPhone 15 Pro Max"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                      placeholder="iphone-15-pro-max"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shortDesc">Mô tả ngắn</Label>
                    <Input
                      id="shortDesc"
                      value={formData.shortDesc}
                      onChange={(e) => setFormData((prev) => ({ ...prev, shortDesc: e.target.value }))}
                      placeholder="Mô tả ngắn về sản phẩm"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Mô tả chi tiết</Label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      placeholder="Mô tả chi tiết về sản phẩm"
                      className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Giá và tồn kho</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="price">Giá *</Label>
                      <Input
                        id="price"
                        type="number"
                        min="0"
                        step="1000"
                        value={formData.price}
                        onChange={(e) => setFormData((prev) => ({ ...prev, price: e.target.value }))}
                        placeholder="0"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="discountPrice">Giá khuyến mãi</Label>
                      <Input
                        id="discountPrice"
                        type="number"
                        min="0"
                        step="1000"
                        value={formData.discountPrice}
                        onChange={(e) => setFormData((prev) => ({ ...prev, discountPrice: e.target.value }))}
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="stock">Tồn kho</Label>
                    <Input
                      id="stock"
                      type="number"
                      min="0"
                      value={formData.stock}
                      onChange={(e) => setFormData((prev) => ({ ...prev, stock: e.target.value }))}
                      placeholder="0"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hình ảnh sản phẩm</CardTitle>
                  <CardDescription>Upload hoặc nhập URL hình ảnh</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProductImageManager images={images} onChange={setImages} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Variants (Màu sắc, Kích thước)</CardTitle>
                  <CardDescription>Quản lý các biến thể của sản phẩm</CardDescription>
                </CardHeader>
                <CardContent>
                  <ProductVariantManager variants={variants} onChange={setVariants} />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Phân loại</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="categoryId">Danh mục *</Label>
                    <select
                      id="categoryId"
                      value={formData.categoryId}
                      onChange={(e) => setFormData((prev) => ({ ...prev, categoryId: e.target.value }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      required
                    >
                      <option value="">Chọn danh mục</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="brandId">Thương hiệu</Label>
                    <select
                      id="brandId"
                      value={formData.brandId}
                      onChange={(e) => setFormData((prev) => ({ ...prev, brandId: e.target.value }))}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Chọn thương hiệu</option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cài đặt</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData((prev) => ({ ...prev, featured: e.target.checked }))}
                      className="h-4 w-4 rounded border-input"
                    />
                    <Label htmlFor="featured" className="cursor-pointer">
                      Sản phẩm nổi bật
                    </Label>
                  </div>
                </CardContent>
              </Card>

              <div className="flex gap-2">
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  <Save className="mr-2 h-4 w-4" />
                  {isLoading ? "Đang lưu..." : "Lưu sản phẩm"}
                </Button>
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Hủy
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </CMSLayout>
  );
}


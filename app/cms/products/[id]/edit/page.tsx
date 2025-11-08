"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
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

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [existingImageIds, setExistingImageIds] = useState<number[]>([]);
  const [existingVariantIds, setExistingVariantIds] = useState<number[]>([]);
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
    // Fetch product data
    Promise.all([
      fetch(`/api/cms/products/${productId}`).then((r) => r.json()),
      fetch(`/api/cms/products/${productId}/images`).then((r) => r.json()),
      fetch(`/api/cms/products/${productId}/variants`).then((r) => r.json()),
      fetch("/api/cms/categories").then((r) => r.json()),
      fetch("/api/cms/brands").then((r) => r.json()),
    ]).then(([productData, imagesData, variantsData, categoriesData, brandsData]) => {
      if (productData.data) {
        const product = productData.data;
        setFormData({
          name: product.name || "",
          slug: product.slug || "",
          shortDesc: product.shortDesc || "",
          description: product.description || "",
          price: product.price?.toString() || "",
          discountPrice: product.discountPrice?.toString() || "",
          stock: product.stock?.toString() || "0",
          featured: product.featured || false,
          categoryId: product.categoryId?.toString() || "",
          brandId: product.brandId?.toString() || "",
          thumbnailUrl: product.thumbnailUrl || "",
        });
      }
      if (imagesData.data) {
        setImages(imagesData.data);
        setExistingImageIds(imagesData.data.map((img: ProductImage) => img.id).filter(Boolean));
      }
      if (variantsData.data) {
        setVariants(variantsData.data);
        setExistingVariantIds(variantsData.data.map((v: ProductVariant) => v.id).filter(Boolean));
      }
      if (categoriesData.data) setCategories(categoriesData.data);
      if (brandsData.data) setBrands(brandsData.data);
      setIsLoading(false);
    });
  }, [productId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      // Update product
      const response = await fetch(`/api/cms/products/${productId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          price: formData.price ? Number(formData.price) : undefined,
          discountPrice: formData.discountPrice ? Number(formData.discountPrice) : null,
          stock: formData.stock ? Number(formData.stock) : undefined,
          categoryId: formData.categoryId ? Number(formData.categoryId) : undefined,
          brandId: formData.brandId ? Number(formData.brandId) : null,
          thumbnailUrl: images[0]?.url || formData.thumbnailUrl || null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || "Không thể cập nhật sản phẩm");
        setIsSaving(false);
        return;
      }

      // Update images
      const currentImageIds = images.filter((img) => img.id).map((img) => img.id!);
      const imagesToDelete = existingImageIds.filter((id) => !currentImageIds.includes(id));
      const imagesToAdd = images.filter((img) => !img.id);
      const imagesToUpdate = images.filter((img) => img.id && existingImageIds.includes(img.id));

      // Delete removed images
      await Promise.all(
        imagesToDelete.map((id) =>
          fetch(`/api/cms/products/${productId}/images/${id}`, { method: "DELETE" })
        )
      );

      // Add new images
      await Promise.all(
        imagesToAdd.map((image, index) =>
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

      // Update existing images
      await Promise.all(
        imagesToUpdate.map((image) =>
          fetch(`/api/cms/products/${productId}/images/${image.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              url: image.url,
              alt: image.alt || null,
              isPrimary: image.isPrimary || false,
            }),
          })
        )
      );

      // Update variants
      const currentVariantIds = variants.filter((v) => v.id).map((v) => v.id!);
      const variantsToDelete = existingVariantIds.filter((id) => !currentVariantIds.includes(id));
      const variantsToAdd = variants.filter((v) => !v.id);
      const variantsToUpdate = variants.filter((v) => v.id && existingVariantIds.includes(v.id));

      // Delete removed variants
      await Promise.all(
        variantsToDelete.map((id) =>
          fetch(`/api/cms/products/${productId}/variants/${id}`, { method: "DELETE" })
        )
      );

      // Add new variants
      await Promise.all(
        variantsToAdd.map((variant) =>
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

      // Update existing variants
      await Promise.all(
        variantsToUpdate.map((variant) =>
          fetch(`/api/cms/products/${productId}/variants/${variant.id}`, {
            method: "PATCH",
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

      router.push("/cms/products");
    } catch (error) {
      console.error("Error updating product:", error);
      alert("Đã xảy ra lỗi khi cập nhật sản phẩm");
    } finally {
      setIsSaving(false);
    }
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
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa sản phẩm</h1>
            <p className="text-sm text-muted-foreground">Cập nhật thông tin sản phẩm</p>
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
                      onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={formData.slug}
                      onChange={(e) => setFormData((prev) => ({ ...prev, slug: e.target.value }))}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shortDesc">Mô tả ngắn</Label>
                    <Input
                      id="shortDesc"
                      value={formData.shortDesc}
                      onChange={(e) => setFormData((prev) => ({ ...prev, shortDesc: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Mô tả chi tiết</Label>
                    <textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
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
                  <ProductImageManager images={images} onChange={setImages} productId={Number(productId)} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Variants (Màu sắc, Cấu hình)</CardTitle>
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
                  <div className="space-y-2">
                    <Label htmlFor="thumbnailUrl">URL hình ảnh</Label>
                    <Input
                      id="thumbnailUrl"
                      type="url"
                      value={formData.thumbnailUrl}
                      onChange={(e) => setFormData((prev) => ({ ...prev, thumbnailUrl: e.target.value }))}
                    />
                  </div>

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
                <Button type="submit" className="flex-1" disabled={isSaving}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? "Đang lưu..." : "Lưu thay đổi"}
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


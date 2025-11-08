"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Save, Eye } from "lucide-react";
import { CMSLayout } from "@/components/cms/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProductImageManager } from "@/components/cms/product-image-manager";
import { ProductVariantManager } from "@/components/cms/product-variant-manager";
import { formatCurrency, calcDiscountPercent } from "@/lib/format";
import { ProductVariantSelector } from "@/components/store/product-variant-selector";

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
  const [showPreview, setShowPreview] = useState(false);
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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa sản phẩm</h1>
              <p className="text-sm text-muted-foreground">Cập nhật thông tin sản phẩm</p>
            </div>
          </div>
          <Button type="button" variant="outline" onClick={() => setShowPreview(!showPreview)}>
            <Eye className="mr-2 h-4 w-4" />
            {showPreview ? "Ẩn" : "Hiện"} Preview
          </Button>
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

        {showPreview && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Preview Product Card</CardTitle>
                <CardDescription>Xem trước sản phẩm trên trang danh sách</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="group relative flex h-full flex-col overflow-hidden rounded-xl border bg-background shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="relative flex items-center justify-center bg-white p-6">
                    {images[0]?.url ? (
                      <Image
                        src={images[0].url}
                        alt={formData.name || "Sản phẩm"}
                        width={320}
                        height={320}
                        className="h-40 w-40 object-contain transition group-hover:scale-105"
                        sizes="(max-width: 640px) 160px, 200px"
                      />
                    ) : (
                      <div className="flex h-32 w-32 items-center justify-center rounded bg-muted text-muted-foreground">
                        Không có ảnh
                      </div>
                    )}
                    {formData.discountPrice && formData.price && Number(formData.discountPrice) < Number(formData.price) ? (
                      <span className="absolute right-4 top-4 rounded-full bg-red-500 px-2 py-1 text-xs font-semibold text-white shadow">
                        Giảm {calcDiscountPercent(Number(formData.price), Number(formData.discountPrice))}%
                      </span>
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col gap-2 px-5 pb-4 pt-2">
                    <h3 className="line-clamp-2 text-sm font-semibold text-foreground transition group-hover:text-primary">
                      {formData.name || "Tên sản phẩm"}
                    </h3>
                    <div className="flex items-end gap-2">
                      <span className="text-lg font-bold text-red-500">
                        {formatCurrency(formData.discountPrice ? Number(formData.discountPrice) : formData.price ? Number(formData.price) : 0)}
                      </span>
                      {formData.discountPrice && formData.price && Number(formData.discountPrice) < Number(formData.price) ? (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatCurrency(Number(formData.price))}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1">
                        <span>⭐</span>
                        0.0
                      </span>
                      <span>Đã bán 0</span>
                    </div>
                  </div>
                  <div className="px-5 pb-4">
                    <Button variant="secondary" className="w-full gap-2" disabled>
                      🛒 Thêm vào giỏ
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preview Product Detail</CardTitle>
                <CardDescription>Xem trước trang chi tiết sản phẩm</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  {images[0]?.url ? (
                    <div className="flex justify-center">
                      <Image
                        src={images[0].url}
                        alt={formData.name || "Sản phẩm"}
                        width={600}
                        height={600}
                        className="h-80 w-full max-w-md object-contain"
                        sizes="(min-width: 1024px) 480px, 80vw"
                      />
                    </div>
                  ) : (
                    <div className="flex h-80 items-center justify-center rounded-xl bg-muted text-muted-foreground">
                      Chưa có hình sản phẩm
                    </div>
                  )}
                  {images.length > 1 && (
                    <div className="mt-4 grid grid-cols-4 gap-3">
                      {images.slice(0, 4).map((image, index) => (
                        <Image
                          key={index}
                          src={image.url}
                          alt={formData.name || "Sản phẩm"}
                          width={160}
                          height={160}
                          className="h-20 w-full rounded-lg border object-contain p-2"
                          sizes="120px"
                        />
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm">
                  <h1 className="text-2xl font-bold">{formData.name || "Tên sản phẩm"}</h1>
                  {formData.shortDesc && (
                    <p className="mt-2 text-muted-foreground">{formData.shortDesc}</p>
                  )}
                  <div className="mt-4 flex items-center gap-4">
                    <span className="text-3xl font-bold text-red-500">
                      {formatCurrency(formData.discountPrice ? Number(formData.discountPrice) : formData.price ? Number(formData.price) : 0)}
                    </span>
                    {formData.discountPrice && formData.price && Number(formData.discountPrice) < Number(formData.price) ? (
                      <>
                        <span className="text-xl text-muted-foreground line-through">
                          {formatCurrency(Number(formData.price))}
                        </span>
                        <span className="rounded bg-red-100 px-2 py-1 text-sm font-semibold text-red-600">
                          Giảm {calcDiscountPercent(Number(formData.price), Number(formData.discountPrice))}%
                        </span>
                      </>
                    ) : null}
                  </div>
                  {variants.length > 0 && (
                    <div className="mt-4">
                      <ProductVariantSelector
                        variants={variants.map((v) => ({
                          id: v.id || 0,
                          name: v.name,
                          sku: v.sku || null,
                          price: v.price || null,
                          stock: v.stock,
                          attributes: v.attributes || null,
                        }))}
                        basePrice={formData.price ? Number(formData.price) : 0}
                        baseStock={formData.stock ? Number(formData.stock) : 0}
                      />
                    </div>
                  )}
                  <div className="mt-6">
                    <Button className="w-full" size="lg" disabled>
                      Thêm vào giỏ hàng
                    </Button>
                  </div>
                </div>

                {formData.description && (
                  <div className="rounded-2xl bg-white p-6 shadow-sm">
                    <h2 className="mb-4 text-xl font-bold">Mô tả sản phẩm</h2>
                    <div className="prose prose-sm max-w-none">
                      <p className="whitespace-pre-wrap">{formData.description}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </CMSLayout>
  );
}


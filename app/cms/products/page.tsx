"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Search, Edit, Trash2, Package } from "lucide-react";
import { CMSLayout } from "@/components/cms/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/format";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number | null;
  stock: number;
  featured: boolean;
  category: { id: number; name: string };
  brand?: { id: number; name: string } | null;
  images: Array<{ url: string; isPrimary: boolean }>;
  _count?: { variants: number };
}

export default function ProductsPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(20);

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(search && { search }),
      });
      const response = await fetch(`/api/cms/products?${params}`);
      const data = await response.json();

      if (response.ok) {
        setProducts(data.data);
        setTotal(data.meta.total);
      } else {
        console.error("Failed to fetch products:", data.error);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
      return;
    }

    try {
      const response = await fetch(`/api/cms/products/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchProducts();
      } else {
        const data = await response.json();
        alert(data.error || "Không thể xóa sản phẩm");
      }
    } catch (error) {
      console.error("Error deleting product:", error);
      alert("Đã xảy ra lỗi khi xóa sản phẩm");
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <CMSLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quản lý Sản phẩm</h1>
            <p className="text-sm text-muted-foreground">Quản lý tất cả sản phẩm trong hệ thống</p>
          </div>
          <Button asChild>
            <Link href="/cms/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Thêm sản phẩm
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tìm kiếm</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Tìm kiếm theo tên, slug..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="pl-9"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách Sản phẩm</CardTitle>
            <CardDescription>
              Tổng cộng {total} sản phẩm
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Đang tải...</p>
              </div>
            ) : products.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Package className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Chưa có sản phẩm nào</p>
                <Button asChild className="mt-4">
                  <Link href="/cms/products/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm sản phẩm đầu tiên
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="px-4 py-3 text-left text-sm font-medium">Hình ảnh</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Tên sản phẩm</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Danh mục</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Thương hiệu</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Giá</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Tồn kho</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Nổi bật</th>
                        <th className="px-4 py-3 text-right text-sm font-medium">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map((product) => (
                        <tr key={product.id} className="border-b hover:bg-muted/50">
                          <td className="px-4 py-3">
                            {product.images?.[0] ? (
                              <img
                                src={product.images[0].url}
                                alt={product.name}
                                className="h-12 w-12 rounded object-cover"
                              />
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded bg-muted">
                                <Package className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium">{product.name}</div>
                            <div className="text-xs text-muted-foreground">{product.slug}</div>
                          </td>
                          <td className="px-4 py-3 text-sm">{product.category.name}</td>
                          <td className="px-4 py-3 text-sm">{product.brand?.name || "-"}</td>
                          <td className="px-4 py-3">
                            <div className="font-medium">
                              {formatCurrency(product.discountPrice || product.price)}
                            </div>
                            {product.discountPrice && (
                              <div className="text-xs text-muted-foreground line-through">
                                {formatCurrency(product.price)}
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-sm">{product.stock}</td>
                          <td className="px-4 py-3">
                            {product.featured ? (
                              <span className="rounded-full bg-primary px-2 py-1 text-xs text-primary-foreground">
                                Nổi bật
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push(`/cms/products/${product.id}/edit`)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDelete(product.id)}
                                className="text-destructive hover:text-destructive"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {totalPages > 1 && (
                  <div className="mt-4 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">
                      Trang {page} / {totalPages}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >
                        Trước
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >
                        Sau
                      </Button>
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </CMSLayout>
  );
}


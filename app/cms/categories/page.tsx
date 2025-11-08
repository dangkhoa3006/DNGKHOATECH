"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Tag } from "lucide-react";
import { CMSLayout } from "@/components/cms/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string | null;
  parentId?: number | null;
  _count?: { products: number };
  children?: Category[];
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/cms/categories");
      const data = await response.json();

      if (response.ok) {
        setCategories(data.data);
      } else {
        console.error("Failed to fetch categories:", data.error);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CMSLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quản lý Danh mục</h1>
            <p className="text-sm text-muted-foreground">Quản lý tất cả danh mục sản phẩm</p>
          </div>
          <Button asChild>
            <Link href="/cms/categories/new">
              <Plus className="mr-2 h-4 w-4" />
              Thêm danh mục
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách Danh mục</CardTitle>
            <CardDescription>Tổng cộng {categories.length} danh mục</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Đang tải...</p>
              </div>
            ) : categories.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <Tag className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Chưa có danh mục nào</p>
                <Button asChild className="mt-4">
                  <Link href="/cms/categories/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm danh mục đầu tiên
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {categories
                  .filter((cat) => !cat.parentId) // Chỉ hiển thị categories chính
                  .map((category) => (
                    <div key={category.id} className="space-y-2">
                      <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-4">
                        <div>
                          <p className="font-medium">{category.name}</p>
                          <p className="text-sm text-muted-foreground">{category.slug}</p>
                          {category.description && (
                            <p className="mt-1 text-sm text-muted-foreground">{category.description}</p>
                          )}
                          {category._count && (
                            <p className="mt-1 text-xs text-muted-foreground">
                              {category._count.products} sản phẩm
                              {category.children && category.children.length > 0 && (
                                <span className="ml-2">
                                  • {category.children.length} danh mục con
                                </span>
                              )}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/cms/categories/${category.id}/edit`}>Chỉnh sửa</Link>
                          </Button>
                        </div>
                      </div>
                      {/* Hiển thị sub-categories */}
                      {category.children && category.children.length > 0 && (
                        <div className="ml-6 space-y-2 border-l-2 border-muted pl-4">
                          {category.children.map((child) => (
                            <div
                              key={child.id}
                              className="flex items-center justify-between rounded-lg border bg-background p-3"
                            >
                              <div>
                                <p className="text-sm font-medium">{child.name}</p>
                                <p className="text-xs text-muted-foreground">{child.slug}</p>
                                {child._count && (
                                  <p className="mt-1 text-xs text-muted-foreground">
                                    {child._count.products} sản phẩm
                                  </p>
                                )}
                              </div>
                              <div className="flex gap-2">
                                <Button variant="outline" size="sm" asChild>
                                  <Link href={`/cms/categories/${child.id}/edit`}>Chỉnh sửa</Link>
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </CMSLayout>
  );
}


"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, FileText, Edit, Trash2 } from "lucide-react";
import { CMSLayout } from "@/components/cms/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Article {
  id: number;
  title: string;
  slug: string;
  excerpt?: string | null;
  publishedAt?: string | null;
  category: string;
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/articles");
      const data = await response.json();

      if (response.ok) {
        setArticles(data.data);
      } else {
        console.error("Failed to fetch articles:", data.error);
      }
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CMSLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quản lý Bài viết</h1>
            <p className="text-sm text-muted-foreground">Quản lý tất cả bài viết và tin tức</p>
          </div>
          <Button asChild>
            <Link href="/cms/articles/new">
              <Plus className="mr-2 h-4 w-4" />
              Thêm bài viết
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách Bài viết</CardTitle>
            <CardDescription>Tổng cộng {articles.length} bài viết</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <p className="text-muted-foreground">Đang tải...</p>
              </div>
            ) : articles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8">
                <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
                <p className="text-muted-foreground">Chưa có bài viết nào</p>
                <Button asChild className="mt-4">
                  <Link href="/cms/articles/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Thêm bài viết đầu tiên
                  </Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-2">
                {articles.map((article) => (
                  <div
                    key={article.id}
                    className="flex items-center justify-between rounded-lg border bg-muted/40 p-4"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{article.title}</p>
                      <p className="text-sm text-muted-foreground">{article.slug}</p>
                      {article.excerpt && (
                        <p className="mt-1 text-sm text-muted-foreground">{article.excerpt}</p>
                      )}
                      <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                        <span>Danh mục: {article.category}</span>
                        {article.publishedAt && (
                          <span>
                            Xuất bản: {new Date(article.publishedAt).toLocaleString("vi-VN")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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


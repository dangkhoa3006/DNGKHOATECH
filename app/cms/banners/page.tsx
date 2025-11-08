"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Image } from "lucide-react";
import { CMSLayout } from "@/components/cms/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function BannersPage() {
  return (
    <CMSLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Quản lý Banner</h1>
            <p className="text-sm text-muted-foreground">Quản lý banner quảng cáo</p>
          </div>
          <Button asChild>
            <Link href="/cms/banners/new">
              <Plus className="mr-2 h-4 w-4" />
              Thêm banner
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách Banner</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8">
              <Image className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Chức năng đang được phát triển</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </CMSLayout>
  );
}


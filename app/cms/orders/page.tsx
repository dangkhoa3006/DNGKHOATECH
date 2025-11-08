"use client";

import { ShoppingCart } from "lucide-react";
import { CMSLayout } from "@/components/cms/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function OrdersPage() {
  return (
    <CMSLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Đơn hàng</h1>
          <p className="text-sm text-muted-foreground">Quản lý tất cả đơn hàng</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách Đơn hàng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8">
              <ShoppingCart className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Chức năng đang được phát triển</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </CMSLayout>
  );
}


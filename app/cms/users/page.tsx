"use client";

import { Users } from "lucide-react";
import { CMSLayout } from "@/components/cms/layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function UsersPage() {
  return (
    <CMSLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quản lý Người dùng</h1>
          <p className="text-sm text-muted-foreground">Quản lý tất cả người dùng trong hệ thống</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Danh sách Người dùng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8">
              <Users className="mb-4 h-12 w-12 text-muted-foreground" />
              <p className="text-muted-foreground">Chức năng đang được phát triển</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </CMSLayout>
  );
}


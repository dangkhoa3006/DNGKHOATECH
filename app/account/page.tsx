"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { LogOut, Mail, Phone, User, Calendar, Shield, Activity, ShoppingCart, Camera } from "lucide-react";
import { Input } from "@/components/ui/input";
import { SiteHeader } from "@/components/store/site-header";

interface UserData {
  id: number;
  email: string;
  name: string | null;
  phone: string | null;
  gender: string | null;
  avatarUrl: string | null;
  emailVerifiedAt: string | null;
  role: string;
  isActive: boolean;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  lastLoginUa: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    orders: number;
    otps: number;
    refreshTokens: number;
  };
}

const genderLabels: Record<string, string> = {
  MALE: "Nam",
  FEMALE: "Nữ",
  OTHER: "Khác",
};

const roleLabels: Record<string, string> = {
  USER: "Người dùng",
  ADMIN: "Quản trị viên",
  EDITOR: "Biên tập viên",
};

export default function AccountPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarMode, setAvatarMode] = useState<"url" | "file">("url");
  const [isUpdatingAvatar, setIsUpdatingAvatar] = useState(false);

  const fetchUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error(data?.error || "Không thể tải thông tin tài khoản");
      }

      setUser(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/");
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  const handleStartEditAvatar = () => {
    setAvatarUrl(user?.avatarUrl || "");
    setAvatarFile(null);
    setAvatarPreview(null);
    setAvatarMode("url");
    setIsEditingAvatar(true);
  };

  const handleCancelEditAvatar = () => {
    setIsEditingAvatar(false);
    setAvatarUrl("");
    setAvatarFile(null);
    setAvatarPreview(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Vui lòng chọn file hình ảnh");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError("File không được vượt quá 5MB");
        return;
      }
      setAvatarFile(file);
      setError(null);
      // Tạo preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateAvatar = async () => {
    setIsUpdatingAvatar(true);
    setError(null);

    try {
      let finalAvatarUrl = "";

      if (avatarMode === "file") {
        if (!avatarFile) {
          setError("Vui lòng chọn file hình ảnh");
          setIsUpdatingAvatar(false);
          return;
        }

        // Upload file lên server
        const formData = new FormData();
        formData.append("file", avatarFile);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(uploadData?.error || "Không thể upload file");
        }

        finalAvatarUrl = uploadData.url;
      } else {
        if (!avatarUrl.trim()) {
          setError("Vui lòng nhập URL avatar");
          setIsUpdatingAvatar(false);
          return;
        }
        finalAvatarUrl = avatarUrl.trim();
      }

      // Cập nhật avatar URL
      const response = await fetch("/api/auth/update-avatar", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl: finalAvatarUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Không thể cập nhật avatar");
      }

      // Cập nhật lại thông tin user
      await fetchUser();
      setIsEditingAvatar(false);
      setAvatarUrl("");
      setAvatarFile(null);
      setAvatarPreview(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Đã xảy ra lỗi");
    } finally {
      setIsUpdatingAvatar(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Chưa có";
    return new Date(dateString).toLocaleString("vi-VN");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-lg">Đang tải thông tin...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center text-destructive">{error}</div>
            <Button onClick={fetchUser} className="mt-4 w-full">
              Thử lại
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-muted/50">
      <SiteHeader />
      <div className="container mx-auto py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Tài khoản của tôi</h1>
          <p className="text-muted-foreground">Quản lý thông tin tài khoản và cài đặt</p>
        </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Bên trái: Thông tin cá nhân và tài khoản */}
        <div className="space-y-6 lg:col-span-2">
          {/* Thông tin cá nhân */}
          <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Thông tin cá nhân
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user.avatarUrl || undefined} alt={user.name || user.email} />
                  <AvatarFallback className="text-2xl">
                    {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {!isEditingAvatar && (
                  <Button
                    size="icon"
                    className="absolute bottom-0 right-0 h-8 w-8 rounded-full"
                    onClick={handleStartEditAvatar}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
              </div>

              {isEditingAvatar && (
                <div className="w-full space-y-4">
                  {/* Tabs để chuyển giữa URL và File */}
                  <div className="flex gap-2 border-b">
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarMode("url");
                        setAvatarFile(null);
                        setAvatarPreview(null);
                      }}
                      className={`flex-1 border-b-2 pb-2 text-sm font-medium transition-colors ${
                        avatarMode === "url"
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Nhập URL
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarMode("file");
                        setAvatarUrl("");
                      }}
                      className={`flex-1 border-b-2 pb-2 text-sm font-medium transition-colors ${
                        avatarMode === "file"
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      Upload file
                    </button>
                  </div>

                  {/* Form nhập URL */}
                  {avatarMode === "url" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">URL Avatar</label>
                      <Input
                        type="url"
                        value={avatarUrl}
                        onChange={(e) => setAvatarUrl(e.target.value)}
                        placeholder="https://example.com/avatar.jpg"
                      />
                      {avatarUrl && (
                        <div className="mt-2">
                          <p className="mb-2 text-xs text-muted-foreground">Preview:</p>
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={avatarUrl} alt="Preview" />
                            <AvatarFallback>Preview</AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Form upload file */}
                  {avatarMode === "file" && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Chọn file hình ảnh</label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="cursor-pointer"
                      />
                      {avatarPreview && (
                        <div className="mt-2">
                          <p className="mb-2 text-xs text-muted-foreground">Preview:</p>
                          <Avatar className="h-16 w-16">
                            <AvatarImage src={avatarPreview} alt="Preview" />
                            <AvatarFallback>Preview</AvatarFallback>
                          </Avatar>
                        </div>
                      )}
                      <p className="text-xs text-muted-foreground">
                        Kích thước tối đa: 5MB. Định dạng: JPG, PNG, GIF
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={handleUpdateAvatar}
                      disabled={isUpdatingAvatar || (avatarMode === "url" && !avatarUrl.trim()) || (avatarMode === "file" && !avatarFile)}
                      className="flex-1"
                      size="sm"
                    >
                      {isUpdatingAvatar ? "Đang cập nhật..." : "Lưu"}
                    </Button>
                    <Button
                      onClick={handleCancelEditAvatar}
                      variant="outline"
                      disabled={isUpdatingAvatar}
                      size="sm"
                    >
                      Hủy
                    </Button>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Email</div>
                  <div className="font-medium">{user.email}</div>
                  {user.emailVerifiedAt ? (
                    <Badge variant="default" className="mt-1">
                      Đã xác minh
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="mt-1">
                      Chưa xác minh
                    </Badge>
                  )}
                </div>
              </div>

              {user.name && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">Họ tên</div>
                    <div className="font-medium">{user.name}</div>
                  </div>
                </div>
              )}

              {user.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">Số điện thoại</div>
                    <div className="font-medium">{user.phone}</div>
                  </div>
                </div>
              )}

              {user.gender && (
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="text-sm text-muted-foreground">Giới tính</div>
                    <div className="font-medium">{genderLabels[user.gender] || user.gender}</div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Thông tin tài khoản */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Thông tin tài khoản
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Vai trò</div>
                  <div className="font-medium">
                    <Badge variant={user.role === "ADMIN" ? "default" : "secondary"}>
                      {roleLabels[user.role] || user.role}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Trạng thái</div>
                  <div className="font-medium">
                    <Badge variant={user.isActive ? "default" : "destructive"}>
                      {user.isActive ? "Hoạt động" : "Đã khóa"}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1">
                  <div className="text-sm text-muted-foreground">Ngày tạo</div>
                  <div className="font-medium">{formatDate(user.createdAt)}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        </div>

        {/* Bên phải: Giỏ hàng */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5" />
              Giỏ hàng
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center py-8">
            <ShoppingCart className="mb-4 h-16 w-16 text-muted-foreground" />
            <p className="mb-4 text-center text-sm text-muted-foreground">
              Giỏ hàng của bạn đang trống
            </p>
            <Button asChild className="w-full">
              <Link href="/">Tiếp tục mua sắm</Link>
            </Button>
            <Button asChild variant="outline" className="mt-2 w-full">
              <Link href="/cart">Xem giỏ hàng</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

        {/* Actions */}
        <div className="mt-6 flex gap-4">
          <Button onClick={handleLogout} variant="destructive">
            <LogOut className="mr-2 h-4 w-4" />
            Đăng xuất
          </Button>
          {user.role === "ADMIN" && (
            <Button asChild>
              <Link href="/cms">Vào CMS</Link>
            </Button>
          )}
          <Button asChild variant="outline">
            <Link href="/">Về trang chủ</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}


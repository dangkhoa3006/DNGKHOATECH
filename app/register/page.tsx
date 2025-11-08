"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";

interface RegisterPayload {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone: string;
  gender: string;
}

const defaultPayload: RegisterPayload = {
  email: "",
  password: "",
  confirmPassword: "",
  name: "",
  phone: "",
  gender: "",
};

const genders = [
  { value: "", label: "-- Chọn giới tính --" },
  { value: "MALE", label: "Nam" },
  { value: "FEMALE", label: "Nữ" },
  { value: "OTHER", label: "Khác" },
];

export default function RegisterPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm] = useState<RegisterPayload>(defaultPayload);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const redirectTarget = useMemo(() => params?.get("from") || "/account", [params]);

  const handleChange = (field: keyof RegisterPayload) => (value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu xác nhận không khớp");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          name: form.name,
          phone: form.phone,
          gender: form.gender || null,
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Đăng ký thất bại. Vui lòng thử lại.");
      }

      setSuccessMessage("Đăng ký thành công! Vui lòng kiểm tra email để xác minh tài khoản.");
      setForm(defaultPayload);

      setTimeout(() => {
        router.push(`/verify-email?email=${encodeURIComponent(form.email)}`);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể đăng ký lúc này.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Đăng ký tài khoản</CardTitle>
          <CardDescription>Điền thông tin bên dưới để tạo tài khoản mới.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2 grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(event) => handleChange("email")(event.target.value)}
                  placeholder="name@example.com"
                  required
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(event) => handleChange("password")(event.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={(event) => handleChange("confirmPassword")(event.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showConfirmPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="name">Họ tên</Label>
              <Input
                id="name"
                value={form.name}
                onChange={(event) => handleChange("name")(event.target.value)}
                placeholder="Nguyễn Văn A"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">Số điện thoại</Label>
              <Input
                id="phone"
                value={form.phone}
                onChange={(event) => handleChange("phone")(event.target.value)}
                placeholder="0123456789"
              />
            </div>

            <div className="grid gap-2 sm:col-span-2">
              <Label htmlFor="gender">Giới tính</Label>
              <select
                id="gender"
                className="h-10 rounded-md border border-input bg-transparent px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={form.gender}
                onChange={(event) => handleChange("gender")(event.target.value)}
              >
                {genders.map((item) => (
                  <option key={item.value || "none"} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            {error ? (
              <div className="sm:col-span-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            {successMessage ? (
              <div className="sm:col-span-2 rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-700">
                {successMessage}
              </div>
            ) : null}

            <Button type="submit" className="sm:col-span-2" disabled={isLoading}>
              {isLoading ? "Đang tạo tài khoản..." : "Đăng ký"}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Đã có tài khoản? </span>
            <Link href="/login" className="text-primary hover:underline">
              Đăng nhập ngay
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}



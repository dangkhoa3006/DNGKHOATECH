"use client";

import { FormEvent, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function VerifyEmailPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    const emailParam = params?.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }
  }, [params]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email) {
      setError("Vui lòng nhập email");
      return;
    }

    if (!code || code.length !== 6) {
      setError("Mã OTP phải có 6 chữ số");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Xác minh thất bại. Vui lòng thử lại.");
      }

      setSuccessMessage("Xác minh email thành công! Đang chuyển đến trang mua hàng...");
      setCountdown(3);

      setTimeout(() => {
        router.push("/");
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể xác minh email lúc này.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <CardTitle className="text-2xl font-bold">Xác minh email</CardTitle>
          <CardDescription>
            Nhập mã OTP đã được gửi đến email của bạn
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                disabled={!!params?.get("email")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Mã OTP</Label>
              <Input
                id="code"
                type="text"
                value={code}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 6);
                  setCode(value);
                }}
                placeholder="000000"
                maxLength={6}
                className="text-center text-2xl font-mono tracking-widest"
                required
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Mã OTP có 6 chữ số và có hiệu lực trong 10 phút
              </p>
            </div>

            {error ? (
              <div className="rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            {successMessage ? (
              <div className="rounded-md border border-emerald-300 bg-emerald-50 p-3 text-sm text-emerald-700">
                {successMessage}
                {countdown > 0 && (
                  <p className="mt-2 text-xs">
                    Chuyển đến trang mua hàng sau {countdown} giây...
                  </p>
                )}
              </div>
            ) : null}

            <Button type="submit" className="w-full" disabled={isLoading || countdown > 0}>
              {isLoading ? "Đang xác minh..." : "Xác minh"}
            </Button>
          </form>

          <div className="mt-6 space-y-2 text-center text-sm">
            <p className="text-muted-foreground">
              Chưa nhận được mã?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Đăng ký lại
              </Link>
            </p>
            <p className="text-muted-foreground">
              Đã có tài khoản?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Đăng nhập ngay
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


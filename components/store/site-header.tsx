"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Phone, ShoppingCart, User, Menu } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const HOT_KEYWORDS = [
  "iPhone 15 Pro Max",
  "Galaxy S24 Ultra",
  "MacBook Air M3",
  "Xiaomi Pad 6",
];

export function SiteHeader() {
  const router = useRouter();
  const [keyword, setKeyword] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const value = keyword.trim();
    if (!value) return;
    router.push(`/search?keyword=${encodeURIComponent(value)}`);
  };

  return (
    <header className="border-b bg-white shadow-sm">
      <div className="bg-primary px-4 py-2 text-sm text-primary-foreground">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Menu className="h-4 w-4" />
            <span>Mua hàng nhanh - Giao tận nơi</span>
          </div>
          <div className="hidden items-center gap-6 md:flex">
            <Link href="tel:18001060" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <span>Gọi mua: 1800 1060</span>
            </Link>
            <Link href="/he-thong-sieu-thi" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Hệ thống 3.000+ cửa hàng</span>
            </Link>
          </div>
        </div>
      </div>
      <div className="container mx-auto flex flex-col gap-4 px-4 py-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-2xl font-black text-primary">
            TGDD Clone
          </Link>
          <div className="hidden items-center gap-3 text-xs font-medium text-muted-foreground lg:flex">
            <Link href="/category/dien-thoai" className="hover:text-primary">
              Điện thoại
            </Link>
            <Link href="/category/laptop" className="hover:text-primary">
              Laptop
            </Link>
            <Link href="/category/may-tinh-bang" className="hover:text-primary">
              Tablet
            </Link>
            <Link href="/category/phu-kien" className="hover:text-primary">
              Phụ kiện
            </Link>
            <Link href="/category/dong-ho" className="hover:text-primary">
              Đồng hồ
            </Link>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
          <form onSubmit={handleSubmit} className="relative flex-1">
            <Input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="Bạn cần tìm gì hôm nay?"
              className="h-12 rounded-lg border-2 border-primary/40 pr-24 text-sm focus-visible:border-primary focus-visible:ring-0"
            />
            <Button type="submit" className="absolute right-1 top-1 h-10 rounded-md px-5 text-sm">
              Tìm kiếm
            </Button>
          </form>
          <div className="hidden flex-col text-xs text-muted-foreground md:flex">
            <span className="font-medium">Tìm kiếm nhiều:</span>
            <div className="flex flex-wrap gap-2">
              {HOT_KEYWORDS.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setKeyword(item)}
                  className="rounded-full bg-muted px-3 py-1 text-xs hover:bg-primary/10"
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm font-medium text-muted-foreground">
          <Link href="/account" className="flex items-center gap-2 hover:text-primary">
            <User className="h-5 w-5" />
            <span>Tài khoản</span>
          </Link>
          <Link href="/cart" className="flex items-center gap-2 hover:text-primary">
            <ShoppingCart className="h-5 w-5" />
            <span>Giỏ hàng</span>
          </Link>
        </div>
      </div>
    </header>
  );
}


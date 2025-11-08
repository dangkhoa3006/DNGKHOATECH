"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Image,
  Package,
  Tag,
  ShoppingCart,
  Menu,
} from "lucide-react"

const navItems = [
  {
    title: "Dashboard",
    href: "/cms",
    icon: LayoutDashboard,
  },
  {
    title: "Sản phẩm",
    href: "/cms/products",
    icon: Package,
  },
  {
    title: "Danh mục",
    href: "/cms/categories",
    icon: Tag,
  },
  {
    title: "Bài viết",
    href: "/cms/articles",
    icon: FileText,
  },
  {
    title: "Banner",
    href: "/cms/banners",
    icon: Image,
  },
  {
    title: "Đơn hàng",
    href: "/cms/orders",
    icon: ShoppingCart,
  },
  {
    title: "Người dùng",
    href: "/cms/users",
    icon: Users,
  },
  {
    title: "Menu",
    href: "/cms/menu",
    icon: Menu,
  },
  {
    title: "Cài đặt",
    href: "/cms/settings",
    icon: Settings,
  },
]

export function SidebarNav() {
  const pathname = usePathname()

  return (
    <nav className="space-y-1">
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Icon className="h-5 w-5" />
            {item.title}
          </Link>
        )
      })}
    </nav>
  )
}


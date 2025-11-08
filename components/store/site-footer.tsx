import Link from "next/link";

const FOOTER_LINKS = [
  {
    title: "Hỗ trợ khách hàng",
    items: [
      { label: "Trung tâm trợ giúp", href: "/ho-tro" },
      { label: "Thanh toán", href: "/huong-dan-thanh-toan" },
      { label: "Chính sách bảo hành", href: "/bao-hanh" },
    ],
  },
  {
    title: "Về TGDD Clone",
    items: [
      { label: "Giới thiệu", href: "/gioi-thieu" },
      { label: "Tuyển dụng", href: "/tuyen-dung" },
      { label: "Liên hệ", href: "/lien-he" },
    ],
  },
  {
    title: "Hỗ trợ online",
    items: [
      { label: "Gọi mua hàng: 1800 1060", href: "tel:18001060" },
      { label: "Khiếu nại: 1800 1062", href: "tel:18001062" },
      { label: "Bảo hành: 1800 1064", href: "tel:18001064" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t bg-white">
      <div className="container mx-auto grid gap-10 px-4 py-12 md:grid-cols-4">
        <div>
          <Link href="/" className="text-2xl font-black text-primary">
            TGDD Clone
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">
            Hệ thống bán lẻ thiết bị di động, laptop, phụ kiện, đồng hồ chính hãng. Giao nhanh trong 2 giờ, trải nghiệm tại hơn 3.000 cửa hàng trên toàn quốc.
          </p>
        </div>
        {FOOTER_LINKS.map((section) => (
          <div key={section.title} className="space-y-3 text-sm">
            <h3 className="font-semibold uppercase text-foreground/80">
              {section.title}
            </h3>
            <ul className="space-y-2">
              {section.items.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-muted-foreground hover:text-primary">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="bg-muted py-4">
        <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 text-xs text-muted-foreground md:flex-row">
          <span>
            © {new Date().getFullYear()} TGDD Clone. Dự án tham khảo giao diện Thế Giới Di Động, phục vụ mục đích học tập.
          </span>
          <div className="flex gap-3">
            <Link href="/chinh-sach-bao-mat" className="hover:text-primary">
              Chính sách bảo mật
            </Link>
            <Link href="/dieu-khoan-su-dung" className="hover:text-primary">
              Điều khoản sử dụng
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}


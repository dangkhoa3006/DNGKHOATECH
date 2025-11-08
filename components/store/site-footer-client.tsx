import Link from "next/link";

interface MenuItem {
  id: number;
  label: string;
  href: string;
  icon?: string | null;
  order: number;
  target?: string | null;
  children?: MenuItem[];
}

interface SiteFooterClientProps {
  footerColumns?: {
    column1?: MenuItem[];
    column2?: MenuItem[];
    column3?: MenuItem[];
    column4?: MenuItem[];
  };
  footerBottomMenu?: MenuItem[];
  siteName?: string;
  siteDescription?: string;
  copyrightText?: string;
}

export function SiteFooterClient({
  footerColumns = {},
  footerBottomMenu = [],
  siteName = "TGDD Clone",
  siteDescription = "Hệ thống bán lẻ thiết bị di động, laptop, phụ kiện, đồng hồ chính hãng. Giao nhanh trong 2 giờ, trải nghiệm tại hơn 3.000 cửa hàng trên toàn quốc.",
  copyrightText,
}: SiteFooterClientProps) {
  const currentYear = new Date().getFullYear();
  const defaultCopyright = `© ${currentYear} ${siteName}. Dự án tham khảo giao diện Thế Giới Di Động, phục vụ mục đích học tập.`;

  const columns = [
    footerColumns.column1 || [],
    footerColumns.column2 || [],
    footerColumns.column3 || [],
    footerColumns.column4 || [],
  ].filter((col) => col.length > 0);

  return (
    <footer className="border-t bg-white">
      <div className="container mx-auto grid gap-10 px-4 py-12 md:grid-cols-4">
        <div>
          <Link href="/" className="text-2xl font-black text-primary">
            {siteName}
          </Link>
          <p className="mt-3 text-sm text-muted-foreground">{siteDescription}</p>
        </div>
        {columns.map((column, index) => (
          <div key={index} className="space-y-3 text-sm">
            {column.length > 0 && (
              <>
                <h3 className="font-semibold uppercase text-foreground/80">
                  {column[0].label || `Cột ${index + 1}`}
                </h3>
                <ul className="space-y-2">
                  {column.map((item) => (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        target={item.target || "_self"}
                        className="text-muted-foreground hover:text-primary"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        ))}
      </div>
      <div className="bg-muted py-4">
        <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 text-xs text-muted-foreground md:flex-row">
          <span>{copyrightText || defaultCopyright}</span>
          {footerBottomMenu.length > 0 && (
            <div className="flex gap-3">
              {footerBottomMenu.map((item) => (
                <Link
                  key={item.id}
                  href={item.href}
                  target={item.target || "_self"}
                  className="hover:text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}


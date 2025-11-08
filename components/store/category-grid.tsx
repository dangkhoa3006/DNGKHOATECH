import Link from "next/link";
import { ChevronRight } from "lucide-react";

import type { SerializedCategory } from "@/lib/serializers";

type CategoryGridProps = {
  categories: SerializedCategory[];
};

const COLORS = [
  "bg-amber-100 text-amber-800",
  "bg-blue-100 text-blue-800",
  "bg-emerald-100 text-emerald-800",
  "bg-rose-100 text-rose-800",
  "bg-indigo-100 text-indigo-800",
];

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {categories.map((category, index) => {
        const color = COLORS[index % COLORS.length];
        return (
          <Link
            key={category.id}
            href={`/category/${category.slug}`}
            className="group flex items-center justify-between rounded-xl border bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
          >
            <div>
              <p className={`mb-1 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${color}`}>
                Khám phá
              </p>
              <h3 className="text-base font-semibold text-foreground group-hover:text-primary">
                {category.name}
              </h3>
              {category.description ? (
                <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                  {category.description}
                </p>
              ) : null}
            </div>
            <ChevronRight className="h-5 w-5 text-muted-foreground transition group-hover:translate-x-1 group-hover:text-primary" />
          </Link>
        );
      })}
    </div>
  );
}


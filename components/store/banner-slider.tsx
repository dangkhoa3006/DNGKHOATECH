"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Banner {
  id: number;
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  link?: string | null;
}

interface BannerSliderProps {
  banners: Banner[];
  autoPlay?: boolean;
  autoPlayInterval?: number;
  showDots?: boolean;
  showArrows?: boolean;
}

export function BannerSlider({
  banners,
  autoPlay = true,
  autoPlayInterval = 5000,
  showDots = true,
  showArrows = true,
}: BannerSliderProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (!autoPlay || banners.length <= 1 || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [autoPlay, autoPlayInterval, banners.length, isPaused]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % banners.length);
  };

  if (banners.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        Đang cập nhật banner
      </div>
    );
  }

  const currentBanner = banners[currentIndex];

  return (
    <div
      className="relative h-64 w-full overflow-hidden rounded-2xl bg-black/80"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Banner Image */}
      <Link
        href={currentBanner.link ?? "#"}
        className="relative block h-full w-full"
      >
        <Image
          src={currentBanner.imageUrl}
          alt={currentBanner.title}
          fill
          className="object-cover transition-transform duration-500"
          sizes="(min-width: 1024px) 66vw, 100vw"
          priority={currentIndex === 0}
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-black/60 via-black/10 to-transparent" />
        <div className="absolute bottom-6 left-6 space-y-2 text-white">
          <span className="rounded-full bg-primary/90 px-3 py-1 text-xs font-semibold uppercase">
            Nổi bật
          </span>
          <h2 className="text-2xl font-bold lg:text-3xl">{currentBanner.title}</h2>
          {currentBanner.subtitle ? (
            <p className="max-w-xl text-sm text-white/80">{currentBanner.subtitle}</p>
          ) : null}
        </div>
      </Link>

      {/* Navigation Arrows */}
      {showArrows && banners.length > 1 && (
        <>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70"
            onClick={(e) => {
              e.preventDefault();
              goToPrevious();
            }}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-black/50 text-white hover:bg-black/70"
            onClick={(e) => {
              e.preventDefault();
              goToNext();
            }}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Dots Indicator */}
      {showDots && banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goToSlide(index)}
              className={`h-2 rounded-full transition-all ${
                index === currentIndex
                  ? "w-8 bg-primary"
                  : "w-2 bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}


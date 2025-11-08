"use client";

import { useState } from "react";
import Image from "next/image";
import { Upload, X, Star, StarOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ProductImage {
  id?: number;
  url: string;
  alt?: string | null;
  isPrimary?: boolean;
}

interface ProductImageManagerProps {
  images: ProductImage[];
  onChange: (images: ProductImage[]) => void;
  productId?: number;
}

export function ProductImageManager({ images, onChange, productId }: ProductImageManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Vui lòng chọn file hình ảnh");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File không được vượt quá 10MB");
      return;
    }

    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/product", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        const newImage: ProductImage = {
          url: data.url,
          alt: null,
          isPrimary: images.length === 0,
        };
        onChange([...images, newImage]);
      } else {
        alert(data.error || "Không thể upload file");
      }
    } catch (error) {
      console.error("Error uploading image:", error);
      alert("Đã xảy ra lỗi khi upload file");
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddUrl = () => {
    if (!imageUrl.trim()) return;

    const newImage: ProductImage = {
      url: imageUrl.trim(),
      alt: null,
      isPrimary: images.length === 0,
    };
    onChange([...images, newImage]);
    setImageUrl("");
  };

  const handleRemove = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    // If removed image was primary, set first image as primary
    if (images[index].isPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true;
    }
    onChange(newImages);
  };

  const handleSetPrimary = (index: number) => {
    const newImages = images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    onChange(newImages);
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Hình ảnh sản phẩm</Label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="cursor-pointer"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isUploading ? (
                <span className="text-xs text-muted-foreground">Đang upload...</span>
              ) : (
                <Upload className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Input
            type="url"
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
            placeholder="Hoặc nhập URL hình ảnh"
            className="flex-1"
          />
          <Button type="button" onClick={handleAddUrl} disabled={!imageUrl.trim()}>
            Thêm
          </Button>
        </div>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="relative aspect-square rounded-lg border overflow-hidden bg-muted">
                <Image
                  src={image.url}
                  alt={image.alt || `Hình ảnh ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 25vw, 20vw"
                />
                {image.isPrimary && (
                  <div className="absolute top-2 left-2">
                    <div className="rounded-full bg-primary p-1">
                      <Star className="h-3 w-3 text-primary-foreground fill-primary-foreground" />
                    </div>
                  </div>
                )}
              </div>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  type="button"
                  size="icon"
                  variant="secondary"
                  onClick={() => handleSetPrimary(index)}
                  className="h-8 w-8"
                >
                  {image.isPrimary ? (
                    <StarOff className="h-4 w-4" />
                  ) : (
                    <Star className="h-4 w-4" />
                  )}
                </Button>
                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  onClick={() => handleRemove(index)}
                  className="h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


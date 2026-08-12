"use client";

import { useState } from "react";
import Image from "next/image";
import { Package } from "lucide-react";

interface SafeImageProps {
  src: string;
  alt: string;
  fill?: boolean;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fallbackClassName?: string;
  iconClassName?: string;
}

/**
 * Image that falls back to a placeholder if the remote asset fails to load,
 * so a broken storage URL never blanks the whole listing UI.
 */
export function SafeImage({
  src,
  alt,
  fill = true,
  className,
  sizes,
  priority,
  fallbackClassName = "flex h-full w-full items-center justify-center text-muted-foreground",
  iconClassName = "h-12 w-12 opacity-40",
}: SafeImageProps) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={fallbackClassName}>
        <Package className={iconClassName} aria-hidden="true" />
        <span className="sr-only">{alt}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill={fill}
      className={className}
      sizes={sizes}
      priority={priority}
      onError={() => setFailed(true)}
    />
  );
}

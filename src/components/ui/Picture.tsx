import type { CSSProperties } from "react";
import { image as resolve, type ImageRef } from "@/content/images";

type Props = {
  image: ImageRef;
  /** The `sizes` attribute: how wide the image renders, so the browser picks the right file. */
  sizes: string;
  className?: string;
  style?: CSSProperties;
  priority?: boolean;
  alt?: string;
};

/**
 * Responsive photo from pre-made WebP sizes. No server resizing: uploads are compressed into
 * these widths once, so serving them costs nothing extra. A blurred preview shows while loading.
 */
export function Picture({ image, sizes, className, style, priority, alt }: Props) {
  const img = resolve(image);
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={img.src}
      srcSet={img.srcSet}
      sizes={sizes}
      width={img.width}
      height={img.height}
      alt={alt ?? img.alt}
      className={className}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      style={{ backgroundImage: `url(${img.blur})`, backgroundSize: "cover", backgroundPosition: "center", ...style }}
    />
  );
}

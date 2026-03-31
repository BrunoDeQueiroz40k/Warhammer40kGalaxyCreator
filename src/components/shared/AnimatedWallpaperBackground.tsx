"use client";

import Image from "next/image";

type AnimatedWallpaperBackgroundProps = {
  showBackground: boolean;
  currentBackground: number;
  alt: string;
  panOpacityClassName?: string;
  overlayClassName?: string;
};

export function AnimatedWallpaperBackground({
  showBackground,
  currentBackground,
  alt,
  panOpacityClassName = "opacity-35",
  overlayClassName = "bg-black/65",
}: AnimatedWallpaperBackgroundProps) {
  if (!showBackground) return null;

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <div className={`absolute inset-0 w-full h-full animate-pan-right ${panOpacityClassName}`}>
        <Image
          src={`/assets/imgs/loading/loadingWallpapers/w${currentBackground}.png`}
          alt={alt}
          fill
          className="object-cover object-center"
          priority
        />
      </div>
      <div className={`absolute inset-0 ${overlayClassName}`} />
    </div>
  );
}

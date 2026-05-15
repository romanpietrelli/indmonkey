"use client";

import { useState } from "react";
import Image from "next/image";

const FALLBACK_BLUR =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTExMTExIiAvPjwvc3ZnPg==";

interface GalleryItem {
  type: "image" | "video";
  src: string | null;
}

export function ProductGallery({ gallery, alt }: { gallery: GalleryItem[]; alt: string }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const activeItem = gallery[activeIndex];

  return (
    <div className="flex flex-col gap-4">
      {/* IMAGEN/VIDEO PRINCIPAL */}
      <div className="relative w-full aspect-[4/5] bg-[#0A0A0A] overflow-hidden rounded-md border border-white/5">
        {activeItem?.type === "video" && activeItem.src ? (
          <video
            src={activeItem.src}
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
          />
        ) : activeItem?.src ? (
          <Image
            key={activeItem.src} // Forzar re-render para animación
            src={activeItem.src}
            alt={alt}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover animate-in fade-in duration-500"
            placeholder="blur"
            blurDataURL={FALLBACK_BLUR}
          />
        ) : (
          <div className="absolute inset-0 bg-[#0A0A0A] flex items-center justify-center">
            <span className="text-zinc-700 font-black uppercase tracking-[0.3em] text-xs select-none">
              IND MONKEY
            </span>
          </div>
        )}
      </div>

      {/* ROW DE THUMBNAILS COMPACTA (Estilo Referencia) */}
      {gallery.length > 1 && (
        <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-2" style={{ scrollbarWidth: "none" }}>
          {gallery.map((item, idx) => (
            <button
              key={idx}
              onClick={() => setActiveIndex(idx)}
              className={`relative w-16 h-20 md:w-20 md:h-24 flex-shrink-0 rounded bg-[#0A0A0A] overflow-hidden transition-all duration-200 border-2 ${
                activeIndex === idx ? "border-white" : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              {item.type === "video" && item.src ? (
                <video
                  src={item.src}
                  className="w-full h-full object-cover"
                  muted
                  playsInline
                />
              ) : item.src ? (
                <Image
                  src={item.src}
                  alt={`${alt} ${idx + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : null}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

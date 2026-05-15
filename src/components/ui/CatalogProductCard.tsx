"use client";

import Link from "next/link";
import Image from "next/image";
import { Producto } from "@/lib/types";

// Fallback SVG ultra-minimalista en base64 (silueta abstracta)
const FALLBACK_BLUR =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTExMTExIiAvPjwvc3ZnPg==";

function ProductImage({ src, secondarySrc, alt }: { src: string | null; secondarySrc?: string | null; alt: string }) {
  if (!src) {
    return (
      <div className="absolute inset-0 bg-neutral-900 flex items-center justify-center">
        <span className="text-zinc-700 font-black uppercase tracking-[0.3em] text-xs select-none">
          IND MONKEY
        </span>
      </div>
    );
  }

  return (
    <>
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        className={`object-cover transition-all duration-700 ease-in-out ${secondarySrc ? 'group-hover:opacity-0' : 'group-hover:scale-105 group-hover:opacity-80'}`}
        placeholder="blur"
        blurDataURL={FALLBACK_BLUR}
        onError={(e) => {
          (e.target as HTMLImageElement).style.display = "none";
        }}
      />
      {secondarySrc && (
        <Image
          src={secondarySrc}
          alt={`${alt} hover`}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover transition-opacity duration-700 ease-in-out opacity-0 group-hover:opacity-100 absolute inset-0"
          placeholder="blur"
          blurDataURL={FALLBACK_BLUR}
        />
      )}
    </>
  );
}

export function CatalogProductCard({ product, isNew }: { product: Producto; isNew?: boolean }) {
  const price = product.variantes?.[0]?.precio_venta || 0;
  const totalStock = product.variantes?.reduce((acc, v) => acc + v.cantidad, 0) || 0;
  const isSoldOut = totalStock <= 0;

  const firstImage = (product.imagenes && product.imagenes.length > 0) ? product.imagenes[0] : product.imagen_url;
  const secondImage = (product.imagenes && product.imagenes.length > 1) ? product.imagenes[1] : null;

  return (
    <Link
      href={`/producto/${product.slug}`}
      className="group flex flex-col gap-4 cursor-pointer"
    >
      <div className="relative w-full aspect-[3/4] overflow-hidden bg-neutral-900 border border-white/5">
        {isSoldOut ? (
          <div className="absolute top-3 right-3 z-10 px-2 py-1 text-[10px] font-bold tracking-widest uppercase bg-zinc-950/80 text-zinc-400 backdrop-blur-sm">
            Soldout
          </div>
        ) : isNew ? (
          <div className="absolute top-3 right-3 z-10 px-2 py-1 text-[10px] font-bold tracking-widest uppercase bg-white text-black backdrop-blur-sm">
            New
          </div>
        ) : null}

        <ProductImage src={firstImage} secondarySrc={secondImage} alt={product.nombre} />
      </div>

      <div className="flex flex-col gap-1 px-1">
        <h3 className="font-bold uppercase tracking-wider text-sm text-zinc-100">
          {product.nombre}
        </h3>
        <p className="text-zinc-400 text-sm">
          ${price.toLocaleString("es-AR")}
        </p>
      </div>
    </Link>
  );
}

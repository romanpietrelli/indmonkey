"use client";

import { useState } from "react";
import { Producto } from "@/lib/types";
import { useCartStore } from "@/store/cart";

export function AddToCartForm({ product }: { product: Producto }) {
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = () => {
    if (!selectedSize) return;

    const variant = product.variantes?.find((v) => v.talle === selectedSize);
    if (!variant || variant.cantidad <= 0) return;

    // A fines de esta prueba, si no hay url de imagen real, pasamos un string vacio o placeholder
    const imageUrl = `/images/products/${product.id}.jpg`;

    addItem({
      id: `${variant.id_variante}-${Date.now()}`,
      variant_id: variant.id_variante,
      name: product.nombre,
      size: variant.talle,
      price: variant.precio_venta,
      image: product.imagen_url || "",
      slug: product.slug,
      quantity: 1,
    });
  };

  return (
    <div className="flex flex-col gap-8 mt-8">
      <div className="flex flex-col gap-3">
        <h3 className="font-bold uppercase tracking-widest text-xs text-zinc-500">
          Talle
        </h3>
        <div className="flex flex-wrap gap-2">
          {product.variantes?.map((variant) => {
            const hasStock = variant.cantidad > 0;
            const isSelected = selectedSize === variant.talle;

            return (
              <button
                key={variant.id_variante}
                disabled={!hasStock}
                onClick={() => setSelectedSize(variant.talle)}
                className={`w-12 h-12 flex items-center justify-center border text-sm font-medium transition-all ${
                  !hasStock
                    ? "border-zinc-800 text-zinc-600 opacity-50 cursor-not-allowed line-through"
                    : isSelected
                    ? "bg-white text-black border-white"
                    : "border-zinc-800 text-zinc-400 hover:border-zinc-500 hover:text-white"
                }`}
              >
                {variant.talle}
              </button>
            );
          })}
        </div>
      </div>

      <button
        disabled={!selectedSize}
        onClick={handleAddToCart}
        className="w-full bg-white text-black py-4 font-black uppercase tracking-widest text-sm transition-all hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Agregar al carrito
      </button>
    </div>
  );
}

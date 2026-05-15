"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

export function FilterDrawer() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const currentSize = searchParams.get("size") || "";
  const currentSort = searchParams.get("sort") || "";

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (params.get(key) === value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 z-40 flex items-center gap-2 bg-white text-black px-6 py-3 font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 transition-colors shadow-2xl"
      >
        <SlidersHorizontal className="w-4 h-4" />
        Filtros
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 cursor-pointer"
            />
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-[#0a0a0a] border-l border-zinc-900 border-opacity-50 z-50 flex flex-col text-white shadow-2xl"
            >
              <div className="flex items-center justify-between p-6 border-b border-zinc-800/50">
                <h2 className="font-bold uppercase tracking-[0.2em] text-sm">Filtros</h2>
                <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-zinc-900 rounded-full transition-colors">
                  <X className="w-5 h-5 text-zinc-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-12">
                {/* Talle */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Talle</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {SIZES.map((size) => (
                      <button
                        key={size}
                        onClick={() => updateFilters("size", size)}
                        className={`aspect-square flex items-center justify-center text-xs font-medium border transition-all ${
                          currentSize === size
                            ? "border-white bg-white text-black"
                            : "border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Orden */}
                <div className="space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500">Ordenar por</h3>
                  <div className="flex flex-col gap-2">
                    {[
                      { value: "recientes", label: "Más recientes" },
                      { value: "precio_asc", label: "Precio: Menor a Mayor" },
                      { value: "precio_desc", label: "Precio: Mayor a Menor" },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => updateFilters("sort", option.value)}
                        className={`text-left text-sm py-2 px-4 border transition-all ${
                          currentSort === option.value
                            ? "border-white bg-white text-black font-medium"
                            : "border-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-white"
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-zinc-800/50">
                <button 
                  onClick={() => setIsOpen(false)}
                  className="w-full bg-white text-black py-4 font-bold uppercase tracking-widest text-xs hover:bg-zinc-200 transition-colors"
                >
                  Aplicar Filtros
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

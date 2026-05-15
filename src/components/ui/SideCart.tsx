"use client";

import { useCartStore } from "@/store/cart";
import { X, Trash2 } from "lucide-react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export function SideCart() {
  const { items, isOpen, setIsOpen, removeItem } = useCartStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const total = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] cursor-pointer"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-neutral-950 border-l border-white/10 z-[101] flex flex-col text-white shadow-2xl"
          >
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="font-black uppercase tracking-widest text-lg">Carrito</h2>
              <button 
                onClick={() => setIsOpen(false)} 
                className="hover:text-zinc-400 transition-colors p-2 -mr-2"
                aria-label="Cerrar carrito"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {items.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-zinc-500 uppercase tracking-widest text-xs font-bold gap-4">
                  Tu carrito está vacío.
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 items-start">
                    <div className="relative w-20 aspect-[3/4] bg-neutral-900 border border-white/5 overflow-hidden flex-shrink-0">
                      {item.image ? (
                         <Image src={item.image} alt={item.name} fill className="object-cover" />
                      ) : (
                         <div className="w-full h-full bg-zinc-900" />
                      )}
                    </div>
                    <div className="flex-1 flex flex-col gap-1">
                      <h3 className="uppercase font-bold text-sm tracking-wider leading-tight text-white">{item.name}</h3>
                      <p className="text-zinc-400 text-xs font-bold tracking-widest uppercase">Talle: {item.size}</p>
                      <p className="text-[#E2E2E2] font-medium tracking-tighter mt-1 text-base">
                        ${item.price.toLocaleString("es-AR")}
                      </p>
                      <div className="mt-1 text-xs text-zinc-500 font-bold">CANTIDAD: {item.quantity}</div>
                    </div>
                    <button 
                      onClick={() => removeItem(item.id)}
                      className="p-2 hover:text-white transition-colors -mr-2 text-zinc-600"
                      aria-label="Eliminar item"
                    >
                      <Trash2 className="w-4 h-4 cursor-pointer" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {items.length > 0 && (
              <div className="p-6 border-t border-white/10 bg-neutral-950 flex flex-col gap-5">
                <div className="flex items-end justify-between uppercase tracking-widest font-bold">
                  <span className="text-xs text-zinc-400">Total Estimado</span>
                  <span className="text-2xl tracking-tighter text-white">${total.toLocaleString("es-AR")}</span>
                </div>
                <button 
                  onClick={() => {
                    setIsOpen(false);
                    window.location.href = "/checkout";
                  }}
                  className="w-full bg-white text-black font-black uppercase tracking-widest py-4 text-sm transition-opacity hover:opacity-90"
                >
                  Iniciar Compra
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

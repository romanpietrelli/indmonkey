"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function Lookbook() {
  return (
    <section className="w-full bg-[#000000] py-16 md:py-32">
      <div className="w-full max-w-[1440px] mx-auto px-4 md:px-12">
        {/* Encabezado Editorial */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-12 gap-6">
          <div>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white leading-none">
              Campaña Invierno '26
            </h2>
            <p className="text-zinc-400 mt-3 text-xs md:text-sm font-medium tracking-[0.2em] uppercase">
              Streetwear Utility & Comfort
            </p>
          </div>
          <Link
            href="/catalogo"
            className="text-white border-b border-white pb-1 text-[10px] md:text-xs font-bold uppercase tracking-widest hover:text-zinc-400 hover:border-zinc-400 transition-colors"
          >
            Ver Colección Completa
          </Link>
        </div>

        {/* Contenedor de la Imagen (Altura natural) con overlay de texto */}
        <div className="relative w-full bg-[#0a0a0a] group overflow-hidden border border-zinc-800">
          <img
            src="/lookbook.jpg"
            alt="Ind Monkey Campaña Invierno 2026"
            className="w-full h-auto block transition-transform duration-[3s] group-hover:scale-105"
          />

          {/* Gradiente sutil para que los textos resalten */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />

          {/* Textos sobre la imagen */}
          <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-16 pointer-events-none z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h3 className="text-4xl md:text-7xl lg:text-8xl font-black uppercase tracking-tighter text-white leading-[0.85] mb-4">
                The Cold<br />Never<br />Looked<br />Better.
              </h3>
              <p className="text-zinc-300 max-w-md text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] leading-relaxed">
                Nuevos calces, texturas pesadas y diseño utilitario. Preparate para el invierno definitivo.
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}

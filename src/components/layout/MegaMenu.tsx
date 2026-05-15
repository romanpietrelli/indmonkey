import React, { useState } from "react";
import Link from "next/link";
import clsx from "clsx";

interface MegaMenuProps {
  isOpen: boolean;
  onItemClick?: () => void;
}

const CATEGORIES = [
  {
    title: "REMERAS & CAMISAS",
    links: [
      { label: "Remeras", href: "/catalogo/remeras" },
      { label: "Camisas", href: "/catalogo/camisas" },
    ]
  },
  {
    title: "PANTALONES & BERMUDAS",
    links: [
      { label: "Jeans", href: "/catalogo/jeans" },
      { label: "Cargos", href: "/catalogo/cargos" },
      { label: "Jorts", href: "/catalogo/jorts" },
      { label: "Bermudas", href: "/catalogo/bermudas" },
    ]
  },
  {
    title: "ABRIGO",
    links: [
      { label: "Buzos", href: "/catalogo/buzos" },
      { label: "Camperas", href: "/catalogo/camperas" },
    ]
  },
  {
    title: "ZAPATILLAS",
    links: [
      { label: "Urbanas", href: "/catalogo/zapatillas-urbanas" },
      { label: "Deportivas", href: "/catalogo/zapatillas-deportivas" },
      { label: "Hype", href: "/catalogo/zapatillas-hype" },
    ]
  },
  {
    title: "ACCESORIOS",
    links: [
      { label: "Gorras", href: "/catalogo/gorras" },
      { label: "Medias", href: "/catalogo/medias" },
      { label: "Cordones", href: "/catalogo/cordones" },
      { label: "Varios", href: "/catalogo/varios" },
    ]
  }
];

export function MegaMenu({ isOpen, onItemClick }: MegaMenuProps) {
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);


  return (
    <div
      className={clsx(
        "absolute top-full left-0 w-full bg-[#050505]/95 backdrop-blur-xl border-b border-zinc-900 transition-all duration-300 ease-in-out origin-top",
        isOpen
          ? "opacity-100 translate-y-0 pointer-events-auto shadow-2xl"
          : "opacity-0 -translate-y-2 pointer-events-none"
      )}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-10 flex gap-12">
        {/* Izquierda: Columnas de Categorías */}
        <div className="flex-1 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 xl:gap-6 pr-4">
          {CATEGORIES.map((cat, index) => (
            <div
              key={cat.title}
              className={clsx(
                "flex flex-col gap-5 transition-all duration-700 ease-out",
                isOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
              )}
              style={{ transitionDelay: isOpen ? `${index * 75 + 150}ms` : '0ms' }}
              onMouseEnter={() => setHoveredCategory(cat.title)}
              onMouseLeave={() => setHoveredCategory(null)}
            >
              <h3 className="text-white text-[11px] font-black uppercase tracking-[0.15em]">
                {cat.title}
              </h3>
              <ul className="flex flex-col gap-3">
                {cat.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      onClick={onItemClick}
                      className="text-[#888] hover:text-white text-sm tracking-wide transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Derecha: Imagen Destacada */}
        <div 
          className={clsx(
            "hidden lg:block w-[25%] max-w-[260px] ml-auto transition-all duration-700 ease-out",
            isOpen ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
          )}
          style={{ transitionDelay: isOpen ? '450ms' : '0ms' }}
        >
          <Link href="/catalogo" className="block relative w-full aspect-[4/5] overflow-hidden rounded-2xl bg-[#0a0a0a] border border-white/5 group shadow-[0_20px_50px_rgba(0,0,0,0.7)]" style={{ transform: 'translateZ(0)' }}>
            <img
              src="/catalogotopbar.jpg"
              alt="Editorial Catalogo"
              className="absolute inset-0 w-full h-full object-cover saturate-[0.85] contrast-[1.05] group-hover:saturate-100 group-hover:scale-110 transition-transform duration-[1.5s] ease-out"
            />
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/80 via-black/10 to-transparent pointer-events-none" />
            <div className="absolute inset-0 rounded-2xl border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
              <span className="text-white text-xs font-bold uppercase tracking-widest drop-shadow-md">
                {hoveredCategory || "Ver Todo"}
              </span>
              <span className="w-6 h-[1px] bg-white opacity-80"></span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

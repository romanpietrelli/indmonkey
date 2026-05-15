import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CATEGORIES = [
  { id: 1, title: 'Nuevos Ingresos', image: '/nuevosingresos.jpg?v=26', link: '/nuevos-ingresos' },
  { id: 2, title: 'Pantalones', image: '/pantalones.jpg?v=26', link: '/catalogo/pantalones' },
  { id: 3, title: 'Hoodies & Buzos', image: '/accesorios.jpg?v=26', link: '/catalogo/buzos' },
  { id: 4, title: 'Zapatillas', image: '/zapatillas.png?v=26', link: '/catalogo/zapatillas' }
];

export function FeaturedGrid() {
  return (
    <section className="w-full bg-[#000000]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 w-full max-w-7xl mx-auto">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.id}
            href={cat.link}
            className="group relative w-full aspect-[3/2] overflow-hidden rounded-lg flex flex-col items-end justify-end cursor-pointer shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            {/* Background Image without heavy text overlay */}
            <Image
              src={cat.image}
              alt={cat.title}
              fill
              unoptimized
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            
            {/* Dark overlay on hover */}
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/50 transition-colors duration-300" />
            
            {/* Inner Border on Hover */}
            <div className="absolute inset-4 border border-white/0 group-hover:border-white/20 transition-all duration-500 pointer-events-none" />

            {/* Content */}
            <div className="relative z-10 w-full h-full p-8 flex flex-col justify-end">
              <span className="text-[10px] text-white/50 font-bold uppercase tracking-[0.3em] mb-2 block translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                Categoría
              </span>
              <h3 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white mb-4 leading-none">
                {cat.title}
              </h3>
              <div className="flex items-center gap-2 text-white/70 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] group-hover:text-white transition-colors">
                <span className="border-b border-transparent group-hover:border-white transition-colors pb-1">Ver Colección</span>
                <ArrowRight className="w-3 h-3 md:w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

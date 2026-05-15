import { ProductCard } from "@/components/ProductCard";
import Image from "next/image";
import Link from "next/link";

export function ProductGrid({ productos }: { productos: any[] }) {
  if (!productos || productos.length === 0) return null;

  return (
    <div className="w-full max-w-[1440px] mx-auto px-6 md:px-12 pb-24">
      
      {/* Banner Intermedio Asimétrico (VCP Style) - Movido arriba */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-6 mb-16 md:mb-24 mt-4">
        <Link href="/catalogo" className="relative aspect-[4/5] md:aspect-square bg-[#0a0a0a] group overflow-hidden block">
           <img 
             src="/50off.jpg?v=26" 
             alt="Colección Invierno"
             className="absolute inset-0 w-full h-full object-cover object-center transition-transform duration-[2s] group-hover:scale-105" 
           />
           <div className="absolute inset-0 bg-black/40 transition-colors duration-700 group-hover:bg-black/20" />
           <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-white z-10">
             <h3 className="text-5xl font-black uppercase tracking-tighter mb-6 leading-none">Invierno<br/>'26</h3>
             <span className="border-b-2 border-white pb-1 text-sm font-bold uppercase tracking-[0.2em] group-hover:text-[#ccc] group-hover:border-[#ccc] transition-colors">
               Colección Exclusiva
             </span>
           </div>
        </Link>

        <Link href="/catalogo" className="relative aspect-[4/5] md:aspect-square bg-[#0a0a0a] group overflow-hidden block">
           <Image 
             src="/basicos.jpg" 
             alt="Básicos"
             fill
             className="object-cover object-center transition-transform duration-[2s] group-hover:scale-105" 
           />
           <div className="absolute inset-0 bg-black/40 transition-colors duration-700 group-hover:bg-black/20" />
           <div className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center text-white z-10">
             <h3 className="text-5xl font-black uppercase tracking-tighter mb-6">Básicos<br/>Esenciales</h3>
             <span className="border-b-2 border-white pb-1 text-sm font-bold uppercase tracking-[0.2em] group-hover:text-[#ccc] group-hover:border-[#ccc] transition-colors">
               Explorar
             </span>
           </div>
        </Link>
      </div>

      {/* Título VCP Style */}
      <h2 className="text-xl md:text-2xl font-black uppercase tracking-widest mb-12 flex items-center gap-4">
        <span className="w-1 h-6 bg-white block"></span>
        Nuevos Ingresos
      </h2>

      {/* Grid de 3 columnas (VCP default) - Solo 6 productos */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-2 gap-y-12 md:gap-x-6 md:gap-y-16">
        {productos.slice(0, 6).map((p) => (
           <ProductCard key={p.id} {...p} />
        ))}
      </div>

      {/* Botón Ver todo si hay más de 6 */}
      {productos.length > 6 && (
        <div className="mt-16 flex justify-center">
          <Link 
            href="/nuevos-ingresos" 
            className="border border-zinc-800 text-zinc-400 px-8 py-4 text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
          >
            Ver Todos
          </Link>
        </div>
      )}
    </div>
  );
}

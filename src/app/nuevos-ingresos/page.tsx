import { getNewArrivals } from "@/lib/supabase-catalog";
import { CatalogProductCard } from "@/components/ui/CatalogProductCard";

export const metadata = {
  title: "Nuevos Ingresos | Ind Monkey",
  description: "Lo último en zapatillas y streetwear. New Drops."
};

// Next.js Revalidation si se desea cachear
export const revalidate = 60;

export default async function NuevosIngresosPage() {
  const products = await getNewArrivals();

  return (
    <main className="min-h-screen bg-black text-white font-sans overflow-hidden pt-24">
      {/* Título de Fondo */}
      <section className="relative w-full h-[30vh] md:h-[40vh] flex flex-col justify-center items-center px-4">
        <div className="absolute inset-0 flex justify-center items-center overflow-hidden pointer-events-none select-none">
          <h1 
            className="text-[22vw] sm:text-[18vw] leading-none font-extrabold uppercase tracking-tighter whitespace-nowrap"
            style={{ color: "#FFFFFF08" }}
          >
            New Drops
          </h1>
        </div>
        
        <div className="relative z-10 text-center mt-auto mb-10">
          <p className="text-xl md:text-2xl font-black tracking-[0.3em] text-zinc-300 uppercase">
            Recién Llegado
          </p>
        </div>
      </section>

      {/* Grid de Productos */}
      <section className="max-w-[1440px] mx-auto px-6 md:px-12 pb-32">
        {products.length === 0 ? (
          <div className="text-center text-zinc-600 py-32 font-bold tracking-widest text-sm uppercase">
            No hay nuevos ingresos en este momento.
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 md:grid-cols-3 gap-x-4 gap-y-12 md:gap-x-8 md:gap-y-16">
            {products.map((product) => (
              <CatalogProductCard key={product.id} product={product} isNew={true} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

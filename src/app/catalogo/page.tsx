import { getCatalogProducts } from "@/lib/supabase-catalog";
import { CatalogProductCard } from "@/components/ui/CatalogProductCard";

export default async function CatalogoPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const resolvedSearchParams = await searchParams;
  
  const filters = {
    size: typeof resolvedSearchParams.size === 'string' ? resolvedSearchParams.size : undefined,
    sort: typeof resolvedSearchParams.sort === 'string' ? resolvedSearchParams.sort : undefined,
    search: typeof resolvedSearchParams.search === 'string' ? resolvedSearchParams.search : undefined,
  };

  const products = await getCatalogProducts(undefined, filters);

  return (
    <main className="pt-32 pb-24 px-6 md:px-12 max-w-[1440px] mx-auto min-h-screen">
      <header className="mb-16 md:mb-24 relative overflow-hidden">
        <h1 className="text-6xl md:text-9xl font-black uppercase tracking-tighter text-white opacity-[0.03] select-none truncate">
          CATALOGO
        </h1>
        <div className="absolute inset-0 flex items-center pointer-events-none">
          <h2 className="text-2xl md:text-4xl font-bold uppercase tracking-widest ml-4 md:ml-12 text-white">
            Todos los Productos
          </h2>
        </div>
      </header>

      {products.length === 0 ? (
        <div className="py-24 text-center text-zinc-500 uppercase tracking-widest text-sm font-bold">
          No hay productos disponibles.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-2 gap-y-12 md:gap-x-6 md:gap-y-16">
          {products.map((p) => (
            <CatalogProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </main>
  );
}

import { getProductBySlug } from "@/lib/supabase-catalog";
import { AddToCartForm } from "@/components/ui/AddToCartForm";
import { notFound } from "next/navigation";
import Image from "next/image";
import { ProductGallery } from "@/components/ui/ProductGallery";

const FALLBACK_BLUR =
  "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjgwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMTExMTExIiAvPjwvc3ZnPg==";

// Estructura escalable: en el futuro se puede reemplazar por array de imágenes
// eg: product.images: string[] => sustituir galería facilmente
// Estructura escalable: utiliza el array de imágenes si existe
function buildGallery(product: {
  imagen_url: string | null;
  video_url: string | null;
  imagenes?: string[];
}): Array<{ type: "image" | "video"; src: string | null }> {
  const gallery: Array<{ type: "image" | "video"; src: string | null }> = [];

  if (product.imagenes && product.imagenes.length > 0) {
    product.imagenes.forEach((img) => gallery.push({ type: "image", src: img }));
  } else if (product.imagen_url) {
    gallery.push({ type: "image", src: product.imagen_url });
  }

  if (product.video_url) {
    gallery.push({ type: "video", src: product.video_url });
  }

  // Fallback: si no hay nada, al menos mostrar un slot vacío
  if (gallery.length === 0) {
    gallery.push({ type: "image", src: null });
  }

  return gallery;
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const resolvedParams = await params;
  const product = await getProductBySlug(resolvedParams.slug);

  if (!product) {
    notFound();
  }

  const price = product.variantes?.[0]?.precio_venta || 0;
  const gallery = buildGallery(product);

  return (
    <main className="min-h-screen pt-32 pb-24 px-0 md:px-12 max-w-[1440px] mx-auto text-white">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-24 relative">

        {/* COLUMNA IZQUIERDA: Galería con Thumbnails */}
        <div className="w-full">
          <ProductGallery gallery={gallery} alt={product.nombre} />
        </div>

        {/* COLUMNA DERECHA: Info sticky */}
        <div className="relative">
          <div className="md:sticky md:top-32 h-fit flex flex-col gap-6">
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none text-white">
              {product.nombre}
            </h1>

            <p className="text-2xl font-bold tracking-tight text-[#E2E2E2]">
              ${price.toLocaleString("es-AR")}
            </p>

            <div className="text-zinc-400 text-sm leading-relaxed mt-2 font-medium">
              <p>
                {product.descripcion ||
                  "Pieza de diseño exclusiva producida con los más altos estándares de calidad. Corte oversized y caída perfecta."}
              </p>
            </div>

            <AddToCartForm product={product} />
          </div>
        </div>
      </div>
    </main>
  );
}

import { ProductGrid } from "@/components/shop/ProductGrid";
import { Hero } from "@/components/sections/Hero";
import { InfoTrustBar } from "@/components/sections/InfoTrustBar";
import { AnnouncementMarquee } from "@/components/sections/AnnouncementMarquee";

import { FeaturedGrid } from "@/components/sections/FeaturedGrid";
import { ReelShowcase } from "@/components/sections/ReelShowcase";
import { SocialMedia } from "@/components/sections/SocialMedia";
import { Newsletter } from "@/components/sections/Newsletter";
import { getProductos } from "@/lib/actions";
import { Reveal } from "@/components/ui/Reveal";
import { Lookbook } from "@/components/sections/Lookbook";

export default async function HomePage() {
  const productosRaw = await getProductos();
  
  // Transformamos los productos de la BD al formato que espera el ProductGrid/ProductCard
  const productos = productosRaw.map(p => ({
    id: p.id,
    name: p.nombre,
    price: p.variantes?.[0]?.precio_venta || 0,
    imageUrl: p.imagenes?.[0] || p.imagen_url || "",
    secondaryImageUrl: p.imagenes?.[1] || undefined,
    videoUrl: p.video_url || undefined,
    slug: p.slug,
    active: p.activo
  }));

  return (
    <div className="bg-[#000000] min-h-screen text-white">
      {/* ─── 01. HERO (ESTILO VCP 100VH) ────────────────────── */}
      <Hero />

      <Reveal>
        {/* ─── 02. INFO TRUST BAR (ESTILO VCP 3 COLUMNAS) ────────────── */}
        <InfoTrustBar />
      </Reveal>

      <Reveal delay={0.2}>
        {/* ─── 03. INFINITE MARQUEE (ANUNCIOS OUTLINE) ──────────────── */}
        <AnnouncementMarquee />
      </Reveal>

      <Reveal>
        {/* ─── 04. PRODUCT GRID ASIMÉTRICA ─────────────────────── */}
        <section className="w-full pt-16 md:pt-32">
          <ProductGrid productos={productos} />
        </section>
      </Reveal>

      <Reveal>
        {/* ─── 05. SHOP THE LOOK (LOOKBOOK) ──────────────── */}
        <Lookbook />
      </Reveal>

      <Reveal>
        {/* ─── 06. FEATURED GRID (2x2 GRID) ─────────────── */}
        <FeaturedGrid />
      </Reveal>

      <Reveal>
        {/* ─── XX. REEL SHOWCASE ───────────────────────── */}
        <ReelShowcase />
      </Reveal>

      <Reveal>
        {/* ─── 06. SOCIAL MEDIA BLOCKS ───────────────────────── */}
        <SocialMedia />
      </Reveal>

      <Reveal>
        {/* ─── 07. NEWSLETTER CTA ──────────────────────────── */}
        <Newsletter />
      </Reveal>

    </div>
  );
}

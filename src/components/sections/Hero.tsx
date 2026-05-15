import Image from "next/image";
import Link from "next/link";

export function Hero() {
  return (
    <section className="w-full bg-black pt-20 md:pt-24 pb-12 px-4 md:px-8">
      {/* Contenedor principal adaptativo que toma la forma gráfica natural de la imagen */}
      <div className="relative mx-auto max-w-[1400px] w-full rounded-lg overflow-hidden border border-zinc-800 group">

        {/* Usamos img clásico para mantener el 100% de la nitidez original y el formato exacto de tu archivo HD */}
        <img
          src="/hero-banner.png"
          alt="Ind Monkey - Streetwear Campaign"
          className="w-full h-auto block object-cover transition-transform duration-[2s] ease-out group-hover:scale-105"
        />

        {/* Overlay oscuro para acentuar el Dark Mode y dar legibilidad */}
        <div className="absolute inset-0 bg-black/40 z-10 transition-opacity duration-700 group-hover:bg-black/30" />

        {/* Contenido superpuesto (absolute) sobre la imagen generada por su alto */}
        <div className="absolute inset-0 z-20 w-full h-full flex flex-col justify-between p-6 md:p-12">

          {/* Top Header Labels */}
          <div className="flex justify-end items-start w-full">
            <div className="text-right">
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-[#cccccc]">Trend & Quality</span>
            </div>
          </div>

          {/* Center Massive Branding - Layer 1 */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-full text-center mix-blend-overlay flex flex-col items-center justify-center">
            <h2 className="text-[14vw] md:text-[9vw] font-black tracking-tighter text-white opacity-[0.15] uppercase leading-none">
              IND MONKEY
            </h2>
          </div>

          {/* Bottom Principal Call to Action - Layer 2 */}
          <div className="flex justify-between items-end w-full">
            {/* Esquina inferior izquierda (antes arriba a la izquierda) */}
            <div className="flex flex-col gap-1 pb-2">
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-[#cccccc]">Original</span>
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-[#cccccc]">Arg Fashion Brand</span>
            </div>

            {/* Esquina inferior derecha: Título y Botón */}
            <div className="text-right">
              <h1 className="text-3xl md:text-5xl lg:text-7xl font-black uppercase text-white tracking-[0.02em] leading-[0.9]">
                All Good<br />Feels. Winter '26
              </h1>
              <Link
                href="/catalogo"
                className="inline-block mt-6 border border-white text-white px-8 py-3 text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] hover:bg-white hover:text-black transition-colors rounded-none backdrop-blur-sm"
              >
                Descubrir Ahora
              </Link>
            </div>
          </div>

        </div>
      </div>

      {/* Extreme editorial look text below */}
      <div className="mx-auto max-w-[1400px] w-full mt-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-zinc-400 px-2 lg:px-0">
        <p className="text-[10px] md:text-xs uppercase tracking-[0.1em] max-w-md leading-relaxed">
          Indumentaria técnica diseñada para el frío. Conocé el nuevo drop: tecnología textil y diseño utilitario de invierno.
        </p>
        <div className="flex items-center gap-4">
          <span className="inline-block w-8 md:w-16 h-[1px] bg-zinc-800"></span>
          <span className="text-[10px] md:text-xs font-mono tracking-widest text-zinc-500">WINTER COLLECTION // 2026</span>
        </div>
      </div>
    </section>
  );
}

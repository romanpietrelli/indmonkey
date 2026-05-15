import Image from "next/image";

export const metadata = {
  title: "Nosotros | Ind Monkey",
  description: "La historia de Ind Monkey. Hecho para los que van al frente.",
};

export default function NosotrosPage() {
  return (
    <main className="min-h-screen bg-black text-white font-sans overflow-hidden">
      {/* --- HERO SECTION --- */}
      <section className="relative w-full h-[60vh] md:h-[80vh] flex flex-col justify-center items-center px-6">
        {/* Giant Background Title */}
        <div className="absolute inset-0 flex justify-center items-center overflow-hidden pointer-events-none select-none">
          <h1
            className="text-[25vw] sm:text-[20vw] leading-none font-extrabold uppercase tracking-tighter whitespace-nowrap"
            style={{ color: "#FFFFFF10" }}
          >
            Nosotros
          </h1>
        </div>

        {/* Subtitle */}
        <div className="relative z-10 text-center mt-auto mb-16 md:mb-24">
          <p className="text-xl sm:text-2xl md:text-3xl font-light tracking-wide text-zinc-300 italic">
            "Hecho para los que van al frente."
          </p>
        </div>
      </section>

      {/* --- STORY LAYOUT --- */}
      <section className="max-w-7xl mx-auto px-6 pb-24 space-y-32 md:space-y-48">

        {/* Sección 1: Orígenes (Garage) */}
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-20">
          <div className="w-full md:w-1/2 relative aspect-[3/4] bg-zinc-900 group overflow-hidden">
            <Image
              src="/image_0.png"
              alt="El origen en el garaje - 2018"
              fill
              className="object-cover transition-opacity duration-700 ease-in-out hover:opacity-90"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          <div className="w-full md:w-1/2 space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight leading-tight">
              El comienzo<br />fue en el garage.
            </h2>
            <div className="h-1 w-16 bg-white rounded-sm"></div>
            <p className="text-base md:text-lg text-zinc-400 leading-relaxed font-light">
              Año 2018. Catriel, Río Negro. El sueño empezó a tomar forma entre cuatro paredes y un puñado de zapatillas que Erwin, el fundador y único empleado, vendía en el garaje de su casa. Sin grandes inversiones, pero con una visión clara de lo que el streetwear real debía ser. Cada par que salía de ese garaje llevaba consigo la promesa de autenticidad.
            </p>
          </div>
        </div>

        {/* Sección 2: Actualidad (Erwin en Av. San Martín) */}
        <div className="flex flex-col md:flex-row-reverse items-center gap-12 md:gap-20">
          <div className="w-full md:w-1/2 relative aspect-[3/4] bg-zinc-900 group overflow-hidden border border-zinc-800">
            {/* Placeholder Visual for Erwin's Photo */}
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-10 px-4 text-center">
              <span className="text-white/70 tracking-[0.2em] text-xs md:text-sm uppercase font-semibold">
                [ Placeholder ]
              </span>
              <span className="text-white/40 mt-2 text-xs">
                Foto de Erwin en el local
              </span>
            </div>
            {/* Fallback image path mapped */}
            <Image
              src="/erwin.png"
              alt="Erwin en el local de Av. San Martín"
              fill
              className="object-cover transition-opacity duration-700 ease-in-out opacity-40 hover:opacity-90 grayscale hover:grayscale-0"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>

          <div className="w-full md:w-1/2 space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold uppercase tracking-tight leading-tight">
              Avenida San Martín:<br />La nueva presencia.
            </h2>
            <div className="h-1 w-16 bg-white rounded-sm"></div>
            <p className="text-base md:text-lg text-zinc-400 leading-relaxed font-light">
              El tiempo y la pasión hicieron lo suyo. Hoy, ese mismo espíritu perseverante tiene un lugar físico en Av. San Martín. Ind Monkey pasó de ser un secreto a voces a una marca consolidada, un punto de encuentro para la cultura urbana local. Aquí, nosotros seguimos curando cada prenda y zapatilla con la misma dedicación que el primer día.
            </p>
          </div>
        </div>

      </section>
    </main>
  );
}

export function AnnouncementMarquee() {
  const phrases = [
    "WINTER '26",
    "COLECCIÓN INVIERNO",
    "NUEVOS INGRESOS",
    "IND MONKEY EXCLUSIVE",
    "ENVÍOS A TODO EL PAÍS"
  ];

  // Repetimos varias veces para llenar pantallas ultra wide
  const content = [...phrases, ...phrases, ...phrases, ...phrases, ...phrases, ...phrases];

  return (
    <div 
      className="w-full bg-[#000000] h-24 md:h-28 flex items-center overflow-hidden"
      style={{
        maskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)",
        WebkitMaskImage: "linear-gradient(to right, transparent, black 15%, black 85%, transparent)"
      }}
    >
      {/* Inyectamos CSS para animación ultra fluida sin saltos */}
      <style>{`
        @keyframes marquee-smooth {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .animate-marquee-smooth {
          animation: marquee-smooth 120s linear infinite;
          will-change: transform;
        }
      `}</style>

      {/* Contenedor desplazable: width doble para que el -50% sea justo la mitad */}
      <div className="flex whitespace-nowrap animate-marquee-smooth items-center min-w-max">
        {/* Tira 1 */}
        <div className="flex items-center min-w-max">
          {content.map((item, idx) => (
            <div key={`part1-${idx}`} className="flex items-center">
              <span className="text-5xl md:text-6xl font-black text-white/90 uppercase tracking-normal px-6 md:px-8">
                {item}
              </span>
              <span className="text-white/30 text-2xl">
                &bull;
              </span>
            </div>
          ))}
        </div>
        {/* Tira 2 (Duplicado exacto) */}
        <div className="flex items-center min-w-max">
          {content.map((item, idx) => (
            <div key={`part2-${idx}`} className="flex items-center">
              <span className="text-5xl md:text-6xl font-black text-white/90 uppercase tracking-normal px-6 md:px-8">
                {item}
              </span>
              <span className="text-white/30 text-2xl">
                &bull;
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

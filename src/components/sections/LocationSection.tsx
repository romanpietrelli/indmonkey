import React from 'react';

export function LocationSection() {
  return (
    <section className="w-full bg-black border-t border-zinc-900 overflow-hidden text-white font-sans">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-24 flex flex-col md:flex-row gap-12 lg:gap-24 items-center">
        {/* Info Left */}
        <div className="w-full md:w-1/3 flex flex-col gap-8 z-10">
          <h2 className="text-4xl lg:text-5xl font-extrabold uppercase tracking-tighter leading-[1.1]">
            Visitanos en<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-300 to-zinc-600">Catriel</span>
          </h2>
          <div className="flex flex-col gap-3">
            <h4 className="text-zinc-500 uppercase tracking-[0.2em] text-[10px] font-black mb-1">Dirección</h4>
            <p className="text-zinc-300 text-lg font-light leading-relaxed">
              Av. San Martín 296<br />
              Catriel, Río Negro<br />
              Patagonia Argentina.
            </p>
          </div>
          <div className="pt-4">
            <a 
              href="https://maps.google.com/?q=Av.+San+Martín+296,+Catriel,+Río+Negro" 
              target="_blank" 
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-6 border border-zinc-800 hover:border-zinc-300 px-6 py-4 transition-all duration-300 w-full lg:w-fit"
            >
              <span className="text-xs tracking-[0.2em] font-bold uppercase">Cómo llegar</span>
              <span className="text-zinc-500 group-hover:translate-x-1 group-hover:text-white transition-all">→</span>
            </a>
          </div>
        </div>

        {/* Map Right */}
        <div className="w-full md:w-2/3 h-[400px] md:h-[500px] relative group overflow-hidden border border-zinc-800 bg-zinc-900">
          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/0 transition-colors duration-700 z-10 pointer-events-none"></div>
          
          <iframe
            src="https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=en&amp;q=Av.%20San%20Martin%20296,%20Catriel,%20Rio%20Negro+(Ind%20Monkey)&amp;t=&amp;z=17&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="w-full h-full invert-[90%] grayscale-[100%] contrast-[80%] opacity-60 group-hover:opacity-100 group-hover:contrast-[100%] transition-all duration-[800ms] pointer-events-auto"
          ></iframe>
        </div>
      </div>
    </section>
  );
}

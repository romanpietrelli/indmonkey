"use client";

import Image from "next/image";

export function Newsletter() {
  return (
    <section className="w-full bg-black py-6 md:py-12 px-4 border-t border-b border-zinc-900">
      <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
        {/* Title */}
        <h2 className="w-full max-w-[70%] text-4xl md:text-8xl font-extrabold uppercase tracking-tighter text-white mb-4 md:mb-6 leading-none">
          NEWSLETTER
        </h2>
        
        {/* Description */}
        <p className="text-base md:text-xl font-bold text-white mb-8 max-w-2xl mx-auto leading-relaxed">
          ENTERATE ANTES QUE NADIE DE LOS PRÓXIMOS DROPS Y DESCUENTOS EXCLUSIVOS.
        </p>

        {/* Form Container */}
        <form className="w-full max-w-md mx-auto flex flex-col space-y-6" onSubmit={(e) => e.preventDefault()}>
          <div className="relative w-full">
            {/* Input Icon Left */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center overflow-hidden">
              <Image 
                src="/MONKEY SIN FONDO (1) (1) (1).jpg" 
                alt="Monkey Logo" 
                width={24} 
                height={24} 
                className="object-contain"
              />
            </div>

            {/* Input Field */}
            <input
              type="email"
              placeholder="TU EMAIL"
              className="w-full bg-transparent border-0 border-b-2 border-zinc-800 text-white text-sm font-bold uppercase py-2 pl-8 pr-4 focus:ring-0 focus:outline-none focus:border-white transition-colors placeholder:text-zinc-500"
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full max-w-sm mx-auto bg-white text-black py-4 text-xl font-extrabold uppercase rounded-none hover:bg-zinc-200 transition-colors"
          >
            SUSCRIBIRME
          </button>
        </form>
      </div>
    </section>
  );
}

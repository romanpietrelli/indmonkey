export function SocialMedia() {
  return (
    <section className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 w-full text-white">
        
        {/* Instagram Panel */}
        <a
          href="https://instagram.com/indmonkeyy"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex flex-col items-center justify-center h-[40vh] md:h-[35vh] bg-black hover:bg-zinc-900 transition-colors duration-500 overflow-hidden"
        >
          {/* Faded icon at the background */}
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="absolute text-white/5 w-48 h-48 md:w-64 md:h-64 pointer-events-none transition-transform duration-700 group-hover:scale-110">
            <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
            <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
            <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
          </svg>
          
          <div className="relative z-10 flex flex-col items-center justify-center p-4 text-center space-y-2">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 md:w-8 md:h-8 mb-2">
              <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
              <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
            </svg>
            <h2 className="text-4xl md:text-6xl font-extrabold uppercase tracking-tighter">
              @INDMONKEYY
            </h2>
            <p className="text-sm md:text-base font-bold tracking-widest uppercase text-zinc-400 group-hover:text-white transition-colors">
              SEGUINOS EN INSTAGRAM
            </p>
          </div>
        </a>

        {/* TikTok Panel */}
        <a
          href="https://tiktok.com/@indmonkeyy"
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex flex-col items-center justify-center h-[40vh] md:h-[35vh] bg-zinc-950 hover:bg-zinc-900 transition-colors duration-500 overflow-hidden"
        >
          {/* Custom TikTok SVG background */}
          <svg 
            viewBox="0 0 24 24" 
            fill="currentColor" 
            className="absolute text-white/5 w-48 h-48 md:w-64 md:h-64 pointer-events-none transition-transform duration-700 group-hover:scale-110"
          >
            <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
          </svg>

          <div className="relative z-10 flex flex-col items-center justify-center p-4 text-center space-y-2">
            <svg 
              viewBox="0 0 24 24" 
              fill="currentColor" 
              className="w-6 h-6 md:w-8 md:h-8 mb-2"
            >
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
            </svg>
            <h2 className="text-4xl md:text-6xl font-extrabold uppercase tracking-tighter">
              @INDMONKEYY
            </h2>
            <p className="text-sm md:text-base font-bold tracking-widest uppercase text-zinc-400 group-hover:text-white transition-colors">
              MIRÁ NUESTROS REELS Y DROPS
            </p>
          </div>
        </a>

      </div>
    </section>
  );
}

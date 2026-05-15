"use client";

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';

export function Footer() {
  return (
    <footer className="w-full bg-black border-t border-zinc-900 py-24 text-white font-sans overflow-hidden">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-12">
          {/* Col 1: Marca */}
          <div className="flex flex-col gap-6 lg:pr-8">
            <h3 className="text-3xl font-black tracking-tighter uppercase whitespace-nowrap">
              Ind Monkey
            </h3>
            <p className="text-zinc-500 font-medium tracking-wide leading-relaxed">
              "Desde el garage a la calle.<br/>Catriel, Patagonia Argentina."
            </p>
          </div>

          {/* Col 2: Ayuda */}
          <div className="flex flex-col gap-5">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-2">Ayuda</h4>
            <Link href="/como-comprar" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Cómo comprar</Link>
            <Link href="/cambios" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Cambios y Devoluciones</Link>
            <Link href="/seguimiento" className="text-sm font-medium text-zinc-300 hover:text-white transition-colors">Seguimiento de pedido</Link>
          </div>

          {/* Col 3: Contacto */}
          <div className="flex flex-col gap-5">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-2">Contacto</h4>
            <div className="text-sm font-medium text-zinc-300 flex flex-col gap-1">
              <span>Av. San Martin</span>
              <span>Catriel, Río Negro</span>
            </div>
            <a 
              href="https://wa.me/5492996052060"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 flex items-center justify-between gap-4 border border-zinc-800 hover:border-zinc-300 px-5 py-3 text-xs font-bold tracking-[0.1em] uppercase transition-all w-full md:w-fit group"
            >
              <span>WhatsApp</span>
              <ArrowUpRight className="w-4 h-4 text-zinc-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </a>
          </div>

          {/* Col 4: Newsletter */}
          <div className="flex flex-col gap-5">
            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-600 mb-2">Unete al Club</h4>
            <p className="text-sm font-medium text-zinc-400">
              Recibí novedades y early access a los próximos drops.
            </p>
            <form className="mt-4 flex border-b border-zinc-700 pb-3 focus-within:border-zinc-300 transition-colors group" onSubmit={(e) => e.preventDefault()}>
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS" 
                className="w-full bg-transparent text-xs font-medium tracking-widest placeholder:text-zinc-600 outline-none p-0 focus:ring-0 text-white"
                required
              />
              <button type="submit" className="text-xs font-black tracking-wider uppercase pl-4 text-zinc-600 group-hover:text-white transition-colors">
                Enviá
              </button>
            </form>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-32 pt-10 border-t border-zinc-900 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-[10px] md:text-xs font-bold text-zinc-600 tracking-[0.15em] uppercase text-center md:text-left">
            &copy; 2026 IND MONKEY. TODOS LOS DERECHOS RESERVADOS.
          </p>
          
          <div className="flex items-center gap-6 group hover:grayscale-0 grayscale transition-all duration-[600ms]">
            {/* Visa */}
            <div className="font-extrabold text-sm tracking-tighter italic opacity-60 group-hover:opacity-100 transition-opacity">VISA</div>
            
            {/* Mastercard */}
            <div className="flex items-center opacity-60 group-hover:opacity-100 transition-opacity">
              <div className="w-4 h-4 bg-red-600 rounded-full mix-blend-screen -mr-1.5 z-10"></div>
              <div className="w-4 h-4 bg-[#F79E1B] rounded-full mix-blend-screen"></div>
            </div>
            
            {/* MercadoPago */}
            <div className="flex items-center font-black text-[9px] sm:text-[10px] bg-[#009EE3] text-white px-2 py-1 rounded-sm opacity-60 group-hover:opacity-100 transition-opacity tracking-wider">
              MERCADO PAGO
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

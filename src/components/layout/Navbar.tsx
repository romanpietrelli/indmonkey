"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Search, Menu, X } from "lucide-react";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useCartStore } from "@/store/cart";
import clsx from "clsx";
import { MegaMenu } from "./MegaMenu";

const NAV_LINKS = [
  { href: "/catalogo", label: "CATÁLOGO" },
  { href: "/nuevos-ingresos", label: "NUEVOS INGRESOS" },
  { href: "/nosotros", label: "NOSOTROS" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();
  const { items, setIsOpen } = useCartStore();
  const esAdmin = pathname?.startsWith("/gestion-interna-privada");

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isSolid = isScrolled || activeMenu !== null || isSearchOpen;

  return (
    <>
      <nav
        className={clsx(
          "fixed top-0 left-0 w-full z-50 transition-all duration-300",
          isSolid ? "bg-[#050505] py-3 border-b border-zinc-900" : "bg-black/80 backdrop-blur-md py-4 border-b border-transparent"
        )}
        onMouseLeave={() => setActiveMenu(null)}
      >
        <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex items-center justify-between relative">
          {/* LOGO FLOTANTE DE GRAN TAMAÑO (Oculto en admin) */}
          {!esAdmin ? (
            <Link href="/" className="flex-shrink-0 relative z-50 h-[30px] w-[80px] md:w-[130px] flex items-center ml-14 md:ml-32">
              <img
                src="/logo-transparent.png"
                alt="Ind Monkey"
                className={clsx(
                  "absolute left-0 transition-all duration-500 ease-out drop-shadow-lg",
                  activeMenu === "CATÁLOGO" ? "opacity-0 -translate-y-4 pointer-events-none" : "opacity-100 translate-y-0",
                  isScrolled ? "w-[70px] top-[0px]" : "w-[130px] md:w-[160px] top-[-10px] md:top-[-20px]"
                )}
              />
            </Link>
          ) : (
            <div className="flex-shrink-0 w-[80px] md:w-[130px] ml-14 md:ml-32" />
          )}

          {/* NAV DESKTOP (Center) */}
          <div className="hidden lg:flex items-center gap-10 absolute left-1/2 -translate-x-1/2 h-full">
            {NAV_LINKS.map((link) => (
              <div
                key={link.href}
                className="h-full flex items-center py-2 cursor-pointer"
                onMouseEnter={() => setActiveMenu(link.label)}
              >
                <Link
                  href={link.href}
                  className="text-xs font-bold uppercase tracking-[0.2em] text-[#cccccc] hover:text-white transition-colors"
                  style={{ textShadow: isSolid ? "none" : "0 2px 4px rgba(0,0,0,0.5)" }}
                >
                  {link.label}
                </Link>
              </div>
            ))}
          </div>

          {/* ACTIONS (Right) */}
          <div className="flex items-center gap-5 relative z-50">
            <button 
              onClick={() => setIsSearchOpen(!isSearchOpen)}
              className="text-white hover:text-[#ccc] transition-colors"
            >
              <Search className="w-5 h-5" />
            </button>
            
            <button 
              onClick={() => setIsOpen(true)}
              className="text-white hover:text-[#ccc] transition-colors relative"
            >
              <ShoppingBag className="w-5 h-5" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-white text-black text-[10px] font-bold w-4 h-4 flex items-center justify-center rounded-none">
                  {itemCount}
                </span>
              )}
            </button>

            {/* Ícono Menú Mobile */}
            <button
              className="lg:hidden text-white ml-2"
              onClick={() => setMenuAbierto(!menuAbierto)}
            >
              {menuAbierto ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* SEARCH OVERLAY */}
        {isSearchOpen && (
          <div className="absolute top-full left-0 w-full bg-[#050505] border-b border-zinc-900 animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-10 flex flex-col items-center justify-center gap-6">
              <div className="w-full max-w-3xl flex items-center gap-4 border-b border-zinc-800 pb-2 focus-within:border-white transition-colors">
                <Search className="w-6 h-6 text-zinc-500" />
                <form 
                  className="flex-1"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (searchQuery.trim()) {
                      router.push(`/catalogo?search=${encodeURIComponent(searchQuery)}`);
                      setIsSearchOpen(false);
                      setSearchQuery("");
                    }
                  }}
                >
                  <input 
                    autoFocus
                    type="text" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="BUSCAR PRODUCTOS..." 
                    className="w-full bg-transparent border-none text-2xl md:text-4xl font-black uppercase tracking-tighter text-white focus:ring-0 placeholder:text-zinc-800 p-0"
                  />
                </form>
                <button 
                  onClick={() => setIsSearchOpen(false)}
                  className="text-zinc-500 hover:text-white transition-colors"
                >
                  <X className="w-8 h-8" />
                </button>
              </div>
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em]">Presiona Enter para buscar</p>
            </div>
          </div>
        )}

        {/* MEGA MENU */}
        <MegaMenu isOpen={activeMenu === "CATÁLOGO"} onItemClick={() => setActiveMenu(null)} />
      </nav>

      {/* OVERLAY MENÚ MOBILE */}
      {menuAbierto && (
        <div className="fixed inset-0 z-40 bg-[#0a0a0a] pt-24 px-6 flex flex-col gap-6 lg:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuAbierto(false)}
              className="text-2xl font-black uppercase tracking-tighter text-white border-b border-[#222] pb-4"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-8 flex gap-6">
            <button 
              onClick={() => {
                setMenuAbierto(false);
                setIsSearchOpen(true);
              }}
              className="text-sm font-bold uppercase tracking-widest text-[#ccc] text-left"
            >
              Buscar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/catalogo", label: "Catálogo" },
  { href: "/drops", label: "Drops" },
  { href: "/nosotros", label: "Nosotros" },
];

export function Header() {
  const [menuAbierto, setMenuAbierto] = useState(false);
  const pathname = usePathname();
  const esAdmin = pathname?.startsWith("/gestion-interna-privada");

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: "rgba(10,10,10,0.95)",
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid var(--color-border)",
      }}
    >
      <div
        className="max-w-7xl mx-auto px-6 flex items-center justify-between"
        style={{ height: "96px" }}
      >
        {/* LOGO — fondo transparente, colores originales (Oculto en admin) */}
        {!esAdmin ? (
          <Link href="/" className="flex-shrink-0">
            <Image
              src="/logo-transparent.png"
              alt="Monkey Indumentaria"
              width={88}
              height={88}
              style={{
                width: "88px",
                height: "88px",
                objectFit: "contain",
                display: "block",
              }}
              priority
            />
          </Link>
        ) : (
          <div className="w-[88px]" /> // Espacio reservado para mantener el layout
        )}

        {/* NAV DESKTOP */}
        <nav className="hidden md:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-xs font-bold uppercase tracking-widest transition-colors"
              style={{ color: "var(--color-muted-foreground)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = "var(--color-foreground)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = "var(--color-muted-foreground)")
              }
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* ACTIONS */}
        <div className="flex items-center gap-4">
          <Link
            href="/carrito"
            className="p-2 transition-opacity hover:opacity-70"
            style={{ color: "var(--color-foreground)" }}
          >
            <ShoppingBag className="w-5 h-5" />
          </Link>

          {/* Botón hamburguesa (mobile) */}
          <button
            className="md:hidden p-2"
            onClick={() => setMenuAbierto(!menuAbierto)}
            style={{ color: "var(--color-foreground)" }}
          >
            {menuAbierto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* MENÚ MOBILE */}
      {menuAbierto && (
        <div
          className="md:hidden px-6 pb-6 flex flex-col gap-4"
          style={{ background: "var(--color-background)" }}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuAbierto(false)}
              className="text-sm font-bold uppercase tracking-widest py-2 border-b"
              style={{
                color: "var(--color-muted-foreground)",
                borderColor: "var(--color-border)",
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}

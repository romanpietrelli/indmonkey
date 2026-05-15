"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/Footer";
import { LocationSection } from "@/components/sections/LocationSection";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export function ClientLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const esAdmin = pathname?.startsWith("/gestion-interna-privada");
  const [isChanging, setIsChanging] = useState(false);

  useEffect(() => {
    // Cuando cambia el pathname, activamos una pequeña transición
    setIsChanging(true);
    const timer = setTimeout(() => setIsChanging(false), 400);
    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <>
      {/* Barra de progreso superior (Sleek) */}
      <AnimatePresence>
        {isChanging && (
          <motion.div
            initial={{ scaleX: 0, opacity: 1 }}
            animate={{ scaleX: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "circOut" }}
            className="fixed top-0 left-0 right-0 h-[2px] bg-white z-[9999] origin-left"
          />
        )}
      </AnimatePresence>

      <motion.main
        key={pathname}
        initial={{ opacity: 0.4, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        {children}
      </motion.main>

      {!esAdmin && (
        <>
          <LocationSection />
          <Footer />
        </>
      )}
    </>
  );
}

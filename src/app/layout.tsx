import type { Metadata } from 'next';
import './globals.css';
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/Footer";
import { LocationSection } from "@/components/sections/LocationSection";
import { ClientLayoutWrapper } from "@/components/layout/ClientLayoutWrapper";

export const metadata: Metadata = {
  title: 'Ind Monkey | Streetwear & Sneakers',
  description: 'Plataforma oficial de Ind Monkey. Streetwear y Sneakers de calidad.',
  icons: {
    icon: '/logo.png',
  },
};

import { SideCart } from "@/components/ui/SideCart";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Inter', system-ui, sans-serif", background: "#000000" }}>
        <Navbar />
        <ClientLayoutWrapper>
          {children}
        </ClientLayoutWrapper>
        <SideCart />
      </body>
    </html>
  );
}

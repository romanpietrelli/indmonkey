import { ReactNode } from "react";
import { FilterDrawer } from "@/components/ui/FilterDrawer";

export const metadata = {
  title: "Catálogo",
  description: "Explorá nuestro catálogo completo",
};

export default function CatalogoLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-white selection:text-black">
      {children}
      <FilterDrawer />
    </div>
  );
}

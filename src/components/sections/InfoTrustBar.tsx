import { CreditCard, Package, ShoppingBag } from "lucide-react";

export function InfoTrustBar() {
  return (
    <section className="w-full bg-[#000000] border-t border-b border-zinc-800">
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 py-10 md:py-14">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10 md:gap-6 divide-y md:divide-y-0 md:divide-x divide-zinc-800">
          
          {/* Item 1 */}
          <div className="flex flex-col items-center justify-center text-center w-full px-4 pt-4 md:pt-0">
            <CreditCard className="w-8 h-8 md:w-10 md:h-10 text-white mb-4 stroke-1" />
            <h3 className="text-sm md:text-base font-bold uppercase tracking-widest text-white mb-2">
              3 Y 6 CUOTAS SIN INTERÉS
            </h3>
            <p className="text-xs md:text-sm text-[#cccccc]">
              6 cuotas sin interés - compra mínima $150.000
            </p>
          </div>

          {/* Item 2 */}
          <div className="flex flex-col items-center justify-center text-center w-full px-4 pt-10 md:pt-0">
            <Package className="w-8 h-8 md:w-10 md:h-10 text-white mb-4 stroke-1" />
            <h3 className="text-sm md:text-base font-bold uppercase tracking-widest text-white mb-2">
              ENVÍOS GRATIS
            </h3>
            <p className="text-xs md:text-sm text-[#cccccc]">
              Con compras superiores a $120.000
            </p>
          </div>

          {/* Item 3 */}
          <div className="flex flex-col items-center justify-center text-center w-full px-4 pt-10 md:pt-0">
            <ShoppingBag className="w-8 h-8 md:w-10 md:h-10 text-white mb-4 stroke-1" />
            <h3 className="text-sm md:text-base font-bold uppercase tracking-widest text-white mb-2">
              10% OFF EN EL PEDIDO
            </h3>
            <p className="text-xs md:text-sm text-[#cccccc]">
              Pagos por transferencia
            </p>
          </div>

        </div>
      </div>
    </section>
  );
}

import { createClient } from "@/lib/supabase/server";
import { CheckCircle2, Copy } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface GraciasPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function GraciasPage({ params }: GraciasPageProps) {
  const supabase = await createClient();
  const { orderId } = await params;

  const { data: order, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (error || !order) {
    return notFound();
  }

  const isTransferencia = order.payment_method === "transferencia";
  const isRetiroLocal = order.shipping_method === "Retiro en local (Catriel)";
  
  // Codificamos el mensaje para WhatsApp
  const whatsappMessage = encodeURIComponent(`Hola, acabo de hacer el pedido ${orderId}. ¿Me podrían confirmar el estado?`);
  const whatsappHref = `https://wa.me/5492996052060?text=${whatsappMessage}`;

  const whatsappMessageTransferencia = encodeURIComponent(`Hola, acabo de hacer el pedido ${orderId}. Aquí te paso el comprobante de la transferencia:`);
  const whatsappHrefTransferencia = `https://wa.me/5492996052060?text=${whatsappMessageTransferencia}`;

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex items-center justify-center py-24 px-4">
      <div className="max-w-2xl w-full bg-neutral-900/50 border border-white/10 p-8 flex flex-col items-center text-center gap-6">
        <CheckCircle2 className="w-20 h-20 text-green-500 mb-2" />
        
        <h1 className="text-3xl font-black uppercase tracking-widest">¡Gracias por tu compra!</h1>
        <p className="text-zinc-400 text-sm">Tu número de orden es: <span className="text-white font-bold">{order.id}</span></p>

        {isRetiroLocal && (
          <div className="w-full bg-black/50 border border-white/10 p-6 mt-4 flex flex-col gap-4 text-left">
            <h2 className="text-lg font-bold uppercase tracking-widest text-center border-b border-white/10 pb-4">Retiro en Local</h2>
            <p className="text-sm text-zinc-300">¡Te esperamos en nuestro local para entregarte tu pedido!</p>
            
            <div className="flex flex-col gap-2 text-sm text-zinc-300">
              <p><span className="font-bold text-white uppercase tracking-wider text-xs">Dirección:</span> Av. San Martín 296, Catriel, Río Negro</p>
              <p><span className="font-bold text-white uppercase tracking-wider text-xs">Horarios:</span> 9:00 a 12:00 y 17:00 a 22:00</p>
            </div>

            <p className="text-xs text-zinc-400 text-center mt-2">
              Si tenés alguna duda, contactanos por WhatsApp.
            </p>

            <a 
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 w-full bg-[#25D366] text-white font-black uppercase tracking-widest py-4 text-sm transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
            >
              Consultar por WhatsApp
            </a>
          </div>
        )}

        {isTransferencia && (
          <div className="w-full bg-black/50 border border-white/10 p-6 mt-4 flex flex-col gap-4 text-left">
            <h2 className="text-lg font-bold uppercase tracking-widest text-center border-b border-white/10 pb-4">Datos para Transferencia</h2>
            
            <div className="flex flex-col gap-2 text-sm text-zinc-300">
              <p><span className="font-bold text-white uppercase tracking-wider text-xs">Banco:</span> Lemon / Mercado Pago</p>
              <p><span className="font-bold text-white uppercase tracking-wider text-xs">Titular:</span> Erwin Mariano Diaz</p>
              <p><span className="font-bold text-white uppercase tracking-wider text-xs">Alias:</span> indmonkeycatriel</p>
              <p><span className="font-bold text-white uppercase tracking-wider text-xs">Monto a transferir:</span> ${order.total.toLocaleString("es-AR")}</p>
            </div>

            <div className="bg-red-500/10 border border-red-500/30 p-4 mt-2">
              <p className="text-sm text-red-200 text-center font-medium">
                ⚠️ <span className="font-bold uppercase tracking-wider">Paso obligatorio:</span> Es necesario que nos envíes el comprobante de pago por WhatsApp para poder procesar y confirmar tu pedido.
              </p>
            </div>

            <a 
              href={whatsappHrefTransferencia}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 w-full bg-[#25D366] text-white font-black uppercase tracking-widest py-4 text-sm transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
            >
              Enviar comprobante por WhatsApp
            </a>
          </div>
        )}

        {!isTransferencia && !isRetiroLocal && (
           <a 
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] text-white font-black uppercase tracking-widest py-4 text-sm transition-opacity hover:opacity-90 flex items-center justify-center gap-2"
          >
            ¿Alguna duda? Escribinos
          </a>
        )}

        <div className="mt-8">
          <Link href="/" className="bg-white text-black px-8 py-3 font-bold uppercase tracking-wider text-sm hover:opacity-90 transition-opacity">
            Volver a la tienda
          </Link>
        </div>
      </div>
    </div>
  );
}

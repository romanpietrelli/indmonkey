"use client";

import { useCartStore } from "@/store/cart";
import { useState, useEffect } from "react";
import { calculateShipping, ShippingOption } from "@/lib/shipping-logic";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function CheckoutPage() {
  const { items, clearCart } = useCartStore();
  const [mounted, setMounted] = useState(false);
  const [zipCode, setZipCode] = useState("");
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<'mercadopago' | 'transferencia'>('mercadopago');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white px-4">
        <div className="text-center">
          <h1 className="text-2xl font-black uppercase tracking-widest mb-4">Tu carrito está vacío</h1>
          <button 
            onClick={() => router.push("/")}
            className="bg-white text-black px-8 py-3 font-bold uppercase tracking-wider text-sm hover:opacity-90 transition-opacity"
          >
            Volver a la tienda
          </button>
        </div>
      </div>
    );
  }

  const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const total = subtotal + (selectedShipping?.cost || 0);

  const handleZipCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cp = e.target.value;
    setZipCode(cp);
    if (cp.length >= 4) {
      const options = calculateShipping(cp, subtotal);
      setShippingOptions(options);
      // Select first option by default
      if (options.length > 0) {
        setSelectedShipping(options[0]);
      } else {
        setSelectedShipping(null);
      }
    } else {
      setShippingOptions([]);
      setSelectedShipping(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedShipping) {
      alert("Por favor ingresa un código postal válido y selecciona un método de envío.");
      return;
    }
    
    if (!customerName || !customerEmail || !customerPhone || !customerAddress) {
      alert("Por favor completa todos tus datos personales.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customerData: {
            name: customerName,
            email: customerEmail,
            phone: customerPhone,
            address: customerAddress
          },
          shippingCost: selectedShipping.cost,
          shippingMethod: selectedShipping.name,
          paymentMethod,
          zipCode
        })
      });

      if (!response.ok) {
        throw new Error("Error al procesar la orden");
      }

      const data = await response.json();

      if (paymentMethod === 'mercadopago' && data.init_point) {
        clearCart();
        window.location.href = data.init_point;
      } else if (paymentMethod === 'transferencia' && data.orderId) {
        clearCart();
        router.push(`/gracias/${data.orderId}`);
      } else {
        throw new Error("Respuesta inválida del servidor");
      }

    } catch (error) {
      console.error("Error al crear la orden:", error);
      alert("Hubo un error al procesar tu orden. Por favor intenta nuevamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Formulario */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          <div>
            <h1 className="text-3xl font-black uppercase tracking-widest mb-2">Checkout</h1>
            <p className="text-zinc-400 text-sm">Completa tus datos para finalizar la compra.</p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-8">
            <div className="bg-neutral-900/50 border border-white/10 p-6 flex flex-col gap-4">
              <h2 className="text-lg font-bold uppercase tracking-widest border-b border-white/10 pb-4">1. Datos Personales</h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-xs uppercase tracking-widest text-zinc-400 font-bold">Nombre Completo</label>
                  <input required value={customerName} onChange={e => setCustomerName(e.target.value)} type="text" className="bg-black border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-white transition-colors" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs uppercase tracking-widest text-zinc-400 font-bold">Email</label>
                  <input required value={customerEmail} onChange={e => setCustomerEmail(e.target.value)} type="email" className="bg-black border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-white transition-colors" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs uppercase tracking-widest text-zinc-400 font-bold">Teléfono</label>
                  <input required value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} type="tel" className="bg-black border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-white transition-colors" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs uppercase tracking-widest text-zinc-400 font-bold">Dirección</label>
                  <input required value={customerAddress} onChange={e => setCustomerAddress(e.target.value)} type="text" className="bg-black border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-white transition-colors" />
                </div>
              </div>
            </div>

            <div className="bg-neutral-900/50 border border-white/10 p-6 flex flex-col gap-4">
              <h2 className="text-lg font-bold uppercase tracking-widest border-b border-white/10 pb-4">2. Método de Envío</h2>
              
              <div className="flex flex-col gap-1 sm:w-1/2">
                <label className="text-xs uppercase tracking-widest text-zinc-400 font-bold">Código Postal</label>
                <input 
                  required
                  type="text" 
                  value={zipCode}
                  onChange={handleZipCodeChange}
                  placeholder="Ej: 8307"
                  className="bg-black border border-white/10 px-4 py-3 text-sm focus:outline-none focus:border-white transition-colors" 
                />
              </div>

              {shippingOptions.length > 0 && (
                <div className="mt-4 flex flex-col gap-3">
                  {shippingOptions.map(option => (
                    <label 
                      key={option.id} 
                      onClick={() => setSelectedShipping(option)}
                      className={`flex items-center justify-between p-4 border cursor-pointer transition-colors ${selectedShipping?.id === option.id ? 'border-white bg-white/5' : 'border-white/10 hover:border-white/30'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedShipping?.id === option.id ? 'border-white' : 'border-zinc-500'}`}>
                          {selectedShipping?.id === option.id && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <span className="font-bold text-sm uppercase tracking-wider">{option.name}</span>
                      </div>
                      <span className="font-medium text-[#E2E2E2]">
                        {option.cost === 0 ? 'Gratis' : `$${option.cost.toLocaleString("es-AR")}`}
                      </span>
                    </label>
                  ))}
                </div>
              )}
              {zipCode.length > 0 && zipCode.length < 4 && (
                <p className="text-xs text-zinc-400 mt-2">Ingresa un código postal válido (al menos 4 caracteres).</p>
              )}
            </div>

            <div className="bg-neutral-900/50 border border-white/10 p-6 flex flex-col gap-4">
              <h2 className="text-lg font-bold uppercase tracking-widest border-b border-white/10 pb-4">3. Método de Pago</h2>
              
              <div className="flex flex-col gap-3">
                <label className={`flex items-center gap-3 p-4 border cursor-pointer transition-colors ${paymentMethod === 'mercadopago' ? 'border-white bg-white/5' : 'border-white/10 hover:border-white/30'}`}>
                  <input 
                    type="radio" 
                    name="payment_method" 
                    value="mercadopago" 
                    checked={paymentMethod === 'mercadopago'} 
                    onChange={() => setPaymentMethod('mercadopago')}
                    className="hidden"
                  />
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'mercadopago' ? 'border-[#009EE3]' : 'border-zinc-500'}`}>
                    {paymentMethod === 'mercadopago' && <div className="w-2 h-2 bg-[#009EE3] rounded-full" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm uppercase tracking-wider text-white">Mercado Pago</span>
                    <span className="text-xs text-zinc-400 font-medium">Tarjetas de crédito, débito o dinero en cuenta</span>
                  </div>
                </label>

                <label className={`flex items-center gap-3 p-4 border cursor-pointer transition-colors ${paymentMethod === 'transferencia' ? 'border-white bg-white/5' : 'border-white/10 hover:border-white/30'}`}>
                  <input 
                    type="radio" 
                    name="payment_method" 
                    value="transferencia" 
                    checked={paymentMethod === 'transferencia'} 
                    onChange={() => setPaymentMethod('transferencia')}
                    className="hidden"
                  />
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'transferencia' ? 'border-white' : 'border-zinc-500'}`}>
                    {paymentMethod === 'transferencia' && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm uppercase tracking-wider text-white">Transferencia Bancaria</span>
                    <span className="text-xs text-zinc-400 font-medium">10% de descuento abonando por este medio</span>
                  </div>
                </label>
              </div>
            </div>

            <button 
              type="submit"
              disabled={isSubmitting || !selectedShipping}
              className="w-full bg-white text-black font-black uppercase tracking-widest py-4 text-sm transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Procesando...' : paymentMethod === 'mercadopago' ? 'Pagar con Mercado Pago' : 'Confirmar Pedido'}
            </button>
          </form>
        </div>

        {/* Resumen */}
        <div className="lg:col-span-5">
          <div className="bg-neutral-900/50 border border-white/10 p-6 sticky top-24">
            <h2 className="text-lg font-bold uppercase tracking-widest border-b border-white/10 pb-4 mb-6">Resumen del pedido</h2>
            
            <div className="flex flex-col gap-4 mb-6 max-h-[40vh] overflow-y-auto pr-2">
              {items.map(item => (
                <div key={item.id} className="flex gap-4">
                  <div className="w-16 aspect-[3/4] bg-neutral-900 relative flex-shrink-0 border border-white/5 overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                        <span className="text-[8px] text-zinc-600 font-bold uppercase tracking-widest">No Image</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <h3 className="uppercase font-bold text-xs tracking-wider line-clamp-1">{item.name}</h3>
                    <p className="text-zinc-400 text-[10px] font-bold tracking-widest uppercase mt-1">Talle: {item.size} | Cant: {item.quantity}</p>
                    <p className="text-[#E2E2E2] text-sm mt-1 font-medium">${(item.price * item.quantity).toLocaleString("es-AR")}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-white/10 pt-4 flex flex-col gap-3 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span className="uppercase tracking-widest text-xs font-bold">Subtotal</span>
                <span>${subtotal.toLocaleString("es-AR")}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span className="uppercase tracking-widest text-xs font-bold">Envío</span>
                <span>{selectedShipping ? (selectedShipping.cost === 0 ? 'Gratis' : `$${selectedShipping.cost.toLocaleString("es-AR")}`) : '-'}</span>
              </div>
              <div className="flex justify-between text-white font-black text-xl mt-4 pt-4 border-t border-white/10">
                <span className="uppercase tracking-widest">Total</span>
                <span>${total.toLocaleString("es-AR")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

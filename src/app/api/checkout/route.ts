import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { items, customerData, shippingCost, shippingMethod, paymentMethod, zipCode } = body;

    const supabase = await createAdminClient();

    let realSubtotal = 0;
    const orderItems = [];

    // Verify real prices against `variantes_stock`
    for (const item of items) {
      const { data: variant, error } = await supabase
        .from('variantes_stock')
        .select('precio_venta, precio_costo, producto_id, cantidad')
        .eq('id_variante', item.variant_id)
        .single();
        
      if (error || !variant) {
        throw new Error(`Variant not found for item ${item.name}`);
      }

      const realPrice = variant.precio_venta;
      const costPrice = variant.precio_costo;
      realSubtotal += realPrice * item.quantity;
      
      orderItems.push({
        id: item.variant_id.toString(),
        title: item.name,
        quantity: item.quantity,
        unit_price: realPrice,
        cost_unit: costPrice,
        currency_id: 'ARS',
        db_cantidad: variant.cantidad
      });
    }

    const total = realSubtotal + shippingCost;

    // Insert order in Supabase
    const { data: order, error: orderError } = await supabase.from('orders').insert({
      customer_name: customerData.name,
      customer_email: customerData.email,
      customer_phone: customerData.phone,
      shipping_address: customerData.address,
      zip_code: zipCode,
      shipping_cost: shippingCost,
      shipping_method: shippingMethod,
      payment_method: paymentMethod,
      subtotal: realSubtotal,
      total: total,
      items: items,
      status: 'pending'
    }).select().single();

    if (orderError) {
      console.error("Order insertion error:", orderError);
      throw new Error("Could not create order");
    }

    // Insert financial record in `ventas`
    const totalCostoMercaderia = orderItems.reduce((acc, item) => acc + item.cost_unit * item.quantity, 0);
    const fechaHoy = new Date().toISOString().split("T")[0];
    
    const { data: ventaData, error: ventaError } = await supabase.from('ventas').insert({
      fecha: fechaHoy,
      total_venta: realSubtotal, // No sumamos el envío a la venta de mercadería
      total_costo_mercaderia: totalCostoMercaderia,
      metodo_pago: paymentMethod === 'mercadopago' ? 'MercadoPago' : 'Transferencia',
      origen: 'Web',
      estado: 'pendiente'
    }).select().single();

    if (ventaError) {
      console.error("Venta insertion error:", ventaError);
      // We continue since the e-commerce order was created, but we should log it
    } else {
      // Insert items
      const ventasItemsToInsert = orderItems.map(item => ({
        venta_id: ventaData.id,
        variante_id: item.id,
        cantidad: item.quantity,
        precio_unitario: item.unit_price,
        costo_unitario: item.cost_unit
      }));
      
      await supabase.from('ventas_items').insert(ventasItemsToInsert);

      // Decrement stock
      for (const item of orderItems) {
        await supabase
          .from('variantes_stock')
          .update({ cantidad: Math.max(0, item.db_cantidad - item.quantity) })
          .eq('id_variante', item.id);
      }
    }

    if (paymentMethod === 'mercadopago') {
      const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN || '' });
      const preference = new Preference(client);
      
      const mpItems: any[] = orderItems.map(item => ({
        id: item.id,
        title: item.title,
        quantity: item.quantity,
        unit_price: item.unit_price,
        currency_id: item.currency_id
      }));
      if (shippingCost > 0) {
        mpItems.push({
          id: 'shipping',
          title: 'Costo de Envío (' + shippingMethod + ')',
          quantity: 1,
          unit_price: shippingCost,
          currency_id: 'ARS'
        });
      }

      const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

      const result = await preference.create({
        body: {
          items: mpItems.map(i => ({
            id: i.id,
            title: i.title,
            quantity: i.quantity,
            unit_price: i.unit_price,
            currency_id: i.currency_id
          })),
          back_urls: {
            success: `${baseUrl}/gracias/${order.id}`,
            failure: `${baseUrl}/checkout`,
            pending: `${baseUrl}/gracias/${order.id}`,
          },
          auto_return: 'approved',
          external_reference: order.id.toString(),
        }
      });

      return NextResponse.json({ init_point: result.init_point });
    } else {
      // Transferencia
      return NextResponse.json({ orderId: order.id });
    }

  } catch (error) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

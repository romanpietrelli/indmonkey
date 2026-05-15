"use server";

import { createClient } from "@/lib/supabase/server";
import type {
  Producto,
  KpiDashboard,
  GastoFijo,
  ProductoParaVenta,
  VentaManualPayload,
  GastoFijoPayload,
  ProveedorPayload,
  EditarVentaPayload,
  VentaConItems,
} from "@/lib/types";
import {
  calcularTotalGastosFijos,
  calcularGananciaNeta,
  convertirARS,
} from "@/lib/business";

// ─── Umbral de alerta de stock bajo ──────────────────────────
const STOCK_ALERTA_UMBRAL = 1; // Solo avisa cuando queda 0 stock

// ─── PRODUCTOS ────────────────────────────────────────────────

/** Lista todos los productos activos con sus variantes */
export async function getProductos(): Promise<Producto[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("productos")
    .select(`
      *,
      categoria:categorias!categoria_id(*),
      coleccion:categorias!coleccion_id(*),
      variantes:variantes_stock(*)
    `)
    .eq("activo", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching productos:", error);
    return [];
  }
  return data as Producto[];
}

/** Lista TODOS los productos incluyendo los inactivos (para drops / coming soon) */
export async function getProductosCatalogo(): Promise<Producto[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("productos")
    .select(`
      *,
      categoria:categorias!categoria_id(*),
      coleccion:categorias!coleccion_id(*),
      variantes:variantes_stock(*)
    `)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching catalogo:", error);
    return [];
  }
  return data as Producto[];
}

/** Obtiene un producto por slug */
export async function getProductoBySlug(slug: string): Promise<Producto | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("productos")
    .select(`
      *,
      categoria:categorias!categoria_id(*),
      coleccion:categorias!coleccion_id(*),
      variantes:variantes_stock(*)
    `)
    .eq("slug", slug)
    .single();

  if (error) return null;
  return data as Producto;
}

// ─── TIPO DE CAMBIO ───────────────────────────────────────────

export async function getTipoCambioUSD(): Promise<number> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("configuracion")
    .select("value")
    .eq("key", "tipo_cambio_usd")
    .single();
  return data?.value ?? 1050;
}

// ─── KPIs DEL DASHBOARD ───────────────────────────────────────

/** KPIs para un rango de fechas específico (ISO strings YYYY-MM-DD) */
export async function getKpisByRange(
  from: string,
  to: string
): Promise<KpiDashboard> {
  const supabase = await createClient();

  // Tipo de cambio almacenado (fallback si no está en BD el dolar blue)
  const tipoCambio = await getTipoCambioUSD();

  // ─ Ventas en rango ────────────────────────────────────────
  const { data: ventasData } = await supabase
    .from("ventas")
    .select("total_venta, ganancia_bruta")
    .gte("fecha", from)
    .lte("fecha", to);

  const ventasHoy = ventasData?.reduce((a, v) => a + v.total_venta, 0) ?? 0;
  const gananciaBrutaMes =
    ventasData?.reduce((a, v) => a + (v.ganancia_bruta ?? 0), 0) ?? 0;

  // ─ Gastos fijos en rango ──────────────────────────────────
  const { data: gastosData } = await supabase
    .from("gastos_fijos")
    .select("*")
    .gte("fecha_gasto", from)
    .lte("fecha_gasto", to);

  const gastosFijosRaw = (gastosData as GastoFijo[]) ?? [];
  const gastosFijosMes = calcularTotalGastosFijos(gastosFijosRaw, tipoCambio);
  const gananciaNeta = calcularGananciaNeta(
    gananciaBrutaMes,
    gastosFijosRaw,
    tipoCambio
  );

  // ─ Top 3 productos en rango ───────────────────────────────
  const { data: itemsData } = await supabase
    .from("ventas_items")
    .select(`
      cantidad,
      precio_unitario,
      variante:variantes_stock(producto:productos(nombre))
    `)
    .gte("created_at", from)
    .lte("created_at", to + "T23:59:59");

  const productoMap = new Map<
    string,
    { nombre: string; unidades: number; ingresos: number }
  >();
  for (const item of (itemsData ?? []) as any[]) {
    const nombre = item.variante?.producto?.nombre ?? "Desconocido";
    const prev = productoMap.get(nombre) ?? { nombre, unidades: 0, ingresos: 0 };
    productoMap.set(nombre, {
      nombre,
      unidades: prev.unidades + item.cantidad,
      ingresos: prev.ingresos + item.precio_unitario * item.cantidad,
    });
  }
  const top3Productos = Array.from(productoMap.values())
    .sort((a, b) => b.unidades - a.unidades)
    .slice(0, 3);

  // ─ Alertas de stock bajo (threshold = 4 unidades) ─────────
  const { data: stockBajo } = await supabase
    .from("variantes_stock")
    .select(`cantidad, talle, producto:productos(nombre)`)
    .lt("cantidad", STOCK_ALERTA_UMBRAL);

  const alertasStockBajo = (stockBajo ?? []).map((v: any) => ({
    nombre: v.producto?.nombre ?? "Desconocido",
    talle: v.talle,
    cantidad: v.cantidad,
  }));

  return {
    ventasHoy,
    gananciaBrutaMes,
    gastosFijosMes,
    gananciaNeta,
    top3Productos,
    alertasStockBajo,
  };
}

/** KPIs del mes actual (retrocompatibilidad) */
export async function getKpisDashboard(): Promise<KpiDashboard> {
  const ahora = new Date();
  const from = new Date(ahora.getFullYear(), ahora.getMonth(), 1)
    .toISOString()
    .split("T")[0];
  const to = ahora.toISOString().split("T")[0];
  return getKpisByRange(from, to);
}

// ─── VENTA MANUAL ─────────────────────────────────────────────

/**
 * Trae productos activos cuya variante tenga stock > 0.
 * Usado para el dropdown del modal de venta manual.
 */
export async function getProductosParaVenta(): Promise<ProductoParaVenta[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("productos")
    .select(`
      id,
      nombre,
      imagen_url,
      categoria:categorias!categoria_id(nombre),
      variantes:variantes_stock(
        id_variante,
        talle,
        cantidad,
        precio_venta,
        precio_costo,
        moneda_costo
      )
    `)
    .eq("activo", true)
    .order("nombre", { ascending: true });

  if (error) {
    console.error("Error fetching productos para venta:", error);
    return [];
  }

  // Filtrar variantes con stock disponible
  return (data ?? [])
    .map((p: any) => ({
      id: p.id,
      nombre: p.nombre,
      imagen_url: p.imagen_url || null,
      categoria_nombre: p.categoria?.nombre || "Sin categoría",
      variantes: (p.variantes ?? []).filter(
        (v: any) => v.cantidad > 0
      ),
    }))
    .filter((p) => p.variantes.length > 0) as ProductoParaVenta[];
}

/**
 * Registra una venta manual de forma atómica:
 * 1. Inserta en `ventas`
 * 2. Inserta en `ventas_items`
 * 3. Descuenta stock en `variantes_stock`
 *
 * Si alguna operación falla, el catch retorna el error sin dejar registros huérfanos.
 * Para atomicidad real, crear un RPC en Supabase que ejecute las 3 ops en una transacción.
 */
export async function registrarVentaManual(
  payload: VentaManualPayload
): Promise<{ ok: boolean; error?: string; venta_id?: string }> {
  const supabase = await createClient();

  // Calcular totales
  const tipoCambio = await getTipoCambioUSD();
  let total_venta = 0;
  let total_costo_mercaderia = 0;

  for (const item of payload.items) {
    total_venta += item.precio_unitario * item.cantidad;
    total_costo_mercaderia += item.costo_unitario * item.cantidad;
  }

  // ─ 1. Insertar venta ────────────────────────────────────────
  const fechaHoy = new Date().toISOString().split("T")[0];
  const { data: ventaData, error: ventaError } = await supabase
    .from("ventas")
    .insert({
      fecha: fechaHoy,
      total_venta,
      total_costo_mercaderia,
      metodo_pago: payload.metodo_pago,
      origen: "Manual",
      estado: "completada",
    })
    .select("id")
    .single();

  if (ventaError || !ventaData) {
    return { ok: false, error: ventaError?.message ?? "Error al insertar venta" };
  }

  const venta_id = ventaData.id as string;

  // ─ 2. Insertar items ────────────────────────────────────────
  const itemsToInsert = payload.items.map((item) => ({
    venta_id,
    variante_id: item.variante_id,
    cantidad: item.cantidad,
    precio_unitario: item.precio_unitario,
    costo_unitario: item.costo_unitario,
  }));

  const { error: itemsError } = await supabase
    .from("ventas_items")
    .insert(itemsToInsert);

  if (itemsError) {
    // Rollback manual: eliminar la venta creada
    await supabase.from("ventas").delete().eq("id", venta_id);
    return { ok: false, error: itemsError.message };
  }

  // ─ 3. Descontar stock ───────────────────────────────────────
  for (const item of payload.items) {
    const { error: stockError } = await supabase.rpc("decrementar_stock", {
      p_variante_id: item.variante_id,
      p_cantidad: item.cantidad,
    });

    if (stockError) {
      // Si falla el decremento de stock intentamos con update directo
      const { data: varianteActual } = await supabase
        .from("variantes_stock")
        .select("cantidad")
        .eq("id_variante", item.variante_id)
        .single();

      if (varianteActual) {
        await supabase
          .from("variantes_stock")
          .update({ cantidad: Math.max(0, varianteActual.cantidad - item.cantidad) })
          .eq("id_variante", item.variante_id);
      }
    }
  }

  return { ok: true, venta_id };
}


// ═══════════════════════════════════════════════════════════════
// GASTOS FIJOS
// ═══════════════════════════════════════════════════════════════

/** Trae gastos fijos en un rango de fechas */
export async function getGastosFijos(from: string, to: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("gastos_fijos")
    .select("*")
    .gte("fecha_gasto", from)
    .lte("fecha_gasto", to)
    .order("fecha_gasto", { ascending: false });
  if (error) return [];
  return data ?? [];
}

/** Crea un gasto fijo */
export async function crearGastoFijo(
  payload: GastoFijoPayload
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("gastos_fijos").insert({
    categoria: payload.categoria,
    monto: payload.monto,
    moneda: payload.moneda,
    fecha_gasto: payload.fecha_gasto,
    descripcion: payload.descripcion || null,
    recurrente: payload.recurrente,
    dia_recurrencia: payload.recurrente ? payload.dia_recurrencia : null,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Elimina un gasto fijo */
export async function eliminarGastoFijo(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("gastos_fijos").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ═══════════════════════════════════════════════════════════════
// PROVEEDORES
// ═══════════════════════════════════════════════════════════════

/** Lista todos los proveedores */
export async function getProveedores() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("proveedores")
    .select("*")
    .order("nombre", { ascending: true });
  if (error) return [];
  return data ?? [];
}

/** Crea un proveedor */
export async function crearProveedor(
  payload: ProveedorPayload
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("proveedores").insert({
    nombre: payload.nombre,
    marca_que_proveen: payload.marca_que_proveen || null,
    email: payload.email || null,
    whatsapp: payload.whatsapp || null,
    descripcion_detalle: payload.descripcion_detalle || null,
  });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Elimina un proveedor */
export async function eliminarProveedor(
  id: string
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("proveedores").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ═══════════════════════════════════════════════════════════════
// GESTIÓN DE VENTAS (Lista, Borrar, Editar)
// ═══════════════════════════════════════════════════════════════

/** Ventas con items expandidos para la tabla del dashboard */
export async function getVentasConItems(
  from: string,
  to: string,
  limit = 50
): Promise<VentaConItems[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("ventas")
    .select(`
      id, fecha, total_venta, ganancia_bruta, metodo_pago, origen, created_at,
      items:ventas_items(
        id,
        variante_id,
        cantidad,
        precio_unitario,
        costo_unitario,
        variante:variantes_stock(talle, producto:productos(nombre))
      )
    `)
    .gte("fecha", from)
    .lte("fecha", to)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];

  // Fetch orders to match with "Web" sales to get customer details
  const { data: ordersData } = await supabase
    .from("orders")
    .select("created_at, subtotal, customer_name, customer_email, customer_phone, shipping_method, shipping_address")
    .gte("created_at", `${from}T00:00:00Z`)
    .lte("created_at", `${to}T23:59:59Z`);

  return (data ?? []).map((v: any) => {
    let customer_info = undefined;
    if (v.origen === "Web" && ordersData) {
      // Find matching order created within 60 seconds and with matching subtotal
      const match = ordersData.find(o => 
        o.subtotal === v.total_venta &&
        Math.abs(new Date(o.created_at).getTime() - new Date(v.created_at).getTime()) < 60000
      );
      if (match) {
        customer_info = {
          name: match.customer_name,
          email: match.customer_email,
          phone: match.customer_phone,
          shipping_method: match.shipping_method,
          shipping_address: match.shipping_address,
        };
      }
    }

    return {
      id: v.id,
      fecha: v.fecha,
      total_venta: v.total_venta,
      ganancia_bruta: v.ganancia_bruta ?? 0,
      metodo_pago: v.metodo_pago,
      origen: v.origen,
      customer_info,
      items: (v.items ?? []).map((item: any) => ({
        id: item.id,
        variante_id: item.variante_id,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
        costo_unitario: item.costo_unitario,
        talle: item.variante?.talle ?? "—",
        nombre_producto: item.variante?.producto?.nombre ?? "Desconocido",
      })),
    };
  });
}

/**
 * Borra una venta de forma transaccional:
 * 1. Recupera los items de la venta
 * 2. Revierte el stock (suma de vuelta)
 * 3. Elimina ventas_items
 * 4. Elimina la venta
 */
export async function borrarVenta(
  venta_id: string
): Promise<{ ok: boolean; error?: string; itemsRevertidos: number }> {
  const supabase = await createClient();

  // 1. Obtener items
  const { data: items, error: itemsErr } = await supabase
    .from("ventas_items")
    .select("variante_id, cantidad")
    .eq("venta_id", venta_id);

  if (itemsErr) return { ok: false, error: itemsErr.message, itemsRevertidos: 0 };

  const itemList = (items ?? []) as { variante_id: string; cantidad: number }[];

  // 2. Revertir stock para cada variante
  let itemsRevertidos = 0;
  for (const item of itemList) {
    const { data: variante } = await supabase
      .from("variantes_stock")
      .select("cantidad")
      .eq("id_variante", item.variante_id)
      .single();

    if (variante) {
      const { error: stockErr } = await supabase
        .from("variantes_stock")
        .update({ cantidad: variante.cantidad + item.cantidad })
        .eq("id_variante", item.variante_id);

      if (!stockErr) itemsRevertidos++;
    }
  }

  // 3. Borrar ventas_items
  const { error: deleteItemsErr } = await supabase
    .from("ventas_items")
    .delete()
    .eq("venta_id", venta_id);

  if (deleteItemsErr) {
    // Rollback: no se borró, el stock ya se revirtió — avisar al usuario
    return {
      ok: false,
      error: `Stock revertido pero error al borrar items: ${deleteItemsErr.message}`,
      itemsRevertidos,
    };
  }

  // 4. Borrar la venta
  const { error: deleteVentaErr } = await supabase
    .from("ventas")
    .delete()
    .eq("id", venta_id);

  if (deleteVentaErr) {
    return {
      ok: false,
      error: `Items borrados pero error al borrar venta: ${deleteVentaErr.message}`,
      itemsRevertidos,
    };
  }

  return { ok: true, itemsRevertidos };
}

/**
 * Edita una venta:
 * - Actualiza `metodo_pago` si se provee.
 * - Ajusta cantidades en `ventas_items` y el delta de stock correspondiente.
 */
export async function editarVenta(
  payload: EditarVentaPayload
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();

  // ─ Actualizar método de pago
  if (payload.metodo_pago) {
    const { error } = await supabase
      .from("ventas")
      .update({ metodo_pago: payload.metodo_pago })
      .eq("id", payload.venta_id);
    if (error) return { ok: false, error: error.message };
  }

  // ─ Ajustar cantidades
  if (payload.items_cantidad && payload.items_cantidad.length > 0) {
    for (const cambio of payload.items_cantidad) {
      const delta = cambio.cantidad_anterior - cambio.nueva_cantidad;
      // Positivo = reducimos venta → devolvemos stock
      // Negativo = aumentamos venta → consumimos más stock

      // Actualizar ventas_items
      const { error: itemErr } = await supabase
        .from("ventas_items")
        .update({ cantidad: cambio.nueva_cantidad })
        .eq("venta_id", payload.venta_id)
        .eq("variante_id", cambio.variante_id);

      if (itemErr) return { ok: false, error: itemErr.message };

      // Ajustar stock
      const { data: variante } = await supabase
        .from("variantes_stock")
        .select("cantidad")
        .eq("id_variante", cambio.variante_id)
        .single();

      if (variante) {
        await supabase
          .from("variantes_stock")
          .update({ cantidad: Math.max(0, variante.cantidad + delta) })
          .eq("id_variante", cambio.variante_id);
      }
    }

    // Recalcular totales de la venta
    const { data: itemsActuales } = await supabase
      .from("ventas_items")
      .select("cantidad, precio_unitario, costo_unitario")
      .eq("venta_id", payload.venta_id);

    if (itemsActuales && itemsActuales.length > 0) {
      const total_venta = itemsActuales.reduce(
        (a: number, i: any) => a + i.precio_unitario * i.cantidad,
        0
      );
      const total_costo_mercaderia = itemsActuales.reduce(
        (a: number, i: any) => a + i.costo_unitario * i.cantidad,
        0
      );
      await supabase
        .from("ventas")
        .update({ total_venta, total_costo_mercaderia })
        .eq("id", payload.venta_id);
    }
  }

  return { ok: true };
}

// ═══════════════════════════════════════════════════════════════
// CATEGORÍAS
// ═══════════════════════════════════════════════════════════════

import type { Categoria, CrearProductoPayload } from "@/lib/types";

/** Obtiene todas las categorías ordenadas por nombre */
export async function getCategorias(): Promise<Categoria[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categorias")
    .select("*")
    .order("nombre", { ascending: true });
  if (error) return [];
  return (data ?? []) as Categoria[];
}

/** Crea una nueva categoría rápida */
export async function crearCategoria(nombre: string): Promise<{ ok: boolean; error?: string; categoria?: Categoria }> {
  const supabase = await createClient();
  
  // Helper simple para slug interno
  const slug = nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  const { data, error } = await supabase
    .from("categorias")
    .insert({
      nombre,
      slug,
      tipo: "Categoria",
    })
    .select("*")
    .single();

  if (error) return { ok: false, error: error.message };
  return { ok: true, categoria: data as Categoria };
}

/** Actualiza una categoría existente */
export async function actualizarCategoria(id: string, nombre: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const slug = nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");

  const { error } = await supabase
    .from("categorias")
    .update({ nombre, slug })
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Elimina una categoría */
export async function eliminarCategoria(id: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  
  // OJO: Si hay productos con esta categoría, Supabase lanzará error por FK 
  // a menos que se haya configurado ON DELETE SET NULL.
  const { error } = await supabase
    .from("categorias")
    .delete()
    .eq("id", id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ═══════════════════════════════════════════════════════════════
// AGREGAR PRODUCTO (transaccional)
// ═══════════════════════════════════════════════════════════════

/**
 * Inserta un producto y todas sus variantes de forma atómica:
 * 1. Inserta en `productos`
 * 2. Inserta en `variantes_stock` usando el id generado
 * Si el paso 2 falla, elimina el producto creado (rollback manual).
 */
export async function crearProductoConVariantes(
  payload: CrearProductoPayload
): Promise<{ ok: boolean; error?: string; producto_id?: string }> {
  const supabase = await createClient();

  // ─ 1. Insertar producto ─────────────────────────────────────
  const { data: productoData, error: productoError } = await supabase
    .from("productos")
    .insert({
      nombre: payload.nombre,
      slug: payload.slug,
      descripcion: payload.descripcion || null,
      imagen_url: payload.imagen_url || null,
      imagenes: payload.imagenes || [],
      categoria_id: payload.categoria_id || null,
      activo: true,
    })
    .select("id")
    .single();

  if (productoError || !productoData) {
    return {
      ok: false,
      error: productoError?.message ?? "Error al crear producto",
    };
  }

  const producto_id = productoData.id as string;

  // ─ 2. Insertar variantes ─────────────────────────────────────
  const variantesInsert = payload.variantes.map((v) => ({
    producto_id,
    talle: v.talle,
    cantidad: v.cantidad,
    precio_venta: v.precio_venta,
    precio_costo: v.precio_costo,
    moneda_costo: v.moneda_costo,
  }));

  const { error: variantesError } = await supabase
    .from("variantes_stock")
    .insert(variantesInsert);

  if (variantesError) {
    // Rollback: borrar el producto huérfano
    await supabase.from("productos").delete().eq("id", producto_id);
    return {
      ok: false,
      error: `Producto creado pero error en variantes: ${variantesError.message}`,
    };
  }

  return { ok: true, producto_id };
}

/**
 * Elimina un producto entero y todas sus variantes de forma atómica (por cascada o explicita).
 */
export async function eliminarProducto(producto_id: string): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  
  // Como variantes_stock tiene ON DELETE CASCADE configurado, basta con borrar el producto
  const { error } = await supabase
    .from("productos")
    .delete()
    .eq("id", producto_id);

  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

// ═══════════════════════════════════════════════════════════════
// GESTIONAR STOCK
// ═══════════════════════════════════════════════════════════════

/**
 * Trae todas las variantes con el nombre del producto para la tabla editable.
 */
export async function getAllVariantesStock() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("variantes_stock")
    .select(`
      id_variante,
      talle,
      cantidad,
      precio_venta,
      precio_costo,
      moneda_costo,
      producto:productos(id, nombre, imagen_url, categoria:categorias!categoria_id(nombre))
    `)
    .order("id_variante", { ascending: true });

  if (error) return [];

  return (data ?? []).map((v: any) => ({
    id_variante: v.id_variante,
    producto_id: v.producto?.id ?? "",
    producto_nombre: v.producto?.nombre ?? "—",
    categoria_nombre: v.producto?.categoria?.nombre ?? "Sin categoría",
    imagen_url: v.producto?.imagen_url ?? null,
    talle: v.talle,
    cantidad: v.cantidad,
    precio_venta: v.precio_venta,
    precio_costo: v.precio_costo,
    moneda_costo: v.moneda_costo,
  }));
}

/**
 * Actualiza los campos editables de una variante.
 */
export async function actualizarVariante(
  id_variante: string,
  updates: { cantidad?: number; precio_venta?: number; precio_costo?: number }
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("variantes_stock")
    .update(updates)
    .eq("id_variante", id_variante);
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}
export async function actualizarProductoConVariantes(
  producto_id: string,
  payload: CrearProductoPayload
): Promise<{ ok: boolean; error?: string }> {
  const supabase = await createClient();

  // 1. Update producto
  const { error: productoError } = await supabase
    .from('productos')
    .update({
      nombre: payload.nombre,
      slug: payload.slug,
      descripcion: payload.descripcion || null,
      imagen_url: payload.imagen_url || null,
      imagenes: payload.imagenes || [],
      categoria_id: payload.categoria_id || null,
    })
    .eq('id', producto_id);

  if (productoError) return { ok: false, error: productoError.message };

  // 2. Fetch existing variants
  const { data: existingVariants, error: fetchErr } = await supabase
    .from('variantes_stock')
    .select('id_variante')
    .eq('producto_id', producto_id);

  if (fetchErr) return { ok: false, error: fetchErr.message };

  const existingIds = new Set(existingVariants?.map((v) => v.id_variante) || []);
  const payloadIds = new Set(payload.variantes.filter(v => v.id_variante).map(v => v.id_variante));

  // 3. Upsert variants
  for (const v of payload.variantes) {
    if (v.id_variante) {
      await supabase.from('variantes_stock').update({
        talle: v.talle,
        cantidad: v.cantidad,
        precio_venta: v.precio_venta,
        precio_costo: v.precio_costo,
        moneda_costo: v.moneda_costo
      }).eq('id_variante', v.id_variante);
    } else {
      await supabase.from('variantes_stock').insert({
        producto_id: producto_id,
        talle: v.talle,
        cantidad: v.cantidad,
        precio_venta: v.precio_venta,
        precio_costo: v.precio_costo,
        moneda_costo: v.moneda_costo
      });
    }
  }

  // 4. Delete missing variants
  for (const id of existingIds) {
    if (!payloadIds.has(id)) {
      await supabase.from('variantes_stock').delete().eq('id_variante', id);
    }
  }

  return { ok: true };
}
export async function getProductoByIdAdmin(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('productos')
    .select('*, variantes:variantes_stock(*)')
    .eq('id', id)
    .single();
  if (error) return null;
  return data;
}

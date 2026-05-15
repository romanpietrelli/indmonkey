// ============================================================
// TIPOS CENTRALES DE LA BASE DE DATOS - IND MONKEY V2
// ============================================================

export type Moneda = "ARS" | "USD";

export type MetodoPago =
  | "Efectivo"
  | "Transferencia"
  | "Tarjeta"
  | "MercadoPago"
  | "Crypto";

export type OrigenVenta = "Web" | "Manual";

export interface Categoria {
  id: string;
  nombre: string;
  slug: string;
  tipo: "Categoria" | "Coleccion";
  created_at: string;
}

export interface Proveedor {
  id: string;
  nombre: string;
  marca_que_proveen: string | null;
  email: string | null;
  whatsapp: string | null;
  descripcion_detalle: string | null;
  created_at: string;
  updated_at: string;
}

export interface Producto {
  id: string;
  nombre: string;
  slug: string;
  imagen_url: string | null;
  imagenes: string[];
  categoria_id: string | null;
  coleccion_id: string | null;
  video_url: string | null;
  descripcion: string | null;
  activo: boolean;
  created_at: string;
  updated_at: string;
  // Joined
  categoria?: Categoria;
  coleccion?: Categoria;
  variantes?: VarianteStock[];
}

export interface VarianteStock {
  id_variante: string;
  producto_id: string;
  talle: string;
  cantidad: number;
  precio_venta: number;
  precio_costo: number;
  moneda_costo: Moneda;
  created_at: string;
  updated_at: string;
}

export interface Venta {
  id: string;
  fecha: string;
  total_venta: number;
  total_costo_mercaderia: number;
  ganancia_bruta: number; // Generated column
  metodo_pago: MetodoPago;
  origen: OrigenVenta;
  estado: string;
  created_at: string;
  // Joined
  items?: VentaItem[];
}

export interface VentaItem {
  id: string;
  venta_id: string;
  variante_id: string;
  cantidad: number;
  precio_unitario: number;
  costo_unitario: number;
  created_at: string;
  // Joined
  variante?: VarianteStock & { producto?: Producto };
}

export type CategoriaGasto =
  | "Alquiler"
  | "Servicios"
  | "Internet"
  | "Sueldos"
  | "Impuestos"
  | "Otros";

export interface GastoFijo {
  id: string;
  categoria: CategoriaGasto;
  monto: number;
  moneda: Moneda;
  fecha_gasto: string;
  descripcion: string | null;
  recurrente: boolean;
  dia_recurrencia: number | null; // 1-31
  created_at: string;
}

export interface Configuracion {
  key: string;
  value: number;
  updated_at: string;
}

// ============================================================
// TIPOS PARA DASHBOARD / KPIs
// ============================================================

export interface KpiDashboard {
  ventasHoy: number;
  gananciaBrutaMes: number;
  gastosFijosMes: number; // En ARS (convertidos)
  gananciaNeta: number;   // gananciaBrutaMes - gastosFijosMes
  top3Productos: { nombre: string; unidades: number; ingresos: number }[];
  alertasStockBajo: { nombre: string; talle: string; cantidad: number }[];
}

// ============================================================
// TIPOS PARA VENTA MANUAL Y DÓLAR BLUE
// ============================================================

export interface VentaManualItem {
  variante_id: string;
  cantidad: number;
  precio_unitario: number;
  costo_unitario: number;
}

export interface VentaManualPayload {
  metodo_pago: MetodoPago;
  items: VentaManualItem[];
}

export interface DolarBlue {
  compra: number;
  venta: number;
  moneda: string;
  nombre: string;
}

// Producto con variantes para el selector del modal de venta
export interface ProductoParaVenta {
  id: string;
  nombre: string;
  imagen_url: string | null;
  categoria_nombre: string;
  variantes: VarianteParaVenta[];
}

export interface VarianteParaVenta {
  id_variante: string;
  talle: string;
  cantidad: number;
  precio_venta: number;
  precio_costo: number;
  moneda_costo: Moneda;
}

// ============================================================
// TIPOS PARA MÓDULOS GASTOS, PROVEEDORES Y VENTAS
// ============================================================

export interface GastoFijoPayload {
  categoria: CategoriaGasto;
  monto: number;
  moneda: Moneda;
  fecha_gasto: string;
  descripcion: string;
  recurrente: boolean;
  dia_recurrencia: number | null;
}

export interface ProveedorPayload {
  nombre: string;
  marca_que_proveen: string;
  email: string;
  whatsapp: string;
  descripcion_detalle: string;
}

export interface EditarVentaPayload {
  venta_id: string;
  metodo_pago?: MetodoPago;
  /** Nuevo mapa variante_id → nueva_cantidad (solo si cambia) */
  items_cantidad?: { variante_id: string; nueva_cantidad: number; cantidad_anterior: number }[];
}

/** Venta con sus ítems expandidos para la lista del dashboard */
export interface VentaConItems {
  id: string;
  fecha: string;
  total_venta: number;
  ganancia_bruta: number;
  metodo_pago: MetodoPago;
  origen: OrigenVenta;
  items: {
    id: string;
    variante_id: string;
    cantidad: number;
    precio_unitario: number;
    costo_unitario: number;
    talle: string;
    nombre_producto: string;
  }[];
  customer_info?: {
    name: string;
    email: string;
    phone: string;
    shipping_method: string;
    shipping_address: string;
  };
}

// ============================================================
// TIPOS PARA MÓDULO AGREGAR PRODUCTO
// ============================================================

export interface VariantePayload {
  id_variante?: string;
  talle: string;
  cantidad: number;
  precio_venta: number;
  precio_costo: number;
  moneda_costo: Moneda;
}

export interface CrearProductoPayload {
  nombre: string;
  slug: string;
  descripcion: string;
  imagen_url: string;
  imagenes: string[];
  categoria_id: string | null;
  variantes: VariantePayload[];
}

// ============================================================
// TIPOS PARA GESTIONAR STOCK (tabla editable)
// ============================================================

export interface VarianteEditable {
  id_variante: string;
  producto_id: string;
  producto_nombre: string;
  categoria_nombre: string;
  talle: string;
  cantidad: number;
  precio_venta: number;
  precio_costo: number;
  moneda_costo: Moneda;
  imagen_url: string | null;
  // tracking de cambios locales
  cantidad_edit: number;
  precio_venta_edit: number;
  precio_costo_edit: number;
  dirty: boolean;
}


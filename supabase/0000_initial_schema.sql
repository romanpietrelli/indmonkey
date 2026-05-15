-- ==========================================
-- IND MONKEY V2 - DATABASE SCHEMA
-- ==========================================

-- Habilitar extensión UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Tabla: PROVEEDORES
CREATE TABLE proveedores (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  marca_que_proveen TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla: CATEGORIAS (Opcional, pero recomendado para categoria_id y coleccion_id)
CREATE TABLE categorias (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('Categoria', 'Coleccion')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabla: PRODUCTOS
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  categoria_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
  coleccion_id UUID REFERENCES categorias(id) ON DELETE SET NULL,
  video_url TEXT,
  descripcion TEXT,
  activo BOOLEAN DEFAULT false, -- Para controlar el filtro "Próximamente" si stock = 0
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabla: VARIANTES_STOCK (SKUs)
CREATE TABLE variantes_stock (
  id_variante UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  talle TEXT NOT NULL,
  cantidad INTEGER NOT NULL DEFAULT 0,
  precio_venta NUMERIC(12, 2) NOT NULL,
  precio_costo NUMERIC(12, 2) NOT NULL,
  moneda_costo TEXT NOT NULL DEFAULT 'ARS' CHECK (moneda_costo IN ('ARS', 'USD')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(producto_id, talle)
);

-- 5. Tabla: VENTAS
CREATE TABLE ventas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fecha TIMESTAMPTZ DEFAULT NOW(),
  total_venta NUMERIC(12, 2) NOT NULL,
  total_costo_mercaderia NUMERIC(12, 2) NOT NULL,
  ganancia_bruta NUMERIC(12, 2) GENERATED ALWAYS AS (total_venta - total_costo_mercaderia) STORED,
  metodo_pago TEXT NOT NULL CHECK (metodo_pago IN ('Efectivo', 'Transferencia', 'Tarjeta', 'MercadoPago', 'Crypto')),
  origen TEXT NOT NULL CHECK (origen IN ('Web', 'Manual')),
  estado TEXT NOT NULL DEFAULT 'Completada',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabla: VENTAS_ITEMS (Detalle de la venta para saber qué variaciones se vendieron)
CREATE TABLE ventas_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  venta_id UUID NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
  variante_id UUID NOT NULL REFERENCES variantes_stock(id_variante) ON DELETE RESTRICT,
  cantidad INTEGER NOT NULL DEFAULT 1,
  precio_unitario NUMERIC(12, 2) NOT NULL,
  costo_unitario NUMERIC(12, 2) NOT NULL, 
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Tabla: GASTOS_FIJOS
CREATE TABLE gastos_fijos (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  categoria TEXT NOT NULL, -- ej: Alquiler, Marketing IG, Packaging
  monto NUMERIC(12, 2) NOT NULL,
  moneda TEXT NOT NULL DEFAULT 'ARS' CHECK (moneda IN ('ARS', 'USD')),
  fecha_gasto DATE NOT NULL DEFAULT CURRENT_DATE,
  descripcion TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Tabla: CONFIGURACION (Para tipo de cambio USD/ARS manual)
CREATE TABLE configuracion (
  key TEXT PRIMARY KEY,
  value NUMERIC(12, 2) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insertar configuración inicial del dólar (ejemplo)
INSERT INTO configuracion (key, value) VALUES ('tipo_cambio_usd', 1050.00);

-- ==========================================
-- INDEXES PARA OPTIMIZACIÓN
-- ==========================================
CREATE INDEX idx_productos_slug ON productos(slug);
CREATE INDEX idx_variantes_producto_id ON variantes_stock(producto_id);
CREATE INDEX idx_ventas_fecha ON ventas(fecha);
CREATE INDEX idx_gastos_fecha ON gastos_fijos(fecha_gasto);

-- ==========================================
-- RLS (ROW LEVEL SECURITY) BÁSICO
-- ==========================================
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE variantes_stock ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos_fijos ENABLE ROW LEVEL SECURITY;
ALTER TABLE configuracion ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública para catálogo (Productos y Categorías)
CREATE POLICY "Lectura publica categorias" ON categorias FOR SELECT USING (true);
CREATE POLICY "Lectura publica productos" ON productos FOR SELECT USING (activo = true);
CREATE POLICY "Lectura publica variantes" ON variantes_stock FOR SELECT USING (true); -- o filtrar por producto activo

-- (Nota: Para un entorno real, las políticas de INSERCIÓN/ACTUALIZACIÓN 
-- deben restringirse al rol autenticado del administrador, omitidos aquí 
-- por simplicidad inicial).

-- ==========================================
-- TRIGGERS PARA UPDATED_AT Y STOCK
-- ==========================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_productos_modtime BEFORE UPDATE ON productos FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_variantes_modtime BEFORE UPDATE ON variantes_stock FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Función simple para descontar stock (puede llamarse desde la API Edge Function o RPC)
CREATE OR REPLACE FUNCTION descontar_stock(p_variante_id UUID, p_cantidad INT)
RETURNS void AS $$
BEGIN
  UPDATE variantes_stock
  SET cantidad = cantidad - p_cantidad
  WHERE id_variante = p_variante_id AND cantidad >= p_cantidad;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Stock insuficiente para la variante %s', p_variante_id;
  END IF;
END;
$$ LANGUAGE plpgsql;

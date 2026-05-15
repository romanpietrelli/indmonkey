-- 1. Eliminar la foreign key actual que tiene ON DELETE RESTRICT
ALTER TABLE ventas_items DROP CONSTRAINT IF EXISTS ventas_items_variante_id_fkey;

-- 2. Permitir que la columna variante_id sea nula
ALTER TABLE ventas_items ALTER COLUMN variante_id DROP NOT NULL;

-- 3. Volver a crear la foreign key con ON DELETE SET NULL
ALTER TABLE ventas_items 
ADD CONSTRAINT ventas_items_variante_id_fkey 
FOREIGN KEY (variante_id) 
REFERENCES variantes_stock(id_variante) 
ON DELETE SET NULL;

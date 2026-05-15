-- ============================================================
-- MIGRACIÓN: Agregar imagen_url a tabla productos
-- Ejecutar en Supabase SQL Editor
-- ============================================================

-- 1. Agregar la columna imagen_url si no existe
ALTER TABLE productos
ADD COLUMN IF NOT EXISTS imagen_url TEXT;

-- 2. Si existe alguna columna con nombre alternativo (ej: image_url, foto_url),
--    copiar los datos y eliminar la columna vieja (descomementar si aplica):

-- ALTER TABLE productos ADD COLUMN IF NOT EXISTS imagen_url TEXT;
-- UPDATE productos SET imagen_url = image_url WHERE image_url IS NOT NULL;
-- ALTER TABLE productos DROP COLUMN IF EXISTS image_url;

-- 3. Verificación posterior (opcional, para confirmar todo está OK)
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'productos'
  AND column_name = 'imagen_url';

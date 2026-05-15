-- Script para asegurar que todas las categorías del menú existan en Supabase
-- Puedes ejecutar directamente esta consulta en el "SQL Editor" de Supabase

INSERT INTO categorias (nombre, slug, tipo) 
VALUES 
  ('Remeras', 'remeras', 'Categoria'),
  ('Camisas', 'camisas', 'Categoria'),
  
  ('Jeans', 'jeans', 'Categoria'),
  ('Cargos', 'cargos', 'Categoria'),
  ('Jorts', 'jorts', 'Categoria'),
  ('Bermudas', 'bermudas', 'Categoria'),
  
  ('Buzos', 'buzos', 'Categoria'),
  ('Camperas', 'camperas', 'Categoria'),
  
  ('Zapatillas Urbanas', 'zapatillas-urbanas', 'Categoria'),
  ('Zapatillas Deportivas', 'zapatillas-deportivas', 'Categoria'),
  ('Zapatillas Hype', 'zapatillas-hype', 'Categoria'),
  
  ('Gorras', 'gorras', 'Categoria'),
  ('Medias', 'medias', 'Categoria'),
  ('Cordones', 'cordones', 'Categoria'),
  ('Varios', 'varios', 'Categoria')
ON CONFLICT (slug) DO UPDATE 
SET nombre = EXCLUDED.nombre;

-- Para verificar qué categorías quedaron finalmente
SELECT * FROM categorias ORDER BY nombre ASC;

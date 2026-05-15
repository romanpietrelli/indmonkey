import { createClient } from "./supabase/server";
import { Producto } from "./types";

export async function getCatalogProducts(
  categorySlug?: string,
  filters?: { size?: string; sort?: string; search?: string }
) {
  const supabase = await createClient();

  let query = supabase
    .from("productos")
    .select(`
      *,
      categoria:categoria_id (*),
      variantes:variantes_stock (*)
    `)
    .eq("activo", true);

  if (filters?.search) {
    query = query.ilike("nombre", `%${filters.search}%`);
  }

  if (categorySlug) {
    // Necesitamos hacer match con el slug de la categoria
    // Supabase no permite filtrar directamente por campo de tabla join sin inner join tipado complejo,
    // asi que primero buscamos la categoria.
    const { data: categoriaData } = await supabase
      .from("categorias")
      .select("id")
      .eq("slug", categorySlug)
      .single();

    if (categoriaData) {
      query = query.eq("categoria_id", categoriaData.id);
    }
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching catalog products:", error);
    return [];
  }

  let products = (data as unknown as Producto[]) || [];

  // Filter by size if provided
  if (filters?.size) {
    products = products.filter((p) =>
      p.variantes?.some(
        (v) => v.talle === filters.size && v.cantidad > 0
      )
    );
  }

  // Sort
  if (filters?.sort) {
    if (filters.sort === "precio_asc" || filters.sort === "precio_desc") {
      products.sort((a, b) => {
        const priceA = a.variantes?.[0]?.precio_venta || 0;
        const priceB = b.variantes?.[0]?.precio_venta || 0;
        return filters.sort === "precio_asc" ? priceA - priceB : priceB - priceA;
      });
    } else if (filters.sort === "recientes") {
      products.sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );
    }
  }

  return products;
}

export async function getProductBySlug(slug: string): Promise<Producto | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("productos")
    .select(`
      *,
      categoria:categoria_id (*),
      variantes:variantes_stock (*)
    `)
    .eq("slug", slug)
    .single();

  if (error || !data) {
    console.error("Error fetching product by slug:", error);
    return null;
  }

  return data as unknown as Producto;
}

export async function getNewArrivals() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("productos")
    .select(`
      *,
      categoria:categoria_id (*),
      variantes:variantes_stock (*)
    `)
    .eq("activo", true)
    .order("created_at", { ascending: false })
    .limit(24);

  if (error) {
    console.error("Error fetching new arrivals:", error);
    return [];
  }

  return (data as unknown as Producto[]) || [];
}

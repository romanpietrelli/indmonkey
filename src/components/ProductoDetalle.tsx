"use client";

import { useState } from "react";
import { Play, AlertTriangle } from "lucide-react";
import type { Producto } from "@/lib/types";
import { formatearPrecio, esStockBajo } from "@/lib/business";

interface Props {
  producto: Producto;
}

export function ProductoDetalle({ producto }: Props) {
  const [talleSeleccionado, setTalleSeleccionado] = useState<string | null>(null);
  const [media, setMedia] = useState<"imagen" | "video">("imagen");
  const [imagenActivaIndex, setImagenActivaIndex] = useState(0);

  const varianteActual = producto.variantes?.find(
    (v) => v.talle === talleSeleccionado
  );

  const precioMostrado = varianteActual
    ? formatearPrecio(varianteActual.precio_venta)
    : producto.variantes?.[0]
    ? formatearPrecio(producto.variantes[0].precio_venta)
    : "—";

  const stockBajo = varianteActual
    ? esStockBajo(varianteActual.cantidad)
    : false;

  const sinStock = varianteActual ? varianteActual.cantidad === 0 : false;

  return (
    <div className="min-h-screen" style={{ background: "var(--color-background)" }}>
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* ─── VISOR DE MEDIA ──────────────────────────────── */}
          <div className="flex flex-col gap-4">
            <div
              className="relative w-full overflow-hidden"
              style={{ aspectRatio: "4/5", background: "var(--color-card)" }}
            >
              {/* Carrusel de Imágenes */}
              {media === "imagen" && (
                <div className="w-full h-full relative group">
                  <img
                    src={(producto.imagenes && producto.imagenes.length > 0) ? producto.imagenes[imagenActivaIndex] : producto.imagen_url || ""}
                    alt={producto.nombre}
                    className="w-full h-full object-cover transition-opacity duration-300"
                  />
                  
                  {producto.imagenes && producto.imagenes.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                       {producto.imagenes.map((_, idx) => (
                          <button 
                            key={idx}
                            onClick={() => setImagenActivaIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-all ${idx === imagenActivaIndex ? "bg-white scale-125" : "bg-white/40 hover:bg-white/80"}`}
                          />
                       ))}
                    </div>
                  )}
                </div>
              )}

              {/* Video si existe */}
              {producto.video_url && media === "video" && (
                <video
                  src={producto.video_url}
                  autoPlay
                  muted
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}

              {/* Badge */}
              {!producto.activo && (
                <div
                  className="absolute top-4 left-4 px-3 py-1 text-xs font-bold uppercase tracking-widest"
                  style={{
                    background: "var(--color-primary)",
                    color: "var(--color-primary-foreground)",
                  }}
                >
                  Coming Soon
                </div>
              )}
            </div>

            {/* Toggles imagen/video */}
            {producto.video_url && (
              <div className="flex gap-2">
                {(["imagen", "video"] as const).map((tipo) => (
                  <button
                    key={tipo}
                    onClick={() => setMedia(tipo)}
                    className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest border transition-colors"
                    style={{
                      borderColor: media === tipo ? "var(--color-foreground)" : "var(--color-border)",
                      color: media === tipo ? "var(--color-foreground)" : "var(--color-muted-foreground)",
                      background: media === tipo ? "var(--color-primary)" : "transparent",
                    }}
                  >
                    {tipo === "video" && <Play className="w-3 h-3" />}
                    {tipo.charAt(0).toUpperCase() + tipo.slice(1)}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ─── INFO DEL PRODUCTO ───────────────────────────── */}
          <div className="flex flex-col gap-6 pt-4">
            {/* Categoría */}
            {producto.categoria && (
              <p
                className="text-xs font-bold uppercase tracking-widest"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                {producto.categoria.nombre}
              </p>
            )}

            {/* Nombre */}
            <h1
              className="text-4xl font-black uppercase"
              style={{ letterSpacing: "-0.03em", lineHeight: "1" }}
            >
              {producto.nombre}
            </h1>

            {/* Precio */}
            <p className="text-3xl font-black">{precioMostrado}</p>

            {/* Descripción */}
            {producto.descripcion && (
              <p
                className="text-sm leading-relaxed"
                style={{ color: "var(--color-muted-foreground)" }}
              >
                {producto.descripcion}
              </p>
            )}

            {/* ─── SELECTOR DE TALLE ─────────────────────────── */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-bold uppercase tracking-widest">
                  Talle
                  {!talleSeleccionado && (
                    <span
                      className="ml-2 text-xs"
                      style={{ color: "var(--color-muted-foreground)" }}
                    >
                      — Seleccioná un talle
                    </span>
                  )}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {producto.variantes?.map((v) => {
                  const sinStockVariante = v.cantidad === 0;
                  return (
                    <button
                      key={v.id_variante}
                      onClick={() => !sinStockVariante && setTalleSeleccionado(v.talle)}
                      disabled={sinStockVariante}
                      className="w-14 h-14 text-sm font-bold uppercase border transition-all"
                      style={{
                        borderColor:
                          talleSeleccionado === v.talle
                            ? "var(--color-foreground)"
                            : "var(--color-border)",
                        background:
                          talleSeleccionado === v.talle
                            ? "var(--color-primary)"
                            : "transparent",
                        color:
                          sinStockVariante
                            ? "var(--color-muted-foreground)"
                            : talleSeleccionado === v.talle
                            ? "var(--color-primary-foreground)"
                            : "var(--color-foreground)",
                        opacity: sinStockVariante ? 0.4 : 1,
                        cursor: sinStockVariante ? "not-allowed" : "pointer",
                        textDecoration: sinStockVariante ? "line-through" : "none",
                      }}
                    >
                      {v.talle}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Alertas de stock */}
            {stockBajo && !sinStock && (
              <div
                className="flex items-center gap-2 px-4 py-3 text-sm font-bold"
                style={{
                  background: "rgba(255, 160, 0, 0.1)",
                  border: "1px solid rgba(255, 160, 0, 0.3)",
                  color: "#FFA000",
                }}
              >
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                ¡Últimas unidades! Solo quedan {varianteActual?.cantidad}.
              </div>
            )}

            {/* ─── BOTÓN DE COMPRA ───────────────────────────── */}
            <button
              disabled={!talleSeleccionado || sinStock || !producto.activo}
              className="w-full py-4 text-sm font-black uppercase tracking-widest transition-opacity"
              style={{
                background:
                  !talleSeleccionado || sinStock || !producto.activo
                    ? "var(--color-muted)"
                    : "var(--color-primary)",
                color:
                  !talleSeleccionado || sinStock || !producto.activo
                    ? "var(--color-muted-foreground)"
                    : "var(--color-primary-foreground)",
                cursor:
                  !talleSeleccionado || sinStock || !producto.activo
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {!producto.activo
                ? "Próximamente"
                : sinStock
                ? "Sin Stock"
                : !talleSeleccionado
                ? "Seleccioná un Talle"
                : "Agregar al Carrito"}
            </button>

            {/* Opciones de entrega */}
            <div
              className="p-4 text-xs"
              style={{
                background: "var(--color-card)",
                border: "1px solid var(--color-border)",
                color: "var(--color-muted-foreground)",
              }}
            >
              <p className="font-bold uppercase tracking-widest mb-2">Entrega</p>
              <p>🚚 Andreani — Envío a domicilio en todo Argentina</p>
              <p>📦 Correo Argentino — Opción económica</p>
              <p>🏪 Retiro en local — Sin cargo</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

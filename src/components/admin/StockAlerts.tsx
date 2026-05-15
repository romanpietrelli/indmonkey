"use client";

import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface StockAlert {
  nombre: string;
  talle: string;
  cantidad: number;
}

interface StockAlertsProps {
  alertas: StockAlert[];
}

export function StockAlerts({ alertas }: StockAlertsProps) {
  return (
    <div
      className="p-8 h-full relative overflow-hidden group border border-zinc-700/50"
      style={{
        background: "linear-gradient(165deg, rgba(20, 20, 22, 0.9) 0%, rgba(9, 9, 11, 1) 100%)",
      }}
    >
      {/* Wireframe bg */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[radial-gradient(#fff_1px,transparent_0)] [background-size:16px_16px]" />

      <div className="flex items-center gap-3 mb-8 relative z-10">
        <div className="p-2 bg-amber-500/10 border border-amber-500/20">
          <AlertTriangle className="w-4 h-4 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />
        </div>
        <div>
          <h2 className="text-[10px] font-mono font-black uppercase tracking-[0.25em] text-zinc-500">
            SISTEMA DE MONITOREO
          </h2>
          <p className="text-xs font-mono font-bold uppercase text-white tracking-widest">
            Alertas de Stock Bajo
          </p>
        </div>
        {alertas.length > 0 && (
          <div className="ml-auto flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
            <span className="text-xl font-mono font-black text-amber-500 tabular-nums">
              {alertas.length.toString().padStart(2, '0')}
            </span>
          </div>
        )}
      </div>

      {alertas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border border-zinc-900 bg-black/20">
          <div className="w-12 h-12 border border-zinc-800 flex items-center justify-center mb-4">
            <span className="text-green-500 font-mono text-xl">OK</span>
          </div>
          <p className="text-[10px] font-mono font-bold uppercase tracking-widest text-zinc-600">
            Todos los sistemas nominales
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar relative z-10">
          {alertas.map((a, i) => (
            <motion.div
              key={`${a.nombre}-${a.talle}-${i}`}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between p-4 border border-zinc-800 bg-zinc-950/50 hover:border-amber-500/30 transition-colors group/item"
            >
              <div className="flex flex-col gap-1">
                <p className="text-[11px] font-mono font-black uppercase tracking-tight text-white group-hover/item:text-amber-500 transition-colors">
                  {a.nombre}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-mono font-bold text-zinc-600 uppercase">Talle:</span>
                  <span className="text-[10px] font-mono text-zinc-400 font-bold">{a.talle}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <div 
                  className={`text-[10px] font-mono font-black px-3 py-1 border transition-all duration-300 ${
                    a.cantidad === 0 
                      ? "bg-red-500/10 border-red-500/50 text-red-500 shadow-[0_0_10px_rgba(239,68,68,0.2)]" 
                      : "bg-amber-500/10 border-amber-500/30 text-amber-500 group-hover/item:shadow-[0_0_12px_rgba(245,158,11,0.25)]"
                  }`}
                >
                  {a.cantidad === 0 ? "CRIT_00_STOCK" : `QTY_${a.cantidad.toString().padStart(2, '0')}`}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Technical corner accents */}
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-zinc-600 opacity-20" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-zinc-600 opacity-20" />
    </div>
  );
}

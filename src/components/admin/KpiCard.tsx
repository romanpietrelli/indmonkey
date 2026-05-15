"use client";

import { TrendingUp, TrendingDown, ShoppingBag, DollarSign } from "lucide-react";
import { motion } from "framer-motion";

function formatValue(
  raw: number,
  moneda: "ARS" | "USD",
  dolarBlue: number
): string {
  const value = moneda === "USD" ? raw / dolarBlue : raw;
  if (moneda === "USD") {
    return `USD ${value.toLocaleString("es-AR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  return `$${value.toLocaleString("es-AR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  rawValue: number;
  moneda: "ARS" | "USD";
  dolarBlue: number;
  highlight?: boolean;
  muted?: boolean;
  negative?: boolean;
  index?: number;
  /** Valor de referencia del mes para mostrar la barra de progreso (opcional) */
  referenceMax?: number;
}

export function KpiCard({
  icon,
  label,
  rawValue,
  moneda,
  dolarBlue,
  highlight = false,
  muted = false,
  negative = false,
  index = 0,
  referenceMax,
}: KpiCardProps) {
  const accentColor = negative
    ? "#FF4444"
    : highlight
    ? "#4ADE80"
    : undefined;

  const displayValue = formatValue(rawValue, moneda, dolarBlue);

  const progressPct =
    referenceMax && referenceMax > 0
      ? Math.min(100, (Math.abs(rawValue) / referenceMax) * 100)
      : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07, ease: "easeOut" }}
      className={`p-6 flex flex-col gap-4 relative overflow-hidden rounded-sm group transition-all duration-300 ${
        negative ? "animate-pulse-red" : ""
      }`}
      style={{
        background: "linear-gradient(145deg, rgba(24, 24, 27, 0.9) 0%, rgba(9, 9, 11, 1) 100%)",
        border: negative 
          ? "1px solid rgba(239, 68, 68, 0.5)" 
          : "1px solid rgba(39, 39, 42, 1)",
        boxShadow: negative 
          ? "0 0 15px rgba(239, 68, 68, 0.15), inset 0 0 10px rgba(239, 68, 68, 0.05)" 
          : "none"
      }}
    >
      {/* Wireframe background pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none" 
        style={{ 
          backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
          backgroundSize: '16px 16px'
        }} 
      />

      {/* Glow effect for positive/highlight cards */}
      {highlight && !negative && (
        <div
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            background: "radial-gradient(circle at 50% 100%, rgba(74, 222, 128, 0.08) 0%, transparent 70%)",
          }}
        />
      )}

      <div
        className="flex items-center gap-2 text-[10px] font-mono font-bold uppercase tracking-[0.2em]"
        style={{ color: accentColor ?? "var(--color-muted-foreground)" }}
      >
        <span className="opacity-70">{icon}</span>
        {label}
      </div>

      <p
        className={`text-3xl font-black leading-none font-mono ${
          (highlight && !negative) ? "drop-shadow-[0_0_8px_rgba(74,222,128,0.5)] text-green-400" : ""
        } ${negative ? "drop-shadow-[0_0_8px_rgba(239,68,68,0.5)] text-red-500" : ""}`}
        style={{
          color: accentColor,
          letterSpacing: "-0.05em",
        }}
      >
        {displayValue}
      </p>

      {/* Progress bar with technical styling */}
      {progressPct !== null && (
        <div
          className="h-[2px] w-full bg-zinc-800/50 overflow-hidden"
        >
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${progressPct}%` }}
            transition={{ duration: 1, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
            className={`h-full ${negative ? "bg-red-500" : "bg-green-400"}`}
            style={{
              boxShadow: (highlight || negative) ? `0 0 8px ${accentColor}` : 'none'
            }}
          />
        </div>
      )}

      {/* Technical corner accents */}
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-zinc-700 opacity-30" />
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-zinc-700 opacity-30" />
    </motion.div>
  );
}

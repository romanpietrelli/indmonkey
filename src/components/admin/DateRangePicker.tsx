"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";

export type DatePreset = "today" | "week" | "month" | "custom";

export interface DateRange {
  from: string; // YYYY-MM-DD
  to: string;   // YYYY-MM-DD
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

function getToday(): string {
  return new Date().toISOString().split("T")[0];
}

function getPresetRange(preset: DatePreset): DateRange {
  const today = new Date();
  const todayStr = today.toISOString().split("T")[0];

  if (preset === "today") {
    return { from: todayStr, to: todayStr };
  }
  if (preset === "week") {
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    return { from: monday.toISOString().split("T")[0], to: todayStr };
  }
  if (preset === "month") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    return { from: start.toISOString().split("T")[0], to: todayStr };
  }
  return { from: todayStr, to: todayStr };
}

const PRESETS: { id: DatePreset; label: string }[] = [
  { id: "today", label: "Hoy" },
  { id: "week", label: "Esta semana" },
  { id: "month", label: "Este mes" },
  { id: "custom", label: "Personalizado" },
];

export function DateRangePicker({ value, onChange }: DateRangePickerProps) {
  const [activePreset, setActivePreset] = useState<DatePreset>("month");
  const [open, setOpen] = useState(false);

  function selectPreset(preset: DatePreset) {
    setActivePreset(preset);
    if (preset !== "custom") {
      onChange(getPresetRange(preset));
      setOpen(false);
    }
  }

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-4 py-2 text-xs font-bold uppercase tracking-widest transition-opacity hover:opacity-70"
        style={{
          background: "var(--color-card)",
          border: "1px solid var(--color-border)",
          color: "var(--color-foreground)",
        }}
      >
        <span>
          {activePreset === "custom"
            ? `${value.from} → ${value.to}`
            : PRESETS.find((p) => p.id === activePreset)?.label}
        </span>
        <ChevronDown
          className="w-3 h-3"
          style={{
            transform: open ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute top-full left-0 mt-1 z-50 min-w-[200px] p-1"
          style={{
            background: "var(--color-card)",
            border: "1px solid var(--color-border)",
          }}
        >
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => selectPreset(preset.id)}
              className="w-full text-left px-3 py-2 text-xs font-bold uppercase tracking-widest transition-colors"
              style={{
                color:
                  activePreset === preset.id
                    ? "var(--color-foreground)"
                    : "var(--color-muted-foreground)",
                background:
                  activePreset === preset.id
                    ? "var(--color-muted)"
                    : "transparent",
              }}
            >
              {preset.label}
            </button>
          ))}

          {/* Custom date inputs */}
          {activePreset === "custom" && (
            <div className="border-t mt-1 pt-2 px-3 pb-2 flex flex-col gap-2" style={{ borderColor: "var(--color-border)" }}>
              <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-muted-foreground)" }}>
                Desde
              </label>
              <input
                type="date"
                value={value.from}
                max={value.to}
                onChange={(e) => onChange({ ...value, from: e.target.value })}
                className="w-full px-2 py-1 text-xs font-bold"
                style={{
                  background: "var(--color-muted)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-foreground)",
                  colorScheme: "dark",
                }}
              />
              <label className="text-xs font-bold uppercase tracking-widest" style={{ color: "var(--color-muted-foreground)" }}>
                Hasta
              </label>
              <input
                type="date"
                value={value.to}
                min={value.from}
                max={getToday()}
                onChange={(e) => {
                  onChange({ ...value, to: e.target.value });
                  setOpen(false);
                }}
                className="w-full px-2 py-1 text-xs font-bold"
                style={{
                  background: "var(--color-muted)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-foreground)",
                  colorScheme: "dark",
                }}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

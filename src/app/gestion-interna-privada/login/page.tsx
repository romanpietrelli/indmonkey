"use client";

import { useState } from "react";
import { login } from "@/lib/auth-actions";
import { useRouter } from "next/navigation";
import { Lock, User, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const res = await login(formData);

    if (res.success) {
      router.push("/gestion-interna-privada");
      router.refresh(); // Para que el middleware note el cambio de cookie
    } else {
      setError(res.error || "Error al iniciar sesión");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        {/* Logo / Branding */}
        <div className="flex flex-col items-center mb-10">
          <img src="/logo.png" alt="Ind Monkey" className="h-20 w-auto mb-4 grayscale brightness-150" />
          <h1 className="text-xs font-mono font-black tracking-[0.3em] text-zinc-500 uppercase">
            Acceso_Restringido
          </h1>
        </div>

        <div className="bg-zinc-950 border border-zinc-900 p-8 shadow-2xl relative overflow-hidden group">
          {/* Accent line top */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-zinc-700 to-transparent opacity-50" />
          
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest ml-1">
                Usuario
              </label>
              <div className="relative group/field">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within/field:text-white transition-colors" />
                <input
                  name="username"
                  type="text"
                  required
                  placeholder="ID_OPERADOR"
                  className="w-full bg-zinc-900/50 border border-zinc-800 px-10 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-zinc-700 focus:bg-zinc-900 transition-all font-mono"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-mono font-bold text-zinc-600 uppercase tracking-widest ml-1">
                Contraseña
              </label>
              <div className="relative group/field">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within/field:text-white transition-colors" />
                <input
                  name="password"
                  type="password"
                  required
                  placeholder="********"
                  className="w-full bg-zinc-900/50 border border-zinc-800 px-10 py-3 text-sm text-white placeholder:text-zinc-700 focus:outline-none focus:border-zinc-700 focus:bg-zinc-900 transition-all font-mono"
                />
              </div>
            </div>

            {error && (
              <p className="text-[10px] font-mono text-red-500 text-center uppercase tracking-widest animate-pulse">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-white text-black py-3 text-xs font-black uppercase tracking-[0.2em] hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  Autenticando...
                </>
              ) : (
                "Entrar"
              )}
            </button>
          </form>
          
          {/* Corner accents */}
          <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-zinc-800 opacity-50" />
          <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-zinc-800 opacity-50" />
        </div>

        <p className="mt-8 text-center text-[9px] font-mono text-zinc-700 uppercase tracking-widest">
          Secure Terminal v1.2 // Ind Monkey HQ
        </p>
      </div>
    </div>
  );
}

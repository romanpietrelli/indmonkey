import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/request';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = request.cookies.get("admin_session");

  // Definimos la ruta secreta (podría venir de env, pero en middleware debe ser predecible para el matcher o lógica)
  const SECRET_PATH = "/gestion-interna-privada";

  // Redirigir el viejo /admin a la ruta secreta por comodidad/obscuridad
  if (pathname === "/admin" || pathname.startsWith("/admin/")) {
    return NextResponse.redirect(new URL(SECRET_PATH, request.url));
  }

  // Protección de la ruta secreta
  if (pathname.startsWith(SECRET_PATH)) {
    // Permitir acceso a la página de login sin sesión
    if (pathname === `${SECRET_PATH}/login`) {
      if (session) {
        return NextResponse.redirect(new URL(SECRET_PATH, request.url));
      }
      return NextResponse.next();
    }

    // Si no hay sesión, al login
    if (!session) {
      return NextResponse.redirect(new URL(`${SECRET_PATH}/login`, request.url));
    }
  }

  return NextResponse.next();
}

// Opcional: configurar en qué rutas corre el middleware para ahorrar performance
export const config = {
  matcher: ['/admin/:path*', '/gestion-interna-privada/:path*'],
};

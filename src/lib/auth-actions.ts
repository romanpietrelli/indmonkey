"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_USER = process.env.ADMIN_USER || "admin";
const ADMIN_PASS = process.env.ADMIN_PASS || "admin123";
const ADMIN_PATH = process.env.NEXT_PUBLIC_ADMIN_PATH || "/gestion-interna-privada";

export async function login(formData: FormData) {
  const username = formData.get("username");
  const password = formData.get("password");

  if (username === ADMIN_USER && password === ADMIN_PASS) {
    const cookieStore = await cookies();
    
    // Seteamos la cookie por 30 días
    cookieStore.set("admin_session", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 días
      path: "/",
      sameSite: "lax",
    });

    return { success: true };
  }

  return { success: false, error: "Credenciales incorrectas" };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("admin_session");
  redirect("/");
}

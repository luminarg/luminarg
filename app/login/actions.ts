"use server";

import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { isInternalUser, type UserRole } from "@/data/roles";

export async function loginAction(formData: FormData) {
  const supabase = await createSupabaseServerClient();

  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  const next = String(formData.get("next") || "");

  if (!email || !password) {
    redirect("/login?error=credenciales");
  }

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect("/login?error=credenciales");
  }

  // 👇 Obtener usuario
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  // 👇 Obtener perfil
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  // 👇 ADMIN → dashboard SIEMPRE
  if (profile && isInternalUser(profile.role as UserRole)) {
    redirect("/internal/dashboard");
  }

  // 👇 CLIENTE → respeta next o va a cuenta
  if (next && next.startsWith("/")) {
    redirect(next);
  }

  redirect("/account");
}
"use server";

import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

async function getBaseUrl() {
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = host?.includes("localhost") ? "http" : "https";

  return `${protocol}://${host}`;
}

export async function loginAction(formData: FormData) {
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");

  const supabase = await createSupabaseServerClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    redirect("/login?error=credenciales");
  }

  // 🔥 obtener perfil
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user?.id)
    .single();

  if (profile?.role === "admin" || profile?.role === "internal") {
    redirect("/internal/dashboard");
  }

  redirect("/products");
}
export async function loginWithGoogleAction() {
  const supabase = await createSupabaseServerClient();
  const baseUrl = await getBaseUrl();

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${baseUrl}/auth/callback`,
    },
  });

  if (error) {
    console.error("Google login error:", error.message);
    redirect("/login?error=google");
  }

  if (data.url) {
    redirect(data.url);
  }

  redirect("/login?error=google");
}
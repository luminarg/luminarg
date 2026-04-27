"use server";

import { supabaseAdmin } from "@/lib/supabaseAdmin";

export async function createUserAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error) {
    console.error(error);
    throw new Error("Error creando usuario");
  }

  const userId = data.user.id;

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .insert({
      id: userId,
      email,
      role,
      is_active: true,
    });

  if (profileError) {
    console.error(profileError);
    throw new Error("Error creando perfil");
  }

  return { success: true };
}
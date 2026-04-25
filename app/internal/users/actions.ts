"use server";

import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function createUserAction(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const role = formData.get("role") as string;

  const supabase = await createSupabaseServerClient();

  // 🔐 crear usuario en auth
  const { data: userData, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError) {
    console.error(authError);
    throw new Error("Error creando usuario");
  }

  const userId = userData.user.id;

  // 🧠 crear perfil
  const { error: profileError } = await supabase
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
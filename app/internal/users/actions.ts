"use server";

import { revalidatePath } from "next/cache";
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { getCurrentProfile } from "@/data/auth";
import { canManageUsers } from "@/data/roles";

async function requireAdmin() {
  const profile = await getCurrentProfile();
  if (!profile || !canManageUsers(profile.role)) throw new Error("No autorizado");
}

export async function createUserAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const email = String(formData.get("email") || "");
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "minorista");
  const fullName = String(formData.get("fullName") || "");

  if (!email || !password) throw new Error("Email y contrasena son requeridos");

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !data.user) throw new Error(error?.message || "Error creando usuario");

  const { error: profileError } = await supabaseAdmin
    .from("profiles")
    .insert({ id: data.user.id, email, role, full_name: fullName, is_active: true });

  if (profileError) throw new Error("Usuario creado pero error en perfil");

  revalidatePath("/internal/users");
}

export async function updateUserRoleAction(userId: string, formData: FormData): Promise<void> {
  await requireAdmin();
  const role = String(formData.get("role") || "minorista");
  const { error } = await supabaseAdmin.from("profiles").update({ role }).eq("id", userId);
  if (error) throw new Error("No se pudo actualizar el rol");
  revalidatePath("/internal/users");
}

export async function toggleUserActiveAction(userId: string, currentActive: boolean): Promise<void> {
  await requireAdmin();
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ is_active: !currentActive })
    .eq("id", userId);
  if (error) throw new Error("No se pudo cambiar el estado");
  revalidatePath("/internal/users");
}

export async function deleteUserAction(userId: string): Promise<void> {
  await requireAdmin();
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (authError) throw new Error("No se pudo eliminar el usuario");
  await supabaseAdmin.from("profiles").delete().eq("id", userId);
  revalidatePath("/internal/users");
}

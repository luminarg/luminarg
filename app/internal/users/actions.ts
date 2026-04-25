"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/data/auth";
import { canManageUsers, UserRole } from "@/data/roles";
import { updateProfileRole } from "@/data/userService";

export async function updateUserRoleAction(formData: FormData) {
  const profile = await getCurrentProfile();

  if (!profile || !canManageUsers(profile.role)) {
    throw new Error("No autorizado");
  }

  const id = String(formData.get("id") || "");
  const role = String(formData.get("role") || "minorista") as UserRole;

  await updateProfileRole(id, role);

  revalidatePath("/internal/users");
}
import { supabaseAdmin } from "@/lib/supabaseAdmin";
import { UserRole } from "@/data/roles";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
};

export async function getProfiles(): Promise<Profile[]> {
  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching profiles:", error);
    return [];
  }

  return data as Profile[];
}

export async function updateProfileRole(id: string, role: UserRole) {
  const { error } = await supabaseAdmin
    .from("profiles")
    .update({ role })
    .eq("id", id);

  if (error) {
    console.error("Error updating profile role:", error);
    throw new Error("No se pudo actualizar el rol");
  }
}
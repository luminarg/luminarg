import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/data/auth";
import { isInternalUser } from "@/data/roles";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  const profile = await getCurrentProfile();

  if (!profile || !isInternalUser(profile.role)) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Usuarios</h1>
    </div>
  );
}